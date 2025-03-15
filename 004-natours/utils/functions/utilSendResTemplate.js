module.exports = ({ res, statusCode, templateName, data, title }) => {
    res.status(statusCode).render(templateName, {
        title,
        data,
    });
};
