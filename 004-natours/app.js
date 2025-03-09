const morgan = require("morgan");
const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

const routerTours = require("./routes/routesTours");
const routerUsers = require("./routes/routesUsers");
const routerAuth = require("./routes/routesAuth");
const controllerErrors = require("./controllers/controllerErrors");
const hpp = require("hpp");

const UtilAppError = require("./utils/classes/utilAppError");

// Development logging requests
const app = express();
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Set security http
app.use(helmet());

// Limit amount of requests
app.use(
    "/api",
    rateLimit({
        max: 100,
        windowMs: 1000 * 60,
        message: "Too many requests from this IP. Try again later",
    }),
);

// Enable json responses
app.use(express.json({ limit: "10kb" }));

// Data sanitization against noSQL query injection
app.use(mongoSanitize());

// Prevent parameters pollution
app.use(hpp());

// Provide the static folder
app.use(express.static(`${__dirname}./public`));

// Add request time to each request made
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// Routes
app.use("/api/v1/tours", routerTours);
app.use("/api/v1/users", routerUsers);
app.use("/api/v1/auth", routerAuth);

// Route not found
app.all("*", (req, res, next) => {
    next(new UtilAppError(`${req.originalUrl} could not be found`, 404));
});

// Middleware to handle errors
app.use(controllerErrors);

// Default export the app
module.exports = app;
