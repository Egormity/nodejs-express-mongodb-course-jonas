const express = require("express");

const ControllerAuth = require("../controllers/controllerAuth");
const ControllerUsers = require("../controllers/controllerUsers");

//
const router = express.Router();

//
router.post("/signup", ControllerAuth.signup);
router.post("/login", ControllerAuth.login);

//
router.post("/forgot-password", ControllerAuth.forgotPassword);
router.patch("/reset-password/:token", ControllerAuth.resetPassword);

//
router.get("/getMe", ControllerAuth.protect, ControllerAuth.middlewareGetMe, ControllerUsers.getUser);

//
router.patch("/update-my-password", ControllerAuth.protect, ControllerAuth.updateMyPassword);
router.patch("/update-me", ControllerAuth.protect, ControllerAuth.updateMe);
router.patch("/delete-me", ControllerAuth.protect, ControllerAuth.deleteMe);

//
module.exports = router;
