var CryptoJS = require("crypto-js");
module.exports.EncryptState = function EncryptState(Data,PassWord) { return CryptoJS.AES.encrypt(Data, PassWord).toString(); }

module.exports.DecryptState = function DecryptState(Data,PassWord) { return CryptoJS.AES.decrypt(Data, PassWord).toString(CryptoJS.enc.Utf8); }







