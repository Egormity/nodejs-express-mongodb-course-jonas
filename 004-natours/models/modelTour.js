const mongoose = require("mongoose");
const slugify = require("slugify");

//
const schemaTour = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "A tour must have a name"],
            unique: true,
            trim: true,
            minLength: [3, "A tour name must have >= 3 characters"],
            maxLength: [40, "A tour name must have <= 40 characters"],
        },
        duration: {
            type: Number,
            required: [true, "A tour must have a duration"],
        },

        maxGroupSize: {
            type: Number,
            required: [true, "A tour must have a maxGroupSize"],
        },
        difficulty: {
            type: String,
            required: [true, "A tour must have a difficulty"],
            enum: {
                values: ["easy", "medium", "difficult"],
                message: "Difficulty must be easy, or, medium, or difficult",
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, "A rating must be >= 1"],
            max: [5, "A rating must be <= 5"],
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, "A tour must have a price"],
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (value) {
                    // This only point to current document on NEW document creating
                    return value < this.price;
                },
                message: "A tour discount must be < regular price",
            },
        },
        summary: {
            type: String,
            required: [true, "A tour must have a description"],
            trim: true,
        },
        description: {
            type: String,
        },
        imageCover: {
            type: String,
            required: [true, "A tour must have an image cover"],
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            // select: false,
        },
        startDates: [Date],
        slug: String,
        secretTour: {
            type: Boolean,
            default: false,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

//
schemaTour.virtual("durationWeeks").get(function () {
    return this.duration / 7;
});

// document middlewares // .pre runs before .save() and .create()
schemaTour.pre("save", function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// query middleware
schemaTour.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    next();
});

// query middleware
schemaTour.post(/^find/, function (docs, next) {
    // console.log(docs);
    next();
});

// aggregation middleware
schemaTour.pre("aggregate", function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next();
});

//
module.exports = mongoose.model("ModelTour", schemaTour);
