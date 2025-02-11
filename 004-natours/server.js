const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });
const app = require("./app");

const DB = process.env.DB_URL.replace("<db_password>", process.env.DB_PASSWORD);
mongoose
    // .connect(process.end.DB_URL_LOCAL, {
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
    })
    .then(() => {
        console.log("MongoDB connection successful");
    });

const tourSchema = new mongoose.Schema({
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
const Tour = mongoose.model("Tour", tourSchema);

const testTour = new Tour({
    name: "The Park Camper",
    rating: 4.7,
    price: 497,
});

testTour
    .save()
    .then((res) => console.log(res))
    .catch((err) => console.log(err));

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`App running on port ${port} with ${process.env.NODE_ENV} mode`);
});
