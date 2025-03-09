module.exports = ({ res, statusCode, data, token, message }) => {
    res.status(statusCode).json({
        status: "success",
        token,
        message,
        data,
    });
};
