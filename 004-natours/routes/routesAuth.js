const express = require("express");

const ControllerAuth = require("../controllers/controllerAuth");
const ControllerUsers = require("../controllers/controllerUsers");

//
const router = express.Router();

//
router.post("/signup", ControllerAuth.signup);
router.post("/login", ControllerAuth.login);

//
router.post("/forgotPassword", ControllerAuth.forgotPassword);
router.patch("/resetPassword/:token", ControllerAuth.resetPassword);

//
router.get("/getMe", ControllerAuth.protect, ControllerAuth.middlewareGetMe, ControllerUsers.getUser);

//
router.patch("/updateMyPassword", ControllerAuth.protect, ControllerAuth.updateMyPassword);
router.patch("/updateMe", ControllerAuth.protect, ControllerAuth.updateMe);
router.patch("/deleteMe", ControllerAuth.protect, ControllerAuth.deleteMe);

//
module.exports = router;
