const crypto = require("crypto");
const util = require("util");

const jwt = require("jsonwebtoken");

const ModelUser = require("../models/modelUser");

const UtilAppError = require("../utils/classes/utilAppError");

const utilCatchAsync = require("../utils/functions/utilCatchAsync");
const utilSendEmail = require("../utils/functions/utilSendEmail");
const utilFilterObj = require("../utils/functions/utilFilterObj");
const utilSendResJson = require("../utils/functions/utilSendResJson");

//
const generateSignToken = id =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

//
const createSendToken = ({ res, statusCode, user }) => {
    // 1. Get the token
    const token = generateSignToken(user._id);

    // 2. Set the cookie
    res.cookie("jwt", token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * process.env.JWT_COOKIE_EXPIRES_IN),
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
    });
    user.password = undefined;

    // 3. Send the request
    utilSendResJson({ res, statusCode, data: user, token });
};

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

    // 5. Set the user property on all incoming req
    req.user = freshUser;
    next();
});

//
exports.restrictTo = (...roles) => {
    console.log(roles);
    return utilCatchAsync(async (req, res, next) => {
        if (roles.length > 0 && !roles.includes(req.user.role))
            return next(new UtilAppError("You do not have the permission to perform this action", 403));
        next();
    });
};

//
exports.signup = utilCatchAsync(async (req, res, next) => {
    const user = await ModelUser.create({
        // name: req.body.name,
        // email: req.body.email,
        // password: req.body.password,
        // passwordConfirm: req.body.passwordConfirm,
        ...req.body,
    });
    createSendToken({ res, statusCode: 201, user });
});

//
exports.login = utilCatchAsync(async (req, res, next) => {
    // 1. Check if email and password exist
    const { email, password } = req.body;
    if (!email || !password) return next(new UtilAppError("Email and password are required", 400));

    // 2. Check if user exists && password is correct
    const user = await ModelUser.findOne({ email }).select("+password");
    const isCorrect = user && (await user.isCorrectPassword(password, user.password));
    if (!isCorrect) return next(new UtilAppError("Incorrect email or password", 401));

    // 3. If everything is ok, send a token to the client
    createSendToken({ res, statusCode: 200, user });
});

//
exports.forgotPassword = utilCatchAsync(async (req, res, next) => {
    // 1. Get user based on posted email
    const user = await ModelUser.findOne({ email: req.body.email });
    if (!user) return next(new UtilAppError("No user with provided email found", 404));

    // 2. Generate a random token
    const token = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3. Send an email to the user
    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${token}`;
    const text = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\/If you didn't request this action, please ignore this email.`;

    try {
        await utilSendEmail({
            email: user.email,
            subject: "Your password reset token (valid only for 10 minutes)",
            text,
        });
        utilSendResJson({ res, statusCode: 200, message: "Token sent to the email" });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new UtilAppError("There was an error sending the email. Please try again later"));
    }
});

//
exports.resetPassword = utilCatchAsync(async (req, res, next) => {
    // 1. Get user based on the token
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await ModelUser.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    // 2. If token has not expired && user: set the new property
    if (!user) return next(new UtilAppError("User not found or the token has expired", 404));
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3. Update passwordChangedAt
    // Handled by the middleware

    // 3. Log the user in, send JWT
    createSendToken({ res, statusCode: 200, user });
});

//
exports.updateMyPassword = utilCatchAsync(async (req, res, next) => {
    // 1. Get the user
    const user = await ModelUser.findById(req.user.id).select("+password");

    // 2. Check if the password is correct
    if (!(await user.isCorrectPassword(req.body.passwordCurrent, user.password)))
        return next(new UtilAppError("The current password provided is wrong", 404));

    // 3. Update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4. Log in the user, send JWT
    createSendToken({ res, statusCode: 200, user });
});

//
exports.updateMe = utilCatchAsync(async (req, res, next) => {
    // 1. If user tries to update the password - return
    if (req.body.password || req.body.passwordConfirm)
        return next(new UtilAppError("You cannot change the password here", 400));

    // 2. Filter the not allowed fields
    const filtered = utilFilterObj(req.body, "name", "email");

    // 3. Update the user
    const user = await ModelUser.findByIdAndUpdate(req.user._id, filtered, {
        new: true,
        runValidators: true,
    });
    const token = generateSignToken(user._id);
    utilSendResJson({ res, statusCode: 200, data: user, token });
});

//
exports.deleteMe = utilCatchAsync(async (req, res, next) => {
    await ModelUser.findByIdAndDelete(req.user._id, { active: false });
    utilSendResJson({ res, statusCode: 204, data: null });
});
