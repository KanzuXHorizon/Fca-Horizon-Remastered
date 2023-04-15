module.exports = async function(SessionID) {
    try {
        var userName,Text;
        var os = require('os');
        var Database = require("../../Extra/Database");
        var Fetch = global.Fca.Require.Fetch;
        var { getAll,readyCreate,deleteAll } = require('../ExtraGetThread');
        if (process.env.REPL_OWNER != undefined) userName = process.env.REPL_OWNER;
        else if (os.hostname() != null || os.hostname() != undefined) userName = os.hostname();
        else userName = os.userInfo().username;
        if (await Database.has('UserName')) {
            if (await Database.get('UserName') != userName) {
                await Database.set('Premium', false);
                await Database.set('PremiumKey', '');
                await Database.set('UserName', userName);
            }
        }
        if (await Database.has('PremiumKey') && await Database.get('PremiumKey') != '' && await Database.has('Premium') && await Database.get('Premium') == true) {
            try {
                await Database.set('Premium', true);
                await Database.set('PremiumKey', String(global.Fca.Require.FastConfig.PreKey));
                await Database.set('UserName', userName);
                process.env.HalzionVersion = 1973
                Text = "Bạn Đang Sài Phiên Bản: Premium Access";
            }
            catch (error) {
                Text = "Lỗi Kết Nối";
            }
        } else if (global.Fca.Require.FastConfig.PreKey) {
            try {
                await Database.set('Premium', true);
                await Database.set('PremiumKey', String(global.Fca.Require.FastConfig.PreKey));
                await Database.set('UserName', userName);
                process.env.HalzionVersion = 1973
                Text = "Bạn Đang Sài Phiên Bản: Premium Access";
            }
            catch (error) {
                Text = "Lỗi Kết Nối";
            }
        }
        else if (!global.Fca.Require.FastConfig.PreKey) {
            try {
                await Database.set('Premium', true);
                await Database.set('PremiumKey', String(global.Fca.Require.FastConfig.PreKey));
                await Database.set('UserName', userName);
                process.env.HalzionVersion = 1973
                Text = "Bạn Đang Sài Phiên Bản: Premium Access";
            }
            catch (error) {
                Text = "Lỗi Kết Nối";
            }
        }
    } catch (e) {
        try {
            await Database.set('Premium', true);
            await Database.set('PremiumKey', String(global.Fca.Require.FastConfig.PreKey));
            await Database.set('UserName', userName);
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
            var getAll = await getAll()
                if (getAll.length == 1) {
                    return;
                } else if (getAll.length > 1) {
                    for (let i of getAll) {
                        if (i.data.messageCount != undefined) {
                            data.push(i.data.threadID);
                        } else continue;
                    }
                    deleteAll(data);
                }
        } catch (e) {
            console.log(e);
        }
    }
return Text;
}