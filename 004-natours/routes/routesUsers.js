const express = require("express");

const ControllerUser = require("../controllers/controllerUsers");
const ControllerAuth = require("../controllers/controllerAuth");

//
const router = express.Router();

// Protect all routes bellow
router.use(ControllerAuth.protect);

//
router.route("/").get(ControllerUser.getUsers).post(ControllerUser.postUser);
router
    .route("/:id")
    .get(ControllerUser.getUser)
    .patch(ControllerUser.patchUser)
    .delete(ControllerUser.deleteUser);

//
module.exports = router;
