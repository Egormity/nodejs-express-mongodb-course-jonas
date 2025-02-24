const mongoose = require("mongoose");

const schemaTour = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A tour must have a name"],
        unique: true,
    },
    rating: {
        type: Number,
        default: 4.5,
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price"],
    },
});
module.exports = mongoose.model("Tour", schemaTour);
