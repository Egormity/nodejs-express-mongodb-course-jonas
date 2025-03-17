const express = require("express");

const controllerAuth = require("../controllers/controllerAuth");
const controllerViews = require("../controllers/controllerViews");

//
const router = express.Router();

// Add user if logged in to res.locals middleware
router.use(controllerAuth.isLoggedIn);

// Auth routes
router.get("/login", controllerViews.getLogin);

// Other routes
router.get("/", controllerViews.getOverview);
router.get("/tours/:slug", controllerViews.getTour);

//
module.exports = router;
