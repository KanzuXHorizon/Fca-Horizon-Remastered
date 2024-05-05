const crypto = require('crypto')
const RandPass = Array.from({length: 101}, (_,i) => crypto.randomBytes(5).toString('hex'));
console.log(RandPass)