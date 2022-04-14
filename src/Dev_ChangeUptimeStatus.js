/* eslint-disable linebreak-style */
"use strict";

module.exports = function (defaultFuncs, api, ctx) {
    return function (boolean, callback) {
        var resolveFunc = function () { };
        var rejectFunc = function () { };
    var returnPromise = new Promise(function (resolve, reject) {
        resolveFunc = resolve;
        rejectFunc = reject;
    }); 

    if (!callback) {
        callback = function (err, data) {
            if (err) return rejectFunc(err);
            resolveFunc(data);
        };
    }
    try {
        // luoi qua huhuhuh sos
    }
    catch (e) {
        return callback(null, e);
    }
    return returnPromise;
    };
};