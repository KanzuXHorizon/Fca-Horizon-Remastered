"use strict";

var utils = require("../utils");
var log = require("npmlog");
var database = require('../Extra/Database');
module.exports = function (defaultFuncs, api, ctx) {
    return function (args,callback) {
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
            if (database(true).get('agreement') == true) {
                callback(null, "Accecpt");
            }
            else {
                database(true).set('agreement', true);
                var Form = "=== Horizon end-user license agreement ===\n\n Free to use and edited ✨";
                callback(null, Form);
            }
        return returnPromise;
    };
};
