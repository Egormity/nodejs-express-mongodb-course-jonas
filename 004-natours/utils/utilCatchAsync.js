module.exports = utilCatchAsync = async func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    };
};
