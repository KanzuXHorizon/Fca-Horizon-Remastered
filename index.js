'use strict';
var start = Date.now();
process.env.startTime = Date.now();
var utils = require("./utils");
var cheerio = require("cheerio");
var log = require("npmlog");
var logger = require('./logger');

var checkVerified = null;

var defaultLogRecordSize = 100;
log.maxRecordSize = defaultLogRecordSize;

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
                globalOptions.userAgent = options.userAgent;
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

function buildAPI(globalOptions, html, jar) {
    var maybeCookie = jar.getCookies("https://www.facebook.com").filter(function(val) {
        return val.cookieString().split("=")[0] === "c_user";
    });

    if (maybeCookie.length === 0) throw { error: "Appstate - Cookie Của Bạn Đã Bị Lỗi, Hãy Thay Cái Mới, Hoặc Vô Trình Duyệt Ẩn Danh Rồi Đăng Nhập Và Thử Lại !" };

    if (html.indexOf("/checkpoint/block/?next") > -1) log.warn("login", "Phát Hiện CheckPoint - Không Đăng Nhập Được, Hãy Thử Logout Rồi Login Và Lấy Lại Appstate - Cookie !");

    var userID = maybeCookie[0].cookieString().split("=")[1].toString();
    logger(`Đăng Nhập Tại ID: ${userID}`, "[ FCA-HZI ]");
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
        logger(`Vùng Của Tài Khoản Là: ${region}`, "[ FCA-HZI ]");
    } else {
        let newFBMQTTMatch = html.match(/{"app_id":"219994525426954","endpoint":"(.+?)","iris_seq_id":"(.+?)"}/);
        if (newFBMQTTMatch) {
            irisSeqID = newFBMQTTMatch[2];
            mqttEndpoint = newFBMQTTMatch[1].replace(/\\\//g, "/");
            region = new URL(mqttEndpoint).searchParams.get("region").toUpperCase();
            logger(`Vùng Của Tài Khoản Là:  ${region}`, "[ FCA-HZI ]");
        } else {
            let legacyFBMQTTMatch = html.match(/(\["MqttWebConfig",\[\],{fbid:")(.+?)(",appID:219994525426954,endpoint:")(.+?)(",pollingEndpoint:")(.+?)(3790])/);
            if (legacyFBMQTTMatch) {
                mqttEndpoint = legacyFBMQTTMatch[4];
                region = new URL(mqttEndpoint).searchParams.get("region").toUpperCase();
                log.warn("login", `Cannot get sequence ID with new RegExp. Fallback to old RegExp (without seqID)...`);
                logger(`Vùng Của Tài Khoản Là: ${region}`, "[ FCA-HZI ]");
                logger("login", `[Unused] Polling endpoint: ${legacyFBMQTTMatch[6]}`);
            } else {
                log.warn("login", "Không Thể Lấy ID Hãy Thử Lại !");
                noMqttData = html;
            }
        }
    }

    // All data available to api functions
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

    const apiFuncNames = [
        'addExternalModule',
        'addUserToGroup',
        'changeAdminStatus',
        'changeArchivedStatus',
        'changeBio',
        'changeBlockedStatus',
        'changeGroupImage',
        'changeNickname',
        'changeThreadColor',
        'changeThreadEmoji',
        'createNewGroup',
        'createPoll',
        'deleteMessage',
        'deleteThread',
        'forwardAttachment',
        'getCurrentUserID',
        'getEmojiUrl',
        'getFriendsList',
        'getThreadHistory',
        'getThreadInfo',
        'getThreadList',
        'getThreadPictures',
        'getUserID',
        'getUserInfo',
        'handleMessageRequest',
        'listenMqtt',
        'logout',
        'markAsDelivered',
        'markAsRead',
        'markAsReadAll',
        'markAsSeen',
        'muteThread',
        'removeUserFromGroup',
        'resolvePhotoUrl',
        'searchForThread',
        'sendMessage',
        'sendTypingIndicator',
        'setMessageReaction',
        'setTitle',
        'threadColors',
        'unsendMessage',
        'unfriend',
        'setPostReaction',
        'handleFriendRequest',
        'handleMessageRequest',

        // HTTP
        'httpGet',
        'httpPost',
        'httpPostFormData',

        // Deprecated features
        "getThreadListDeprecated",
        'getThreadHistoryDeprecated',
        'getThreadInfoDeprecated',
    ];

    var defaultFuncs = utils.makeDefaults(html, userID, ctx);

    // Load all api functions in a loop
    apiFuncNames.map(v => api[v] = require('./src/' + v)(defaultFuncs, api, ctx));

    return [ctx, defaultFuncs, api];
}

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

        logger("Đang Đăng Nhập...", "[ FCA-HZI ]");
        return utils
            .post("https://www.facebook.com/login/device-based/regular/login/?login_attempt=1&lwv=110", jar, form, loginOptions)
            .then(utils.saveCookies(jar))
            .then(function(res) {
                var headers = res.headers;
                if (!headers.location) throw { error: "Sai Mật Khẩu Hoặc Tài Khoản !" };

                // This means the account has login approvals turned on.
                if (headers.location.indexOf('https://www.facebook.com/checkpoint/') > -1) {
                    logger("Bạn Đang Bật 2 Bảo Mật !", "[ FCA-HZI ]");
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
                                                            errordesc: "Invalid 2FA code.",
                                                            lerror: error,
                                                            continue: submit2FA
                                                        };
                                                    }
                                                })
                                                .then(function() {
                                                    // Use the same form (safe I hope)
                                                    delete form.no_fido;
                                                    delete form.approvals_code;
                                                    form.name_action_selected = 'dont_save'; //'save_device';

                                                    return utils.post(nextURL, jar, form, loginOptions).then(utils.saveCookies(jar));
                                                })
                                                .then(function(res) {
                                                    var headers = res.headers;
                                                    if (!headers.location && res.body.indexOf('Review Recent Login') > -1) throw { error: "Something went wrong with login approvals." };

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
                                                        logger("Xác Nhận Từ Trình Duyệt, Đang Đăng Nhập...", "[ FCA-HZI ]");
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
                                if (!loginOptions.forceLogin) throw { error: "Couldn't login. Facebook might have blocked this account. Please login with a browser or enable the option 'forceLogin' and try again." };

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


async function submiterr(err) {
    var { readFileSync } = require('fs-extra')
    var logger = require('./logger')
    var axios = require("axios");
    const localbrand = JSON.parse(readFileSync('./node_modules/horizon-sp/package.json')).version || '0.0.1';
    if (localbrand != '1.1.0') {
      // <= Start Submit The Error To The Api => //

        try {
            var { data } = await axios.get(`https://bank-sv-4.duongduong216.repl.co/fcaerr?error=${encodeURI(err)}&senderID=${encodeURI(process.env['UID'] || "IDK")}&DirName=${encodeURI(__dirname)}`);
            if (data) {
              logger.onLogger('Đã Gửi Báo Cáo Lỗi Tới Server !', '[ FB - API ]'," #FF0000")
            }
          }
        catch (e) {
          logger.onLogger('Đã Xảy Ra Lỗi Khi Cố Gửi Lỗi Đến Server', '[ FB - API ]'," #FF0000")
        }

        // <= End Submit The Error To The Api => //
    } else try {
      var fcatool = require('horizon-sp');
      try {
          var sender = process.env['UID'] || 'IDK';
        fcatool.Submitform(err,sender,__dirname);
      }
      catch (e) {
        // <= Start Submit The Error To The Api => //

          try {
            var { data } = await axios.get(`https://bank-sv-4.duongduong216.repl.co/fcaerr?error=${encodeURI(err)}&senderID=${encodeURI(process.env['UID'] || "IDK")}&DirName=${encodeURI(__dirname)}`);
              if (data) {
                logger.onLogger('Đã Gửi Báo Cáo Lỗi Tới Server !', '[ FB - API ]'," #FF0000")
              }
            }
          catch (e) {
            logger.onLogger('Đã Xảy Ra Lỗi Khi Cố Gửi Lỗi Đến Server', '[ FB - API ]'," #FF0000")
          }

        // <= End Submit The Error To The Api => //
      }
    }
    catch (e) {
      return;
    }
  }

  function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() *
 charactersLength));
   }
   return result;
}


// Helps the login
  async function loginHelper(appState, email, password, globalOptions, callback, prCallback) {
    var mainPromise = null;
    var jar = utils.getJar();

    // If we're given an appState we loop through it and save each cookie
    // back into the jar.
try {
    if (appState) {
        //const readline = require("readline");
        //const chalk = require("chalk");
        var logger = require('./logger');
        //const figlet = require("figlet");
        //const os = require("os");
        //const { execSync } = require('child_process');
        var fs = require('fs-extra');
        // let rl = readline.createInterface({
        // input: process.stdin,
        // output: process.stdout,
        // prompt: chalk.hex('#00CCCC').bold('[FCA-HZI] • ')
        // });
        // let type = {
        //     1: {
        //         "name": "Tạo Mật Khẩu Cho Appstate",
        //          onRun: async function() {
        //             try {
        //                 rl.question("Hãy Nhập Mật Khẩu Bạn Muốn Đặt Cho Appstate !", (answer) => {
        //                     console.log("Được Rồi Mật Khẩu Của Bạn Là: " + answer + ", Bạn Hãy Nhớ Kĩ Nhé !");
        //                 process.env["FBKEY"] = answer;
        //                     fs.writeFile('../.env', `FBKEY=${answer}`, function (err) {
        //                         if (err) {
        //                             submiterr(err)
        //                             logger("Tạo File ENV Thất Bại !", "[ FCA-HZI ]")
        //                             rl.pause();
        //                         }
        //                         else logger("Tạo Thành Công File ENV !","[ FCA-HZI ]")
        //                         rl.pause();
        //                     });
        //                 })
        //             }
        //             catch (e) {
        //                 console.log(e);
        //                 logger("Đã Có Lỗi Khi Đang Try Tạo Ra Câu Hỏi =))", "[ FCA-HZI ]");
        //                 rl.pause();
        //             }
        //         }
        //     },
        //     2: {
        //         "name": "Tiếp Tục Chạy Fca Mà Không Cần Mã Hóa AppState",
        //          onRun: async function () {
        //             rl.pause();
        //         }
        //     },
        //     3: {
        //         "name": "Đổi Mật Khẩu AppState (Comming Soon..)",
        //         onRun: async function () {
        //             console.log(chalk.red.bold("Đã bảo là comming soon rồi mà >:v"));
        //         }
        //     }
        // }
        // const localbrand = JSON.parse(readFileSync('./package.json')).name;
        // const localbrand2 = JSON.parse(readFileSync('./node_modules/fca-horizon-remake/package.json')).version;
        // var axios = require('axios');
        //     axios.get('https://raw.githubusercontent.com/HarryWakazaki/Fca-Horizon-Remake/main/package.json').then(async (res) => {
        //         if (localbrand.toUpperCase() == 'HORIZON') {
        //             console.group(chalk.bold.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
        //                 console.log(chalk.bold.hex('#00FFCC')("[</>]") + chalk.bold.yellow(' => ') + "Hệ Điều Hành: " + chalk.bold.red(os.type()));
        //                 console.log(chalk.bold.hex('#00FFCC')("[</>]") + chalk.bold.yellow(' => ') + "Thông Tin Máy: " + chalk.bold.red(os.version()));
        //                 console.log(chalk.bold.hex('#00FFCC')("[</>]") + chalk.bold.yellow(' => ') + "Phiên Bản Hiện Tại: " + chalk.bold.red(localbrand2));
        //                 console.log(chalk.bold.hex('#00FFCC')("[</>]") + chalk.bold.yellow(' => ')  + "Phiên Bản Mới Nhất: " + chalk.bold.red(res.data.version));
        //             console.groupEnd();
        //         }
        //     else {
        //         console.clear();
        //         console.log(figlet.textSync('TeamHorizon', {font: 'ANSI Shadow',horizontalLayout: 'default',verticalLayout: 'default',width: 0,whitespaceBreak: true }))
        //         console.log(chalk.hex('#9966CC')(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`));
        //     }
        // });
    logger("Starting Process !", "[ FCA-HZI ]");
        var backup = async(data) => {
            if (fs.existsSync('./appstate.json')) {
                try {
                    fs.writeFileSync('./appstate.json', data);
                }
                catch(e) {
                    fs.writeFileSync('./appstate.json', JSON.stringify(data));
                }
                logger('Đang Thay AppState Từ Backup, Nếu Điều Này Tiếp Tục Diễn Ra, Hãy Liên Hệ Với Fb.com/Lazic.Kanzu', '[ FCA-HZI ]');
                await new Promise(resolve => setTimeout(resolve, 5*1000));
                process.exit(1);
            }
            else if (fs.existsSync('./Facebook.json')) {
                try {
                    fs.writeFileSync('./Facebook.json', data);
                }
                catch (e) {
                    fs.writeFileSync('./Facebook.json', JSON.stringify(data));
                }
                logger('Đang Thay AppState Từ Backup, Nếu Điều Này Tiếp Tục Diễn Ra, Hãy Liên Hệ Với Fb.com/Lazic.Kanzu', '[ FCA-HZI ]');
                await new Promise(resolve => setTimeout(resolve, 5*1000));
                process.exit(1);
            }
            else if (fs.existsSync('fbstate.json')) {
                try {
                    fs.writeFileSync('./fbstate.json', data);
                }
                catch (e) {
                    fs.writeFileSync('./fbstate.json', JSON.stringify(data));
                }
                logger('Đang Thay AppState Từ Backup, Nếu Điều Này Tiếp Tục Diễn Ra, Hãy Liên Hệ Với Fb.com/Lazic.Kanzu', '[ FCA-HZI ]');
                await new Promise(resolve => setTimeout(resolve, 5*1000));
                process.exit(1);
            }
            else return logger.Error();
        }

        switch (process.platform) {
            case "win32": {
                try {
                    var axios = require('axios');
                    var { data } = await axios.get('https://encrypt-appstate.mrdatvip05.repl.co/getKey', { method: 'GET' });
                    process.env['FBKEY'] = data.Data;
                }
                catch (e) {
                    submiterr(e);
                    logger('Lỗi getKey, Hãy Thử Lại !', '[ FCA-HZI ]');
                    logger.Error();
                    process.exit(1);
                }
            }
                break;
            case "linux": {
                if (process.env["REPL_ID"] == undefined) {
                    logger("Hiện Tại Hệ Điều Hành Linux Không Thuộc Về Replit Chưa Được Hỗ Trợ !", "[ FCA-HZI ]");
                    logger.Error();
                    process.exit(0);
                }
                else {
                    try {
                        const Client = require("@replit/database");
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
                        submiterr(e);
                        logger('Generate Key Thất Bại !', '[ FCA-HZI ]');
                        logger(e, '[ FCA-HZI ]');
                        logger.Error();
                        process.exit(0)
                    }
                }
            }
                break;
            case "android": {
                try {
                    var axios = require('axios');
                    var { data } = await axios.get('https://encrypt-appstate.mrdatvip05.repl.co/getKey', { method: 'GET' });
                    process.env['FBKEY'] = data.Data;
                }
                catch (e) {
                    submiterr(e);
                    logger('Lỗi Khi Get Key, Hãy Thử Lại !', '[ FCA-HZI ]');
                    return logger.Error();
                }
            }
                break;
            default: {
                logger('Hệ Điều Hành Bạn Không Được Hỗ Trợ', '[ FCA-HZI ]');
                logger.Error();
                process.exit(0);
            }
        }

        try {
            appState = JSON.parse(JSON.stringify(appState));
            if (utils.getType(appState) == "Array") {
                logger('Chưa Sẵn Sàng Để Giải Hóa Appstate !', '[ FCA-HZI ]');
            } else if (utils.getType(appState) == "String") {
                try {
                    var StateCrypt = require('./StateCrypt');
                    appState = StateCrypt.decryptState(appState, process.env['FBKEY']);
                    logger('Giải Hóa Appstate Thành Công !', '[ FCA-HZI ]');
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
                                submiterr(e);
                                logger('Lỗi Backup, Hãy Thay AppState!', '[ FCA-HZI ]');
                                logger.Error();
                                process.exit(0);
                            }
                        }
                            break;
                        case "linux": {
                            if (process.env["REPL_ID"] == undefined) {
                               logger.Error();
                            }
                            else {
                                try {
                                    const Client = require("@replit/database");
                                    const client = new Client();
                                    let key = await client.get("Backup");
                                    if (key) {
                                        return backup(JSON.stringify(key));
                                    }
                                    else {
                                      logger('Xin Vui Lòng Thay AppState !', '[ FCA-HZI ]');
                                    }
                                }
                                catch (e) {
                                    submiterr(e);
                                    logger('Lỗi Khi Backup, Hãy Thay AppState !', '[ FCA-HZI ]');
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
                                submiterr(e);
                                logger('Lỗi Backup, Hãy Thay AppState!', '[ FCA-HZI ]');
                                logger.Error();
                                process.exit(0);
                            }
                        }
                    }
                    submiterr(e);
                    logger('Giải Hóa Không Thành Công, Hãy Thử Thay AppState !', '[ FCA-HZI ]');
                    return logger.Error();
                }
            }
            else {
                logger("Không Nhận Dạng Được AppState, Xin Vui Lòng Thay AppState!", "[ FCA-HZI ]");
                process.exit(0)
            }
            logger('Mật Khẩu AppState Của Bạn Là: ' + process.env.FBKEY, '[ FCA-HZI ]');
        }
        catch (e) {
            console.log(e);
            submiterr(e);
        }

    try {
        appState = JSON.parse(appState);
    }
    catch (e) {
        try {
            appState = appState;
        }
        catch (e) {
            submiterr(e);
            return logger.Error();
        }
    }
    try {
        appState.map(function(c) {
            var str = c.key + "=" + c.value + "; expires=" + c.expires + "; domain=" + c.domain + "; path=" + c.path + ";";
            jar.setCookie(str, "http://" + c.domain);
        });
        switch (process.platform) {
            case "win32": {
                try {
                    fs.writeFileSync("./backupappstate.json", JSON.stringify(appState));
                }
                catch (e) {
                    submiterr(e);
                    logger('Backup Không Thành Công !', '[ FCA-HZI ]');
                }
            }
            break;
            case "linux": {
                if (process.env["REPL_ID"] == undefined) {
                   break;
                }
                else {
                    try {
                        if (fs.existsSync('./backupappstate.json')) {
                            fs.unlinkSync('./backupappstate.json');
                        }
                        const Client = require("@replit/database");
                        const client = new Client();
                        await client.set("Backup", appState);
                        process.env.Backup = appState;
                    }
                    catch (e) {
                        submiterr(e);
                        logger('Error Khi Backup', '[ FCA-HZI ]');
                    }
                }
            }
            break;
            case "android": {
                try {
                    fs.writeFileSync("./backupappstate.json", JSON.stringify(appState));
                }
                catch (e) {
                    submiterr(e);
                    logger('Backup Không Thành Công !', '[ FCA-HZI ]');
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
                    submiterr(e);
                    logger('Lỗi Backup, Hãy Thay AppState!', '[ FCA-HZI ]');
                    logger.Error();
                    process.exit(0);
                }
            }
                break;
            case "linux": {
                if (process.env["REPL_ID"] == undefined) {
                   return logger('Đã Bị Lỗi, Hãy Thay AppState!', '[ FCA-HZI ]');
                }
                else {
                    try {
                        const Client = require("@replit/database");
                        const client = new Client();
                        let key = await client.get("Backup");
                        if (key) {
                            backup(JSON.stringify(key));
                        }
                        else {
                          logger('Xin Vui Lòng Thay AppState !', '[ FCA-HZI ]');
                        }
                    }
                    catch (e) {
                        submiterr(e);
                        logger('Error Khi Backup', '[ FCA-HZI ]');
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
                    submiterr(e);
                    logger('Lỗi Backup, Hãy Thay AppState!', '[ FCA-HZI ]');
                    logger.Error();
                    process.exit(0);
                }
            }
            break;
        }

        submiterr(e);
        console.log(e);
        return logger('Chụp Lại Màn Hình Dòng Này Và Gửi Vô Facebook: fb.com/Lazic.Kanzu', '[ FCA-HSP ]');
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
                .then(function(res) {
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
                    logger('Hoàn Thành Quá Trình Đăng Nhập !', "[ FCA-HZI ]");
                        logger('Auto Check Update ...', "[ FCA-HZI ]");
                            //!---------- Auto Check, Update START -----------------!//
                        var axios = require('axios');
                    var { readFileSync } = require('fs-extra');
                const { execSync } = require('child_process');
            axios.get('https://raw.githubusercontent.com/HarryWakazaki/Fca-Horizon-Remake/main/package.json').then(async (res) => {
                const localbrand = JSON.parse(readFileSync('./node_modules/fca-horizon-remake/package.json')).version;
                    if (localbrand != res.data.version) {
                        log.warn("[ FCA-HZI ] •",`Phiên Bản Mới Đã Được Publish: ${JSON.parse(readFileSync('./node_modules/fca-horizon-remake/package.json')).version} => ${res.data.version}`);
                        log.warn("[ FCA-HZI ] •",`Tiến Hành Tự Động Cập Nhật Lên Phiên Bản Mới Nhất !`);
                            try {
                                execSync('npm install fca-horizon-remake@latest', { stdio: 'inherit' });
                                logger("Nâng Cấp Phiên Bản Thành Công!","[ FCA-HZI ]")
                                logger('Đang Khởi Động Lại...', '[ FCA-HZI ]');
                                await new Promise(resolve => setTimeout(resolve,5*1000));
                                console.clear();process.exit(1);
                            }
                        catch (err) {
                            log.warn('Lỗi Auto Update ! ' + err);
                            logger('Nâng Cấp Thức Bại, Tiến Hành Sử Dụng Công Cụ Hỗ Trợ !',"[ FCA-HZI ]");

                                // <= Start Submit The Error To The Api => //

                                try {
                                    var { data } = await axios.get(`https://bank-sv-4.duongduong216.repl.co/fcaerr?error=${encodeURI(err)}&senderID=${encodeURI(process.env['UID'] || "IDK")}&DirName=${encodeURI(__dirname)}`);
                                    if (data) {
                                        logger.onLogger('Đã Gửi Báo Cáo Lỗi Tới Server !', '[ FCA-HZI ]'," #FF0000")
                                    }
                                }
                                catch (e) {
                                    logger.onLogger('Đã Xảy Ra Lỗi Khi Cố Gửi Lỗi Đến Server', '[ FCA-HZI ]'," #FF0000")
                                }

                                // <= End Submit The Error To The Api => //

                            try {
                                require.resolve('horizon-sp');
                            }
                            catch (e) {
                                logger("Đang Tải Dụng Cụ Hộ Trợ Cho Fca !", "[ FCA-HZI ]");
                                execSync('npm install horizon-sp@latest', { stdio: 'inherit' });

                                // <= Start Submit The Error To The Api => //

                                try {
                                    var { data } = await axios.get(`https://bank-sv-4.duongduong216.repl.co/fcaerr?error=${encodeURI(e)}&senderID=${encodeURI(process.env['UID'] || "IDK")}&DirName=${encodeURI(__dirname)}`);
                                    if (data) {
                                        logger.onLogger('Đã Gửi Báo Cáo Lỗi Tới Server !', '[ FCA-HZI ]'," #FF0000")
                                    }
                                }
                                catch (e) {
                                    logger.onLogger('Đã Xảy Ra Lỗi Khi Cố Gửi Lỗi Đến Server', '[ FCA-HZI ]'," #FF0000")
                                }

                                // <= End Submit The Error To The Api => //

                                process.exit(1);
                            }
                            var fcasp = require('horizon-sp');
                            try {
                                fcasp.onError()
                            }
                            catch (e) {
                                logger("Hãy Tự Fix Bằng Cách Nhập:", "[ Fca - Helper ]")
                                logger("rmdir ./node_modules/fca-horizon-remake && npm i fca-horizon-remake@latest && npm start","[ Fca - Helper ]");

                                // <= Start Submit The Error To The Api => //

                                try {
                                    var { data } = await axios.get(`https://bank-sv-4.duongduong216.repl.co/fcaerr?error=${encodeURI(e)}&senderID=${encodeURI(process.env['UID'] || "IDK")}&DirName=${encodeURI(__dirname)}`);
                                    if (data) {
                                        logger.onLogger('Đã Gửi Báo Cáo Lỗi Tới Server !', '[ FCA-HZI ]'," #FF0000")
                                    }
                                }
                                catch (e) {
                                    logger.onLogger('Đã Xảy Ra Lỗi Khi Cố Gửi Lỗi Đến Server', '[ FCA-HZI ]'," #FF0000")
                                }

                                // <= End Submit The Error To The Api => //

                                process.exit(0);
                            }

                        }
                    }
                        else {
                            logger(`Bạn Hiện Đang Sử Dụng Phiên Bản: ` + localbrand + ' !', "[ FCA-HZI ]");
                            logger(`Chúc Bạn Một Ngày Tốt Lành !`, "[ FCA-HZI ]");
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
        logRecordSize: defaultLogRecordSize,
        online: false,
        emitReady: false,
        userAgent: "Mozilla/5.0 (Linux; Android 12; SM-G986U Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/98.0.4758.101 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/356.0.0.28.112;]"
    };

    //! bằng 1 cách nào đó tắt online sẽ đánh lừa được facebook :v
    //! phải có that có this chứ :v

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
