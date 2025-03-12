const UtilApiFeatures = require("../utils/classes/utilApiFeatures");
const UtilAppError = require("../utils/classes/utilAppError");

const utilCatchAsync = require("../utils/functions/utilCatchAsync");
const utilSendResJson = require("../utils/functions/utilSendResJson");

//
exports.getAll = ({ Model }) =>
    utilCatchAsync(async (req, res, next) => {
        //
        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId };

        //
        const features = new UtilApiFeatures(Model.find(filter), req.query).filter().sort().limit(); // .paginate();
        const documents = await features.query;
        utilSendResJson({ res, statusCode: 200, data: documents });
    });

//
exports.getOne = ({ Model, populateOptions }) =>
    utilCatchAsync(async (req, res, next) => {
        //
        const { id } = req.params;

        //
        let query = Model.findById(id).populate("reviews");
        if (populateOptions) query = query.populate(populateOptions);

        //
        const document = await query;
        if (!document) return next(new UtilAppError(`No documents found with id: ${id}`));
        utilSendResJson({ res, statusCode: 200, data: document });
    });

//
exports.postOne = ({ Model }) =>
    utilCatchAsync(async (req, res, next) => {
        const data = await Model.create(req.body);
        utilSendResJson({ res, statusCode: 201, data });
    });

//
exports.patchOne = ({ Model }) =>
    utilCatchAsync(async (req, res, next) => {
        const data = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        utilSendResJson({ res, statusCode: 201, data });
    });

//
exports.deleteOne = ({ Model }) =>
    utilCatchAsync(async (req, res, next) => {
        const document = await Model.findByIdAndDelete(req.params.id);
        if (!document) return next(new UtilAppError(`No documents found with id: ${req.params.id}`));
        utilSendResJson({ res, statusCode: 204, data: null });
    });
