const path = require("path");

const cors = require("cors");
const morgan = require("morgan");
const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");

const routerAuth = require("./routes/routesAuth");
const routerBookings = require("./routes/routesBookings");
const controllerErrors = require("./controllers/controllerErrors");
const routerReviews = require("./routes/routesReviews");
const routerTours = require("./routes/routesTours");
const routerUsers = require("./routes/routesUsers");
const routerViews = require("./routes/routesViews");

const hpp = require("hpp");

const UtilAppError = require("./utils/classes/utilAppError");

// Create express app
const app = express({
    // origin: "http://127.0.0.1:3000"
});

// Enable trust proxy
app.enable("trust proxy");

// Enable cors
app.use(cors());
app.options("*", cors());

// Set the views folder
app.set("views", path.join(__dirname, "views"));

// Provide the static folder
app.use(express.static(path.join(__dirname, "public")));

// Set view engine
app.set("view engine", "pug");

// Development logging requests
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Set security http
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                connectSrc: ["'self'", "http://127.0.0.1:3000"],
            },
        },
    }),
);

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
app.use(express.json({ limit: "100kb" }));

// Data sanitization against noSQL query injection
app.use(mongoSanitize());

// Prevent parameters pollution
app.use(hpp());

// Add request time to each request made
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// Compress responses
app.use(compression());

// Routes api
app.use("/api/v1/auth", routerAuth);
app.use("/api/v1/bookings", routerBookings);
app.use("/api/v1/reviews", routerReviews);
app.use("/api/v1/tours", routerTours);
app.use("/api/v1/users", routerUsers);

// Routes views
app.use("/", routerViews);

// Route not found
app.all("*", (req, res, next) => {
    next(new UtilAppError(`${req.originalUrl} could not be found`, 404));
});

// Middleware to handle errors
app.use(controllerErrors);

// Default export the app
module.exports = app;
