//
const morgan = require("morgan");
const express = require("express");

//
const routerTours = require("./routes/routesTours");
const routerUsers = require("./routes/routesUsers");

//
const app = express();
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}
app.use(express.json());
app.use(express.static(`${__dirname}./public`));
app.use((req, res, next) => {
    console.log("Hello from the middleware!");
    next();
});
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

//
app.use("/api/v1/tours", routerTours);
app.use("/api/v1/users", routerUsers);

//
module.exports = app;
