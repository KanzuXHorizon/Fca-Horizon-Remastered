'use strict';

var CryptoJS = require("crypto-js");

/**
 * Encrypt the text using the CryptoJS library and return the encrypted text as a Base64 string.
 * @param Data - The data to be encrypted.
 * @returns A string of characters that represent the encrypted data.
 */
module.exports.Encrypt = function Encrypt(Data) {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(Data));
};

/**
 * Decrypt the data using the CryptoJS library, and return the decrypted data as a string.
 * @param Data - The data to be decrypted.
 * @returns The decrypted data.
 */

module.exports.Decrypt = function Decrypt(Data) {
    return CryptoJS.enc.Base64.parse(Data).toString(CryptoJS.enc.Utf8);
};
