const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

//
const schemaUser = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A user must have a name"],
    },
    email: {
        type: String,
        required: [true, "A user must have an email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "An email must be valid"],
    },
    photo: String,
    password: {
        type: String,
        required: [true, "A user must have a password"],
        minLength: 8,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, "A user must have a password"],
        validate: [
            function (el) {
                return el === this.password;
            },
            "Passwords must be the same",
        ],
        select: false,
    },
});

//
schemaUser.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

//
schemaUser.methods.isCorrectPassword = async (candidatePassword, userPassword) => {
    const result = await bcrypt.compare(candidatePassword, userPassword);
    return result;
};

//
module.exports = mongoose.model("User", schemaUser);
