const ModelTour = require("../models/modelTour");
const utilCatchAsync = require("../utils/functions/utilCatchAsync");
const utilSendResTemplate = require("../utils/functions/utilSendResTemplate");

//
module.exports.getLogin = utilCatchAsync(async (req, res, next) => {
    // 1. Build the template
    // Inside the pug
    // console.log(tours);

    // 2. Render the template
    utilSendResTemplate({
        res,
        statusCode: 200,
        templateName: "login",
        title: "Log into your account",
    });
});

//
module.exports.getOverview = utilCatchAsync(async (req, res, next) => {
    // 1. Get tour data
    const tours = await ModelTour.find();

    // 2. Build the template
    // Inside the pug
    // console.log(tours);

    // 3. Render the template
    utilSendResTemplate({
        res,
        statusCode: 200,
        templateName: "overview",
        data: tours,
        title: "Exciting tour for Adventurous people",
    });
});

//
module.exports.getTour = utilCatchAsync(async (req, res, next) => {
    // 1. Get tour data
    const tour = await ModelTour.findOne({ slug: req.params.slug }).populate({
        path: "reviews",
        fields: "review rating user",
    });

    // 2. Build the template
    // Inside the pug
    // console.log(tour);

    // 3. Render the template
    utilSendResTemplate({
        res,
        statusCode: 200,
        templateName: "tour",
        data: tour,
        title: `${tour?.name} Tour`,
    });
});
