'use strict';

const got = global.Fca.Require.Fetch;

/**
 * @param {string | URL} url
 * @param {{ sendMessage: (arg0: string, arg1: any) => any; }} api
 */
async function getUIDSlow(url,api) {
    var FormData =  require("form-data");
    var Form = new FormData();
	var Url = new URL(url);
    Form.append('username', Url.pathname.replace(/\//g, ""));
	try {
        var data = await got.post('https://api.findids.net/api/get-uid-from-username',{
            body: Form,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.79 Safari/537.36'
        })
	} catch (e) {
        console.log(global.Fca.Data.event.threadID,e)
        return api.sendMessage("Lỗi: " + e.message,global.Fca.Data.event.threadID);
	}
    if (JSON.parse(data.body.toString()).status != 200) return api.sendMessage('Đã bị lỗi !',global.Fca.Data.event.threadID)
    if (typeof JSON.parse(data.body.toString()).error === 'string') return "errr"
    else return JSON.parse(data.body.toString()).data.id || "nịt";
}

/**
 * @param {string | URL} url
 * @param {{ sendMessage: (arg0: string, arg1: any, arg2: any) => any; }} api
 */
async function getUIDFast(url,api) {
    var FormData =  require("form-data");
    var Form = new FormData();
	var Url = new URL(url);
    Form.append('link', Url.href);
    try {
        var data = await got.post('https://id.traodoisub.com/api.php',{
            body: Form
        })
	} catch (e) {
        return api.sendMessage("Lỗi: " + e.message,global.Fca.Data.event.threadID,global.Fca.Data.event.messageID);
	}
    if (JSON.parse(data.body.toString()).error) return api.sendMessage(JSON.parse(data.body.toString()).error,global.Fca.Data.event.threadID,global.Fca.Data.event.messageID);
    else return JSON.parse(data.body.toString()).id || "co cai nit huhu";
}

/**
 * @param {any} url
 * @param {any} api
 */
async function getUID(url,api) {
    var getUID = await getUIDFast(url,api);
        if (!isNaN(getUID) == true) return getUID;  
            else {
                let getUID = await getUIDSlow(url,api);
            if (!isNaN(data) == true) return getUID;
        else return null;
    }
}

module.exports = getUID;        