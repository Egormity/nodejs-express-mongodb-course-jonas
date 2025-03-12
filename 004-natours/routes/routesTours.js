const express = require("express");

const ControllerTours = require("../controllers/controllerTours");
const ControllerAuth = require("../controllers/controllerAuth");

const routerReviews = require("./routesReviews");

// Create a router
const router = express.Router();

// Protect all routes bellow
router.use(ControllerAuth.protect);

// Merge with reviews router
router.use("/:tourId/reviews", routerReviews);

// Query
router.route("/top-5").get(ControllerTours.aliasPopularTours, ControllerTours.getTours);

// Base
router.route("/").get(ControllerTours.getTours).post(ControllerTours.postTour);
router
    .route("/:id")
    .get(ControllerTours.getTour)
    .patch(ControllerTours.patchTour)
    .delete(ControllerTours.deleteTour);

// Aggregations
router.route("/stats").get(ControllerTours.getToursStats);
router.route("/monthly-plan/:year").get(ControllerTours.getMonthlyPlan);

// Export default
module.exports = router;
