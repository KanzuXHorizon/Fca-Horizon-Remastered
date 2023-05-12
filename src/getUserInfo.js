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
  const Database = require('../Extra/Database');
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
    if (global.Fca.Data.AlreadyGetInfo != true) {
      if (Database(true).has('UserInfo') == false) { 
        Database(true).set('UserInfo', []); 
        global.Fca.Data.AlreadyGetInfo = true; 
      }
    }

    var NeedGet = [];
    var AlreadyGet = [];

    if (global.Fca.Data.Userinfo != undefined && global.Fca.Data.Userinfo.length != 0) {
      for (let i of id) {
        if (global.Fca.Data.Userinfo.some(ii => ii.id == i)) {
          let Format = {};
          Format[i] = global.Fca.Data.Userinfo.find(ii => ii.id == i);
          AlreadyGet.push(Format);
        }
        else {
          const DatabaseUser = Database(true).get('UserInfo', {}) || [];
          if (DatabaseUser.some(ii => ii.id == i)) {
            let Format = {};
            Format[i] = DatabaseUser.find(ii => ii.id == i);
            AlreadyGet.push(Format);
          }
          else {
            NeedGet.push(i);
          }
        }
      }
    }

    if (NeedGet.length > 0) {
      let form = {};
        NeedGet.map(function (v, i) {
          form["ids[" + i + "]"] = v;
        });
      defaultFuncs
        .post("https://www.facebook.com/chat/user_info/", ctx.jar, form)
          .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
            .then(function (resData) {
              if (resData.error) throw resData;
                if (AlreadyGet.length > 0) {
                  AlreadyGet.push(formatData(resData.payload.profiles));
                }
                else if (AlreadyGet.length <= 0 && NeedGet.length == 1) {
                  AlreadyGet = formatData(resData.payload.profiles);
                }
                else {
                  AlreadyGet.push(formatData(resData.payload.profiles));
                }
                callback(null, AlreadyGet);
              })
            .catch(function (err) {
          log.error("getUserInfo", "Lỗi: getUserInfo Có Thể Do Bạn Spam Quá Nhiều !,Hãy Thử Lại !");
        callback(err, null);
      });
    }
    else if (AlreadyGet.length == 1) {
      callback(null,AlreadyGet[0]);
    }
    else if (AlreadyGet.length > 1) {
      callback(null, AlreadyGet);
    }
    return returnPromise;
  };
};
