const fs = require("fs");
const crypto = require("crypto");

process.env.UV_THREDPOOL_SIZE = 4;

const start = Date.now();

setTimeout(() => console.log("Timeout finished 1"), 0);
setImmediate(() => console.log("Immediate finished 1"));

fs.readFile("test-file.txt", () => {
    console.log("I/O finished");

    setTimeout(() => console.log("Timeout finished 2"), 0);
    setTimeout(() => console.log("Timeout finished 3"), 3000);
    setImmediate(() => console.log("Immediate finished 2"));

    process.nextTick(() => console.log("process.nextTick"));

    crypto.pbkdf2("password", "salt", 100_000, 1024, "sha512", () => {
        console.log(Date.now() - start, "Encrypted");
    });
    crypto.pbkdf2("password", "salt", 100_000, 1024, "sha512", () => {
        console.log(Date.now() - start, "Encrypted");
    });
    crypto.pbkdf2("password", "salt", 100_000, 1024, "sha512", () => {
        console.log(Date.now() - start, "Encrypted");
    });
    crypto.pbkdf2("password", "salt", 100_000, 1024, "sha512", () => {
        console.log(Date.now() - start, "Encrypted");
    });
});

console.log("Top level code finished");
