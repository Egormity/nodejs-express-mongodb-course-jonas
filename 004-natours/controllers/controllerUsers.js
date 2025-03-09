const modelUser = require("../models/modelUser");

const UtilAppError = require("../utils/classes/utilAppError");

const utilCatchAsync = require("../utils/functions/utilCatchAsync");

//
exports.getUsers = utilCatchAsync(async (req, res) => {
    const data = await modelUser.find();
    res.status(200).json({ status: "success", data: { data } });
});

//
exports.getUser = utilCatchAsync(async (req, res, next) => {
    const { id } = req.params;
    const data = await modelUser.findById(id);
    if (!data) return next(new UtilAppError(`No users found with id: ${id}`));
    res.status(200).json({ status: "success", data: { data } });
});

//
exports.postUser = (req, res) => {
    res.status(500).json({ status: "error", message: "Route has not been implemented yet" });
};

//
exports.patchUser = (req, res) => {
    res.status(500).json({ status: "error", message: "Route has not been implemented yet" });
};

//
exports.deleteUser = (req, res) => {
    res.status(500).json({ status: "error", message: "Route has not been implemented yet" });
};
