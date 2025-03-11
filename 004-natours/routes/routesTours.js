const express = require("express");

const {
    aliasPopularTours,
    getTours,
    postTour,
    patchTour,
    getTour,
    deleteTour,
    getToursStats,
    getMonthlyPlan,
} = require("../controllers/controllerTours");
const { protect } = require("../controllers/controllerAuth");

const routerReviews = require("./routesReviews");

// Create a router
const router = express.Router();

// Merge with reviews router
router.use("/:tourId/reviews", routerReviews);

// Query
router.route("/top-5").get(protect, aliasPopularTours, getTours);

// Base
router.route("/").get(protect, getTours).post(protect, postTour);
router.route("/:id").get(protect, getTour).patch(protect, patchTour).delete(protect, deleteTour);

// Aggregations
router.route("/stats").get(protect, getToursStats);
router.route("/monthly-plan/:year").get(protect, getMonthlyPlan);

// Export default
module.exports = router;
