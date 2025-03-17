const UtilAppError = require("../utils/classes/utilAppError");

const utilSendResJson = require("../utils/functions/utilSendResJson");
const utilSendResTemplate = require("../utils/functions/utilSendResTemplate");

//
const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith("/api"))
        utilSendResJson({
            res,
            statusCode: err.statusCode,
            status: err.status,
            message: err.message,
            stack: err.stack,
        });
    else {
        utilSendResTemplate({
            res,
            statusCode: err.statusCode,
            templateName: "error",
            title: "Something went wrong",
            data: { message: err.message },
        });
    }
};

//
const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        if (req.originalUrl.startsWith("/api"))
            utilSendResJson({ res, statusCode: err.statusCode, status: err.status, message: err.message });
        else
            utilSendResTemplate({
                res,
                statusCode: err.statusCode,
                templateName: "error",
                title: "Something went wrong",
                data: { message: err.message },
            });
    } else {
        if (req.originalUrl.startsWith("/api"))
            utilSendResJson({ res, statusCode: 500, status: "error", message: "Something went wrong." });
        else
            utilSendResTemplate({
                res,
                statusCode: err.statusCode,
                templateName: "error",
                title: "Something went wrong",
                data: { message: "Please, try again later" },
            });
    }
};

//
const handleCastError = err => new UtilAppError(`Invalid ${err.path}: ${err.value}.`, 400);
const handleDuplicateKey = err => {
    const duplicate = err.msg.match(/(['"])(\\?.)*?\1/)[0];
    return new UtilAppError(`${duplicate}. Please, use another key`, 404);
};
const handleValidationError = err => {
    const errors = Object.values(err.errors).map(error => error.message);
    return new UtilAppError(`Invalid input data ${errors.join(". ")}`);
};
const handleJWTError = () => new UtilAppError("Invalid token. Please login again", 401);
const handleJWTExpired = () => new UtilAppError("Your token has expired. Please login again", 401);

//
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") sendErrorDev(err, req, res);
    else {
        let errCopy = { ...err };
        errCopy.message = err.message;

        if (errCopy.name === "CastError") errCopy = handleCastError(errCopy);
        if (errCopy.code === 11000) errCopy = handleDuplicateKey(errCopy);
        if (errCopy.name === "ValidationError") errCopy = handleValidationError(errCopy);
        if (errCopy.name === "JsonWebTokenError") errCopy = handleJWTError();
        if (errCopy.name === "TokenExpiredError") errCopy = handleJWTExpired();

        sendErrorProd(errCopy, res);
    }
};
