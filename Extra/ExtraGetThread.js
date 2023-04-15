/* eslint-disable */
"use strict";
var Database = require("../Extra/Database");
var { lastRun,capture } = require('./Src/Last-Run');
var logger = require("../logger");
var getText = global.Fca.getText;
var language = require("../Language/index.json");
language = language.find(i => i.Language == require(process.cwd() + "/FastConfigFca.json").Language).Folder.ExtraGetThread;

exports.createData = function(threadID,threadData) {
    try { 
        Database.set(String(threadID),Object(threadData),true);
        logger.Normal(getText(language.CreateDatabaseSuccess,String(threadID)));
    }
    catch (e) {
        console.log(e);
        logger.Warning(getText(language.CreateDatabaseFailure,String(threadID))); 
    }
}

exports.updateData = function(threadID,threadData) {
    try { 
        Database.set(String(threadID),Object(threadData),true);
        logger.Normal(getText(language.updateDataSuccess,String(threadID)));
    }
    catch (e) {
        console.log(e);
        logger.Warning(getText(language.updateDataFailure,String(threadID))); 
    }
}

exports.updateMessageCount = function(threadID,threadData) {
    try { 
        Database.set(String(threadID),Object(threadData),true);
    }
    catch (e) {
        console.log(e);
    }
}

exports.getData = function(threadID) {
    switch (Database.has(String(threadID),true)) {
        case true: {
            return Database.get(String(threadID),{},true)
        }
        case false: {
            return null;
        }
    }
}

exports.deleteAll = function(data) {
    for (let i of data) {
        Database.delete(String(i),true);
    }
}

exports.getAll = function() {
    return Database.list(true);
}

exports.hasData = function(threadID) {
    return Database.has(String(threadID),true);
}

exports.alreadyUpdate = function(threadID) {
    var Time = Database.get(String(threadID),{},true).TimeUpdate;
        try { 
            if (global.Fca.startTime >= (Time + (3600 * 1000))) {
                logger.Normal(getText(language.alreadyUpdate, String(threadID)));
                return true;
            }
            else return false;
        }
        catch (e) { 
            console.log(e);
        return true;
    }
}

exports.readyCreate = function(Name) {
    switch (Database.has(String(Name),true)) {
        case true: {
            if (Number(global.Fca.startTime) >= Number(Database.get(String(Name),{},true) + (120 * 1000))) {
                return true;
            }   
            else {
                return false;
            }
        }
        case false: {
            return false;
        }
    }
}

exports.setLastRun = function(Name,LastRun) {
    Database.set(String(Name),String(lastRun(LastRun)),true);
}

exports.getLastRun = function(Name) {
    switch (Database.has(String(Name),true)) {
        case true: {
            return Database.get(String(Name),{},true);
        }
        case false: {
            try {
                capture(Name)
                this.setLastRun(Name,Name);
                return Database.get(String(Name),{},true);
            }
            catch(e) {
                console.log(e);
                return Date.now();
            }
        }
    }
}