"use strict";
const { execSync } = require('child_process');
var utils = require("../utils");
var log = require("../logger");
var Object = ['png','json','wav','mp3','mp4','jpg','txt','gif','tff','m4a'];
var Recommend = ['png','wav','mp3','mp4','jpg','m4a'];
module.exports = function (defaultFuncs, api, ctx) {
    return function (Args,callback) {
        let New1 = [];
        if (!Args.New || utils.getType(Args.New) !== "Array") { 
            New1 = Recommend;
            log.Normal("Không Có Adding Thêm, Tiến Hành Sử Dụng Theo Hệ Thống Chỉ Định !");
        }
        else {
            for (let i = 0; i < Args.New.length; i++) {
                if (Object.indexOf(Args.New[i]) === -1) {
                    log.Normal('Không tìm thấy file ' + Args.New[i] + ' trong danh sách định dạng');
                    return;
                }
                New1.push(Args.New[i]);
            }
        }
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
        switch (process.platform) {
            case 'linux': {
                for (let i = 0; i < New1.length; i++) {
                    log.Normal('Đang Clear Loại File ' + New1[i]);
                    var STR = String(`find ./modules -type f -iname \'*.${New1[i]}\' -exec rm {} \\;`)
                    execSync(STR);
                }
                log.Normal('Thành Công Clear ' + New1.length + ' Loại File !');
                callback(null, 'Thành Công Clear ' + New1.length + ' Loại File !');
            }
            break;
            case "win32": {
                var cmd = "del /q /s /f /a ";
                for (let i = 0; i < New1.length; i++) {
                    log.Normal('Đang Clear Loại File ' + New1[i]);
                    var STR = String(cmd + '.\\modules\\*.' + New1[i] + '\"')
                    execSync(STR, { stdio: 'inherit' });
                }
                log.Normal('Thành Công Clear ' + New1.length + ' Loại File !');
                callback(null, 'Thành Công Clear ' + New1.length + ' Loại File !');
            }
            break;
            default: {
                return log.Error('Not Supported');
            }
        }
        return returnPromise;
    }
};
