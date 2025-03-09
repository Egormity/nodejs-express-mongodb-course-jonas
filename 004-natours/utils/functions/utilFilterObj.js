module.exports = (obj, ...allowedFields) => {
    const newObj = {};
    Object.entries(obj).forEach(([key, value]) => {
        if (allowedFields.includes(key)) newObj[key] = value;
    });
    return newObj;
};
