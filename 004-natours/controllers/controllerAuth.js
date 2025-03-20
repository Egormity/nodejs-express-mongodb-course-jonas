const crypto = require("crypto");
const util = require("util");

const jwt = require("jsonwebtoken");
const multer = require("multer");
const sharp = require("sharp");

const ModelUser = require("../models/modelUser");

const UtilAppError = require("../utils/classes/utilAppError");

const UtilEmail = require("../utils/classes/utilEmail");

const utilCatchAsync = require("../utils/functions/utilCatchAsync");
const utilFilterObj = require("../utils/functions/utilFilterObj");
const utilSendResJson = require("../utils/functions/utilSendResJson");

const multerStorage = multer.memoryStorage(); // = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, "public/img/users"),
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split("/")[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     },
// });
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) cb(null, true);
    else cb(new UtilAppError("Image extension not recognized. Please upload a valid image"), false);
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

//
exports.uploadUserPhoto = upload.single("photo");

//
exports.resizeUserPhoto = utilCatchAsync(async (req, res, next) => {
    if (!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);
    next();
});

//
const generateSignToken = id =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

//
const createSendToken = ({ req, res, statusCode, user }) => {
    // 1. Get the token
    const token = generateSignToken(user._id);

    // 2. Set the cookie
    res.cookie("jwt", token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * process.env.JWT_COOKIE_EXPIRES_IN),
        secure: req.secure || req.headers["x-forwarded-proto"] === "https",
        httpOnly: true,
    });

    // 3. Remove the password
    user.password = undefined;

    // 4. Send the request
    utilSendResJson({ res, statusCode, data: user, token });
};

//
exports.protect = utilCatchAsync(async (req, res, next) => {
    // 1. Get the token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer "))
        token = req.headers.authorization.split(" ")[1];
    if (req.headers.cookie?.jwt) token = req.cookies.jwt;
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

// Only for rendered pages, no errors
exports.isLoggedIn = utilCatchAsync(async (req, res, next) => {
    // 1. Verify the token
    if (req.cookie?.jwt) {
        try {
            const decoded = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET);

            // 2. Check if user still exists
            const user = await ModelUser.findById(decoded.id);
            if (!user) return next();

            // 3. Check if user checked the password after the token was issued
            if (user.changedPasswordAfter(decoded.iat)) return next();

            // 4. There is a logged in user
            res.locals.user = user;
        } catch (err) {}
    }
    next();
});

//
exports.restrictTo = (...roles) => {
    // console.log(roles);
    return utilCatchAsync(async (req, res, next) => {
        if (roles.length > 0 && !roles.includes(req.user.role))
            return next(new UtilAppError("You do not have the permission to perform this action", 403));
        next();
    });
};

//
exports.signup = utilCatchAsync(async (req, res, next) => {
    const newUser = await ModelUser.create({
        // name: req.body.name,
        // email: req.body.email,
        // password: req.body.password,
        // passwordConfirm: req.body.passwordConfirm,
        ...req.body,
    });
    const url = `${req.protocol}://${req.get("host")}/me`;
    await new UtilEmail({ user: newUser, url }).sendWelcome();
    createSendToken({ req, res, statusCode: 201, user });
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
    createSendToken({ req, res, statusCode: 200, user });
});

//
exports.logout = utilCatchAsync(async (req, res, next) => {
    res.cookie("jwt", "logged out", {
        expires: new Date(new Date.now() + 10 * 1000),
    });
    utilSendResJson({ res, statusCode: 200 });
});

//
exports.forgotPassword = utilCatchAsync(async (req, res, next) => {
    // 1. Get user based on posted email
    const user = await ModelUser.findOne({ email: req.body.email });
    if (!user) return next(new UtilAppError("No user with provided email found", 404));

    // 2. Generate a random token
    const token = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
        // 3. Send an email to the user
        const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${token}`;
        await new UtilEmail({ user, url: resetURL }).sendPasswordReset();
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
    createSendToken({ req, res, statusCode: 200, user });
});

//
exports.getMe = (req, res, next) => {
    req.params.id = req.user._id;
    next();
};

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
    createSendToken({ req, res, statusCode: 200, user });
});

//
exports.updateMe = utilCatchAsync(async (req, res, next) => {
    // 1. If user tries to update the password - return
    if (req.body.password || req.body.passwordConfirm)
        return next(new UtilAppError("You cannot change the password here", 400));

    // 2. Filter the not allowed fields
    const filtered = utilFilterObj(req.body, "name", "email");
    if (req.file) filtered.photo = req.file.filename;

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
