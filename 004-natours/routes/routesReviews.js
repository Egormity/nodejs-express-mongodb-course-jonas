const express = require("express");

const { getReviews, getReview, postReview } = require("../controllers/controllerReviews");
const { protect } = require("../controllers/controllerAuth");

//
const router = express.Router({ mergeParams: true });

//
router.route("/").get(protect, getReviews).post(protect, postReview);
router.route("/:id").get(protect, getReview);

//
module.exports = router;
