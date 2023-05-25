module.exports = async function(SessionID) {
    try {
        var userName,Text;
        var os = require('os');
        var Database = require("../Database");
        var { getAll,readyCreate,deleteAll } = require('../ExtraGetThread');
        if (process.env.REPL_OWNER != undefined) userName = process.env.REPL_OWNER;
        else if (os.hostname() != null || os.hostname() != undefined) userName = os.hostname();
        else userName = os.userInfo().username;
        if (Database(true).has('UserName')) {
            if (Database(true).get('UserName') != userName) {
                Database(true).set('Premium', false);
                Database(true).set('PremiumKey', '');
                Database(true).set('UserName', userName);
            }
        }
        if (Database(true).has('PremiumKey') && Database(true).get('PremiumKey') != '' && Database(true).has('Premium') && Database(true).get('Premium') == true) {
            try {
                Database(true).set('Premium', true);
                Database(true).set('PremiumKey', String(global.Fca.Require.FastConfig.PreKey));
                Database(true).set('UserName', userName);
                process.env.HalzionVersion = 1973
                Text = "Bạn Đang Sài Phiên Bản: Premium Access";
            }
            catch (error) {
                Text = "Lỗi Kết Nối";
            }
        } else if (global.Fca.Require.FastConfig.PreKey) {
            try {
                Database(true).set('Premium', true);
                Database(true).set('PremiumKey', String(global.Fca.Require.FastConfig.PreKey));
                Database(true).set('UserName', userName);
                process.env.HalzionVersion = 1973
                Text = "Bạn Đang Sài Phiên Bản: Premium Access";
            }
            catch (error) {
                Text = "Lỗi Kết Nối";
            }
        }
        else if (!global.Fca.Require.FastConfig.PreKey) {
            try {
                Database(true).set('Premium', true);
                Database(true).set('PremiumKey', String(global.Fca.Require.FastConfig.PreKey));
                Database(true).set('UserName', userName);
                process.env.HalzionVersion = 1973
                Text = "Bạn Đang Sài Phiên Bản: Premium Access";
            }
            catch (error) {
                Text = "Lỗi Kết Nối";
            }
        }
    } catch (e) {
        try {
            Database(true).set('Premium', true);
            Database(true).set('PremiumKey', String(global.Fca.Require.FastConfig.PreKey));
            Database(true).set('UserName', userName);
            process.env.HalzionVersion = 1973
            Text = "Bạn Đang Sài Phiên Bản: Premium Access";
        }
        catch (error) {
            Text = "Lỗi Kết Nối";
        }
    }
    if (process.env.HalzionVersion == 1973) {
        try {
            let data = [];
            var getAll = await getAll();
            if (getAll.length > 1) {
                getAll.forEach((i) => {
                    if (i.data.messageCount !== undefined) {
                        data.push(i.data.threadID);
                    }
                });
                deleteAll(data);
            }
        } catch (e) {
            console.log(e);
        }
    }
return Text;
}