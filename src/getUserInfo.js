"use strict";

var utils = require("../utils");
var log = require("npmlog");

function formatData(data) {
  var retObj = {};

  for (var prop in data) {
    // eslint-disable-next-line no-prototype-builtins
    if (data.hasOwnProperty(prop)) {
      var innerObj = data[prop];
      retObj[prop] = {
        name: innerObj.name,
        firstName: innerObj.firstName,
        vanity: innerObj.vanity,
        thumbSrc: innerObj.thumbSrc,
        profileUrl: innerObj.uri,
        gender: innerObj.gender,
        type: innerObj.type,
        isFriend: innerObj.is_friend,
        isBirthday: !!innerObj.is_birthday
      };
    }
  }

  return retObj;
}

module.exports = function (defaultFuncs, api, ctx) {
  return function getUserInfo(id, callback) {
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

    if (utils.getType(id) !== "Array") id = [id];

    var respone = [];
    var Nope = [];

    if (id.length == 1) {
      if (global.Fca.Data.Userinfo.some(i => i.id == id[0])) {
        return callback(null,global.Fca.Data.Userinfo.find(i => i.id == id[0])[0]);
      }
      else {
        Nope.push(id[0]);
      }
    } 
    else for (let ii of id) {
      if (global.Fca.Data.Userinfo.some(i => i.id == ii)) {
        respone.push(global.Fca.Data.Userinfo.find(i => i.id == ii));
      }
      else {
        Nope.push(ii);
      }
    }
    if (Nope.length > 0 && respone > 0) {
      var form = {};
      Nope.map(function (v, i) {
        form["ids[" + i + "]"] = v;
      });
      defaultFuncs
        .post("https://www.facebook.com/chat/user_info/", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
        .then(function (resData) {
          if (resData.error) throw resData;
          respone.push(formatData(resData.payload.profiles));
          callback(null, respone);
        })
        .catch(function (err) {
          log.error("getUserInfo", "Lỗi: getUserInfo Có Thể Do Bạn Spam Quá Nhiều !,Hãy Thử Lại !");
          return callback(err, respone);
        });
      return returnPromise;
    }
    else if (Nope.length > 0 && respone <= 0) {
      var form = {};
      Nope.map(function (v, i) {
        form["ids[" + i + "]"] = v;
      });
      defaultFuncs
        .post("https://www.facebook.com/chat/user_info/", ctx.jar, form)
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
        .then(function (resData) {
          if (resData.error) throw resData;
          callback(null, formatData(resData.payload.profiles));
        })
        .catch(function (err) {
          log.error("getUserInfo", "Lỗi: getUserInfo Có Thể Do Bạn Spam Quá Nhiều !,Hãy Thử Lại !");
          return callback(err, respone);
        });
      return returnPromise;
    };
  }
};
