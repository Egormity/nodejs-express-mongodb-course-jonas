const express = require("express");

//
const { getTours, postTour, patchTour, getTour, deleteTour } = require("../controllers/controllerTours");

//
const router = express.Router();

//
router.route("/").get(getTours).post(postTour);
router.route("/:id").get(getTour).patch(patchTour).delete(deleteTour);

//
module.exports = router;
