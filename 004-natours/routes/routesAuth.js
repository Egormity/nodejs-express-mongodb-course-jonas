const express = require("express");

const {
    protect,
    signup,
    login,
    forgotPassword,
    resetPassword,
    updateMyPassword,
    updateMe,
    deleteMe,
} = require("../controllers/controllerAuth");

//
const router = express.Router();

//
router.post("/signup", signup);
router.post("/login", login);

//
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

//
router.patch("/updateMyPassword", protect, updateMyPassword);
router.patch("/updateMe", protect, updateMe);
router.patch("/deleteMe", protect, deleteMe);

//
module.exports = router;
