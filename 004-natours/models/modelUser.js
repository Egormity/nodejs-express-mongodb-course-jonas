const crypto = require("crypto");

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
    photo: {
        type: String,
        default: "default.jpg",
    },
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
        default: Date.now(),
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

//
schemaUser.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

//
schemaUser.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    this.passwordChangedAt = Date.now() - 1000 * 60;
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
schemaUser.methods.createPasswordResetToken = function () {
    const token = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    // console.log({
    //     token,
    //     passwordResetToken: this.passwordResetToken,
    //     passwordResetExpires: this.passwordResetExpires,
    // });
    return token;
};

//
module.exports = mongoose.model("ModelUser", schemaUser);
