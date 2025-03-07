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
    role: {
        type: String,
        enum: ["user", "guide", "lead-guide", "admin"],
        default: "user",
    },
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
    passwordChangedAt: {
        type: Date,
        default: Date.now,
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
schemaUser.methods.changedPasswordAfter = function (JWTTimestamp) {
    // 1. If an old user has never changed the password
    if (!this.passwordChangedAt) return false;

    // 2. If token time if before the passwordChangedAt return true
    if (new Date(this.passwordChangedAt).getTime() > JWTTimestamp * 1000) return true;

    // 3. If ok return not changed
    return false;
};

//
module.exports = mongoose.model("User", schemaUser);
