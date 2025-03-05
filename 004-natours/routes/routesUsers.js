const express = require("express");

const { getUsers, postUser, getUser, patchUser, deleteUser } = require("../controllers/controllerUsers");
const { signup, login } = require("../controllers/controllerAuth");

//
const router = express.Router();

//
router.post("/signup", signup);

//
router.post("/login", login);

//
router.route("/").get(getUsers).post(postUser);
router.route("/:id").get(getUser).patch(patchUser).delete(deleteUser);

//
module.exports = router;
