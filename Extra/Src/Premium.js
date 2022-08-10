module.exports = async function(SessionID) {
    try {
        var userName,Text;
        var os = require('os');
        var Database = require("synthetic-horizon-database");
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
                var {
                    body
                } = await Fetch(`https://pure-hollows-72312.herokuapp.com/checkKey?Key=${String(global.Fca.Require.FastConfig.PreKey)}&UserName=${userName}&PassWord=${SessionID}&Platform=${process.platform}`, { headers: { 'User-Agent': 'Horizon/PremiumCentral/1983823.28' } })
                if (JSON.parse(body).Status == true) {
                    await Database.set('Premium', true);
                    await Database.set('PremiumKey', String(global.Fca.Require.FastConfig.PreKey));
                    await Database.set('UserName', userName);
                    process.env.HalzionVersion = 1973
                    Text = "Bạn Đang Sài Phiên Bản: Premium";
                } else {
                    await Database.set('Premium', false);
                    await Database.set('PremiumKey', '');
                    process.env.HalzionVersion = 0
                    Text = JSON.parse(body).Message;
                }
            }   catch (e) {
                await Database.set('Premium', false);
                await Database.set('PremiumKey', '');
                process.env.HalzionVersion = 0
                Text = "Đã Xảy Ra Lỗi Khi Đang Kiểm Tra Key !, Bạn Sẽ Được Về Phiên Bản Thường";
            }
        } else if (global.Fca.Require.FastConfig.PreKey) {
            try {
                var {
                    body
                } = await Fetch(`https://pure-hollows-72312.herokuapp.com/checkKey?Key=${String(global.Fca.Require.FastConfig.PreKey)}&UserName=${userName}&PassWord=${SessionID}&Platform=${process.platform}`, {headers: { 'User-Agent': 'Horizon/PremiumCentral/1983823.28' }  })
                if (JSON.parse(body).Status == true) {
                    await Database.set('Premium', true);
                    await Database.set('PremiumKey', String(global.Fca.Require.FastConfig.PreKey));
                    await Database.set('UserName', userName);
                    process.env.HalzionVersion = 1973
                    Text = "Bạn Đang Sài Phiên Bản: Premium"
                } 
                else {
                    await Database.set('Premium', false);
                    await Database.set('PremiumKey', '');
                    process.env.HalzionVersion = 0
                    Text = JSON.parse(body).Message;
                }
            }   
            catch (e) {
                await Database.set('Premium', false);
                await Database.set('PremiumKey', '');
                process.env.HalzionVersion = 0
                Text = "Đã Xảy Ra Lỗi Khi Đang Kiểm Tra Key !, Bạn Sẽ Được Về Phiên Bản Thường";
            }
        }
        else if (!global.Fca.Require.FastConfig.PreKey) {
            Text = "Bạn Đang Sài Phiên Bản: Free";
        }
    } catch (e) {
        process.env.HalzionVersion = 0
        Text = "Đã Xảy Ra Lỗi Khi Đang Kiểm Tra Key !, Bạn Sẽ Được Về Phiên Bản Thường";
    }
    if (process.env.HalzionVersion == 1973) {
        try {
            let data = [];
            var getAll = await getAll()
            switch (readyCreate('LastUpdate')) {
                case true: {
                    if (getAll.length == 1) {
                        return;
                    } else if (getAll.length > 1) {
                        for (let i of getAll) {
                            if (i.data.threadID != undefined) {
                                data.push(i.data.threadID);
                            } else continue;
                        }
                        deleteAll(data);
                    }
                }
                break;
            }
        } catch (e) {
            console.log(e);
        }
    }
return Text;
}