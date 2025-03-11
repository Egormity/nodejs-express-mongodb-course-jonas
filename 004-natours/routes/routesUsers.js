const express = require("express");

const { getUsers, postUser, getUser, patchUser, deleteUser } = require("../controllers/controllerUsers");
const { protect } = require("../controllers/controllerAuth");

//
const router = express.Router();

//
router.route("/").get(protect, getUsers).post(protect, postUser);
router.route("/:id").get(protect, getUser).patch(protect, patchUser).delete(protect, deleteUser);

//
module.exports = router;
