var utils = require('../utils');
var logger = require('../logger')
var OTP = require('totp-generator');

module.exports.getInfo = async function (id,jar,ctx,defaultFuncs) {
    var AccessToken = await module.exports.getAccessToken(jar,ctx,defaultFuncs);
    var { body:Data } = await utils.get(`https://graph.facebook.com/${id}?fields=name,first_name,email,about,birthday,gender,website,hometown,link,location,quotes,relationship_status,significant_other,username,subscribers.limite(0)&access_token=${AccessToken}`,jar,null,ctx.globalOptions);
    var Format = {
        id: JSON.parse(Data).id || "Không Có Dữ Liệu",
        name: JSON.parse(Data).name || "Không Có Dữ Liệu",
        first_name: JSON.parse(Data).first_name || "Không Có Dữ Liệu",
        username: JSON.parse(Data).username || "Không Có Dữ Liệu",
        link: JSON.parse(Data).link || "Không Có Dữ Liệu",
        verified: JSON.parse(Data).verified || "Không Có Dữ Liệu",
        about: JSON.parse(Data).about || "Không Có Dữ Liệu",
        avatar: `https://graph.facebook.com/${id}/picture?height=1500&width=1500&access_token=1449557605494892|aaf0a865c8bafc314ced5b7f18f3caa6` || "Không Có Dữ Liệu",
        birthday: JSON.parse(Data).birthday || "Không Có Dữ Liệu",
        follow: JSON.parse(Data).subscribers.summary.total_count || "Không Có Dữ Liệu",
        gender: JSON.parse(Data).gender || "Không Có Dữ Liệu",
        hometown: JSON.parse(Data).hometown || "Không Có Dữ Liệu",
        email: JSON.parse(Data).email || "Không Có Dữ Liệu",
        interested_in: JSON.parse(Data).interested_in || "Không Có Dữ Liệu",
        location: JSON.parse(Data).location || "Không Có Dữ Liệu",
        locale: JSON.parse(Data).locale || "Không Có Dữ Liệu",
        relationship_status: JSON.parse(Data).relationship_status || "Không Có Dữ Liệu",
        love: JSON.parse(Data).significant_other || "Không Có Dữ Liệu",
        website: JSON.parse(Data).website || "Không Có Dữ Liệu",
        quotes: JSON.parse(Data).quotes || "Không Có Dữ Liệu",
        timezone: JSON.parse(Data).timezone || "Không Có Dữ Liệu",
        updated_time: JSON.parse(Data).updated_time || "Không Có Dữ Liệu"
    }
    return Format;
}

/**
 * Help: @ManhG
 * Author: @KanzuWakazaki
*/

module.exports.getAccessToken = async function (jar, ctx,defaultFuncs) {
    if (global.Fca.Data.AccessToken) {
        return global.Fca.Data.AccessToken;
    }
    else {
        var netURLS = "https://business.facebook.com/security/twofactor/reauth/enter/"
        return defaultFuncs.get('https://business.facebook.com/business_locations', jar, null, ctx.globalOptions).then(async function(data) {
            try {
                if (/"],\["(.*?)","/.exec(/LMBootstrapper(.*?){"__m":"LMBootstrapper"}/.exec(data.body)[1])[1])  {
                    global.Fca.Data.AccessToken = /"],\["(.*?)","/.exec(/LMBootstrapper(.*?){"__m":"LMBootstrapper"}/.exec(data.body)[1])[1];
                    return /"],\["(.*?)","/.exec(/LMBootstrapper(.*?){"__m":"LMBootstrapper"}/.exec(data.body)[1])[1];
                }
            }
            catch (_) {
                if (global.Fca.Require.FastConfig.AuthString.includes('|')) return logger.Error(globalThis.Fca.Require.Language.Index.Missing)
                var OPTCODE = global.Fca.Require.FastConfig.AuthString.includes(" ") ? global.Fca.Require.FastConfig.AuthString.replace(RegExp(" ", 'g'), "") : global.Fca.Require.FastConfig.AuthString;
                var Form = { 
                    approvals_code: OTP(String(OPTCODE)),
                    save_device: true,
                    lsd: utils.getFrom(data.body, "[\"LSD\",[],{\"token\":\"", "\"}")
                }
                return defaultFuncs.post(netURLS, jar, Form, ctx.globalOptions, { 
                    referer: "https://business.facebook.com/security/twofactor/reauth/?twofac_next=https%3A%2F%2Fbusiness.facebook.com%2Fbusiness_locations&type=avoid_bypass&app_id=0&save_device=1",
                }).then(async function(data) {
                    if (String(data.body).includes(false)) throw { Error: "Invaild OTP | FastConfigFca.json: AuthString" }
                    return defaultFuncs.get('https://business.facebook.com/business_locations', jar, null, ctx.globalOptions,{ 
                        referer: "https://business.facebook.com/security/twofactor/reauth/?twofac_next=https%3A%2F%2Fbusiness.facebook.com%2Fbusiness_locations&type=avoid_bypass&app_id=0&save_device=1",
                    }).then(async function(data) {
                        var Access_Token = /"],\["(.*?)","/.exec(/LMBootstrapper(.*?){"__m":"LMBootstrapper"}/.exec(data.body)[1])[1];
                        global.Fca.Data.AccessToken = Access_Token;
                        return Access_Token;
                    });
                });
            }
        })
    }
}

//hard working =))