const dotenv = require("dotenv");
const mongoose = require("mongoose");

//
process.on("uncaughtException", err => {
    console.log(err.name, err.message);
    console.log(err.stack);
    console.log("Uncaught rejection 💥 Shutting down the server...");
    process.exit(1);
});

//
dotenv.config({ path: "./config.env" });
const app = require("./app");

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
const port = process.env.PORT;
const server = app.listen(port, () => {
    console.log(`App running on port ${port} with ${process.env.NODE_ENV} mode`);
});

//
process.on("unhandledRejection", err => {
    console.log(err.name, err.message);
    console.log("Unhandled rejection 💥 Shutting down the server...");
    server.close(() => process.exit(1));
});
