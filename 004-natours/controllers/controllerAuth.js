const util = require("util");
const jwt = require("jsonwebtoken");

const ModelUser = require("../models/modelUser");
const utilCatchAsync = require("../utils/utilCatchAsync");
const UtilAppError = require("../utils/utilAppError");

//
const generateSignToken = id =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

//
exports.signup = utilCatchAsync(async (req, res, next) => {
    const data = await ModelUser.create({
        // name: req.body.name,
        // email: req.body.email,
        // password: req.body.password,
        // passwordConfirm: req.body.passwordConfirm,
        ...req.body,
    });
    const token = generateSignToken(data._id);
    res.status(201).json({
        status: "success",
        data: {
            token,
            data,
        },
    });
});

//
exports.login = utilCatchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1. Check if email and password exist
    if (!email || !password) return next(new UtilAppError("Email and password are required", 400));

    // 2. Check if user exists && password is correct
    const user = await ModelUser.findOne({ email }).select("+password");
    const isCorrect = user && (await user.isCorrectPassword(password, user.password));
    if (!isCorrect) return new UtilAppError("Incorrect email or password", 401)();

    // 3. If everything is ok, send a token to the client
    const token = generateSignToken(user._id);
    res.status(200).json({
        status: "success",
        data: { token },
    });
});

//
exports.protect = utilCatchAsync(async (req, res, next) => {
    // 1. Get the token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer "))
        token = req.headers.authorization.split(" ")[1];
    if (!token) return next(new UtilAppError("Unauthorized", 401));

    // 2. Validate the token
    const decoded = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3. Check if user still exists
    const freshUser = await ModelUser.findById(decoded.id);
    if (!freshUser) return next(new UtilAppError("The user no longer exists", 401));

    // 4. Check if user checked the password after the token was issued
    if (freshUser.changedPasswordAfter(decoded.iat))
        return next(new UtilAppError("The password has been recently changed", 401));

    // 5.
    req.data = freshUser;
    next();
});

//
exports.restrictTo = (...roles) => {
    return utilCatchAsync(async (req, res, next) => {
        if (!roles.includes(req.data.role))
            return next(new UtilAppError("You do not have the permission to perform this action", 403));
        next();
    });
};
