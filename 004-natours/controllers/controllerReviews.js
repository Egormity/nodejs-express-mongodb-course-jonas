const ModelReview = require("../models/modelReview");

const UtilApiFeatures = require("../utils/classes/utilApiFeatures");
const UtilAppError = require("../utils/classes/utilAppError");

const utilSendResJson = require("../utils/functions/utilSendResJson");
const utilCatchAsync = require("../utils/functions/utilCatchAsync");

//
exports.getReviews = utilCatchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new UtilApiFeatures(ModelReview.find(filter), req.query).filter().sort().limit(); // .paginate();

    const data = await features.query;
    utilSendResJson({ res, statusCode: 200, data });
});

//
exports.getReview = utilCatchAsync(async (req, res, next) => {
    const { id } = req.params;
    const data = await ModelReview.findById(id);
    if (!data) return next(new UtilAppError(`No Reviews found with id: ${id}`));
    utilSendResJson({ res, statusCode: 200, data });
});

//
exports.postReview = utilCatchAsync(async (req, res, next) => {
    // Nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user._id; // req.user comes from the protected route
    const data = await ModelReview.create(req.body);
    utilSendResJson({ res, statusCode: 200, data });
});
