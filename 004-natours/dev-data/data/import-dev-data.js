const fs = require("fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

//
const ModelTour = require("../../models/modelTour");
const ModelUser = require("../../models/modelUser");
const ModelReview = require("../../models/modelReview");
dotenv.config({ path: "./.env" });

//
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

//
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, "utf-8"));

//
const importData = async () => {
    try {
        await ModelTour.createMany(tours);
        await ModelUser.createMany(users);
        await ModelReview.createMany(reviews);
        console.log("Data successfully loader");
    } catch (error) {
        console.log(error);
    }
};

//
const deleteData = async () => {
    try {
        await ModelTour.deleteMany();
        await ModelTour.deleteMany();
        await ModelTour.deleteMany();
        console.log("Data successfully deleted");
    } catch (error) {
        console.log(error);
    }
};

//
if (process.argv[2] === "--import") {
    importData();
    console.log("success");
    process.exit();
}

//
if (process.argv[2] === "--delete") {
    deleteData();
    console.log("success");
    process.exit();
}
