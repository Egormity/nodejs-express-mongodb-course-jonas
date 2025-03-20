const mongoose = require("mongoose");

const {
    SCHEMA_NAME_TOUR,
    SCHEMA_NAME_USER,
    SCHEMA_NAME_REVIEW,
} = require("../utils/constants/constants.mongo");

const ModelTour = require("./modelTour");

//
const schemaReview = mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, "A review cannot be empty"],
        },
        rating: {
            type: Number,
            required: [true, "A reviews must have a rating from 1 to 5"],
            min: 1,
            max: 5,
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: SCHEMA_NAME_USER,
            required: [true, "A review must belong to a user"],
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: SCHEMA_NAME_TOUR,
            required: [true, "A review must belong to a tour"],
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
    },
    {
        toJSON: { virtions: true },
        toObject: { virtions: true },
    },
);

//
schemaReview.index({ tour: 1, user: 1 }, { unique: true });

// query middleware
schemaReview.pre(/^find/, function (next) {
    this.find();
    this.populate({
        path: "user",
        select: "-__v -passwordChangedAt",
    });
    // this.populate({
    //     path: "tour",
    //     select: "-__v",
    // });
    next();
});

//
schemaReview.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId },
        },
        {
            $group: {
                _id: "$tour",
                numRatings: { $sum: 1 },
                avgRating: { $avg: "$rating" },
            },
        },
    ]);
    await ModelTour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats?.[0]?.numRatings || 0,
        ratingsAverage: stats?.[0]?.avgRating || 0,
    });
};

//
schemaReview.post("save", function () {
    this.constructor.calcAverageRatings(this.tour);
});

//
schemaReview.pre(/^findOneAnd/, async function (next) {
    this.review = await this.findOne();
    next();
});

//
schemaReview.post(/^findOneAnd/, async function () {
    console.log(this);
    await this.review.constructor(this.review.tour);
});

//
module.exports = mongoose.model(SCHEMA_NAME_REVIEW, schemaReview);
