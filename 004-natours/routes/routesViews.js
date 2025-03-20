const express = require("express");

const controllerAuth = require("../controllers/controllerAuth");
const controllerBookings = require("../controllers/controllerBookings");
const controllerViews = require("../controllers/controllerViews");

//
const router = express.Router();

//

// Auth routes
router.get("/login", controllerViews.getLogin);

// Add user if logged in to res.locals middleware
router.use(controllerAuth.isLoggedIn);

// Other routes
router.get("/", controllerBookings.createBookingCheckout, controllerViews.getOverview);
router.get("/tours/:slug", controllerViews.getTour);

//
module.exports = router;
