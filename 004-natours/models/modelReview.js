const mongoose = require("mongoose");

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
            ref: "ModelUser",
            required: [true, "A review must belong to a user"],
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: "ModelTour",
            required: [true, "A review must belong to a tour"],
        },
    },
    {
        toJSON: { virtions: true },
        toObject: { virtions: true },
    },
);

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
module.exports = mongoose.model("ModelReview", schemaReview);
