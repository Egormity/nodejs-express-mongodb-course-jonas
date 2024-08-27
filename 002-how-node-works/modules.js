// console.log(arguments);
// console.log(require('module').wrapper);

// ===> module.exports <=== //
const C = require('./test-module-1');
const calc1 = new C();
console.log(calc1.add(2, 5));

// ===> exports <=== //
// const calc2 = require('./test-module-2');
// console.log(calc2.multiply(2, 5));

const { add, subtract, multiply, divide } = require('./test-module-2');
console.log(divide(2, 5));

// ===> Caching <=== //
require('./test-module-3')();
require('./test-module-3')();
require('./test-module-3')();
