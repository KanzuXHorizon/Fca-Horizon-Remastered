'use strict';
/* eslint-disable linebreak-style */

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
    Action: async function(Type) {
        switch (Type) {
            case "AutoLogin": {
                var Database = require('./Extra/Database');
                var logger = global.Fca.Require.logger;
                var Email = (await Database.get('Account')).replace(RegExp('"', 'g'), ''); //hmm IDK
                var PassWord = (await Database.get('Password')).replace(RegExp('"', 'g'), '');
                require('./Main')({ email: Email, password: PassWord},async (error, api) => {
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
            break;
            default: {
                require('npmlog').Error("Invalid Message!");
            };
        }
    }
});

try {
    let Boolean_Fca = ["AutoUpdate","Uptime","BroadCast","EncryptFeature","AutoLogin","ResetDataLogin","Login2Fa"];
    let String_Fca = ["MainName","PreKey","Language","AuthString","Config"]
    let Number_Fca = ["AutoRestartMinutes"];
    let All_Variable = Boolean_Fca.concat(String_Fca,Number_Fca);


    if (!global.Fca.Require.fs.existsSync(process.cwd() + '/FastConfigFca.json')) {
        global.Fca.Require.fs.writeFileSync(process.cwd() + "/FastConfigFca.json", JSON.stringify(global.Fca.Data.ObjFastConfig, null, "\t"));
        process.exit(1);
    }

try {
    var DataLanguageSetting = require(process.cwd() + "/FastConfigFca.json");
}
catch (e) {
    global.Fca.Require.logger.Error('Detect Your FastConfigFca Settings Invalid!, Carry out default restoration');
    global.Fca.Require.fs.writeFileSync(process.cwd() + "/FastConfigFca.json", JSON.stringify(global.Fca.Data.ObjFastConfig, null, "\t"));     
    process.exit(1)
}
    if (global.Fca.Require.fs.existsSync(process.cwd() + '/FastConfigFca.json')) {
        try { 
            if (DataLanguageSetting.Logo != undefined) {
                    delete DataLanguageSetting.Logo
                global.Fca.Require.fs.writeFileSync(process.cwd() + "/FastConfigFca.json", JSON.stringify(DataLanguageSetting, null, "\t"));        
            }
        }
        catch (e) {
            console.log(e);
        }
        if (!global.Fca.Require.languageFile.some((/** @type {{ Language: string; }} */i) => i.Language == DataLanguageSetting.Language)) { 
            global.Fca.Require.logger.Warning("Not Support Language: " + DataLanguageSetting.Language + " Only 'en' and 'vi'");
            process.exit(0); 
        }
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
                global.Fca.Require.fs.writeFileSync(process.cwd() + "/FastConfigFca.json", JSON.stringify(DataLanguageSetting, null, "\t"));
            }
            else continue; 
        }
    global.Fca.Require.FastConfig = DataLanguageSetting;
}
catch (e) {
    console.log(e);
    global.Fca.Require.logger.Error();
}

module.exports = function(loginData, options, callback) {
    const Language = global.Fca.Require.languageFile.find((/** @type {{ Language: string; }} */i) => i.Language == global.Fca.Require.FastConfig.Language).Folder.Index;
    const login = require('./Main'); // khúc này để use personal config
    const fs = require('fs-extra');
    const got = require('got');
    const log = require('npmlog');
    const { execSync } = require('child_process');
    const Database = require('./Extra/Database');

    return got.get('https://github.com/KanzuXHorizon/Global_Horizon/raw/main/InstantAction.json').then(async function(res) {

        switch (fs.existsSync(process.cwd() + "/replit.nix")) {
            case true: {
                await require('./Extra/Src/Change_Environment.js')(function(boolean) {
                    Database.set("NeedRebuild", boolean,true);
                });
                break;
            }
            case false: {
                const NodeVersion = execSync('node -v').toString().replace(/(\r\n|\n|\r)/gm, "");
                if (!NodeVersion.includes("v14")) {
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
                                    // download NodeJS v14 for Windows and slient install
                                    await got('https://nodejs.org/dist/v14.17.0/node-v14.17.0-x64.msi').pipe(fs.createWriteStream(process.cwd() + "/node-v14.17.0-x64.msi"));
                                    log.info("[ FCA-UPDATE ] •", Language.DownloadingNode);
                                    await new Promise(resolve => setTimeout(resolve, 3000));
                                    execSync('msiexec /i node-v14.17.0-x64.msi /qn');
                                    log.info("[ FCA-UPDATE ] •", Language.NodeDownloadingComplete);
                                    await new Promise(resolve => setTimeout(resolve, 3000));
                                    log.info("[ FCA-UPDATE ] •", Language.RestartRequire);
                                    Database.set("NeedRebuild", true, true);
                                    process.exit(0);
                                }
                                catch (e) {
                                    log.error("[ FCA-UPDATE ] •",Language.ErrNodeDownload);
                                    process.exit(0);
                                }
                            }
                            case "linux": {
                                try {
                                    //check if user using nvm 
                                    if (fs.existsSync(process.env.HOME + "/.nvm/nvm.sh")) {
                                        log.warn("[ FCA-UPDATE ] •", Language.UsingNVM);
                                        process.exit(0);
                                    }
                                    // download NodeJS v14 for Linux and slient install
                                    await got('https://nodejs.org/dist/v14.17.0/node-v14.17.0-linux-x64.tar.xz').pipe(fs.createWriteStream(process.cwd() + "/node-v14.17.0-linux-x64.tar.xz"));
                                    log.info("[ FCA-UPDATE ] •", Language.DownloadingNode);
                                    await new Promise(resolve => setTimeout(resolve, 3000));
                                    execSync('tar -xf node-v14.17.0-linux-x64.tar.xz');
                                    execSync('cd node-v14.17.0-linux-x64');
                                    execSync('sudo cp -R * /usr/local/');
                                    log.info("[ FCA-UPDATE ] •", Language.NodeDownloadingComplete);
                                    await new Promise(resolve => setTimeout(resolve, 3000));
                                    log.info("[ FCA-UPDATE ] •",Language.RestartingN);
                                    Database.set("NeedRebuild", true, true);
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
                                    // download NodeJS v14 for MacOS and slient install
                                    await got('https://nodejs.org/dist/v14.17.0/node-v14.17.0-darwin-x64.tar.gz').pipe(fs.createWriteStream(process.cwd() + "/node-v14.17.0-darwin-x64.tar.gz"));
                                    log.info("[ FCA-UPDATE ] •", Language.DownloadingNode);
                                    await new Promise(resolve => setTimeout(resolve, 3000));
                                    execSync('tar -xf node-v14.17.0-darwin-x64.tar.gz');
                                    execSync('cd node-v14.17.0-darwin-x64');
                                    execSync('sudo cp -R * /usr/local/');
                                    log.info("[ FCA-UPDATE ] •", Language.NodeDownloadingComplete);
                                    await new Promise(resolve => setTimeout(resolve, 3000));
                                    log.info("[ FCA-UPDATE ] •",Language.RestartingN);
                                    Database.set("NeedRebuild", true,true);
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
        if ((Database.get("NeedRebuild",{},true)) == true || (Database.get("NeedRebuild",{},true)) == undefined) {
            log.info("[ FCA-UPDATE ] •",Language.Rebuilding);
            await new Promise(resolve => setTimeout(resolve, 3000));
            try {
                execSync('npm i', {stdio: 'inherit'});
            }
            catch (e) {
                console.log(e);
                log.error("[ FCA-UPDATE ] •",Language.ErrRebuilding);
                Database.set("NeedRebuild", false, true);// why ? idk just set it to false
            }
            try {
                execSync('npm rebuild', {stdio: 'inherit'});
            }
            catch (e) {
                console.log(e);
                log.error("[ FCA-UPDATE ] •",Language.ErrRebuilding);
                Database.set("NeedRebuild", false, true);// why ? idk just set it to false
            }
            log.info("[ FCA-UPDATE ] •",Language.SuccessRebuilding);
            Database.set("NeedRebuild", false, true);// why ? idk just set it to false
            await new Promise(resolve => setTimeout(resolve, 3000));
            log.info("[ FCA-UPDATE ] •",Language.RestartingN);
            process.exit(1);
        }

        let Data = JSON.parse(res.body);
            if (Data.HasProblem == true || Data.ForceUpdate == true) {
                let TimeStamp = Database.get('Instant_Update',{},true);
                    if (TimeStamp == null || TimeStamp == undefined || Date.now() - TimeStamp > 500) {
                        var Instant_Update = require('./Extra/Src/Instant_Update.js');
                    await Instant_Update()
                }
            }
            else {
                let TimeStamp = Database.get('Check_Update',{},true);
                    if (TimeStamp == null || TimeStamp == undefined || Date.now() - TimeStamp > 300000) {
                        var Check_Update = require('./Extra/Src/Check_Update.js');
                    await Check_Update()
                } 
            }
        return login(loginData, options, callback);
    }).catch(function(err) {
        console.log(err)
        log.error("[ FCA-UPDATE ] •",Language.UnableToConnect);
        process.exit(0);
    });
};

