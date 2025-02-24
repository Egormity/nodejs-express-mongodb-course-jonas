const ModelTour = require("../models/modelTour");

//
exports.getTours = async (req, res) => {
    try {
        const data = await ModelTour.find();
        res.status(200).json({ status: "success", data: data });
    } catch (error) {
        res.status(404).json({ status: "fail", message: error });
    }
};

//
exports.getTour = async (req, res) => {
    try {
        const data = await ModelTour.findById(req.params.id);
        res.status(200).json({ status: "success", data });
    } catch (error) {
        res.status(404).json({ status: "fail", message: error });
    }
};

//
exports.postTour = async (req, res) => {
    try {
        const data = await ModelTour.create(req.body);
        res.status(201).json({ status: "success", data });
    } catch (error) {
        res.status(400).json({ status: "error", message: error });
    }
};

//
exports.patchTour = async (req, res) => {
    try {
        const data = await ModelTour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(201).json({ status: "success", data });
    } catch (error) {
        res.status(400).json({ status: "error", message: error });
    }
};

//
exports.deleteTour = async (req, res) => {
    try {
        const data = await ModelTour.findByIdAndDelete(req.params.id);
        res.status(204).json({ status: "success", data });
    } catch (error) {
        res.status(400).json({ status: "error", message: error });
    }
};
