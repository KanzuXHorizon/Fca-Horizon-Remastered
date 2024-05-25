'use strict';
/* eslint-disable linebreak-style */
const utils = require('./utils');
global.Fca = new Object({
    isThread: new Array(),
    isUser: new Array(),
    startTime: Date.now(),
    Setting: new Map(),
    Version: require('./package.json').version,
    Require: new Object({
        fs: require("fs"),
        Fetch: require('got'),
        log: require("npmlog"),
        utils: require("./utils.js"),
        logger: require('./logger.js'),
        languageFile: require('./Language/index.json'),
        Security: require('./Extra/Src/uuid.js')
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
            "DevMode": false,
            "Login2Fa": false,
            "AutoLogin": false,
            "BroadCast": true,
            "AuthString": "SD4S XQ32 O2JA WXB3 FUX2 OPJ7 Q7JZ 4R6Z | https://i.imgur.com/RAg3rvw.png Please remove this !, Recommend If You Using getUserInfoV2",
            "EncryptFeature": true,
            "ResetDataLogin": false,
            "AutoInstallNode": false,
            "AntiSendAppState": true,
            "AutoRestartMinutes": 0,
            "RestartMQTT_Minutes": 0,
            "Websocket_Extension": {
                "Status": false,
                "ResetData": false,
                "AppState_Path": "appstate.json"
            },
            "HTML": {   
                "HTML": true,
                "UserName": "Guest",
                "MusicLink": "https://drive.google.com/uc?id=1zlAALlxk1TnO7jXtEP_O6yvemtzA2ukA&export=download"
            },
            "AntiGetInfo": {
                "Database_Type": "default", //json or default
                "AntiGetThreadInfo": true,
                "AntiGetUserInfo": true
            },
            "Stable_Version": {
                "Accept": false,
                "Version": ""
            },
            "CheckPointBypass": {
                "956": {
                    "Allow": false,
                    "Difficult": "Easy",
                    "Notification": "Turn on with AutoLogin!"
                }
            },
            "AntiStuckAndMemoryLeak": {
                "AutoRestart": {
                    "Use": true,
                    "Explain": "When this feature is turned on, the system will continuously check and confirm that if memory usage reaches 90%, it will automatically restart to avoid freezing or stopping."
                },
                "LogFile": {
                    "Use": false,
                    "Explain": "Record memory usage logs to fix errors. Default location: Horizon_Database/memory.logs"
                }
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
    Action: async function(Type, ctx, Code, defaultFuncs) {
        switch (Type) {
            case "AutoLogin": {
                var Database = require('./Extra/Database');
                var logger = global.Fca.Require.logger;
                var Email = (Database().get('Account')).replace(RegExp('"', 'g'), ''); //hmm IDK
                var PassWord = (Database().get('Password')).replace(RegExp('"', 'g'), '');
                require('./Main')({ email: Email, password: PassWord},async (error, api) => {
                    if (error) {
                        logger.Error(JSON.stringify(error,null,2), function() { logger.Error("AutoLogin Failed!", function() { process.exit(0); }) });
                    }
                    try {
                        Database().set("TempState", Database().get('Through2Fa'));
                    }
                    catch(e) {
                        logger.Warning(global.Fca.Require.Language.Index.ErrDatabase);
                            logger.Error();
                        process.exit(0);
                    }
                    process.exit(1);
                });
            }
            break;
            case "Bypass": {
                const Bypass_Module = require(`./Extra/Bypass/${Code}`);
                const logger = global.Fca.Require.logger;
                switch (Code) {
                    case 956: {
                        async function P1() {
                            return new Promise((resolve, reject) => {
                                try {
                                    utils.get('https://www.facebook.com/checkpoint/828281030927956/?next=https%3A%2F%2Faccountscenter.facebook.com%2Fpassword_and_security', ctx.jar, null, ctx.globalOptions).then(function(data) {
                                        resolve(Bypass_Module.Check(data.body));    
                                    })
                                } 
                                catch (error) {
                                    reject(error);
                                }
                            })
                        }
                        try {
                            const test = await P1();
                            if (test != null && test != '' && test != undefined) {
                                const resp = await Bypass_Module.Cook_And_Work(ctx, defaultFuncs)
                                if (resp == true) return logger.Success("Bypassing 956 successfully!", function() { return process.exit(1); })
                                else return logger.Error("Bypass 956 failed ! DO YOUR SELF :>", function() { process.exit(0) });
                            }
                        }
                        catch (e) {
                            logger.Error("Bypass 956 failed ! DO YOUR SELF :>", function() { process.exit(0) })
                        }
                    }
                }
            }
            break;
            default: {
                require('npmlog').Error("Invalid Message!");
            };
        }
    }
});

try {
    let Boolean_Fca = ["AntiSendAppState","AutoUpdate","Uptime","BroadCast","EncryptFeature","AutoLogin","ResetDataLogin","Login2Fa", "DevMode","AutoInstallNode"];
    let String_Fca = ["MainName","PreKey","Language","AuthString","Config"]
    let Number_Fca = ["AutoRestartMinutes","RestartMQTT_Minutes"];
    let Object_Fca = ["HTML","Stable_Version","AntiGetInfo","Websocket_Extension", "CheckPointBypass", "AntiStuckAndMemoryLeak"];
    let All_Variable = Boolean_Fca.concat(String_Fca,Number_Fca,Object_Fca);


    if (!global.Fca.Require.fs.existsSync(process.cwd() + '/FastConfigFca.json')) {
        global.Fca.Require.fs.writeFileSync(process.cwd() + "/FastConfigFca.json", JSON.stringify(global.Fca.Data.ObjFastConfig, null, "\t"));
        process.exit(1);
    }

try {
    var Data_Setting = require(process.cwd() + "/FastConfigFca.json");
}
catch (e) {
    global.Fca.Require.logger.Error('Detect Your FastConfigFca Settings Invalid!, Carry out default restoration');
    global.Fca.Require.fs.writeFileSync(process.cwd() + "/FastConfigFca.json", JSON.stringify(global.Fca.Data.ObjFastConfig, null, "\t"));     
    process.exit(1)
}
    if (global.Fca.Require.fs.existsSync(process.cwd() + '/FastConfigFca.json')) {
        
        for (let i of All_Variable) {
            if (Data_Setting[i] == undefined) {
                Data_Setting[i] = global.Fca.Data.ObjFastConfig[i];
                global.Fca.Require.fs.writeFileSync(process.cwd() + "/FastConfigFca.json", JSON.stringify(Data_Setting, null, "\t"));
            }
            else continue; 
        } //Check Variable

        for (let i in Data_Setting) {
            if (Boolean_Fca.includes(i)) {
                if (global.Fca.Require.utils.getType(Data_Setting[i]) != "Boolean") logger.Error(i + " Is Not A Boolean, Need To Be true Or false !", function() { process.exit(0) });
                else continue;
            }
            else if (String_Fca.includes(i)) {
                if (global.Fca.Require.utils.getType(Data_Setting[i]) != "String") logger.Error(i + " Is Not A String, Need To Be String!", function() { process.exit(0) });
                else continue;
            }
            else if (Number_Fca.includes(i)) {
                if (global.Fca.Require.utils.getType(Data_Setting[i]) != "Number") logger.Error(i + " Is Not A Number, Need To Be Number !", function() { process.exit(0) });
                else continue;
            }
            else if (Object_Fca.includes(i)) {
                if (global.Fca.Require.utils.getType(Data_Setting[i]) != "Object") {
                    Data_Setting[i] = global.Fca.Data.ObjFastConfig[i];
                    global.Fca.Require.fs.writeFileSync(process.cwd() + "/FastConfigFca.json", JSON.stringify(Data_Setting, null, "\t"));
                }
                else continue;
            }
        }

        for (let i of Object_Fca) {
            const All_Paths = utils.getPaths(global.Fca.Data.ObjFastConfig[i]);
            const Mission = { Main_Path: i, Data_Path: All_Paths }
            for (let i of Mission.Data_Path) {
                if (Data_Setting[Mission.Main_Path] == undefined) {
                    Data_Setting[Mission.Main_Path] = global.Fca.Data.ObjFastConfig[Mission.Main_Path];
                    global.Fca.Require.fs.writeFileSync(process.cwd() + "/FastConfigFca.json", JSON.stringify(Data_Setting, null, "\t"));      
                }
                const User_Data = (utils.getData_Path(Data_Setting[Mission.Main_Path], i, 0))
                const User_Data_Type = utils.getType(User_Data);
                if (User_Data_Type == "Number") {
                    const Mission_Path = User_Data == 0 ? i : i.slice(0, User_Data); 
                    const Mission_Obj = utils.getData_Path(global.Fca.Data.ObjFastConfig[Mission.Main_Path], Mission_Path, 0);
                    Data_Setting[Mission.Main_Path] = utils.setData_Path(Data_Setting[Mission.Main_Path], Mission_Path, Mission_Obj)
                    global.Fca.Require.fs.writeFileSync(process.cwd() + "/FastConfigFca.json", JSON.stringify(Data_Setting, null, "\t"));      
                }
            }
        }

        if (!global.Fca.Require.languageFile.some((/** @type {{ Language: string; }} */i) => i.Language == Data_Setting.Language)) { 
            global.Fca.Require.logger.Warning("Not Support Language: " + Data_Setting.Language + " Only 'en' and 'vi'");
            process.exit(0); 
        }
        global.Fca.Require.Language = global.Fca.Require.languageFile.find((/** @type {{ Language: string; }} */i) => i.Language == Data_Setting.Language).Folder;
    } else process.exit(1);
    global.Fca.Require.FastConfig = Data_Setting;
}
catch (e) {
    console.log(e);
    global.Fca.Require.logger.Error();
}

/*
if (global.Fca.Require.FastConfig.Websocket_Extension.Status) {
    console.history = new Array();
    var Convert = require('ansi-to-html');
    var convert = new Convert();
    console.__log = console.log;
    console.log = function (data) {
        const log = convert.toHtml(data)
        console.history.push(log)
        console.__log.apply(console,arguments)
        if (console.history.length > 80) {
            console.history.shift();
        }
    }
}
**/

module.exports = function(loginData, options, callback) {
    //const Language = global.Fca.Require.languageFile.find((/** @type {{ Language: string; }} */i) => i.Language == global.Fca.Require.FastConfig.Language).Folder.Index;
    var login;
    try {
        login = require('./Main');
    }
    catch (e) {
        console.log(e)
    }
    //const fs = require('fs-extra');
    //const got = require('got');
    //const log = require('npmlog');
    //const { execSync } = require('child_process');
 require('./Extra/Database');
    
    /*
    return got.get('https://github.com/KanzuXHorizon/Global_Horizon/raw/main/InstantAction.json').then(async function(res) {
        if (global.Fca.Require.FastConfig.AutoInstallNode) {
            switch (fs.existsSync(process.cwd() + "/replit.nix") && process.env["REPL_ID"] != undefined) {
                case true: {
                    await require('./Extra/Src/Change_Environment.js')();
                    break;
                }
                case false: {
                    const NodeVersion = execSync('node -v').toString().replace(/(\r\n|\n|\r)/gm, "");
                    if (!NodeVersion.includes("v14") && !NodeVersion.includes("v16") && !Database(true).has('SkipReplitNix')) {
                        log.warn("[ FCA-UPDATE ] •",global.Fca.getText(Language.NodeVersionNotSupported, NodeVersion));
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        try {
                            switch (process.platform) {
                                case "win32": {
                                    try {
                                    //check if user using nvm 
                                        if (fs.existsSync(process.env.APPDATA + "/nvm/nvm.exe")) {
                                            log.warn("[ FCA-UPDATE ] •", Language.UsingNVM);
                                            process.exit(0);
                                        }
                                        //download NodeJS v14 for Windows and slient install
                                        await got('https://nodejs.org/dist/v14.17.0/node-v14.17.0-x64.msi').pipe(fs.createWriteStream(process.cwd() + "/node-v14.17.0-x64.msi"));
                                        log.info("[ FCA-UPDATE ] •", Language.DownloadingNode);
                                        await new Promise(resolve => setTimeout(resolve, 3000));
                                        execSync('msiexec /i node-v14.17.0-x64.msi /qn');
                                        log.info("[ FCA-UPDATE ] •", Language.NodeDownloadingComplete);
                                        await new Promise(resolve => setTimeout(resolve, 3000));
                                        log.info("[ FCA-UPDATE ] •", Language.RestartRequire);
                                        Database(true).set("NeedRebuild", true);
                                        process.exit(0);
                                    }
                                    catch (e) {
                                        log.error("[ FCA-UPDATE ] •",Language.ErrNodeDownload);
                                        process.exit(0);
                                    }
                                }
                                case "linux": {

                                    try {
                                        if (process.env["REPL_ID"] != undefined) {
                                            log.warn("[ FCA-UPDATE ] •", "Look like you are using Replit, and didn't have replit.nix file in your project, i don't know how to help you, hmm i will help you pass this step, but you need to install NodeJS v14 by yourself, and restart your repl");
                                            Database(true).set('SkipReplitNix', true);
                                            await new Promise(resolve => setTimeout(resolve, 3000));
                                            process.exit(1);
                                        }
                                            //check if user using nvm 
                                            if (fs.existsSync(process.env.HOME + "/.nvm/nvm.sh")) {
                                                log.warn("[ FCA-UPDATE ] •", Language.UsingNVM);
                                                process.exit(0);
                                            }
                                            //download NodeJS v14 for Linux and slient install
                                            await got('https://nodejs.org/dist/v14.17.0/node-v14.17.0-linux-x64.tar.xz').pipe(fs.createWriteStream(process.cwd() + "/node-v14.17.0-linux-x64.tar.xz"));
                                            log.info("[ FCA-UPDATE ] •", Language.DownloadingNode);
                                            await new Promise(resolve => setTimeout(resolve, 3000));
                                            execSync('tar -xf node-v14.17.0-linux-x64.tar.xz');
                                            execSync('cd node-v14.17.0-linux-x64');
                                            execSync('sudo cp -R * /usr/local/');
                                            log.info("[ FCA-UPDATE ] •", Language.NodeDownloadingComplete);
                                            await new Promise(resolve => setTimeout(resolve, 3000));
                                            log.info("[ FCA-UPDATE ] •",Language.RestartingN);
                                            Database(true).set("NeedRebuild", true);
                                            process.exit(1);                                
                                        }
                                        catch (e) {
                                            log.error("[ FCA-UPDATE ] •",Language.ErrNodeDownload);
                                            process.exit(0);
                                        }
                                }
                                case "darwin": {
                                    try {
                                        //check if user using nvm 
                                        if (fs.existsSync(process.env.HOME + "/.nvm/nvm.sh")) {
                                            log.warn("[ FCA-UPDATE ] •", Language.UsingNVM);
                                            process.exit(0);
                                        }
                                        //download NodeJS v14 for MacOS and slient install
                                        await got('https://nodejs.org/dist/v14.17.0/node-v14.17.0-darwin-x64.tar.gz').pipe(fs.createWriteStream(process.cwd() + "/node-v14.17.0-darwin-x64.tar.gz"));
                                        log.info("[ FCA-UPDATE ] •", Language.DownloadingNode);
                                        await new Promise(resolve => setTimeout(resolve, 3000));
                                        execSync('tar -xf node-v14.17.0-darwin-x64.tar.gz');
                                        execSync('cd node-v14.17.0-darwin-x64');
                                        execSync('sudo cp -R * /usr/local/');
                                        log.info("[ FCA-UPDATE ] •", Language.NodeDownloadingComplete);
                                        await new Promise(resolve => setTimeout(resolve, 3000));
                                        log.info("[ FCA-UPDATE ] •",Language.RestartingN);
                                        Database(true).set("NeedRebuild", true);
                                        process.exit(1);
                                    }
                                    catch (e) {
                                        log.error("[ FCA-UPDATE ] •",Language.ErrNodeDownload);
                                        process.exit(0);
                                    }
                                }
                            }
                        }
                        catch (e) {
                            console.log(e);
                            log.error("[ FCA-UPDATE ] •","NodeJS v14 Installation Failed, Please Try Again and Contact fb.com/Lazic.Kanzu!");
                            process.exit(0);
                        }
                    }
                }
            }
        }
        if ((Database(true).get("NeedRebuild")) == true) {
            Database(true).set("NeedRebuild", false);
            log.info("[ FCA-UPDATE ] •",Language.Rebuilding);
            await new Promise(resolve => setTimeout(resolve, 3000));
            try {
                execSync('npm rebuild', {stdio: 'inherit'});
            }
            catch (e) {
                console.log(e);
                log.error("[ FCA-UPDATE ] •",Language.ErrRebuilding);
            }
            log.info("[ FCA-UPDATE ] •",Language.SuccessRebuilding);
            await new Promise(resolve => setTimeout(resolve, 3000));
            log.info("[ FCA-UPDATE ] •",Language.RestartingN);
            process.exit(1);
        }

        let Data = JSON.parse(res.body);
            if (global.Fca.Require.FastConfig.Stable_Version.Accept == true) {
                if (Data.Stable_Version.Valid_Version.includes(global.Fca.Require.FastConfig.Stable_Version.Version)) {
                    let TimeStamp = Database(true).get('Check_Update');
                        if (TimeStamp == null || TimeStamp == undefined || Date.now() - TimeStamp > 300000) {
                            var Check_Update = require('./Extra/Src/Check_Update.js');
                        await Check_Update(global.Fca.Require.FastConfig.Stable_Version.Version);
                    }
                }
                else {
                    log.warn("[ FCA-UPDATE ] •", "Error Stable Version, Please Check Your Stable Version in FastConfig.json, Automatically turn off Stable Version!");
                        global.Fca.Require.FastConfig.Stable_Version.Accept = false;
                        global.Fca.Require.fs.writeFileSync(process.cwd() + "/FastConfigFca.json", JSON.stringify(global.Fca.Require.FastConfig, null, "\t"));
                    process.exit(1);
                }
            }
            else {
                if (Data.HasProblem == true || Data.ForceUpdate == true) {
                    let TimeStamp = Database(true).get('Instant_Update');
                        if (TimeStamp == null || TimeStamp == undefined || Date.now() - TimeStamp > 500) {
                            var Instant_Update = require('./Extra/Src/Instant_Update.js');
                        await Instant_Update()
                    }
                }
                else {
                    let TimeStamp = Database(true).get('Check_Update');
                        if (TimeStamp == null || TimeStamp == undefined || Date.now() - TimeStamp > 300000) {
                            var Check_Update = require('./Extra/Src/Check_Update.js');
                        await Check_Update()
                    } 
                }
            }
        return login(loginData, options, callback);
    }).catch(function(err) {
        console.log(err)
            log.error("[ FCA-UPDATE ] •",Language.UnableToConnect);
            log.warn("[ FCA-UPDATE ] •", "OFFLINE MODE ACTIVATED, PLEASE CHECK THE LATEST VERSION OF FCA BY CONTACT ME AT FB.COM/LAZIC.KANZU");
        return login(loginData, options, callback);
    });
    **/
   //temp disabled
    try {
        login(loginData, options, callback);
    }
    catch (e) {
        console.log(e)
    }
};