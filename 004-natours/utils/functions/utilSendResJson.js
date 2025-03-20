module.exports = ({ res, statusCode, status = "success", token, message, stack, session, data }) => {
    res.status(statusCode).json({
        status,
        token,
        message,
        stack,
        session,
        data,
    });
};
