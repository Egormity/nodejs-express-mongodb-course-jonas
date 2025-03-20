const mongoose = require("mongoose");

const {
    SCHEMA_NAME_BOOKING,
    SCHEMA_NAME_TOUR,
    SCHEMA_NAME_USER,
} = require("../utils/constants/constants.mongo");

//
const schemaBooking = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: SCHEMA_NAME_TOUR,
        required: [true, "Booking must belong to a tour"],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: SCHEMA_NAME_USER,
        required: [true, "Booking must belong to a user"],
    },
    price: {
        type: Number,
        require: [true, "Booking must have a price"],
    },
    paid: {
        type: Boolean,
        default: true,
    },
});

//
bookingSchema.pre(/^find/, function (next) {
    this.populate("user").populate({ path: "tour", select: "name" });
    next();
});

//
module.exports = mongoose.model(SCHEMA_NAME_BOOKING, bookingSchema);
