// console.log(arguments);
// console.log(require("module").wrapper);

// module.exports
const C = require("./test-module-1");
const calc1 = new C();
console.log(calc1.add(8, 7));

// exports
const calc2 = require("./test-module-2");
console.log(calc2.add(8, 7));

const { add } = require("./test-module-2");
console.log(add(8, 7));

require("./test-module-3")();
require("./test-module-3")();
require("./test-module-3")();
