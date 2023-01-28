'use strict';

/**
    * Developers: @KanzuWakazaki - @HarryWakazaki
    ** A few words about developer appstate security.
    *! Statement renouncing responsibility for the security of appstate encryption of the following operating systems: windows, Android, Linux operating systems,.. (maybe repl.it?),
    *! because the above operating systems are private (except rep.it if the fraudster does not own your account or invite link to join).
    *! If the intruder owns the computer, these private operating systems,the security of this fca cannot guarantee 100% of the time.
    ** If the grammar is wrong, please understand because I'm just a kid 🍵.
*/

/!-[ Max Cpu Speed ]-!/

process.env.UV_THREADPOOL_SIZE = require('os').cpus().length;

/!-[ Global Set ]-!/

global.Fca = new Object({
    isThread: new Array(),
    isUser: new Array(),
    startTime: Date.now(),
    Setting: new Map(),
    Require: new Object({
        fs: require("fs"),
        Fetch: require('got'),
        log: require("npmlog"),
        utils: require("./utils"),
        logger: require('./logger'),
        Security: require("uuid-apikey"),
        languageFile: require('./Language/index.json'),
        Database: require("./Horizon_Package/Synthetic-Horizon-Database")
    }),
    getText: function(/** @type {any[]} */...Data) {
        var Main = (Data.splice(0,1)).toString();
            for (let i = 0; i < Data.length; i++) Main = Main.replace(RegExp(`%${i + 1}`, 'g'), Data[i]);
        return Main;
    },
    Data: new Object({
        ObjFastConfig: {
            "Language": "vi",
            "PreKey": "",
            "AutoUpdate": true,
            "MainColor": "#9900FF",
            "MainName": "[ FCA-HZI ]",
            "Uptime": false,
            "Config": "default",
            "Login2Fa": false,
            "AutoLogin": false,
            "BroadCast": true,
            "AuthString": "SD4S XQ32 O2JA WXB3 FUX2 OPJ7 Q7JZ 4R6Z | https://i.imgur.com/RAg3rvw.png Please remove this !, Recommend If You Using getUserInfoV2",
            "EncryptFeature": true,
            "ResetDataLogin": false,
            "AutoRestartMinutes": 0,
            "HTML": {   
                "HTML": true,
                "UserName": "Guest",
                "MusicLink": "https://drive.google.com/uc?id=1zlAALlxk1TnO7jXtEP_O6yvemtzA2ukA&export=download"
            }   
        },
        CountTime: function() {
            var fs = global.Fca.Require.fs;
            if (fs.existsSync(__dirname + '/CountTime.json')) {
                try {
                    var data = Number(fs.readFileSync(__dirname + '/CountTime.json', 'utf8')),
                    hours = Math.floor(data / (60 * 60));
                }
                catch (e) {
                    fs.writeFileSync(__dirname + '/CountTime.json', 0);
                    hours = 0;
                }
            }
            else {
                hours = 0;
            }
            return `${hours} Hours`;
        }
    }),
    AutoLogin: async function () {
        var Database = global.Fca.Require.Database;
        var logger = global.Fca.Require.logger;
        var Email = (await global.Fca.Require.Database.get('Account')).replace(RegExp('"', 'g'), ''); //hmm IDK
        var PassWord = (await global.Fca.Require.Database.get('Password')).replace(RegExp('"', 'g'), '');
        login({ email: Email, password: PassWord},async (error, api) => {
            if (error) {
                logger.Error(JSON.stringify(error,null,2), function() { logger.Error("AutoLogin Failed!", function() { process.exit(0); }) });
            }
            try {
                await Database.set("TempState", api.getAppState());
            }
            catch(e) {
                logger.Warning(global.Fca.Require.Language.Index.ErrDatabase);
                    logger.Error();
                process.exit(0);
            }
            process.exit(1);
        });
    }
});

/!-[ Check File To Run Process ]-!/

let Boolean_Fca = ["AutoUpdate","Uptime","BroadCast","EncryptFeature","AutoLogin","ResetDataLogin","Login2Fa"];
let String_Fca = ["MainName","PreKey","Language","AuthString","Config"]
let Number_Fca = ["AutoRestartMinutes"];
let All_Variable = Boolean_Fca.concat(String_Fca,Number_Fca);

try {
    if (!global.Fca.Require.fs.existsSync('./FastConfigFca.json')) {
        global.Fca.Require.fs.writeFileSync("./FastConfigFca.json", JSON.stringify(global.Fca.Data.ObjFastConfig, null, "\t"));
        process.exit(1);
    }

try {
    var DataLanguageSetting = require("../../FastConfigFca.json");
}
catch (e) {
    global.Fca.Require.logger.Error('Detect Your FastConfigFca Settings Invalid!, Carry out default restoration');
    global.Fca.Require.fs.writeFileSync("./FastConfigFca.json", JSON.stringify(global.Fca.Data.ObjFastConfig, null, "\t"));     
    process.exit(1)
}
    if (global.Fca.Require.fs.existsSync('./FastConfigFca.json')) {
        try { 
            if (!DataLanguageSetting.Config || global.Fca.Require.utils.getType(DataLanguageSetting.Config) != 'String') {
                    DataLanguageSetting.Config = "default"
                global.Fca.Require.fs.writeFileSync("./FastConfigFca.json", JSON.stringify(DataLanguageSetting, null, "\t"));        
            }
        }
        catch (e) {
            console.log(e);
        }
        if (!global.Fca.Require.languageFile.some((/** @type {{ Language: string; }} */i) => i.Language == DataLanguageSetting.Language)) { 
            global.Fca.Require.logger.Warning("Not Support Language: " + DataLanguageSetting.Language + " Only 'en' and 'vi'");
            process.exit(0); 
        }
        var Language = global.Fca.Require.languageFile.find((/** @type {{ Language: string; }} */i) => i.Language == DataLanguageSetting.Language).Folder.Index;
        global.Fca.Require.Language = global.Fca.Require.languageFile.find((/** @type {{ Language: string; }} */i) => i.Language == DataLanguageSetting.Language).Folder;
    } else process.exit(1);
        for (let i in DataLanguageSetting) {
            if (Boolean_Fca.includes(i)) {
                if (global.Fca.Require.utils.getType(DataLanguageSetting[i]) != "Boolean") return logger.Error(i + " Is Not A Boolean, Need To Be true Or false !", function() { process.exit(0) });
                else continue;
            }
            else if (String_Fca.includes(i)) {
                if (global.Fca.Require.utils.getType(DataLanguageSetting[i]) != "String") return logger.Error(i + " Is Not A String, Need To Be String!", function() { process.exit(0) });
                else continue;
            }
            else if (Number_Fca.includes(i)) {
                if (global.Fca.Require.utils.getType(DataLanguageSetting[i]) != "Number") return logger.Error(i + " Is Not A Number, Need To Be Number !", function() { process.exit(0) });
                else continue;
            }
        }
        for (let i of All_Variable) {
            if (!DataLanguageSetting[All_Variable[i]] == undefined) {
                DataLanguageSetting[All_Variable[i]] = global.Fca.Data.ObjFastConfig[All_Variable[i]];
                global.Fca.Require.fs.writeFileSync("./FastConfigFca.json", JSON.stringify(DataLanguageSetting, null, "\t"));
            }
            else continue; 
        }
    global.Fca.Require.FastConfig = DataLanguageSetting;
}
catch (e) {
    console.log(e);
    global.Fca.Require.logger.Error();
}

/!-[ Require config and use ]-!/

if (global.Fca.Require.FastConfig.Config != 'default') {
    //do ssth
}

/!-[ Require All Package Need Use ]-!/

var utils = global.Fca.Require.utils,
    logger = global.Fca.Require.logger,
    fs = global.Fca.Require.fs,
    getText = global.Fca.getText,
    log = global.Fca.Require.log,
    Fetch = global.Fca.Require.Fetch,
    express = require("express")(),
    { join } = require('path'),
    cheerio = require("cheerio"),
    StateCrypt = require('./OldSecurity'),
    { readFileSync } = require('fs-extra'),
    Database = require("./Horizon_Package/Synthetic-Horizon-Database"),
    readline = require("readline"),
    chalk = require("chalk"),
    figlet = require("figlet"),
    os = require("os"),
    Security = require("./Extra/Security/Index");

/!-[ Set Variable For Process ]-!/

log.maxRecordSize = 100;
var checkVerified = null;
var Boolean_Option = ['online','selfListen','listenEvents','updatePresence','forceLogin','autoMarkDelivery','autoMarkRead','listenTyping','autoReconnect','emitReady'];

/!-[ Set And Check Template HTML ]-!/

var css = readFileSync(join(__dirname, 'Extra', 'Html', 'Classic', 'style.css'));
var js = readFileSync(join(__dirname, 'Extra', 'Html', 'Classic', 'script.js'));

/!-[ Function Generate HTML Template ]-!/

/**
 * It returns a string of HTML code.
 * @param UserName - The username of the user
 * @param Type - The type of user, either "Free" or "Premium"
 * @param link - The link to the music you want to play
 * @returns A HTML file
 */

function ClassicHTML(UserName,Type,link) {
    return `<!DOCTYPE html>
    <html lang="en" >
        <head>
        <meta charset="UTF-8">
        <title>Horizon</title>
        <link rel="stylesheet" href="./style.css">
    </head>
    <body>
        <center>
            <marquee><b>waiting for u :d</b></marquee>
            <h2>Horizon User Infomation</h2>
            <h3>UserName: ${UserName} | Type: ${Type}</h3>
            <canvas id="myCanvas"></canvas>
            <script  src="./script.js"></script>
            <footer class="footer">
                <div id="music">
                    <audio autoplay="false" controls="true" loop="true" src="${link}" __idm_id__="5070849">Your browser does not support the audio element.</audio>
                    <br><b>Session ID:</b> ${global.Fca.Require.Security.create().uuid}<br>
                    <br>Thanks For Using <b>Fca-Horizon-Mod</b> - From <b>Kanzu</b> <3<br>
                </div>
            </footer>
            </div>
        </center>
    </html>
    </body>`
    //lazy to change
}

/!-[ Stating Http Infomation ]-!/

express.set('DFP', (process.env.PORT || process.env.port || 1932));
express.use(function(req, res, next) {
    switch (req.url.split('?')[0]) {
        case '/script.js': {
            res.writeHead(200, { 'Content-Type': 'text/javascript' });
                res.write(js);
            break;
        }
        case '/style.css': {
            res.writeHead(200, { 'Content-Type': 'text/css' });
                res.write(css);
            break;
        }
        // case '/History': {
        //     if (req.query.PassWord == process.env.REPL_OWNER) {
        //         res.writeHead(200, { 'Content-Type': 'application/json charset=utf-8' });
        //         res.write(JSON.stringify(console.history,null,2),'utf8');
        //         res.end();
        //     }
        //     else res.json({
        //         Status: false,
        //         Error: "Thiếu Params ?PassWord=PassWordCuaBan =))"
        //     });
        //     break;
        // }
        default: {
            res.writeHead(200, "OK", { "Content-Type": "text/html" });
            res.write(ClassicHTML(global.Fca.Require.FastConfig.HTML.UserName, global.Fca.Data.PremText.includes("Premium") ? "Premium": "Free", global.Fca.Require.FastConfig.HTML.MusicLink));
        }
    }
    res.end();
})

global.Fca.Require.Web = express;

/!-[ Function setOptions ]-!/

/**
 * @param {{ [x: string]: boolean; selfListen?: boolean; listenEvents?: boolean; listenTyping?: boolean; updatePresence?: boolean; forceLogin?: boolean; autoMarkDelivery?: boolean; autoMarkRead?: boolean; autoReconnect?: boolean; logRecordSize: any; online?: boolean; emitReady?: boolean; userAgent: any; logLevel?: any; pageID?: any; proxy?: any; }} globalOptions
 * @param {{ [x: string]: any; logLevel?: any; forceLogin?: boolean; userAgent?: any; pauseLog?: any; logRecordSize?: any; pageID?: any; proxy?: any; }} options
 */

function setOptions(globalOptions, options) {
    Object.keys(options).map(function(key) {
        switch (Boolean_Option.includes(key)) {
            case true: {
                globalOptions[key] = Boolean(options[key]);
                break;
            }
            case false: {
                switch (key) {
                    case 'pauseLog': {
                        if (options.pauseLog) log.pause();
                            else log.resume();
                        break;
                    }
                    case 'logLevel': {
                        log.level = options.logLevel;
                            globalOptions.logLevel = options.logLevel;
                        break;
                    }
                    case 'logRecordSize': {
                        log.maxRecordSize = options.logRecordSize;
                            globalOptions.logRecordSize = options.logRecordSize;
                        break;
                    }
                    case 'pageID': {
                        globalOptions.pageID = options.pageID.toString();
                        break;
                    }
                    case 'userAgent': {
                        globalOptions.userAgent = (options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36');
                        break;
                    }
                    case 'proxy': {
                        if (typeof options.proxy != "string") {
                            delete globalOptions.proxy;
                            utils.setProxy();
                        } else {
                            globalOptions.proxy = options.proxy;
                            utils.setProxy(globalOptions.proxy);
                        }
                        break;
                    }
                    default: {
                        log.warn("setOptions", "Unrecognized option given to setOptions: " + key);
                        break;
                    }
                }
            break;
            }
        }
    });
}

/!-[ Function BuildAPI ]-!/

/**
 * @param {any} globalOptions
 * @param {string} html
 * @param {{ getCookies: (arg0: string) => any[]; }} jar
 */

function buildAPI(globalOptions, html, jar) {
    var maybeCookie = jar.getCookies("https://www.facebook.com").filter(function(/** @type {{ cookieString: () => string; }} */val) { return val.cookieString().split("=")[0] === "c_user"; });

    if (maybeCookie.length === 0) {
        switch (global.Fca.Require.FastConfig.AutoLogin) {
            case true: {
                global.Fca.Require.logger.Warning(global.Fca.Require.Language.Index.AutoLogin, function() {
                    return global.Fca.AutoLogin();
                });
                break;
            }
            case false: {
                throw { error: global.Fca.Require.Language.Index.ErrAppState };
                
            }
        }
    }

    if (html.indexOf("/checkpoint/block/?next") > -1) log.warn("login", Language.CheckPointLevelI);

    var userID = maybeCookie[0].cookieString().split("=")[1].toString();
    process.env['UID'] = logger.Normal(getText(Language.UID,userID), userID);

    try {
        clearInterval(checkVerified);
    } catch (e) {
        console.log(e);
    }

    var clientID = (Math.random() * 2147483648 | 0).toString(16);

    var CHECK_MQTT = {
        oldFBMQTTMatch: html.match(/irisSeqID:"(.+?)",appID:219994525426954,endpoint:"(.+?)"/),
        newFBMQTTMatch: html.match(/{"app_id":"219994525426954","endpoint":"(.+?)","iris_seq_id":"(.+?)"}/),
        legacyFBMQTTMatch: html.match(/(\["MqttWebConfig",\[\],{fbid:")(.+?)(",appID:219994525426954,endpoint:")(.+?)(",pollingEndpoint:")(.+?)(3790])/)
    }

    let Slot = Object.keys(CHECK_MQTT);
    
    var mqttEndpoint,region,irisSeqID;
    Object.keys(CHECK_MQTT).map(function(MQTT) {
        if (CHECK_MQTT[MQTT] && !region) {
            switch (Slot.indexOf(MQTT)) {
                case 0: {
                    irisSeqID = CHECK_MQTT[MQTT][1];
                        mqttEndpoint = CHECK_MQTT[MQTT][2];
                        region = new URL(mqttEndpoint).searchParams.get("region").toUpperCase();
                    return;
                }
                case 1: {
                    irisSeqID = CHECK_MQTT[MQTT][2];
                        mqttEndpoint = CHECK_MQTT[MQTT][1].replace(/\\\//g, "/");
                        region = new URL(mqttEndpoint).searchParams.get("region").toUpperCase();
                    return;
                }
                case 2: {
                    mqttEndpoint = CHECK_MQTT[MQTT][4];
                        region = new URL(mqttEndpoint).searchParams.get("region").toUpperCase();
                    return;
                }
            }
        return;
        }
    });    

    var ctx = {
        userID: userID,
        jar: jar,
        clientID: clientID,
        globalOptions: globalOptions,
        loggedIn: true,
        access_token: 'NONE',
        clientMutationId: 0,
        mqttClient: undefined,
        lastSeqId: irisSeqID,
        syncToken: undefined,
        mqttEndpoint: mqttEndpoint,
        region: region,
        firstListen: true
    };

    var api = {
        setOptions: setOptions.bind(null, globalOptions),
        getAppState: function getAppState() {
            return utils.getAppState(jar);
        }
    };

    if (region && mqttEndpoint) {
        //do sth
    }
    else {
        log.warn("login", getText(Language.NoAreaData));
        api["htmlData"] = html;
    }

    var defaultFuncs = utils.makeDefaults(html, userID, ctx);

    fs.readdirSync(__dirname + "/src").filter((/** @type {string} */File) => File.endsWith(".js") && !File.includes('Dev_')).map((/** @type {string} */File) => api[File.split('.').slice(0, -1).join('.')] = require('./src/' + File)(defaultFuncs, api, ctx));

    return {
        ctx,
        defaultFuncs, 
        api
    };
}

/!-[ Function makeLogin ]-!/

/**
 * @param {{ setCookie: (arg0: any, arg1: string) => void; }} jar
 * @param {any} email
 * @param {any} password
 * @param {{ forceLogin: any; }} loginOptions
 * @param {(err: any, api: any) => any} callback
 * @param {any} prCallback
 */

function makeLogin(jar, email, password, loginOptions, callback, prCallback) {
    return function(/** @type {{ body: any; }} */res) {
        var html = res.body,$ = cheerio.load(html),arr = [];

        $("#login_form input").map((i, v) => arr.push({ val: $(v).val(), name: $(v).attr("name") }));

        arr = arr.filter(function(v) {
            return v.val && v.val.length;
        });

        var form = utils.arrToForm(arr);
            form.lsd = utils.getFrom(html, "[\"LSD\",[],{\"token\":\"", "\"}");
            form.lgndim = Buffer.from("{\"w\":1440,\"h\":900,\"aw\":1440,\"ah\":834,\"c\":24}").toString('base64');
            form.email = email;
            form.pass = password;
            form.default_persistent = '0';
            form.locale = 'en_US';     
            form.timezone = '240';
            form.lgnjs = ~~(Date.now() / 1000);

        html.split("\"_js_").slice(1).map((/** @type {any} */val) => {
            jar.setCookie(utils.formatCookie(JSON.parse("[\"" + utils.getFrom(val, "", "]") + "]"), "facebook"),"https://www.facebook.com")
        });

        logger.Normal(Language.OnLogin);
        return utils
            .post("https://www.facebook.com/login/device-based/regular/login/?login_attempt=1&lwv=110", jar, form, loginOptions)
            .then(utils.saveCookies(jar))
            .then(function(/** @type {{ headers: any; }} */res) {
                var headers = res.headers;  
                if (!headers.location) throw { error: Language.InvaildAccount };

                // This means the account has login approvals turned on.
                if (headers.location.indexOf('https://www.facebook.com/checkpoint/') > -1) {
                    logger.Warning(Language.TwoAuth);
                    var nextURL = 'https://www.facebook.com/checkpoint/?next=https%3A%2F%2Fwww.facebook.com%2Fhome.php';

                    return utils
                        .get(headers.location, jar, null, loginOptions)
                        .then(utils.saveCookies(jar))
                        .then(async function(/** @type {{ body: any; }} */res) {
                            if (!await Database.get('ThroughAcc')) {
                                await Database.set('ThroughAcc', email);
                            }
                            else {
                                if (String((await Database.get('ThroughAcc'))).replace(RegExp('"','g'), '') != String(email).replace(RegExp('"','g'), '')) {
                                    await Database.set('ThroughAcc', email);
                                    if (await Database.get('Through2Fa')) {
                                        await Database.delete('Through2Fa');
                                    }
                                }
                            }
                            var html = res.body,$ = cheerio.load(html), arr = [];
                            $("form input").map((i, v) => arr.push({ val: $(v).val(), name: $(v).attr("name") }));
                            arr = arr.filter(v => { return v.val && v.val.length });
                            var form = utils.arrToForm(arr);
                            if (html.indexOf("checkpoint/?next") > -1) {
                                setTimeout(() => {
                                    checkVerified = setInterval((_form) => {}, 5000, {
                                        fb_dtsg: form.fb_dtsg,
                                        jazoest: form.jazoest,
                                        dpr: 1
                                    });
                                }, 2500);  
                                switch (global.Fca.Require.FastConfig.Login2Fa) {
                                    case true: {
                                        try {
                                            const question = question => {
                                                const rl = readline.createInterface({
                                                    input: process.stdin,
                                                    output: process.stdout
                                                });
                                                return new Promise(resolve => {
                                                    rl.question(question, answer => {
                                                        rl.close();
                                                        return resolve(answer);
                                                    });
                                                });
                                            };
                                            async function EnterSecurityCode() {
                                                try {
                                                    var Through2Fa = await Database.get('Through2Fa');
                                                    if (Through2Fa) {
                                                        Through2Fa.map(function(/** @type {{ key: string; value: string; expires: string; domain: string; path: string; }} */c) {
                                                            let str = c.key + "=" + c.value + "; expires=" + c.expires + "; domain=" + c.domain + "; path=" + c.path + ";";
                                                            jar.setCookie(str, "http://" + c.domain);
                                                        })
                                                        var from2 = utils.arrToForm(arr);
                                                            from2.lsd = utils.getFrom(html, "[\"LSD\",[],{\"token\":\"", "\"}");
                                                            from2.lgndim = Buffer.from("{\"w\":1440,\"h\":900,\"aw\":1440,\"ah\":834,\"c\":24}").toString('base64');
                                                            from2.email = email;
                                                            from2.pass = password;
                                                            from2.default_persistent = '0';
                                                            from2.locale = 'en_US';     
                                                            from2.timezone = '240';
                                                            from2.lgnjs = ~~(Date.now() / 1000);
                                                        return utils
                                                            .post("https://www.facebook.com/login/device-based/regular/login/?login_attempt=1&lwv=110", jar, from2, loginOptions)
                                                            .then(utils.saveCookies(jar))
                                                            .then(function(/** @type {{ headers: any; }} */res) {
                                                        var headers = res.headers;  
                                                        if (!headers['set-cookie'][0].includes('deleted')) {
                                                            logger.Warning(Language.ErrThroughCookies, async function() {
                                                                await Database.delete('Through2Fa');
                                                            });
                                                            process.exit(1);
                                                        }
                                                            if (headers.location && headers.location.indexOf('https://www.facebook.com/checkpoint/') > -1) {
                                                                return utils
                                                                    .get(headers.location, jar, null, loginOptions)
                                                                    .then(utils.saveCookies(jar))
                                                                    .then(function(/** @type {{ body: any; }} */res) {
                                                                        var html = res.body,$ = cheerio.load(html), arr = [];
                                                                        $("form input").map((i, v) => arr.push({ val: $(v).val(), name: $(v).attr("name") }));
                                                                        arr = arr.filter(v => { return v.val && v.val.length });
                                                                        var from2 = utils.arrToForm(arr);
                                                                        
                                                                        if (html.indexOf("checkpoint/?next") > -1) {
                                                                            setTimeout(() => {
                                                                                checkVerified = setInterval((_form) => {}, 5000, {
                                                                                    fb_dtsg: from2.fb_dtsg,
                                                                                    jazoest: from2.jazoest,
                                                                                    dpr: 1
                                                                                });
                                                                            }, 2500);
                                                                            if (!res.headers.location && res.headers['set-cookie'][0].includes('checkpoint')) {
                                                                                try {
                                                                                    delete from2.name_action_selected;
                                                                                    from2['submit[Continue]'] = $("#checkpointSubmitButton").html();
                                                                                    return utils
                                                                                        .post(nextURL, jar, from2, loginOptions)
                                                                                        .then(utils.saveCookies(jar))
                                                                                        .then(function() {
                                                                                            from2['submit[This was me]'] = "This was me";
                                                                                            return utils.post(nextURL, jar, from2, loginOptions).then(utils.saveCookies(jar));
                                                                                        })
                                                                                        .then(function() {
                                                                                            delete from2['submit[This was me]'];
                                                                                            from2.name_action_selected = 'save_device';
                                                                                            from2['submit[Continue]'] = $("#checkpointSubmitButton").html();
                                                                                            return utils.post(nextURL, jar, from2, loginOptions).then(utils.saveCookies(jar));
                                                                                        })
                                                                                        .then(async function(/** @type {{ headers: any; body: string | string[]; }} */res) {
                                                                                            var headers = res.headers;
                                                                                            if (!headers.location && res.headers['set-cookie'][0].includes('checkpoint')) throw { error: "wtf ??:D" };
                                                                                            var appState = utils.getAppState(jar,false);
                                                                                            await Database.set('Through2Fa', appState);
                                                                                            return loginHelper(appState, email, password, loginOptions, callback);
                                                                                        })
                                                                                    .catch((/** @type {any} */e) => callback(e));
                                                                                }
                                                                                catch (e) {
                                                                                    console.log(e)
                                                                                }
                                                                            }
                                                                        }
                                                                    })
                                                                }
                                                            return utils.get('https://www.facebook.com/', jar, null, loginOptions).then(utils.saveCookies(jar));
                                                        }).catch((/** @type {any} */e) => console.log(e));
                                                    }
                                                }
                                                catch (e) {
                                                    await Database.delete('Through2Fa');
                                                }
                                            var code = await question(Language.EnterSecurityCode);
                                                try {
                                                    form.approvals_code = code;
                                                    form['submit[Continue]'] = $("#checkpointSubmitButton").html();
                                                    var prResolve,prReject;
                                                    var rtPromise = new Promise((resolve, reject) => { prResolve = resolve; prReject = reject; });
                                                    if (typeof code == "string") { //always strings
                                                        utils
                                                            .post(nextURL, jar, form, loginOptions)
                                                            .then(utils.saveCookies(jar))
                                                            .then(function(/** @type {{ body: string | Buffer; }} */res) {
                                                                var $ = cheerio.load(res.body);
                                                                var error = $("#approvals_code").parent().attr("data-xui-error");
                                                                if (error) {
                                                                        logger.Warning(Language.InvaildTwoAuthCode,function() { EnterSecurityCode(); }); //bruh loop
                                                                    };
                                                                })
                                                            .then(function() {
                                                                delete form.no_fido;delete form.approvals_code;
                                                                form.name_action_selected = 'save_device'; //'save_device' || 'dont_save;
                                                                return utils.post(nextURL, jar, form, loginOptions).then(utils.saveCookies(jar));
                                                            })  
                                                            .then(async function(/** @type {{ headers: any; body: string | string[]; }} */res) {
                                                                var headers = res.headers;
                                                                if (!headers.location && res.headers['set-cookie'][0].includes('checkpoint')) {
                                                                    try {
                                                                        delete form.name_action_selected;
                                                                        form['submit[Continue]'] = $("#checkpointSubmitButton").html();
                                                                        return utils
                                                                            .post(nextURL, jar, form, loginOptions)
                                                                            .then(utils.saveCookies(jar))
                                                                            .then(function() {
                                                                                form['submit[This was me]'] = "This was me";
                                                                                return utils.post(nextURL, jar, form, loginOptions).then(utils.saveCookies(jar));
                                                                            })
                                                                            .then(function() {
                                                                                delete form['submit[This was me]'];
                                                                                form.name_action_selected = 'save_device';
                                                                                form['submit[Continue]'] = $("#checkpointSubmitButton").html();
                                                                                return utils.post(nextURL, jar, form, loginOptions).then(utils.saveCookies(jar));
                                                                            })
                                                                            .then(async function(/** @type {{ headers: any; body: string | string[]; }} */res) {
                                                                                var headers = res.headers;
                                                                                if (!headers.location && res.headers['set-cookie'][0].includes('checkpoint')) throw { error: "wtf ??:D" };
                                                                                var appState = utils.getAppState(jar,false);
                                                                                await Database.set('Through2Fa', appState);
                                                                                return loginHelper(appState, email, password, loginOptions, callback);
                                                                            })
                                                                        .catch((/** @type {any} */e) => callback(e));
                                                                    }
                                                                    catch (e) {
                                                                        console.log(e)
                                                                    }
                                                                }
                                                                var appState = utils.getAppState(jar,false);
                                                                if (callback === prCallback) {
                                                                    callback = function(/** @type {any} */err, /** @type {any} */api) {
                                                                        if (err) return prReject(err);
                                                                        return prResolve(api);
                                                                    };
                                                                }
                                                                await Database.set('Through2Fa', appState);
                                                                return loginHelper(appState, email, password, loginOptions, callback);
                                                            })
                                                            .catch(function(/** @type {any} */err) {
                                                                if (callback === prCallback) prReject(err);
                                                                else callback(err);
                                                            });
                                                    } else {
                                                        utils
                                                            .post("https://www.facebook.com/checkpoint/?next=https%3A%2F%2Fwww.facebook.com%2Fhome.php", jar, form, loginOptions, null, { "Referer": "https://www.facebook.com/checkpoint/?next" })
                                                            .then(utils.saveCookies(jar))
                                                            .then(async function(/** @type {{ body: string; }} */res) {
                                                                try { 
                                                                    JSON.parse(res.body.replace(/for\s*\(\s*;\s*;\s*\)\s*;\s*/, ""));
                                                                } catch (ex) {
                                                                    clearInterval(checkVerified);
                                                                    logger.Warning(Language.VerifiedCheck);
                                                                    if (callback === prCallback) {
                                                                        callback = function(/** @type {any} */err, /** @type {any} */api) {
                                                                            if (err) return prReject(err);
                                                                            return prResolve(api);
                                                                        };
                                                                    }
                                                                    let appState = utils.getAppState(jar,false);
                                                                    return loginHelper(appState, email, password, loginOptions, callback);
                                                                }
                                                            })
                                                            .catch((/** @type {any} */ex) => {
                                                                log.error("login", ex);
                                                                if (callback === prCallback) prReject(ex);
                                                                else callback(ex);
                                                            });
                                                    }
                                                    return rtPromise;  
                                                }
                                                catch (e) {
                                                    logger.Error(e)
                                                    logger.Error()
                                                    process.exit(0)
                                                }
                                            }
                                            await EnterSecurityCode()
                                        }
                                        catch (e) {
                                            logger.Error(e)
                                            logger.Error();
                                            process.exit(0);
                                        }
                                    } 
                                        break;
                                    case false: {
                                        throw {
                                            error: 'login-approval',
                                            continue: function submit2FA(/** @type {any} */code) {
                                                form.approvals_code = code;
                                                form['submit[Continue]'] = $("#checkpointSubmitButton").html(); //'Continue';
                                                var prResolve,prReject;
                                                var rtPromise = new Promise((resolve, reject) => { prResolve = resolve; prReject = reject; });
                                                if (typeof code == "string") {
                                                    utils
                                                        .post(nextURL, jar, form, loginOptions)
                                                        .then(utils.saveCookies(jar))
                                                        .then(function(/** @type {{ body: string | Buffer; }} */res) {
                                                            var $ = cheerio.load(res.body);
                                                            var error = $("#approvals_code").parent().attr("data-xui-error");
                                                            if (error) {
                                                                throw {
                                                                    error: 'login-approval',
                                                                    errordesc: Language.InvaildTwoAuthCode,
                                                                    lerror: error,
                                                                    continue: submit2FA
                                                                };
                                                            }
                                                        })
                                                        .then(function() {
                                                            delete form.no_fido;delete form.approvals_code;
                                                            form.name_action_selected = 'dont_save'; //'save_device' || 'dont_save;
                                                            return utils.post(nextURL, jar, form, loginOptions).then(utils.saveCookies(jar));
                                                        })
                                                        .then(function(/** @type {{ headers: any; body: string | string[]; }} */res) {
                                                            var headers = res.headers;
                                                            if (!headers.location && res.headers['set-cookie'][0].includes('checkpoint')) throw { error: Language.ApprovalsErr };
                                                            var appState = utils.getAppState(jar,false);
                                                            if (callback === prCallback) {
                                                                callback = function(/** @type {any} */err, /** @type {any} */api) {
                                                                    if (err) return prReject(err);
                                                                    return prResolve(api);
                                                                };
                                                            }
                                                            return loginHelper(appState, email, password, loginOptions, callback);
                                                        })
                                                        .catch(function(/** @type {any} */err) {
                                                            if (callback === prCallback) prReject(err);
                                                            else callback(err);
                                                        });
                                                } else {
                                                    utils
                                                        .post("https://www.facebook.com/checkpoint/?next=https%3A%2F%2Fwww.facebook.com%2Fhome.php", jar, form, loginOptions, null, { "Referer": "https://www.facebook.com/checkpoint/?next" })
                                                        .then(utils.saveCookies(jar))
                                                        .then((/** @type {{ body: string; }} */res) => {
                                                            try { 
                                                                JSON.parse(res.body.replace(/for\s*\(\s*;\s*;\s*\)\s*;\s*/, ""));
                                                            } catch (ex) {
                                                                clearInterval(checkVerified);
                                                                logger.Warning(Language.VerifiedCheck);
                                                                if (callback === prCallback) {
                                                                    callback = function(/** @type {any} */err, /** @type {any} */api) {
                                                                        if (err) return prReject(err);
                                                                        return prResolve(api);
                                                                    };
                                                                }
                                                                return loginHelper(utils.getAppState(jar,false), email, password, loginOptions, callback);
                                                            }
                                                        })
                                                        .catch((/** @type {any} */ex) => {
                                                            log.error("login", ex);
                                                            if (callback === prCallback) prReject(ex);
                                                            else callback(ex);
                                                        });
                                                    }
                                                return rtPromise;
                                            }
                                        };
                                    }
                                }
                            } else {
                                if (!loginOptions.forceLogin) throw { error: Language.ForceLoginNotEnable };

                                if (html.indexOf("Suspicious Login Attempt") > -1) form['submit[This was me]'] = "This was me";
                                else form['submit[This Is Okay]'] = "This Is Okay";

                                return utils
                                    .post(nextURL, jar, form, loginOptions)
                                    .then(utils.saveCookies(jar))
                                    .then(function() {
                                        form.name_action_selected = 'dont_save';

                                        return utils.post(nextURL, jar, form, loginOptions).then(utils.saveCookies(jar));
                                    })
                                    .then(function(/** @type {{ headers: any; body: string | string[]; }} */res) {
                                        var headers = res.headers;

                                        if (!headers.location && res.body.indexOf('Review Recent Login') > -1) throw { error: "Something went wrong with review recent login." };

                                        var appState = utils.getAppState(jar,false);

                                        return loginHelper(appState, email, password, loginOptions, callback);
                                    })
                                    .catch((/** @type {any} */e) => callback(e));
                            }
                        });
                }
            return utils.get('https://www.facebook.com/', jar, null, loginOptions).then(utils.saveCookies(jar));
        });
    };
}

/!-[ Function backup ]-!/

/**
 * @param {string} data
 * @param {any} globalOptions
 * @param {any} callback
 * @param {any} prCallback
 */

function backup(data,globalOptions, callback, prCallback) {
    try {
        var appstate;
        try {
            appstate = JSON.parse(data)
        }
        catch(e) {
            appstate = data;
        }
            logger.Warning(Language.BackupNoti);
        try {
            loginHelper(appstate,null,null,globalOptions, callback, prCallback)
        }
        catch (e) {
            logger.Error(Language.ErrBackup);
            process.exit(0);
        }
    }
    catch (e) {
        return logger.Error();
    }
}

/!-[ async function loginHelper ]-!/

/**
 * @param {string | any[]} appState
 * @param {any} email
 * @param {any} password
 * @param {{ selfListen?: boolean; listenEvents?: boolean; listenTyping?: boolean; updatePresence?: boolean; forceLogin?: boolean; autoMarkDelivery?: boolean; autoMarkRead?: boolean; autoReconnect?: boolean; logRecordSize?: number; online?: boolean; emitReady?: boolean; userAgent?: string; pageID?: any; }} globalOptions
 * @param {(arg0: any, arg1: undefined) => void} callback
 * @param {(error: any, api: any) => any} [prCallback]
 */

async function loginHelper(appState, email, password, globalOptions, callback, prCallback) {
    var mainPromise = null;
    var jar = utils.getJar();

    if (fs.existsSync('./backupappstate.json')) {
        fs.unlinkSync('./backupappstate.json');
    }

try {
    if (appState) {
        logger.Normal(Language.OnProcess);
            switch (await Database.has("FBKEY")) {
                case true: {
                    process.env.FBKEY = await Database.get("FBKEY");
                }
                    break;
                case false: {
                    const SecurityKey = global.Fca.Require.Security.create().apiKey;
                        process.env['FBKEY'] = SecurityKey;
                    await Database.set('FBKEY', SecurityKey);
                }
                    break;
                default: {
                    const SecurityKey = global.Fca.Require.Security.create().apiKey;
                        process.env['FBKEY'] = SecurityKey;
                    await Database.set('FBKEY', SecurityKey);
                }
            }
            try {
                switch (global.Fca.Require.FastConfig.EncryptFeature) {
                    case true: {
                        appState = JSON.parse(JSON.stringify(appState, null, "\t"));
                        switch (utils.getType(appState)) {
                            case "Array": {
                                switch (utils.getType(appState[0])) {
                                    case "Object": {
										logger.Normal(Language.NotReadyToDecrypt);
									}
                                        break;
                                    case "String": {
                                        appState = Security(appState,process.env['FBKEY'],'Decrypt');
                                        logger.Normal(Language.DecryptSuccess);
                                    }
                                }
                            }
                                break;
                            case "Object": {
                                try {
                                    appState = StateCrypt.decryptState(appState, process.env['FBKEY']);
                                    logger.Normal(Language.DecryptSuccess);
                                }
                                catch (e) {
                                    if (process.env.Backup != undefined && process.env.Backup) {
                                    await backup(process.env.Backup,globalOptions, callback, prCallback);
                                }
                                else {
                                    try {
                                        if (await Database.has('Backup')) {
                                            return await backup(await Database.get('Backup'),globalOptions, callback, prCallback);
                                        }
                                        else {
                                            logger.Normal(Language.ErrBackup);
                                            process.exit(0);
                                        }
                                    }
                                    catch (e) {
                                        logger.Warning(Language.ErrBackup);
                                        logger.Error();
                                        process.exit(0);
                                    }
                                }
                                    logger.Warning(Language.DecryptFailed);
                                    return logger.Error();
                                }
                            }
                                break;
                            case "String": {
                                try {
                                    appState = StateCrypt.decryptState(appState, process.env['FBKEY']);
                                    logger.Normal(Language.DecryptSuccess);
                                }
                                catch (e) {
                                    if (process.env.Backup != undefined && process.env.Backup) {
                                    await backup(process.env.Backup,globalOptions, callback, prCallback);
                                }
                                else {
                                    try {
                                        if (await Database.has('Backup')) {
                                            return await backup(await Database.get('Backup'),globalOptions, callback, prCallback);
                                        }
                                        else {
                                            logger.Normal(Language.ErrBackup);
                                            process.exit(0);
                                        }
                                    }
                                    catch (e) {
                                        logger.Warning(Language.ErrBackup);
                                        logger.Error();
                                        process.exit(0);
                                    }
                                }
                                    logger.Warning(Language.DecryptFailed);
                                    return logger.Error();
                                } 
                            }
                                break;
                            default: {
                                logger.Warning(Language.InvaildAppState);
                                process.exit(0)
                            }
                        } 
                    }
                        break;
                    case false: {
                        switch (utils.getType(appState)) { 
                            case "Array": {
                                logger.Normal(Language.EncryptStateOff);
                            }
                                break;
                            case "Object": {
                                logger.Normal(Language.EncryptStateOff);
                                try {
                                    appState = StateCrypt.decryptState(appState, process.env['FBKEY']);
                                    logger.Normal(Language.DecryptSuccess);
                                }
                                catch (e) {
                                    if (process.env.Backup != undefined && process.env.Backup) {
                                        await backup(process.env.Backup,globalOptions, callback, prCallback);
                                    }
                                else {
                                    try {
                                        if (await Database.has('Backup')) {
                                            return await backup(await Database.get('Backup'),globalOptions, callback, prCallback);
                                        }
                                        else {
                                            logger.Warning(Language.ErrBackup);
                                            process.exit(0);
                                        }
                                    }
                                    catch (e) {
                                        logger.Warning(Language.ErrBackup);
                                        logger.Error();
                                        process.exit(0);
                                    }
                                }
                                    logger.Warning(Language.DecryptFailed);
                                    return logger.Error();
                                }
                            }
                                break;
                            default: {
                                logger.Warning(Language.InvaildAppState);
                                process.exit(0)
                            }
                        } 
                    }
                        break;
                    default: {
                        logger.Warning(getText(Language.IsNotABoolean,global.Fca.Require.FastConfig.EncryptFeature))
                        process.exit(0);
                    }
                }
            }
            catch (e) {
                console.log(e);
            }

        try {
            appState = JSON.parse(appState);
        }
        catch (e) {
            try {
                appState = appState;
            }
            catch (e) {
                return logger.Error();
            }
        }
        try {
            global.Fca.Data.AppState = appState;
                appState.map(function(/** @type {{ key: string; value: string; expires: string; domain: string; path: string; }} */c) {
                    var str = c.key + "=" + c.value + "; expires=" + c.expires + "; domain=" + c.domain + "; path=" + c.path + ";";
                    jar.setCookie(str, "http://" + c.domain);
                });
                process.env.Backup = appState;
                await Database.set('Backup', appState);
            mainPromise = utils.get('https://www.facebook.com/', jar, null, globalOptions, { noRef: true }).then(utils.saveCookies(jar));
        } catch (e) {
            if (process.env.Backup != undefined && process.env.Backup) {
                return await backup(process.env.Backup,globalOptions, callback, prCallback);
            }
            try {
                if (await Database.has('Backup')) {
                    return await backup(await Database.get('Backup'),globalOptions, callback, prCallback);
                }
                else {
                    logger.Warning(Language.ErrBackup);
                    process.exit(0);
                }
            }
            catch (e) {
                logger.Warning(Language.ErrBackup);
                logger.Error();
                process.exit(0);
            }
        return logger.Warning(Language.ErrBackup); // unreachable 👑 
    }
} else {
    mainPromise = utils
        .get("https://www.facebook.com/", null, null, globalOptions, { noRef: true })
            .then(utils.saveCookies(jar))
            .then(makeLogin(jar, email, password, globalOptions, callback, prCallback))
            .then(function() {
                return utils.get('https://www.facebook.com/', jar, null, globalOptions).then(utils.saveCookies(jar));
            });
        }
    } catch (e) {
        console.log(e);
    }
        var ctx,api;
            mainPromise = mainPromise
                .then(function(/** @type {{ body: string; }} */res) {
                    var reg = /<meta http-equiv="refresh" content="0;url=([^"]+)[^>]+>/,redirect = reg.exec(res.body);
                        if (redirect && redirect[1]) return utils.get(redirect[1], jar, null, globalOptions).then(utils.saveCookies(jar));
                    return res;
                })
                .then(function(/** @type {{ body: any; }} */res) {
                    var html = res.body,Obj = buildAPI(globalOptions, html, jar);
                        ctx = Obj.ctx;
                        api = Obj.api;
                        process.env.api = Obj.api;
                    return res;
                });
            if (globalOptions.pageID) {
                mainPromise = mainPromise
                    .then(function() {
                        return utils.get('https://www.facebook.com/' + ctx.globalOptions.pageID + '/messages/?section=messages&subsection=inbox', ctx.jar, null, globalOptions);
                    })
                    .then(function(/** @type {{ body: any; }} */resData) {
                        var url = utils.getFrom(resData.body, 'window.location.replace("https:\\/\\/www.facebook.com\\', '");').split('\\').join('');
                        url = url.substring(0, url.length - 1);
                        return utils.get('https://www.facebook.com' + url, ctx.jar, null, globalOptions);
                    });
            }
        mainPromise
            .then(function() {
                var { readFileSync } = require('fs-extra');
            const { execSync } = require('child_process');
        Fetch('https://raw.githubusercontent.com/HarryWakazaki/Fca-Horizon-Mod/main/package.json').then(async (/** @type {{ body: { toString: () => string; }; }} */res) => {
            const localVersion = JSON.parse(readFileSync('./node_modules/fca-horizon-mod/package.json')).version;
                if (Number(localVersion.replace(/\./g,"")) < Number(JSON.parse(res.body.toString()).version.replace(/\./g,"")) ) {
                    log.warn("[ FCA-HZI ] •",getText(Language.NewVersionFound,JSON.parse(readFileSync('./node_modules/fca-horizon-mod/package.json')).version,JSON.parse(res.body.toString()).version));
                    if (global.Fca.Require.FastConfig.AutoUpdate == true) { 
                        log.warn("[ FCA-HZI ] •",Language.AutoUpdate);
                            try {
                                execSync('npm install Fca-Horizon-Mod@latest', { stdio: 'inherit' });
                                    logger.Success(Language.UpdateSuccess)
                                        logger.Normal(Language.RestartAfterUpdate);
                                        await new Promise(resolve => setTimeout(resolve,5*1000));
                                    console.clear();process.exit(1);
                                }
                            catch (err) {
                                log.warn('Error Update: ' + err);
                                    logger.Normal(Language.UpdateFailed);
                                try {
                                    require.resolve('./Horizon_Package/horizon-sp');
                                }
                                catch (e) {
                                    logger.Normal(Language.InstallSupportTool);
                                        execSync('npm install ./Horizon_Package/horizon-sp', { stdio: 'inherit' });
                                    process.exit(1);
                                }
                                    var fcasp = require('./Horizon_Package/horizon-sp');
                                try {
                                    fcasp.onError()
                                }
                                catch (e) {
                                    logger.Normal(Language.NotiAfterUseToolFail, "[ Fca - Helper ]")
                                        logger.Normal("rmdir ./node_modules after type npm i && npm start","[ Fca - Helper ]");
                                    process.exit(0);
                                }
                            }
                        }
                    }
                else {
                    logger.Normal(getText(Language.LocalVersion,localVersion));
                        logger.Normal(getText(Language.CountTime,global.Fca.Data.CountTime()))   
                            logger.Normal(Language.WishMessage[Math.floor(Math.random()*Language.WishMessage.length)]);
                            require('./Extra/ExtraUptimeRobot')();
                        DataLanguageSetting.HTML.HTML==true? global.Fca.Require.Web.listen(global.Fca.Require.Web.get('DFP')) : global.Fca.Require.Web = null;
                    callback(null, api);
                }
            });
        }).catch(function(/** @type {{ error: any; }} */e) {
            log.error("login", e.error || e);
        callback(e);
    });
}

/**
 * It asks the user for their account and password, and then saves it to the database.
 */

function setUserNameAndPassWord() {
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    let localbrand2 = JSON.parse(readFileSync('./node_modules/fca-horizon-mod/package.json')).version;
    console.clear();
    console.log(figlet.textSync('Horizon', {font: 'ANSI Shadow',horizontalLayout: 'default',verticalLayout: 'default',width: 0,whitespaceBreak: true }));
    console.log(chalk.bold.hex('#9900FF')("[</>]") + chalk.bold.yellow(' => ') + "Operating System: " + chalk.bold.red(os.type()));
    console.log(chalk.bold.hex('#9900FF')("[</>]") + chalk.bold.yellow(' => ') + "Machine Version: " + chalk.bold.red(os.version()));
    console.log(chalk.bold.hex('#9900FF')("[</>]") + chalk.bold.yellow(' => ') + "Fca Version: " + chalk.bold.red(localbrand2) + '\n');
    try {
        rl.question(Language.TypeAccount, (Account) => {
            if (!Account.includes("@") && global.Fca.Require.utils.getType(parseInt(Account)) != "Number") return logger.Normal(Language.TypeAccountError, function () { process.exit(1) }); //Very Human
                else rl.question(Language.TypePassword,async function (Password) {
                    rl.close();
                    try {
                        await Database.set("Account", Account);
                        await Database.set("Password", Password);
                    }
                    catch (e) {
                        logger.Warning(Language.ErrDataBase);
                            logger.Error();
                        process.exit(0);
                    }
                    if (global.Fca.Require.FastConfig.ResetDataLogin) {
                        global.Fca.Require.FastConfig.ResetDataLogin = false;
                        global.Fca.Require.fs.writeFileSync('./FastConfigFca.json', JSON.stringify(global.Fca.Require.FastConfig, null, 4));
                    }
                logger.Success(Language.SuccessSetData);
                process.exit(1);
            });
        })
    }
    catch (e) {
        logger.Error(e)
    }
}

/**
 * @param {{ email: any; password: any; appState: any; }} loginData
 * @param {{}} options
 * @param {(error: any, api: any) => any} callback
 */

function login(loginData, options, callback) {
    if (utils.getType(options) === 'Function' || utils.getType(options) === 'AsyncFunction') {
        callback = options;
        options = {};
    }

    var globalOptions = {
        selfListen: false,
        listenEvents: true,
        listenTyping: false,
        updatePresence: false,
        forceLogin: false,
        autoMarkDelivery: false,
        autoMarkRead: false,
        autoReconnect: true,
        logRecordSize: 100,
        online: false,
        emitReady: false,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.1.2 Safari/603.3.8"
    };
    
    if (loginData.email && loginData.password) {
        setOptions(globalOptions, {
            logLevel: "silent",
            forceLogin: true,
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.114 Safari/537.36"
        });
    }
    else if (loginData.appState) {
        setOptions(globalOptions, options);
    }

    var prCallback = null;
    if (utils.getType(callback) !== "Function" && utils.getType(callback) !== "AsyncFunction") {
        var rejectFunc = null;
        var resolveFunc = null;
        var returnPromise = new Promise(function(resolve, reject) {
            resolveFunc = resolve;
            rejectFunc = reject;
        }); 
        prCallback = function(/** @type {any} */error, /** @type {any} */api) {
            if (error) return rejectFunc(error);
            return resolveFunc(api);
        };
        callback = prCallback;
    }
    
    (async function() {
        var Premium = require("./Extra/Src/Premium");
        global.Fca.Data.PremText = await Premium(global.Fca.Require.Security.create().uuid) || "Bạn Đang Sài Phiên Bản: Free !";
        if (!loginData.email && !loginData.password) {
            switch (global.Fca.Require.FastConfig.AutoLogin) {
                case true: {
                    if (global.Fca.Require.FastConfig.ResetDataLogin) return setUserNameAndPassWord();
                    else {
                        try {
                            if (await Database.get("TempState")) { 
                                try {
                                    loginData.appState = JSON.parse(await Database.get("TempState"));
                                }
                                catch (_) {
                                    loginData.appState = await Database.get("TempState");
                                }
                                await Database.delete("TempState");
                            }
                        }
                        catch (e) {
                            console.log(e)
                            await Database.delete("TempState");
                                logger.Warning(Language.ErrDataBase);
                                logger.Error();
                            process.exit(0);
                        }
                        try {
                            if (await Database.has('Account') && await Database.has('Password')) return loginHelper(loginData.appState, loginData.email, loginData.password, globalOptions, callback, prCallback);
                            else return setUserNameAndPassWord();
                        }
                        catch (e) {
                            logger.Warning(Language.ErrDataBase);
                                logger.Error();
                            process.exit(0);
                        }
                    }
                }
                case false: {
                    loginHelper(loginData.appState, loginData.email, loginData.password, globalOptions, callback, prCallback);
                }
            }
        }
        else loginHelper(loginData.appState, loginData.email, loginData.password, globalOptions, callback, prCallback);
    })()
    return returnPromise;
}

module.exports = login;