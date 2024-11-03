"use strict";

const Balancer = require('../Extra/Balancer.js');
var utils = require("../utils");
var log = require("npmlog");

module.exports = function (defaultFuncs, api, ctx) {
  //const BalancerInstance = new Balancer(api.unsendMessage, unsendMessage, 0.85);
  
  function unsendMessage(messageID, threadID, callback) {
    var resolveFunc = function () { };
    var rejectFunc = function () { };
    var returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });
  
    if (!callback) {
      callback = function (err, friendList) {
        if (err) return rejectFunc(err);
        resolveFunc(friendList);
      };
    }

    if (threadID) return api.unsendMqttMessage(threadID, messageID, callback);
    else {
      var form = {
        message_id: messageID
      };
    
      defaultFuncs
        .post("https://www.facebook.com/messaging/unsend_message/", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
        .then(function (resData) {
          if (resData.error) throw resData;
          return callback();
        })
        .catch(function (err) {
          log.error("unsendMessage", err);
          return callback(err);
        });
    
      return returnPromise;
    }
  }

  return unsendMessage;
};