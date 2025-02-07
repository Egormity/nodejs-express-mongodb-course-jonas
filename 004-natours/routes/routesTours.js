//
const express = require("express");

//
const {
    checkTourId,
    checkPostTour,
    getTours,
    postTour,
    patchTour,
    getTour,
    deleteTour,
} = require("../controllers/controllerTours");

//
const router = express.Router();
router.param("id", checkTourId);

//
router.route("/").get(getTours).post(checkPostTour, postTour);
router.route("/:id").get(getTour).patch(patchTour).delete(deleteTour);

//
module.exports = router;
