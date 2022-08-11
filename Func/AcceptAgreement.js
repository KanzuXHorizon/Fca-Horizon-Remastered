"use strict";

var utils = require("../utils");
var log = require("npmlog");

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
            var  Database = require('synthetic-horizon-database');
            if (Database.get('agreement', {}, true) == true) {
                callback(null, "Accecpt");
            }
            else {
                Database.set('agreement', true,true);
                var Form = "=== Horizon end-user license agreement ===\n\nVietNamese: Khi bạn dùng module/file này, nghĩa là bạn đã đồng ý cho sự tổn hại, mất mát, bị chia sẻ appstate,... của bạn, chúng tôi sẽ có toàn quyền với file bạn\nViệc bạn sử dụng một cách đúng giấy phép,... bạn cứ yên tâm, chúng tôi sẽ không làm tổn hại, mất mát,...,Việc bạn sử dụng sai quy chế của giấy phép, bạn có thể phải trả giá bằng File, AppState,... của bạn!\nNếu bạn không chấp nhận được, bạn có thể xóa file này ngay lập tức !\n[+] Bạn Sẽ Bị Xử Lý Nếu Trong Những Trường Hợp Như Sau: Sài File Leak, Key Leak, Troll,Đăng Cho Nhiều Người,..( và một số trường hợp chưa hiện hữu )\n\nEnglish: When you use this module/file, you have given your consent to the harm, loss, and sharing of the appstate,...We will have full rights with your file\nYou use the correct license,...Rest assured, we will not harm or lose,...,You misuse the statute of the license, you may have to pay the price in FileAppState,... yours!\nIf you can't accept it, you can delete this file immediately !\n[+] You will be dealt with if in the following cases: File Leak, Key Leak,Troll Post to multiple people,.. ( and some cases do not yet exist )\n\n=== GOOD LUCK ☕ ===";
                callback(null, Form);
            }
        return returnPromise;
    }
};
