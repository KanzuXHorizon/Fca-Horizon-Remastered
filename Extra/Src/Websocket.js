/* eslint-disable no-prototype-builtins */
/* eslint-disable linebreak-style */

const Eval = require('eval');
const Utils = require('../../utils');
const Database = require('../Database');
global.ws = new Object({ 
    client: {},
});
const All_Session_ID = Database().get('Session_ID') || []; // [ { Session_ID: ".", TimeStamp: "" }]
for (let v of All_Session_ID) {
    if (v.TimeStamp <= Date.now()) {
        const index = All_Session_ID.findIndex(i => i.Session_ID == v.Session_ID);
        All_Session_ID.splice(index,1);
    }
    else {
        setTimeout(() => {
            const index = All_Session_ID.findIndex(i => i.Session_ID == v.Session_ID);
            All_Session_ID.splice(index,1);
        }, v.TimeStamp - Date.now());
    }
}

Database().set("Session_ID", All_Session_ID);

function generateRandomString() {
    var string = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (var i = 0; i < 16; i++) {
        if (i == 4 || i == 8 || i == 12) {
        string += '-';
        }
        var randomIndex = Math.floor(Math.random() * characters.length);
        string += characters.charAt(randomIndex);
    }
    return string;
}

const HowTo =  {
    AutoUpdate: "Automatically update if there is a new version. (Restart required)",
    AutoLogin: "Automatically login and retrieve cookies to continue running the bot whenever kicked out of the account. (Restart required)",
    Login2Fa: "Use two-factor authentication code to log in. (Restart required)",
    Uptime: "Help your process to operate for a longer period of time.(Restart required)",
    BroadCast: "Receive messages from the server.(Restart required)",
    EncryptFeature: "Encrypt your account (appstate) to prevent it from being accessed or damaged by others.(Restart required)",
    ResetDataLogin: "Used to reset autologin account and password.(Restart required)",
    DevMode: "Developer mode, insider, testing untested features.(Restart required)",
    AutoInstallNode: "Automatically download NodeJS version as per system's requirement.(Restart required)",
    AntiSendAppState: "Check and prevent sending your account (appstate) via messages.",
    HTML: "Display the website of FCA.(Restart required)",
    Accept: "Is a part of stable_version, turned on to use a stable version without errors! (Restart required)",
    AntiGetThreadInfo: "Using data storage and release algorithms to avoid being blocked by Facebook.",
    AntiGetUserInfo: "Using data storage and release algorithms to avoid being blocked by Facebook.",
    Status: "Turn on/off the websocket-extension feature. (Restart required)",
    Language: "Select system language (Restart required)",
    MainName: "Name on the top whenever log data. (Restart required)",
    UserName: "Your name display in Express - HTML. (Restart required)",
    MusicLink: "Your music link. (Restart required)",
    AuthString: "Code to retrieve 2FA authenticator. (Restart required)",
    PreKey: "Obsolete feature.",
    Config: "Feature is delayed.",
    Version: "stable version - Stable_Version Feature. (Restart required)",
    Database_Type: "Type of database. (Restart required)",
    AppState_Path: "Name of the file containing your appstate.",
    AutoRestartMinutes: "Auto-restart after a certain number of minutes. (Restart required)",
    RestartMQTT_Minutes: "Automatically restarting MQTT without restarting the bot helps prevent console hangups. (Restart required)",
    Example: {
        Language: "vi or en",
        AuthString: "Like this SD4S XQ32 O2JA WXB3 FUX2 OPJ7 Q7JZ 4R6Z | https://i.imgur.com/RAg3rvw.png",
        Version: "Valid version: https://github.com/KanzuXHorizon/Global_Horizon/blob/main/InstantAction.json",
        Database_Type: "default or json",
        AppState_Path: "fbstate.json, appstate.json,...",
        AutoRestartMinutes: "Number 0 to turn off, Encourage number 60",
        RestartMQTT_Minutes: "Number 0 to turn off, Encourage number 45"

    }
};

module.exports.connect = function(WebSocket) {
    WebSocket.on('connection', function (Websocket, req) {
        var Ws_Client;
        if (!global.ws.client.hasOwnProperty(req.socket.remoteAddress)) {
            global.ws.client[req.socket.remoteAddress] = { Websocket, Status: false, ResetPassWordTime: 0 };
            Ws_Client = global.ws.client[req.socket.remoteAddress];
        }
        else { 
            global.ws.client[req.socket.remoteAddress] = { Websocket, Status: global.ws.client[req.socket.remoteAddress].Status, ResetPassWordTime: global.ws.client[req.socket.remoteAddress].ResetPassWordTime };
            Ws_Client = global.ws.client[req.socket.remoteAddress];
        }
        Ws_Client.Websocket.send(JSON.stringify({ Status: "Username&PassWord"}));
        Ws_Client.Websocket.on('message', function(message) {
            message = JSON.parse(message);
            switch (message.type) {
                case "login": {
                    if (!message.username || !message.password) return Ws_Client.Websocket.send(JSON.stringify({ Status: false, Code: 1 }));
                    const User_UserName = Database().get('Ws_UserName');
                    const User_PassWord = Database().get('Ws_PassWord');
                    if (message.username != User_UserName || User_PassWord != message.password) return Ws_Client.Websocket.send(JSON.stringify({ Status: false, Code: 2}));
                    const Format = {
                        Session_ID: generateRandomString(),
                        TimeStamp: Date.now() + 24 * 60 * 60 * 1000
                    };
                    All_Session_ID.push(Format);
                    Database().set("Session_ID", All_Session_ID);
                    global.ws.client[req.socket.remoteAddress].Status = true;
                    setTimeout(() => {
                        global.ws.client[req.socket.remoteAddress].Status = false;
                    }, (Date.now() + 24 * 60 * 60 * 1000) - Date.now());
                    return Ws_Client.Websocket.send(JSON.stringify({ Status: "Success", Session_ID: Format.Session_ID, TimeStamp: Format.TimeStamp }));
                }
                case "check": {
                    if (!message.Session_ID || !message.TimeStamp) return Ws_Client.Websocket.send(JSON.stringify({ Status: false, Code: 3}));
                    const Format = {
                        Session_ID: message.Session_ID,
                        TimeStamp: message.TimeStamp
                    };
                    if (Format.TimeStamp <= Date.now()) {
                        let index = All_Session_ID.findIndex(i => i.Session_ID == Format.Session_ID);
                        All_Session_ID.splice(index,1);
                        Database().set("Session_ID", All_Session_ID);
                        Ws_Client.Status = false;
                        Ws_Client.Websocket.send(JSON.stringify({ Status: false, Code: 4}));
                        return delete global.ws.client[Format.Session_ID];
                    }
                    if (All_Session_ID.some(i => i.Session_ID == message.Session_ID)) {
                        global.ws.client[req.socket.remoteAddress].Status = true;
                        return Ws_Client.Websocket.send(JSON.stringify({ Status: "Success" }));
                    }
                    else {
                        global.ws.client[req.socket.remoteAddress].Status = false;
                        return Ws_Client.Websocket.send(JSON.stringify({ Status: false, Code: 5 }));
                    }
                }
                case "resetPassword": {
                    if (!message.Otp || !message.NewPassword) return Ws_Client.Websocket.send(JSON.stringify({ Status:  false, Code: 7 }));
                    if (global.ws.client[req.socket.remoteAddress].ResetPassWordTime == 3) return Ws_Client.Websocket.send(JSON.stringify({ Status: false, Code: 9 }));
                    const speakeasy = require('speakeasy');
                    const secret = Database().get('Ws_2Fa');
                    if (message.Otp != speakeasy.totp({
                        secret: secret,
                        encoding: 'base32'
                    })) {
                        global.ws.client[req.socket.remoteAddress].ResetPassWordTime += 1;
                        return Ws_Client.Websocket.send(JSON.stringify({ Status: false, Code: 8 }));
                    }
                    else {
                        Database().set('Ws_PassWord', message.NewPassword);
                        return Ws_Client.Websocket.send(JSON.stringify({ Status: 'Success' }));
                    }
                }
                default: {
                    if (Ws_Client.Status != true) return Ws_Client.Websocket.send(JSON.stringify({ Status: false, Code: 6 }));
                    switch (message.type) {
                        case "Command": {
                            if (message.Data == "Stop") {
                                return process.exit(0);
                            }
                            else Eval(message.Data, {} ,true);
                        }
                            break;
                        case "ChangeAppState": {
                            try {
                                const AppState = JSON.stringify(JSON.parse(message.Data), null ,2);
                                require('fs').writeFileSync(process.cwd() + `/${global.Fca.Require.FastConfig.Websocket_Extension.AppState_Path}`, AppState, 'utf-8');
                                return Ws_Client.Websocket.send(JSON.stringify({ Type: "ChangeAppState", Data: 0 }));
                            }
                            catch (e) {
                                return Ws_Client.Websocket.send(JSON.stringify({ Type: "ChangeAppState", Data: e }));
                            }
                        }
                        case "GetDocument": {
                            
                            return Ws_Client.Websocket.send(JSON.stringify({ Status: "Success", Data: HowTo }));
                        }
                        case "getFastConfig": {
                            return Ws_Client.Websocket.send(JSON.stringify({ Status: "Success", Data: global.Fca.Require.FastConfig }));
                        }
                        case "ping": {
                            return Ws_Client.Websocket.send(JSON.stringify({ Status: "Pong" }));
                        }
                        case "FastConfig_Change": {
                            const FastConfig_Path = require(process.cwd() + "/FastConfigFca.json");
                            const FastConfig_Global = global.Fca.Require.FastConfig;
                            const SetConfig = function(Name, Value, Path, Main_Path) {
                                try {
                                    if (Path && Main_Path) {
                                        FastConfig_Path[Main_Path][Name] = Value;
                                        (HowTo[Name]).includes('(Restart required)') == false ? global.Fca.Require.FastConfig = FastConfig_Path : '';
                                    }
                                    else {
                                        FastConfig_Path[Name] = Value;
                                        (HowTo[Name]).includes('(Restart required)') == false ? global.Fca.Require.FastConfig[Name] = Value : '';
                                    }
                                    global.Fca.Require.fs.writeFileSync(process.cwd() + "/FastConfigFca.json", JSON.stringify(FastConfig_Path, null, "\t"));
                                    return Ws_Client.Websocket.send(JSON.stringify({ Type: 'Noti', Action: `Success ${ (HowTo[Name]).includes('(Restart required)') == true ? 'RestartRequired' : ''}` }));
                                }
                                catch (e) {
                                    global.Fca.Require.fs.writeFileSync(process.cwd() + "/FastConfigFca.json", JSON.stringify(FastConfig_Global, null, "\t"));
                                    return Ws_Client.Websocket.send(JSON.stringify({ Type: 'Noti', Action: e}));
                                }
                            };
                            return SetConfig(message.Data.Name, message.Data.Value, message.Data.Path, message.Data.Main_Path);
                        }
                        case "All_logs": {
                            return Ws_Client.Websocket.send(JSON.stringify({ Type: "Console", Data: console.history.join(" <br> ")}));
                        }
                    }
                }
            }
        });
    });
    return { Client: global.ws.client, WSS: WebSocket };
};