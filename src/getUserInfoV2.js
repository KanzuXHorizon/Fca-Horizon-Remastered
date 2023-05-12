/* eslint-disable linebreak-style */
"use strict";

module.exports = function (defaultFuncs, api, ctx) {
    return function getUserInfoV2(id, callback) {
      var resolveFunc = function () { };
      var rejectFunc = function () { };
      var returnPromise = new Promise(function (resolve, reject) {
        resolveFunc = resolve;
        rejectFunc = reject;
      });
  
      if (!callback) {
        callback = function (err, userInfo) {
          if (err) return rejectFunc(err);
          resolveFunc(userInfo);
        };
      }
    try {
      var { getInfo } = require('../Extra/ExtraAddons');
      getInfo(id,ctx.jar,ctx,defaultFuncs)
        .then(data => {
          //api.Horizon_Data([data], "Users", "Post");
        return callback(null, data);
      });
    }
    catch (e) {
      return callback(null, e);
    }
    return returnPromise;
    };
  };