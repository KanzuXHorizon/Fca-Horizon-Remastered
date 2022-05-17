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
        utils: require("./utils"),
        fs: require("fs"),
        languageFile: require('./Language/index.json'),
        log: require("npmlog"),
        Fetch: require('got'),
        logger: require('./logger'),
        NodeCache: require( "node-cache"),
        Security: require("uuid-apikey")
    }),
    getText: function(...Data) {
        var Main = (Data.splice(0,1)).toString();
        for (let i = 0; i < Data.length; i++) Main = Main.replace(RegExp(`%${i + 1}`, 'g'), Data[i]);
        return Main;
    },
    Data: new Object({
        ObjFastConfig: {
            "Language": "vi",
            "PreKey": "",
            "MainColor": "#9900FF",
            "MainName": "[ FCA-HZI ]",
            "Uptime": false,
            "BroadCast": true,
            "EncryptFeature": true,
            "AutoRestartMinutes": 0,
            "HTML": {
                "UserName": "Guest",
                "MusicLink": "https://drive.google.com/uc?id=1zlAALlxk1TnO7jXtEP_O6yvemtzA2ukA&export=download"
            }
        },
        CountTime: function() {
            var fs = global.Fca.Require.fs;
            if (fs.existsSync(__dirname + '/CountTime.json')) {
                var data = Number(fs.readFileSync(__dirname + '/CountTime.json', 'utf8')),
                hours = Math.floor(data / (60 * 60));
            }
            else {
                hours = 0;
            }
            return `${hours} Hours`;
        }
    })
});

/*
global.Fca.Cache = new global.Fca.Require.NodeCache({ 
    stdTTL: 5, 
    checkperiod: 5 
});
*/

/!-[ Check File To Run Process ]-!/

try {
    if (!global.Fca.Require.fs.existsSync('./FastConfigFca.json')) {
        global.Fca.Require.fs.writeFileSync("./FastConfigFca.json", JSON.stringify(global.Fca.Data.ObjFastConfig, null, "\t"));
        process.exit(1);
    }

try {
    var DataLanguageSetting = require("../../FastConfigFca.json");
}
catch (e) {
    global.Fca.Require.logger.Error('Detect Your FastConfigFca Settings Invalid!, carry out default restoration');
    global.Fca.Require.fs.writeFileSync("./FastConfigFca.json", JSON.stringify(global.Fca.Data.ObjFastConfig, null, "\t"));     
    process.exit(1)
}

    if (global.Fca.Require.fs.existsSync('./FastConfigFca.json')) {
        try { 
            if (!DataLanguageSetting.HTML || global.Fca.Require.utils.getType(DataLanguageSetting.HTML) != 'Object') {
                    DataLanguageSetting.HTML = {
                        UserName: "Guest",
                        MusicLink: "https://drive.google.com/uc?id=1zlAALlxk1TnO7jXtEP_O6yvemtzA2ukA&export=download",
                    }
                global.Fca.Require.fs.writeFileSync("./FastConfigFca.json", JSON.stringify(DataLanguageSetting, null, "\t"));        
            }
        }
        catch (e) {
            console.log(e);
        }
        if (!global.Fca.Require.languageFile.some(i => i.Language == DataLanguageSetting.Language)) { 
            global.Fca.Require.logger.Warning("Not Support Language: " + DataLanguageSetting.Language + " Only 'en' and 'vi'","[ FCA-HZI ]");
            process.exit(0); 
        }
        var Language = global.Fca.Require.languageFile.find(i => i.Language == DataLanguageSetting.Language).Folder.Index;
        global.Fca.Require.Language = global.Fca.Require.languageFile.find(i => i.Language == DataLanguageSetting.Language).Folder;
    }
    else process.exit(1);
        if (global.Fca.Require.utils.getType(DataLanguageSetting.BroadCast) != "Boolean" && DataLanguageSetting.BroadCast != undefined) {
            global.Fca.Require.log.warn("FastConfig-BroadCast", global.Fca.getText(Language.IsNotABoolean,DataLanguageSetting.BroadCast));
            process.exit(0)
        }
    else if (DataLanguageSetting.Uptime == undefined || DataLanguageSetting.AutoRestartMinutes == undefined) {
        global.Fca.Require.fs.writeFileSync("./FastConfigFca.json", JSON.stringify(global.Fca.Data.ObjFastConfig, null, "\t"));
        process.exit(1);
    }
    global.Fca.Require.FastConfig = DataLanguageSetting;
}
catch (e) {
    console.log(e);
    global.Fca.Require.logger.Error();
}

/!-[ Require All Package Need Use ]-!/

var utils = global.Fca.Require.utils,
    logger = global.Fca.Require.logger,
    fs = global.Fca.Require.fs,
    getText = global.Fca.getText,
    log = global.Fca.Require.log,
    Fetch = global.Fca.Require.Fetch,
    http = require("http"),
    { join } = require('path'),
    cheerio = require("cheerio"),
    StateCrypt = require('./StateCrypt'),
    Client = require("@replit/database"),
    { readFileSync } = require('fs-extra'),
    Database = require("./Extra/Database/index");
    

/!-[ Set Variable For Process ]-!/

log.maxRecordSize = 100;
var checkVerified = null;
var Boolean_Option = ['online','selfListen','listenEvents','updatePresence','forceLogin','autoMarkDelivery','autoMarkRead','listenTyping','autoReconnect','emitReady'];

/!-[ Premium Check ]-!/;

(async () => {
    var Premium = require("./Extra/Src/Premium");
    global.Fca.Data.PremText = (await Premium(global.Fca.Require.Security.create().uuid) || " ");
})();

/!-[ Set And Check Template HTML ]-!/

var css = readFileSync(join(__dirname, 'Extra', 'Html', 'Classic', 'style.css'));
var js = readFileSync(join(__dirname, 'Extra', 'Html', 'Classic', 'script.js'));

/!-[ Function Generate HTML Template ]-!/

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
            <marquee><b>On May 30, 2022 We will be handing out gifts on fca-horizon-remake anniversary!</b></marquee>
            <h2>Horizon User Infomation</h2>
            <h3>UserName: ${UserName} | Type: ${Type}</h3>
            <canvas id="myCanvas"></canvas>
            <script  src="./script.js"></script>
            <footer class="footer">
                <div id="music">
                    <audio autoplay="true" controls="true" loop="true" src="${link}" __idm_id__="5070849">Your browser does not support the audio element.</audio>
                    <br><b>Session ID:</b> ${global.Fca.Require.Security.create().uuid}<br>
                    <br>Thanks For Using <b>Fca-Horizon-Remake</b> - From <b>Kanzu</b> <3<br>
                </div>
            </footer>
            </div>
        </center>
    </html>
    </body>`
}


/!-[ Stating Http Infomation ]-!/

global.Fca.Require.Web = http.createServer(function (request, res) {
    switch (request.url) {
        case "/style.css": {
            res.writeHead(200, "OK", { "Content-Type": "text/css" });
                res.write(css);
            break;
        }
        case "/script.js": {
            res.writeHead(200, "OK", { "Content-Type": "text/javascript" });
                res.write(js);
            break;
        }
        default: {
            res.writeHead(200, "OK", { "Content-Type": "text/html" });
            res.write(ClassicHTML(global.Fca.Require.FastConfig.HTML.UserName, global.Fca.Data.PremText.includes("Premium") ? "Premium": "Free", global.Fca.Require.FastConfig.HTML.MusicLink));
        }
    }
    res.end()
});

/!-[ Function setOptions ]-!/

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

function buildAPI(globalOptions, html, jar) {
    var maybeCookie = jar.getCookies("https://www.facebook.com").filter(function(val) { return val.cookieString().split("=")[0] === "c_user"; });

    if (maybeCookie.length === 0) throw { error: Language.ErrAppState };

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
        // do something
    }
    else {
        log.warn("login", getText(Language.NoAreaData));
        api["htmlData"] = html;
    }

    var defaultFuncs = utils.makeDefaults(html, userID, ctx);

    fs.readdirSync(__dirname + "/src")
    .filter((File) => File.endsWith(".js") && !File.includes('Dev_'))
    .map((File) => api[File.split('.').slice(0, -1).join('.')] = require('./src/' + File)(defaultFuncs, api, ctx));

    return {
        ctx,
        defaultFuncs, 
        api
    };
}

/!-[ Function makeLogin ]-!/

function makeLogin(jar, email, password, loginOptions, callback, prCallback) {
    return function(res) {
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
            form.lgnrnd = utils.getFrom(html, "name=\"lgnrnd\" value=\"", "\"");
                switch (global.Fca.Require.FastConfig.Language) {
                    case "en": {
                        form.locale = 'en_US';
                        break;
                    }
                    case "vi": {
                        form.locale = 'vi_VN'; // locale vi_VN sẽ dành cho người việt de tranh bay acc
                        break;
                    }
                    default: {
                        form.locale = 'en_US';
                        break;
                    }
                }
            form.timezone = '240';
            form.lgnjs = ~~(Date.now() / 1000);

        html.split("\"_js_").slice(1).map((val) => {
            jar.setCookie(utils.formatCookie(JSON.parse("[\"" + utils.getFrom(val, "", "]") + "]"), "facebook"),"https://www.facebook.com")
        });

        logger.Normal(Language.OnLogin);
        return utils
            .post("https://www.facebook.com/login/device-based/regular/login/?login_attempt=1&lwv=110", jar, form, loginOptions)
            .then(utils.saveCookies(jar))
            .then(function(res) {
                var headers = res.headers;  
                if (!headers.location) throw { error: Language.InvaildAccount };

                // This means the account has login approvals turned on.
                if (headers.location.indexOf('https://www.facebook.com/checkpoint/') > -1) {
                    logger.Warning(Language.TwoAuth);
                    var nextURL = 'https://www.facebook.com/checkpoint/?next=https%3A%2F%2Fwww.facebook.com%2Fhome.php';

                    return utils
                        .get(headers.location, jar, null, loginOptions)
                        .then(utils.saveCookies(jar))
                        .then(function(res) {
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

                                throw {
                                    error: 'login-approval',
                                    continue: function submit2FA(code) {
                                        form.approvals_code = code;
                                        form['submit[Continue]'] = $("#checkpointSubmitButton").html(); //'Continue';
                                        var prResolve,prReject;

                                        var rtPromise = new Promise((resolve, reject) => { prResolve = resolve; prReject = reject; });

                                        if (typeof code == "string") {
                                            utils
                                                .post(nextURL, jar, form, loginOptions)
                                                .then(utils.saveCookies(jar))
                                                .then(function(res) {
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
                                                .then(function(res) {
                                                    var headers = res.headers;
                                                    if (!headers.location && res.body.indexOf('Review Recent Login') > -1) throw { error: Language.ApprovalsErr };

                                                    var appState = utils.getAppState(jar);

                                                    if (callback === prCallback) {
                                                        callback = function(err, api) {
                                                            if (err) return prReject(err);
                                                            return prResolve(api);
                                                        };
                                                    }

                                                    return loginHelper(appState, email, password, loginOptions, callback);
                                                })
                                                .catch(function(err) {
                                                    if (callback === prCallback) prReject(err);
                                                    else callback(err);
                                                });
                                        } else {
                                            utils
                                                .post("https://www.facebook.com/checkpoint/?next=https%3A%2F%2Fwww.facebook.com%2Fhome.php", jar, form, loginOptions, null, { "Referer": "https://www.facebook.com/checkpoint/?next" })
                                                .then(utils.saveCookies(jar))
                                                .then(res => {
                                                    try { 
                                                        JSON.parse(res.body.replace(/for\s*\(\s*;\s*;\s*\)\s*;\s*/, ""));
                                                    } catch (ex) {
                                                        clearInterval(checkVerified);
                                                        logger.Warning(Language.VerifiedCheck);
                                                        if (callback === prCallback) {
                                                            callback = function(err, api) {
                                                                if (err) return prReject(err);
                                                                return prResolve(api);
                                                            };
                                                        }
                                                        return loginHelper(utils.getAppState(jar), email, password, loginOptions, callback);
                                                    }
                                                })
                                                .catch(ex => {
                                                    log.error("login", ex);
                                                    if (callback === prCallback) prReject(ex);
                                                    else callback(ex);
                                                });
                                        }
                                        return rtPromise;
                                    }
                                };
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
                                    .then(function(res) {
                                        var headers = res.headers;

                                        if (!headers.location && res.body.indexOf('Review Recent Login') > -1) throw { error: "Something went wrong with review recent login." };

                                        var appState = utils.getAppState(jar);

                                        return loginHelper(appState, email, password, loginOptions, callback);
                                    })
                                    .catch(e => callback(e));
                            }
                        });
                }

                return utils.get('https://www.facebook.com/', jar, null, loginOptions).then(utils.saveCookies(jar));
            });
    };
}

/!-[ Function backup ]-!/

function backup(data,globalOptions, callback, prCallback) {
    try {
        var appstate;
        try {
            appstate = JSON.parse(data)
        }
        catch(e) {
            appstate = data;
        }
        logger.Warning(Language.BackupNoti,"[ FCA-HZI ]");
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

async function loginHelper(appState, email, password, globalOptions, callback, prCallback) {
    var mainPromise = null;
    var jar = utils.getJar();

    if (fs.existsSync('./backupappstate.json')) {
        fs.unlinkSync('./backupappstate.json');
    }

try {
    if (appState) {
        logger.Normal(Language.OnProcess);
            switch (process.platform) {
                case "android":
                    case "win32": {
                        try {
                            switch (Database.has("FBKEY")) {
                                case true: {
                                    process.env['FBKEY'] = Database.get("FBKEY");
                                }
                                    break;
                                case false: {
                                    const SecurityKey = global.Fca.Require.Security.create().apiKey;
                                        process.env['FBKEY'] = SecurityKey;
                                    Database.set('FBKEY', SecurityKey);
                                }
                                    break;
                                default: {
                                    const SecurityKey = global.Fca.Require.Security.create().apiKey;
                                        process.env['FBKEY'] = SecurityKey;
                                    Database.set('FBKEY', SecurityKey);
                                }
                            }   
                        }
                        catch (e) {
                            try {
                                const SecurityKey = global.Fca.Require.Security.create().apiKey;
                                    process.env['FBKEY'] = SecurityKey;
                                Database.set('FBKEY', SecurityKey);
                            }
                            catch (e) {
                                logger.Warning(Language.ErrGetPassWord);
                                logger.Error();
                                process.exit(1);
                            }
                        }
                    }
                        break;
                    case "linux": {
                        if (process.env["REPL_ID"] == undefined) {
                            try {
                                switch (Database.has("FBKEY")) {
                                    case true: {
                                        process.env['FBKEY'] = Database.get("FBKEY");
                                    }
                                        break;
                                    case false: {
                                        const SecurityKey = global.Fca.Require.Security.create().apiKey;
                                            process.env['FBKEY'] = SecurityKey;
                                        Database.set('FBKEY', SecurityKey);
                                    }
                                        break;
                                    default: {
                                        const SecurityKey = global.Fca.Require.Security.create().apiKey;
                                            process.env['FBKEY'] = SecurityKey;
                                        Database.set('FBKEY', SecurityKey);
                                    }
                                }   
                            }
                            catch (e) {
                                try {
                                    const SecurityKey = global.Fca.Require.Security.create().apiKey;
                                        process.env['FBKEY'] = SecurityKey;
                                    Database.set('FBKEY', SecurityKey);
                                }
                                catch (e) {
                                    logger.Warning(Language.ErrGetPassWord);
                                    logger.Error();
                                    process.exit(1);
                                }
                            }
                        }
                        else {
                            try {
                                const client = new Client();
                                    let key = await client.get("FBKEY");
                                if (!key) {
                                    await client.set("FBKEY", global.Fca.Require.Security.create().apiKey);
                                        let key = await client.get("FBKEY");
                                    process.env['FBKEY'] = key;
                                } else {
                                    process.env['FBKEY'] = key;
                                }
                            }
                            catch (e) {
                                logger.Warning(Language.ErrGenerateKey);
                                    logger.Normal(e);
                                    logger.Error();
                                process.exit(0)
                            }
                        }
                    }
                    break;
                default: {
                    logger.Warning(Language.UnsupportedDevice);
                        logger.Error();
                    process.exit(0);
                }
            }
            try {
                switch (global.Fca.Require.FastConfig.EncryptFeature) {
                    case true: {
                        appState = JSON.parse(JSON.stringify(appState, null, "\t"));
                        switch (utils.getType(appState)) {
                            case "Array": {
                                logger.Normal(Language.NotReadyToDecrypt);
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
                                else switch (process.platform) {
                                    case "android":
                                        case "win32": {
                                            try {
                                                if (Database.has('Backup')) {
                                                    return await backup(Database.get('Backup'),globalOptions, callback, prCallback);
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
                                            break;
                                        case "linux": {
                                            if (process.env["REPL_ID"] == undefined) {
                                                try {
                                                    if (Database.has('Backup')) {
                                                        return await  backup(Database.get('Backup'),globalOptions, callback, prCallback);
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
                                            else {
                                                try {
                                                    const client = new Client();
                                                    let Data = await client.get("Backup");
                                                    if (Data) {
                                                        return await backup(JSON.stringify(Data),globalOptions, callback, prCallback);
                                                    }
                                                    else {
                                                        logger.Normal(Language.ErrBackup);
                                                    }
                                                }
                                                catch (e) {
                                                    logger.Warning(Language.ErrBackup);
                                                }
                                            }
                                        }
                                    break;
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
                                else switch (process.platform) {
                                    case "android":
                                        case "win32": {
                                            try {
                                                if (Database.has('Backup')) {
                                                    return await backup(Database.get('Backup'),globalOptions, callback, prCallback);
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
                                            break;
                                        case "linux": {
                                            if (process.env["REPL_ID"] == undefined) {
                                                try {
                                                    if (Database.has('Backup')) {
                                                        return await  backup(Database.get('Backup'),globalOptions, callback, prCallback);
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
                                            else {
                                                try {
                                                    const client = new Client();
                                                    let Data = await client.get("Backup");
                                                    if (Data) {
                                                        return await backup(JSON.stringify(Data),globalOptions, callback, prCallback);
                                                    }
                                                    else {
                                                        logger.Normal(Language.ErrBackup);
                                                    }
                                                }
                                                catch (e) {
                                                    logger.Warning(Language.ErrBackup);
                                                }
                                            }
                                        }
                                    break;
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
                                else switch (process.platform) {
                                    case "android":
                                        case "win32": {
                                            try {
                                                if (Database.has('Backup')) {
                                                    return await backup(Database.get('Backup'),globalOptions, callback, prCallback);
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
                                            break;
                                        case "linux": {
                                            if (process.env["REPL_ID"] == undefined) {
                                                try {
                                                    if (Database.has('Backup')) {
                                                        return await backup(Database.get('Backup'),globalOptions, callback, prCallback);
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
                                            else {
                                                try {
                                                    const client = new Client();
                                                    let Data = await client.get("Backup");
                                                    if (Data) {
                                                        return await backup(JSON.stringify(Data),globalOptions, callback, prCallback);
                                                    }
                                                    else {
                                                        logger.Normal(Language.ErrBackup);
                                                    }
                                                }
                                                catch (e) {
                                                    logger.Warning(Language.ErrBackup);
                                                }
                                            }
                                        }
                                    break;
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
                appState.map(function(c) {
                    var str = c.key + "=" + c.value + "; expires=" + c.expires + "; domain=" + c.domain + "; path=" + c.path + ";";
                    jar.setCookie(str, "http://" + c.domain);
                });
            switch (process.platform) {
                case "android":
                    case "win32": {
                        try {
                            process.env.Backup = JSON.stringify(appState, null, "\t");
                            Database.set('Backup', appState);
                        }
                        catch (e) {
                            logger.Warning(Language.BackupFailed);
                        }
                    }
                        break;
                    case "linux": {
                        if (process.env["REPL_ID"] == undefined) {
                            try {
                                process.env.Backup = JSON.stringify(appState, null, "\t");
                                Database.set('Backup', appState);
                            }
                            catch (e) {
                                logger.Warning(Language.BackupFailed);
                            }
                        }
                        else {
                            try {
                                const client = new Client();
                                    await client.set("Backup", appState);
                                process.env.Backup = JSON.stringify(appState, null, "\t");
                            }
                            catch (e) {
                                logger.Warning(Language.BackupFailed);
                            }
                        }
                    }
                break;
            }
            mainPromise = utils.get('https://www.facebook.com/', jar, null, globalOptions, { noRef: true }).then(utils.saveCookies(jar));
        } catch (e) {
console.log(e)
            if (process.env.Backup != undefined && process.env.Backup) {
                return await backup(process.env.Backup,globalOptions, callback, prCallback);
            }
            switch (process.platform) {
                case "android":
                    case "win32": {
                        try {
                            if (Database.has('Backup')) {
                                return await backup(Database.get('Backup'),globalOptions, callback, prCallback);
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
                    case "linux": {
                        if (process.env["REPL_ID"] == undefined) {
                            try {
                                if (Database.has('Backup')) {
                                    return await backup(Database.get('Backup'),globalOptions, callback, prCallback);
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
                        else {
                            try {
                                const client = new Client();
                                    let Data = await client.get("Backup");
                                if (Data) {
                                    return await backup(JSON.stringify(Data),globalOptions, callback, prCallback);
                                }
                                else {
                                    logger.Warning(Language.ErrBackup);
                                }
                            }
                            catch (e) {
                                logger.Warning(Language.ErrBackup);
                            }
                        }
                    }
                break;
            }
        console.log(e);
        return logger.Warning(Language.ScreenShotConsoleAndSendToAdmin, '[ FCA-HSP ]');
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
                .then(function(res) {
                    var reg = /<meta http-equiv="refresh" content="0;url=([^"]+)[^>]+>/,redirect = reg.exec(res.body);
                        if (redirect && redirect[1]) return utils.get(redirect[1], jar, null, globalOptions).then(utils.saveCookies(jar));
                    return res;
                })
                .then(function(res) {
                    var html = res.body,Obj = buildAPI(globalOptions, html, jar);
                        ctx = Obj.ctx;
                        api = Obj.api;
                    return res;
                });
            if (globalOptions.pageID) {
                mainPromise = mainPromise
                    .then(function() {
                        return utils.get('https://www.facebook.com/' + ctx.globalOptions.pageID + '/messages/?section=messages&subsection=inbox', ctx.jar, null, globalOptions);
                    })
                    .then(function(resData) {
                        var url = utils.getFrom(resData.body, 'window.location.replace("https:\\/\\/www.facebook.com\\', '");').split('\\').join('');
                        url = url.substring(0, url.length - 1);
                        return utils.get('https://www.facebook.com' + url, ctx.jar, null, globalOptions);
                    });
            }
        mainPromise
            .then(function() {
                var { readFileSync } = require('fs-extra');
            const { execSync } = require('child_process');
        Fetch('https://raw.githubusercontent.com/HarryWakazaki/Fca-Horizon-Remake/main/package.json').then(async (res) => {
            const localVersion = JSON.parse(readFileSync('./node_modules/fca-horizon-remake/package.json')).version;
                if (Number(localVersion.replace(/\./g,"")) < Number(JSON.parse(res.body.toString()).version.replace(/\./g,""))) {
                    log.warn("[ FCA-HZI ] •",getText(Language.NewVersionFound,JSON.parse(readFileSync('./node_modules/fca-horizon-remake/package.json')).version,JSON.parse(res.body.toString()).version));
                    log.warn("[ FCA-HZI ] •",Language.AutoUpdate);
                        try {
                            execSync('npm install fca-horizon-remake@latest', { stdio: 'inherit' });
                                logger.Success(Language.UpdateSuccess,"[ FCA-HZI ]")
                                    logger.Normal(Language.RestartAfterUpdate);
                                    await new Promise(resolve => setTimeout(resolve,5*1000));
                                console.clear();process.exit(1);
                            }
                        catch (err) {
                            log.warn('Error Update: ' + err);
                                logger.Normal(Language.UpdateFailed,"[ FCA-HZI ]");
                            try {
                                require.resolve('horizon-sp');
                            }
                            catch (e) {
                                logger.Normal(Language.InstallSupportTool);
                                    execSync('npm install horizon-sp@latest', { stdio: 'inherit' });
                                process.exit(1);
                            }
                                var fcasp = require('horizon-sp');
                            try {
                                fcasp.onError()
                            }
                            catch (e) {
                                logger.Normal(Language.NotiAfterUseToolFail, "[ Fca - Helper ]")
                                    logger.Normal("rmdir ./node_modules sau đó nhập npm i && npm start","[ Fca - Helper ]");
                                process.exit(0);
                            }
                        }
                    }
                else {
                    logger.Normal(getText(Language.LocalVersion,localVersion));
                        logger.Normal(getText(Language.CountTime,global.Fca.Data.CountTime()))   
                            logger.Normal(Language.WishMessage[Math.floor(Math.random()*Language.WishMessage.length)]);
                            global.Fca.Require.Web.listen(process.env.port || 1355);
                        require('./Extra/ExtraUptimeRobot').Values();    
                    callback(null, api);
                }
            });
        }).catch(function(e) {
            log.error("login", e.error || e);
        callback(e);
    });
}

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
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36"
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
        prCallback = function(error, api) {
            if (error) return rejectFunc(error);
            return resolveFunc(api);
        };
        callback = prCallback;
    }
    loginHelper(loginData.appState, loginData.email, loginData.password, globalOptions, callback, prCallback);
    return returnPromise;
}

module.exports = login;