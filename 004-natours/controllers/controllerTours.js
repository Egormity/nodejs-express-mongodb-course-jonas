const ModelTour = require("../models/modelTour");

const UtilApiFeatures = require("../utils/classes/utilApiFeatures");
const UtilAppError = require("../utils/classes/utilAppError");

const utilCatchAsync = require("../utils/functions/utilCatchAsync");

//
exports.aliasPopularTours = (req, res, next) => {
    req.query.limit = "5";
    req.query.sort = "-ratingsAverage,price";
    req.query.fields = "name,price,ratingsAverage,difficulty,summary";
    next();
};

//
exports.getTours = utilCatchAsync(async (req, res, next) => {
    const features = new UtilApiFeatures(ModelTour.find(), req.query).filter().sort().limit().paginate();
    const data = await features.query;
    res.status(200).json({ status: "success", data: { data } });
});

//
exports.getTour = utilCatchAsync(async (req, res, next) => {
    const { id } = req.params;
    const data = await ModelTour.findById(id);
    if (!data) return next(new UtilAppError(`No tours found with id: ${id}`));
    res.status(200).json({ status: "success", data: { data } });
});

//
exports.postTour = utilCatchAsync(async (req, res, next) => {
    const data = await ModelTour.create(req.body);
    res.status(201).json({ status: "success", data: { data } });
});

//
exports.patchTour = utilCatchAsync(async (req, res, next) => {
    const data = await ModelTour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    res.status(201).json({ status: "success", data: { data } });
});

//
exports.deleteTour = utilCatchAsync(async (req, res, next) => {
    const data = await ModelTour.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: "success", data: { data } });
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
    res.status(200).json({ status: "success", data: { data } });
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
    res.status(200).json({ status: "success", data: { data } });
});
