const express = require("express");

const ControllerBookings = require("../controllers/controllerBookings");
const ControllerAuth = require("../controllers/controllerAuth");

//
const router = express.Router();

// Protect all routes bellow
router.use(ControllerAuth.protect);

// Base
router.get("/checkout-session/:tourId", ControllerBookings.getCheckoutSession);

//
module.exports = router;
