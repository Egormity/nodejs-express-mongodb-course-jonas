const ModelReview = require("../models/modelReview");

const HandlerFactory = require("./handlerFactory");

//
exports.middlewareSetTourUserIds = (req, res, next) => {
    // Nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user._id; // req.user comes from the protected route
    next();
};

//
exports.getReviews = HandlerFactory.getAll({ Model: ModelReview });
exports.getReview = HandlerFactory.getOne({ Model: ModelReview });
exports.postReview = HandlerFactory.postOne({ Model: ModelReview });
exports.patchReview = HandlerFactory.patchOne({ Model: ModelReview });
exports.deleteReview = HandlerFactory.deleteOne({ Model: ModelReview });
