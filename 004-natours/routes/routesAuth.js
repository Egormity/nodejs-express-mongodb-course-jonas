const express = require("express");

const ControllerAuth = require("../controllers/controllerAuth");
const ControllerUsers = require("../controllers/controllerUsers");

//
const router = express.Router();

//
router.post("/signup", ControllerAuth.signup);
router.post("/login", ControllerAuth.login);
router.get("/logout", ControllerAuth.logout);

//
router.post("/forgot-password", ControllerAuth.forgotPassword);
router.patch("/reset-password/:token", ControllerAuth.resetPassword);

// Protect all routes bellow
router.use(ControllerAuth.protect);

//
router.get("/get-me", ControllerAuth.getMe, ControllerUsers.getUser);

//
router.patch("/update-my-password", ControllerAuth.updateMyPassword);
router.patch(
    "/update-me",
    ControllerAuth.uploadUserPhoto,
    ControllerAuth.resizeUserPhoto,
    ControllerAuth.updateMe,
);
router.patch("/delete-me", ControllerAuth.deleteMe);

//
module.exports = router;
