/* eslint-disable linebreak-style */
"use strict";

module.exports = function (_defaultFuncs, api, _ctx) {
    return function getUID(link, callback) {
      var resolveFunc = function () { };
      var rejectFunc = function () { };
      var returnPromise = new Promise(function (resolve, reject) {
        resolveFunc = resolve;
        rejectFunc = reject;
      });
  
      if (!callback) {
        callback = function (err, uid) {
          if (err) return rejectFunc(err);
          resolveFunc(uid);
        };
      }
      
    try {
        var Link = String(link);
        var FindUID = require('../Extra/ExtraFindUID');
        if (Link.includes('facebook.com') || Link.includes('Facebook.com') || Link.includes('fb')) {
            var LinkSplit = Link.split('/');
            if (LinkSplit.indexOf("https:") == 0) {
              if (!isNaN(LinkSplit[3]) && !Link.split('=')[1]  && !isNaN(Link.split('=')[1])) {
                api.sendMessage('Sai Link, Link Cần Có Định Dạng Như Sau: facebook.com/Lazic.Kanzu',global.Fca.Data.event.threadID,global.Fca.Data.event.messageID);
                callback(null, String(4));
              }
              else if (!isNaN(Link.split('=')[1]) && Link.split('=')[1]) {
                var Format = `https://www.facebook.com/profile.php?id=${Link.split('=')[1]}`;
                FindUID(Format,api).then(function (data) {
                  callback(null, data);
                });
              } 
              else {
                FindUID(Link,api).then(function (data) {
                  callback(null, data);
                });
              }
            }
            else {
                var Form = `https://www.facebook.com/${LinkSplit[1]}`;
                FindUID(Form,api).then(function (data) {
                    callback(null, data);
                });
            }
        }
        else {
            callback(null, null);
            api.sendMessage('Sai Link, Link Cần Là Link Của Facebook',global.Fca.Data.event.threadID,global.Fca.Data.event.messageID)
        }
    }
    catch (e) {
      return callback(null, e);
    }
    return returnPromise;
    };
  };