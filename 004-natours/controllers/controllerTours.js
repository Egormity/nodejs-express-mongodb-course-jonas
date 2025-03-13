const utilCatchAsync = require("../utils/functions/utilCatchAsync");
const utilSendResJson = require("../utils/functions/utilSendResJson");

const ModelTour = require("../models/modelTour");

const HandlerFactory = require("./handlerFactory");
const UtilAppError = require("../utils/classes/utilAppError");

//
exports.getTours = HandlerFactory.getAll({ Model: ModelTour });
exports.getTour = HandlerFactory.getOne({ Model: ModelTour, populateOptions: { path: "reviews" } });
exports.postTour = HandlerFactory.postOne({ Model: ModelTour });
exports.patchTour = HandlerFactory.patchOne({ Model: ModelTour });
exports.deleteTour = HandlerFactory.deleteOne({ Model: ModelTour });

//
exports.aliasPopularTours = (req, res, next) => {
    req.query.limit = "5";
    req.query.sort = "-ratingsAverage,price";
    req.query.fields = "name,price,ratingsAverage,difficulty,summary";
    next();
};

//
exports.getToursWithin = utilCatchAsync(async (req, res, next) => {
    const { distance, latLng, unit } = req.params;
    const [lat, lng] = latLng.split(",").map(el => +el);
    if (isNaN(lat) || isNaN(lng)) return next(new UtilAppError("Invalid lat and (or) lng provided", 404));

    //
    const radius = distance / (unit === "mi" ? 3963.2 : 6378.1);
    const tours = await ModelTour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });
    utilSendResJson({ res, statusCode: 200, data: tours });
});

//
exports.getToursDistances = utilCatchAsync(async (req, res, next) => {
    const { latLng, unit } = req.params;
    const [lat, lng] = latLng.split(",").map(el => +el);
    if (isNaN(lat) || isNaN(lng)) return next(new UtilAppError("Invalid lat and (or) lng provided", 404));

    //
    const distances = await ModelTour.aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [lng, lat],
                },
                distanceField: "distance",
            },
        },
        {
            $project: {
                name: 1,
                distance: 1,
                distanceMultiplier: unit === "mi" ? 0.000621371 : 0.001,
            },
        },
    ]);
    utilSendResJson({ res, statusCode: 200, data: distances });
});

//
exports.getToursStats = utilCatchAsync(async (req, res, next) => {
    const data = await ModelTour.aggregate([
        {
            $group: {
                _id: { $toUpper: "$difficulty" },
                numTours: { $sum: 1 },
                numRating: { $sum: "$ratingsQuantity" },
                avgRating: { $avg: "$ratingsAverage" },
                avgPrice: { $avg: "$price" },
                minPrice: { $min: "$price" },
                maxPrice: { $max: "$price" },
            },
        },
        {
            $sort: { avgPrice: 1 },
        },
    ]);
    utilSendResJson({ res, statusCode: 200, data });
});

//
exports.getMonthlyPlan = utilCatchAsync(async (req, res, next) => {
    const year = +req.params.year;
    const data = await ModelTour.aggregate([
        {
            $unwind: "$startDates",
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { $month: "$startDates" },
                numTourStarts: { $sum: 1 },
                tours: { $push: "$name" },
            },
        },
        {
            $addFields: { month: "$_id" },
        },
        {
            $project: { _id: 0 },
        },
        {
            $sort: { month: 1, numTourStarts: 1 },
        },
    ]);
    utilSendResJson({ res, statusCode: 200, data });
});
