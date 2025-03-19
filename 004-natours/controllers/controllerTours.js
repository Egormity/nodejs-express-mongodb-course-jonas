const multer = require("multer");
const sharp = require("sharp");

const utilCatchAsync = require("../utils/functions/utilCatchAsync");
const utilSendResJson = require("../utils/functions/utilSendResJson");

const ModelTour = require("../models/modelTour");

const HandlerFactory = require("./handlerFactory");
const UtilAppError = require("../utils/classes/utilAppError");

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) cb(null, true);
    else cb(new UtilAppError("Image extension not recognized. Please upload a valid image"), false);
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

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
exports.uploadTourImages = upload.fields([
    { name: "imageCover", maxCount: 1 },
    { name: "images", minCount: 3 },
]);

//
exports.resizeTourImages = utilCatchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.file.images) return next();

    // 1. Image cover
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);

    // 2. Images
    await Promise.all(
        req.files.images.map((file, i) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
            req.body.images.push(filename);
            return sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat("jpeg")
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${filename}`);
        }),
    );

    // 3. Update
    next();
});

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
