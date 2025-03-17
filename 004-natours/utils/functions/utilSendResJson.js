module.exports = ({ res, statusCode, status = "success", token, message, stack, data }) => {
    res.status(statusCode).json({
        status,
        token,
        message,
        stack,
        data,
    });
};
