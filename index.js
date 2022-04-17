'use strict';

/!-[ Max Cpu Speed ]-!/

process.env.UV_THREADPOOL_SIZE = require('os').cpus().length;

/!-[ Global Set ]-!/

global.isThread = new Array();
global.isUser = new Array();
global.startTime = Date.now();
global.Setting = new Map();
global.Require = new Object({
    utils: require("./utils"),
    fs: require("fs"),
    languageFile: require('./Language/index.json'),
    getText: require('gettext.js')(),
    log: require("npmlog"),
    Fetch: require('got'),
    logger: require('./logger')
}); 
global.Data = new Object({
    ObjFastConfig: {
        "Language": "vi",
        "PreKey": "",
        "MainColor": "#9900FF",
        "MainName": "[ FCA-HZI ]",
        "Uptime": false,
        "BroadCast": true,
        "EncryptFeature": true,
        "AutoRestartMinutes": 0
    },
    AppState: null,
    event: null,
    CountTime: function CountTime() {
        var fs = global.Require.fs;
        if (fs.existsSync(__dirname + '/CountTime.json')) {
            var data = Number(fs.readFileSync(__dirname + '/CountTime.json', 'utf8')),
            hours = Math.floor(data / (60 * 60)),
            minutes = Math.floor((data % (60 * 60)) / 60),
            seconds = Math.floor(data % 60);
        }
        else {
            hours = 0,
            minutes = 0,
            seconds = 0;
        }
        return `${hours}h${minutes}m${seconds}s`;
    }
});

/!-[ Check File To Run Process ]-!/

try {
    if (!global.Require.fs.existsSync('./FastConfigFca.json')) {
        global.Require.fs.writeFileSync("./FastConfigFca.json", JSON.stringify(global.Data.ObjFastConfig, null, "\t"));
        process.exit(1);
    }

try {
    var DataLanguageSetting = require("../../FastConfigFca.json");
}
catch (e) {
    global.Require.logger.onLogger('Detect Your FastConfigFca Settings Invalid!')
    global.Require.logger.Error();
    process.exit(0)
}

    if (global.Require.fs.existsSync('./FastConfigFca.json')) {
        try {
            if (DataLanguageSetting && !DataLanguageSetting.MainName) {
                    DataLanguageSetting.MainName = "[ FCA-HZI ]";
                global.Require.fs.writeFileSync("./FastConfigFca.json", JSON.stringify(DataLanguageSetting, null, "\t"));        
            }
        }
        catch (e) {
            console.log(e);
        }
        if (!global.Require.languageFile.some(i => i.Language == DataLanguageSetting.Language)) { 
            logger("Not Support Language: " + DataLanguageSetting.Language + " Only 'en' and 'vi'","[ FCA-HZI ]");
            process.exit(0); 
        }
        var Language = global.Require.languageFile.find(i => i.Language == DataLanguageSetting.Language).Folder.Index;
        global.Require.Language = global.Require.languageFile.find(i => i.Language == DataLanguageSetting.Language).Folder;
    }
    else process.exit(1);
        if (global.Require.utils.getType(DataLanguageSetting.BroadCast) != "Boolean" && DataLanguageSetting.BroadCast != undefined) {
            global.Require.log.warn("FastConfig-BroadCast", global.Require.getText.gettext(Language.IsNotABoolean,DataLanguageSetting.BroadCast));
            process.exit(0)
        }
    else if (DataLanguageSetting.Uptime == undefined || DataLanguageSetting.AutoRestartMinutes == undefined) {
        global.Require.fs.writeFileSync("./FastConfigFca.json", JSON.stringify(global.Data.ObjFastConfig, null, "\t"));
        process.exit(1);
    }
    global.Require.FastConfig = require("../../FastConfigFca.json");
}
catch (e) {
    console.log(e);
    global.Require.logger.Error();
}

/!-[ Require All Package Need Use ]-!/

var utils = global.Require.utils,
    logger = global.Require.logger,
    fs = global.Require.fs,
    getText = global.Require.getText,
    log = global.Require.log,
    Fetch = global.Require.Fetch,
    cheerio = require("cheerio"),
    StateCrypt = require('./StateCrypt'),
    Client = require("@replit/database");

/!-[ Set Variable For Process ]-!/

log.maxRecordSize = 100;
var checkVerified = null;

/!-[ Function setOptions ]-!/

function setOptions(globalOptions, options) {
    Object.keys(options).map(function(key) {
        switch (key) {
            case 'pauseLog':
                if (options.pauseLog) log.pause();
                break;
            case 'online':
                globalOptions.online = Boolean(options.online);
                break;
            case 'logLevel':
                log.level = options.logLevel;
                globalOptions.logLevel = options.logLevel;
                break;
            case 'logRecordSize':
                log.maxRecordSize = options.logRecordSize;
                globalOptions.logRecordSize = options.logRecordSize;
                break;
            case 'selfListen':
                globalOptions.selfListen = Boolean(options.selfListen);
                break;
            case 'listenEvents':
                globalOptions.listenEvents = Boolean(options.listenEvents);
                break;
            case 'pageID':
                globalOptions.pageID = options.pageID.toString();
                break;
            case 'updatePresence':
                globalOptions.updatePresence = Boolean(options.updatePresence);
                break;
            case 'forceLogin':
                globalOptions.forceLogin = Boolean(options.forceLogin);
                break;
            case 'userAgent':
                globalOptions.userAgent = (options.userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML, like Gecko) Version/8.0.3');
                break;
            case 'autoMarkDelivery':
                globalOptions.autoMarkDelivery = Boolean(options.autoMarkDelivery);
                break;
            case 'autoMarkRead':
                globalOptions.autoMarkRead = Boolean(options.autoMarkRead);
                break;
            case 'listenTyping':
                globalOptions.listenTyping = Boolean(options.listenTyping);
                break;
            case 'proxy':
                if (typeof options.proxy != "string") {
                    delete globalOptions.proxy;
                    utils.setProxy();
                } else {
                    globalOptions.proxy = options.proxy;
                    utils.setProxy(globalOptions.proxy);
                }
                break;
            case 'autoReconnect':
                globalOptions.autoReconnect = Boolean(options.autoReconnect);
                break;
            case 'emitReady':
                globalOptions.emitReady = Boolean(options.emitReady);
                break;
            default:
                log.warn("setOptions", "Unrecognized option given to setOptions: " + key);
                break;
        }
    });
}

/!-[ Function BuildAPI ]-!/

function buildAPI(globalOptions, html, jar) {
    var maybeCookie = jar.getCookies("https://www.facebook.com").filter(function(val) { return val.cookieString().split("=")[0] === "c_user"; });

    if (maybeCookie.length === 0) throw { error: Language.ErrAppState };

    if (html.indexOf("/checkpoint/block/?next") > -1) log.warn("login", Language.CheckPointLevelI);

    var userID = maybeCookie[0].cookieString().split("=")[1].toString();
    logger(getText.gettext(Language.UID,userID));
    process.env['UID'] = userID;

    try {
        clearInterval(checkVerified);
    } catch (e) {
        console.log(e);
    }

    var clientID = (Math.random() * 2147483648 | 0).toString(16);

    let oldFBMQTTMatch = html.match(/irisSeqID:"(.+?)",appID:219994525426954,endpoint:"(.+?)"/);
    let mqttEndpoint = null;
    let region = null;
    let irisSeqID = null;
    var noMqttData = null;

    if (oldFBMQTTMatch) {
        irisSeqID = oldFBMQTTMatch[1];
        mqttEndpoint = oldFBMQTTMatch[2];
        region = new URL(mqttEndpoint).searchParams.get("region").toUpperCase();
        logger(getText.gettext(Language.Area,region));
    } else {
        let newFBMQTTMatch = html.match(/{"app_id":"219994525426954","endpoint":"(.+?)","iris_seq_id":"(.+?)"}/);
        if (newFBMQTTMatch) {
            irisSeqID = newFBMQTTMatch[2];
            mqttEndpoint = newFBMQTTMatch[1].replace(/\\\//g, "/");
            region = new URL(mqttEndpoint).searchParams.get("region").toUpperCase();
            logger(getText.gettext(Language.Area,region));
        } else {
            let legacyFBMQTTMatch = html.match(/(\["MqttWebConfig",\[\],{fbid:")(.+?)(",appID:219994525426954,endpoint:")(.+?)(",pollingEndpoint:")(.+?)(3790])/);
            if (legacyFBMQTTMatch) {
                mqttEndpoint = legacyFBMQTTMatch[4];
                region = new URL(mqttEndpoint).searchParams.get("region").toUpperCase();
                log.warn("login", `Cannot get sequence ID with new RegExp. Fallback to old RegExp (without seqID)...`);
                logger(getText.gettext(Language.Area,region));
                logger("login", `[Unused] Polling endpoint: ${legacyFBMQTTMatch[6]}`);
            } else {
                log.warn("login", getText.gettext(Language.NoAreaData));
                noMqttData = html;
            }
        }
    }

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
        mqttEndpoint,
        region,
        firstListen: true
    };

    var api = {
        setOptions: setOptions.bind(null, globalOptions),
        getAppState: function getAppState() {
            return utils.getAppState(jar);
        }
    };

    if (noMqttData) api["htmlData"] = noMqttData;

    const apiFuncNames = fs.readdirSync(__dirname + "/src").filter((File) => File.endsWith(".js") && !File.includes('Dev'));

    var defaultFuncs = utils.makeDefaults(html, userID, ctx);

    // Load all api functions in a loop
    apiFuncNames.map(v => api[v.replace(".js","")] = require('./src/' + v)(defaultFuncs, api, ctx));
    return [ctx, defaultFuncs, api];
}

/!-[ Function makeLogin ]-!/

function makeLogin(jar, email, password, loginOptions, callback, prCallback) {
    return function(res) {
        var html = res.body;
        var $ = cheerio.load(html);
        var arr = [];

        // This will be empty, but just to be sure we leave it
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
        form.locale = 'en_US';
        form.timezone = '240';
        form.lgnjs = ~~(Date.now() / 1000);


        // Getting cookies from the HTML page... (kill me now plz)
        // we used to get a bunch of cookies in the headers of the response of the
        // request, but FB changed and they now send those cookies inside the JS.
        // They run the JS which then injects the cookies in the page.
        // The "solution" is to parse through the html and find those cookies
        // which happen to be conveniently indicated with a _js_ in front of their
        // variable name.
        //
        // ---------- Very Hacky Part Starts -----------------
        var willBeCookies = html.split("\"_js_");
        willBeCookies.slice(1).map(function(val) {
            var cookieData = JSON.parse("[\"" + utils.getFrom(val, "", "]") + "]");
            jar.setCookie(utils.formatCookie(cookieData, "facebook"), "https://www.facebook.com");
        });
        // ---------- Very Hacky Part Ends -----------------

        logger(Language.OnLogin);
        return utils
            .post("https://www.facebook.com/login/device-based/regular/login/?login_attempt=1&lwv=110", jar, form, loginOptions)
            .then(utils.saveCookies(jar))
            .then(function(res) {
                var headers = res.headers;
                if (!headers.location) throw { error: Language.InvaildAccount };

                // This means the account has login approvals turned on.
                if (headers.location.indexOf('https://www.facebook.com/checkpoint/') > -1) {
                    logger(Language.TwoAuth);
                    var nextURL = 'https://www.facebook.com/checkpoint/?next=https%3A%2F%2Fwww.facebook.com%2Fhome.php';

                    return utils
                        .get(headers.location, jar, null, loginOptions)
                        .then(utils.saveCookies(jar))
                        .then(function(res) {
                            var html = res.body;
                            // Make the form in advance which will contain the fb_dtsg and nh
                            var $ = cheerio.load(html);
                            var arr = [];
                            $("form input").map((i, v) => arr.push({ val: $(v).val(), name: $(v).attr("name") }));

                            arr = arr.filter(function(v) {
                                return v.val && v.val.length;
                            });

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
                                        var prResolve = null;
                                        var prReject = null;
                                        var rtPromise = new Promise(function(resolve, reject) {
                                            prResolve = resolve;
                                            prReject = reject;
                                        });
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
                                                    // Use the same form (safe I hope)
                                                    delete form.no_fido;
                                                    delete form.approvals_code;
                                                    form.name_action_selected = 'save_device'; //'save_device' || 'dont_save;

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

                                                    // Simply call loginHelper because all it needs is the jar
                                                    // and will then complete the login process
                                                    return loginHelper(appState, email, password, loginOptions, callback);
                                                })
                                                .catch(function(err) {
                                                    // Check if using Promise instead of callback
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
                                                        logger(Language.VerifiedCheck);
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
                                        // Use the same form (safe I hope)
                                        form.name_action_selected = 'save_device';

                                        return utils.post(nextURL, jar, form, loginOptions).then(utils.saveCookies(jar));
                                    })
                                    .then(function(res) {
                                        var headers = res.headers;

                                        if (!headers.location && res.body.indexOf('Review Recent Login') > -1) throw { error: "Something went wrong with review recent login." };

                                        var appState = utils.getAppState(jar);

                                        // Simply call loginHelper because all it needs is the jar
                                        // and will then complete the login process
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

/!-[ Function makeid ]-!/

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
return result;
}

/!-[ async function loginHelper ]-!/

async function loginHelper(appState, email, password, globalOptions, callback, prCallback) {
    var mainPromise = null;
    var jar = utils.getJar();

    // If we're given an appState we loop through it and save each cookie
    // back into the jar.
try {
    if (appState) {
    logger(Language.OnProcess);
        var backup = async(data) => {
            if (fs.existsSync('./appstate.json')) {
                try {
                    fs.writeFileSync('./appstate.json', data);
                }
                catch(e) {
                    fs.writeFileSync('./appstate.json', JSON.stringify(data, null, "\t"));
                }
                logger(Language.BackupNoti,"[ FCA-HZI ]");
                await new Promise(resolve => setTimeout(resolve, 5*1000));
                process.exit(1);
            }
            else if (fs.existsSync('./Facebook.json')) {
                try {
                    fs.writeFileSync('./Facebook.json', data);
                }
                catch (e) {
                    fs.writeFileSync('./Facebook.json', JSON.stringify(data, null, "\t"));
                }
                logger(Language.BackupNoti,"[ FCA-HZI ]");
                await new Promise(resolve => setTimeout(resolve, 5*1000));
                process.exit(1);
            }
            else if (fs.existsSync('fbstate.json')) {
                try {
                    fs.writeFileSync('./fbstate.json', data);
                }
                catch (e) {
                    fs.writeFileSync('./fbstate.json', JSON.stringify(data), null, "\t");
                }
                logger(Language.BackupNoti,"[ FCA-HZI ]");
                await new Promise(resolve => setTimeout(resolve, 5*1000));
                process.exit(1);
            }
            else return logger.Error();
        }

        switch (process.platform) {
            case "win32": {
                try {
                    var { body } = await Fetch('https://decrypt-appstate-production.up.railway.app/getKey');
                    process.env['FBKEY'] = JSON.parse(body).Data;
                }
                catch (e) {
                    logger(Language.ErrGetPassWord);
                    logger.Error();
                    process.exit(1);
                }
            }
                break;
            case "linux": {
                if (process.env["REPL_ID"] == undefined) {
                    try {
                        var { body } = await Fetch.get('https://decrypt-appstate-production.up.railway.app/getKey');
                        process.env['FBKEY'] = JSON.parse(body).Data;
                    }
                    catch (e) {
                        logger(Language.ErrGetPassWord, '[ FCA-HZI ]');
                        logger.Error();
                        process.exit(1);
                    }
                }
                else {
                    try {
                        const client = new Client();
                        let key = await client.get("FBKEY");
                        if (!key) {
                            await client.set("FBKEY", makeid(49));
                            let key = await client.get("FBKEY");
                            process.env['FBKEY'] = key;
                        } else {
                            process.env['FBKEY'] = key;
                        }
                    }
                    catch (e) {
                        logger(Language.ErrGenerateKey, '[ FCA-HZI ]');
                        logger(e, '[ FCA-HZI ]');
                        logger.Error();
                        process.exit(0)
                    }
                }
            }
                break;
            case "android": {
                try {
                    var { body } = await Fetch.get('https://decrypt-appstate-production.up.railway.app/getKey');
                    process.env['FBKEY'] = JSON.parse(body).Data;
                }
                catch (e) {
                    logger(Language.ErrGetPassWord, '[ FCA-HZI ]');
                    return logger.Error();
                }
            }
                break;
            default: {
                logger(Language.UnsupportedDevice, '[ FCA-HZI ]');
                logger.Error();
                process.exit(0);
            }
        }

        try {
            switch (require("../../FastConfigFca.json").EncryptFeature) {
                case true: {
                    appState = JSON.parse(JSON.stringify(appState, null, "\t"));
                    switch (utils.getType(appState)) {
                        case "Array": {
                            logger(Language.NotReadyToDecrypt, '[ FCA-HZI ]');
                        }
                            break;
                        case "String": {
                            try {
                                appState = StateCrypt.decryptState(appState, process.env['FBKEY']);
                                logger(Language.DecryptSuccess, '[ FCA-HZI ]');
                            }
                            catch (e) {
                                if (process.env.Backup != undefined && process.env.Backup) {
                                backup(process.env.Backup);
                            }
                            else switch (process.platform) {
                                case "win32": {
                                    try {
                                        if (fs.existsSync('./backupappstate.json')) {
                                            let content = fs.readFileSync('./backupappstate.json','utf8');
                                            return backup(content);
                                        }
                                    }
                                    catch (e) {
                                        logger(Language.ErrBackup, '[ FCA-HZI ]');
                                        logger.Error();
                                        process.exit(0);
                                    }
                                }
                                    break;
                                case "linux": {
                                    if (process.env["REPL_ID"] == undefined) {
                                        try {
                                            if (fs.existsSync('./backupappstate.json')) {
                                                let content = fs.readFileSync('./backupappstate.json','utf8');
                                                return backup(content);
                                            }
                                        }
                                        catch (e) {
                                            logger(Language.ErrBackup, '[ FCA-HZI ]');
                                            logger.Error();
                                            process.exit(0);
                                        }
                                    }
                                    else {
                                        try {
                                            const client = new Client();
                                            let key = await client.get("Backup");
                                            if (key) {
                                                return backup(JSON.stringify(key));
                                            }
                                            else {
                                            logger(Language.ErrBackup, '[ FCA-HZI ]');
                                            }
                                        }
                                        catch (e) {
                                            logger(Language.ErrBackup, '[ FCA-HZI ]');
                                        }
                                    }
                                }
                                    break;
                                case "android": {
                                    try {
                                        if (fs.existsSync('./backupappstate.json')) {
                                            let content = fs.readFileSync('./backupappstate.json','utf8');
                                            return backup(content);
                                        }
                                    }
                                    catch (e) {
                                        logger(Language.ErrBackup, '[ FCA-HZI ]');
                                        logger.Error();
                                        process.exit(0);
                                    }
                                }
                            }
                                logger(Language.DecryptFailed, '[ FCA-HZI ]');
                                return logger.Error();
                            }
                            logger(getText.gettext(Language.YourAppStatePass,process.env.FBKEY), '[ FCA-HZI ]');
                        }
                            break;
                        default: {
                            logger(Language.InvaildAppState);
                            process.exit(0)
                        }
                    } 
                }
                    break;
                case false: {
                    switch (utils.getType(appState)) { 
                        case "Array": {
                            logger(Language.EncryptStateOff);
                        }
                            break;
                        case "String": {
                            logger(Language.EncryptStateOff);
                            try {
                                appState = StateCrypt.decryptState(appState, process.env['FBKEY']);
                                logger(Language.DecryptSuccess, '[ FCA-HZI ]');
                            }
                            catch (e) {
                                if (process.env.Backup != undefined && process.env.Backup) {
                                backup(process.env.Backup);
                            }
                            else switch (process.platform) {
                                case "win32": {
                                    try {
                                        if (fs.existsSync('./backupappstate.json')) {
                                            let content = fs.readFileSync('./backupappstate.json','utf8');
                                            return backup(content);
                                        }
                                    }
                                    catch (e) {
                                        logger(Language.ErrBackup, '[ FCA-HZI ]');
                                        logger.Error();
                                        process.exit(0);
                                    }
                                }
                                    break;
                                case "linux": {
                                    if (process.env["REPL_ID"] == undefined) {
                                        try {
                                            if (fs.existsSync('./backupappstate.json')) {
                                                let content = fs.readFileSync('./backupappstate.json','utf8');
                                                return backup(content);
                                            }
                                        }
                                        catch (e) {
                                            logger(Language.ErrBackup, '[ FCA-HZI ]');
                                            logger.Error();
                                            process.exit(0);
                                        }
                                    }
                                    else {
                                        try {
                                            const client = new Client();
                                            let key = await client.get("Backup");
                                            if (key) {
                                                return backup(JSON.stringify(key));
                                            }
                                            else {
                                            logger(Language.ErrBackup, '[ FCA-HZI ]');
                                            }
                                        }
                                        catch (e) {
                                            logger(Language.ErrBackup, '[ FCA-HZI ]');
                                        }
                                    }
                                }
                                    break;
                                case "android": {
                                    try {
                                        if (fs.existsSync('./backupappstate.json')) {
                                            let content = fs.readFileSync('./backupappstate.json','utf8');
                                            return backup(content);
                                        }
                                    }
                                    catch (e) {
                                        logger(Language.ErrBackup, '[ FCA-HZI ]');
                                        logger.Error();
                                        process.exit(0);
                                    }
                                }
                            }
                                logger(Language.DecryptFailed, '[ FCA-HZI ]');
                                return logger.Error();
                            }
                        }
                            break;
                        default: {
                            logger(Language.InvaildAppState);
                            process.exit(0)
                        }
                    }  
                }
                    break;
                default: {
                    logger(getText.gettext(Language.IsNotABoolean,require("../../FastConfigFca.json").EncryptFeature))
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
        global.Data.AppState = appState;
        appState.map(function(c) {
            var str = c.key + "=" + c.value + "; expires=" + c.expires + "; domain=" + c.domain + "; path=" + c.path + ";";
            jar.setCookie(str, "http://" + c.domain);
        });
        switch (process.platform) {
            case "win32": {
                try {
                    fs.writeFileSync("./backupappstate.json", JSON.stringify(appState, null, "\t"));
                    process.env.Backup = JSON.stringify(appState, null, "\t");
                }
                catch (e) {
                    logger(Language.BackupFailed, '[ FCA-HZI ]');
                }
            }
            break;
            case "linux": {
                if (process.env["REPL_ID"] == undefined) {
                    try {
                        fs.writeFileSync("./backupappstate.json", JSON.stringify(appState, null, "\t"));
                        process.env.Backup = JSON.stringify(appState, null, "\t");
                    }
                    catch (e) {
                        logger(Language.BackupFailed, '[ FCA-HZI ]');
                    }
                }
                else {
                    try {
                        if (fs.existsSync('./backupappstate.json')) {
                            fs.unlinkSync('./backupappstate.json');
                        }
                        const client = new Client();
                        await client.set("Backup", appState);
                        process.env.Backup = JSON.stringify(appState, null, "\t");
                    }
                    catch (e) {
                        logger(Language.BackupFailed, '[ FCA-HZI ]');
                    }
                }
            }
            break;
            case "android": {
                try {
                    fs.writeFileSync("./backupappstate.json", JSON.stringify(appState, null, "\t"));
                    process.env.Backup = JSON.stringify(appState, null, "\t");
                }
                catch (e) {
                    logger(Language.BackupFailed, '[ FCA-HZI ]');
                }
            }
        }

        mainPromise = utils.get('https://www.facebook.com/', jar, null, globalOptions, { noRef: true }).then(utils.saveCookies(jar));
    } catch (e) {

        if (process.env.Backup != undefined && process.env.Backup) {
            return backup(process.env.Backup);
        }
        switch (process.platform) {
            case "win32": {
                try {
                    if (fs.existsSync('./backupappstate.json')) {
                        let content = fs.readFileSync('./backupappstate.json','utf8');
                        return backup(content);
                    }
                }
                catch (e) {
                    logger(Language.ErrBackup, '[ FCA-HZI ]');
                    logger.Error();
                    process.exit(0);
                }
            }
                break;
            case "linux": {
                if (process.env["REPL_ID"] == undefined) {
                    try {
                        if (fs.existsSync('./backupappstate.json')) {
                            let content = fs.readFileSync('./backupappstate.json','utf8');
                            return backup(content);
                        }
                    }
                    catch (e) {
                        logger(Language.ErrBackup, '[ FCA-HZI ]');
                        logger.Error();
                        process.exit(0);
                    }
                }
                else {
                    try {
                        const client = new Client();
                        let key = await client.get("Backup");
                        if (key) {
                            backup(JSON.stringify(key));
                        }
                        else {
                            logger(Language.ErrBackup, '[ FCA-HZI ]');
                        }
                    }
                    catch (e) {
                        logger(Language.ErrBackup, '[ FCA-HZI ]');
                    }
                }
            }
                break;
            case "android": {
                try {
                    if (fs.existsSync('./backupappstate.json')) {
                        let content = fs.readFileSync('./backupappstate.json','utf8');
                        return backup(content);
                    }
                }
                catch (e) {
                    logger(Language.ErrBackup, '[ FCA-HZI ]');
                    logger.Error();
                    process.exit(0);
                }
            }
            break;
        }

        console.log(e);
        return logger(Language.ScreenShotConsoleAndSendToAdmin, '[ FCA-HSP ]');
    }
} else {
        // Open the main page, then we login with the given credentials and finally
        // load the main page again (it'll give us some IDs that we need)
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
            var ctx = null;
            var _defaultFuncs = null;
            var api = null;

            mainPromise = mainPromise
                .then(function(res) {
                    // Hacky check for the redirection that happens on some ISPs, which doesn't return statusCode 3xx
                    var reg = /<meta http-equiv="refresh" content="0;url=([^"]+)[^>]+>/;
                    var redirect = reg.exec(res.body);
                    if (redirect && redirect[1]) return utils.get(redirect[1], jar, null, globalOptions).then(utils.saveCookies(jar));
                    return res;
                })
                .then(async function(res) {
                    var html = res.body;
                    var stuff = buildAPI(globalOptions, html, jar);
                    ctx = stuff[0];
                    _defaultFuncs = stuff[1];
                    api = stuff[2];
                    return res;
                });
            // given a pageID we log in as a page
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

           // At the end we call the callback or catch an exception
            mainPromise
                .then(function() {
                    logger(Language.DoneLogin);
                        logger(Language.AutoCheckUpdate);
                            //!---------- Auto Check, Update START -----------------!//
                        var Fetch = require('got');
                    var { readFileSync } = require('fs-extra');
                const { execSync } = require('child_process');
            Fetch('https://raw.githubusercontent.com/HarryWakazaki/Fca-Horizon-Remake/main/package.json').then(async (res) => {
                const localbrand = JSON.parse(readFileSync('./node_modules/fca-horizon-remake/package.json')).version;
                    if (Number(localbrand.replace(/\./g,"")) < Number(JSON.parse(res.body.toString()).version.replace(/\./g,""))) {
                        log.warn("[ FCA-HZI ] •",getText.gettext(Language.NewVersionFound,JSON.parse(readFileSync('./node_modules/fca-horizon-remake/package.json')).version,JSON.parse(res.body.toString()).version));
                        log.warn("[ FCA-HZI ] •",Language.AutoUpdate);
                            try {
                                execSync('npm install fca-horizon-remake@latest', { stdio: 'inherit' });
                                logger(Language.UpdateSuccess,"[ FCA-HZI ]")
                                logger(Language.RestartAfterUpdate, '[ FCA-HZI ]');
                                await new Promise(resolve => setTimeout(resolve,5*1000));
                                console.clear();process.exit(1);
                            }
                        catch (err) {
                            log.warn('Error Update: ' + err);
                            logger(Language.UpdateFailed,"[ FCA-HZI ]");
                            try {
                                require.resolve('horizon-sp');
                            }
                            catch (e) {
                                logger(Language.InstallSupportTool);
                                execSync('npm install horizon-sp@latest', { stdio: 'inherit' });
                                process.exit(1);
                            }
                            var fcasp = require('horizon-sp');
                            try {
                                fcasp.onError()
                            }
                            catch (e) {
                                logger(Language.NotiAfterUseToolFail, "[ Fca - Helper ]")
                                logger("rmdir ./node_modules sau đó nhập npm i && npm start","[ Fca - Helper ]");
                                process.exit(0);
                            }

                        }
                    }
                        else {
                            logger(getText.gettext(Language.LocalVersion,localbrand));
                            logger(Language.WishMessage[Math.floor(Math.random()*Language.WishMessage.length)]);
                            require('./Extra/ExtraUptimeRobot').Values();
                            logger(getText.gettext(Language.CountTime,global.Data.CountTime()))
                            await new Promise(resolve => setTimeout(resolve, 5*1000));
                            callback(null, api);
                        }
                    });
                }).catch(function(e) {
                    log.error("login", e.error || e);
                callback(e);
            });
            //!---------- Auto Check, Update END -----------------!//
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

    setOptions(globalOptions, options);

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