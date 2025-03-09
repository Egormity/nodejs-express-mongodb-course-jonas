const express = require("express");

const { getUsers, postUser, getUser, patchUser, deleteUser } = require("../controllers/controllerUsers");

//
const router = express.Router();

//
router.route("/").get(getUsers).post(postUser);
router.route("/:id").get(getUser).patch(patchUser).delete(deleteUser);

//
module.exports = router;
