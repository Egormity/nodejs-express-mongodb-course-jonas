const express = require("express");

const ControllerReviews = require("../controllers/controllerReviews");
const ControllerAuth = require("../controllers/controllerAuth");

//
const router = express.Router({ mergeParams: true });

// Protect all routes bellow
router.use(ControllerAuth.protect);

//
router.route("/").get(ControllerReviews.getReviews).post(ControllerReviews.postReview);
router
    .route("/:id")
    .get(ControllerReviews.getReview)
    .patch(ControllerReviews.middlewareSetTourUserIds, ControllerReviews.patchReview)
    .delete(ControllerReviews.deleteReview);

//
module.exports = router;
