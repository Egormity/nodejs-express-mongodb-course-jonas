module.exports = class UtilAppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = statusCode >= 500 ? "fail" : "error";
        this.isOperation = true;

        Error.captureStackTrace(this, this.constructor);
    }
};
