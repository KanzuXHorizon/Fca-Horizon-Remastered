var CryptoJS = require("crypto-js");
if (!require('../Src/SecurityCheck')()) {
    console.log("You Are Cheating !");
    process.exit(0)
}
module.exports.EncryptState = function EncryptState(Data,PassWord) { return CryptoJS.AES.encrypt(Data, PassWord).toString(); }

module.exports.DecryptState = function DecryptState(Data,PassWord) { return CryptoJS.AES.decrypt(Data, PassWord).toString(CryptoJS.enc.Utf8); }







