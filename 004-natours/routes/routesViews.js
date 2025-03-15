const express = require("express");

const controllerViews = require("../controllers/controllerViews");

//
const router = express.Router();

//
router.get("/", controllerViews.getOverview);
router.get("/tours/:slug", controllerViews.getTour);

//
module.exports = router;
