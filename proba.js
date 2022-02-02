const BN = require("bn.js");

console.log("ok");

const a = new BN(5);
const b = new BN(2);
console.log(a.divRound(b).toNumber());
