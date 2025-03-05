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

//
const router = express.Router();

//
router.route("/top-5").get(aliasPopularTours, getTours);

//
router.route("/").get(protect, getTours).post(postTour);
router.route("/:id").get(getTour).patch(patchTour).delete(deleteTour);

//
router.route("/stats").get(getToursStats);

//
router.route("/monthly-plan/:year").get(getMonthlyPlan);

//
module.exports = router;
