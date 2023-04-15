"use strict";

var utils = require("../utils");
var log = require("npmlog");

module.exports = function (/** @type {{ post: any; postFormData?: (arg0: string, arg1: any, arg2: any, arg3: {}) => any; get?: (arg0: any, arg1: any) => Promise<any>; }} */ defaultFuncs, /** @type {any} */ api, /** @type {{ jar: any; fb_dtsg?: string; ttstamp?: string; }} */ ctx) {
  return function handleMessageRequest(/** @type {string | any[]} */ threadID, /** @type {any} */ accept, /** @type {((err: any, data: any) => void) | ((arg0: undefined) => any)} */ callback) {
    if (utils.getType(accept) !== "Boolean") throw { error: "Please pass a boolean as a second argument." };

    var resolveFunc = function () { };
    var rejectFunc = function () { };
    var returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = function (/** @type {any} */ err, /** @type {any} */ data) {
        if (err) return rejectFunc(err);
        resolveFunc(data);
      };
    }

    var form = {
      client: "mercury"
    };

    if (utils.getType(threadID) !== "Array") threadID = [threadID];

    var messageBox = accept ? "inbox" : "other";

    for (var i = 0; i < threadID.length; i++) form[messageBox + "[" + i + "]"] = threadID[i];

    defaultFuncs
      .post("https://www.facebook.com/ajax/mercury/move_thread.php", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function (/** @type {{ error: any; }} */ resData) {
        if (resData.error) throw resData;

        return callback();
      })
      .catch(function (/** @type {string} */ err) {
        log.error("handleMessageRequest", err);
        return callback(err);
      });

    return returnPromise;
  };
};
