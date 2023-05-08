/* eslint-disable */
"use strict";
var Database= require("./Database");
var { lastRun,capture } = require('./Src/Last-Run');
var logger = require("../logger");
var getText = global.Fca.getText;
var language = require("../Language/index.json");
language = language.find(i => i.Language == require(process.cwd() + "/FastConfigFca.json").Language).Folder.ExtraGetThread;

exports.createData = function(threadID,threadData) {
    try { 
        Database(true).set(String(threadID),Object(threadData));
        logger.Normal(getText(language.CreateDatabaseSuccess,String(threadID)));
    }
    catch (e) {
        console.log(e);
        logger.Warning(getText(language.CreateDatabaseFailure,String(threadID))); 
    }
}

exports.updateData = function(threadID,threadData) {
    try { 
        Database(true).set(String(threadID),Object(threadData));
        logger.Normal(getText(language.updateDataSuccess,String(threadID)));
    }
    catch (e) {
        console.log(e);
        logger.Warning(getText(language.updateDataFailure,String(threadID))); 
    }
}

exports.updateMessageCount = function(threadID,threadData) {
    try { 
        Database(true).set(String(threadID),Object(threadData));
    }
    catch (e) {
        console.log(e);
    }
}

exports.getData = function(threadID) {
    switch (Database(true).has(String(threadID))) {
        case true: {
            return Database(true).get(String(threadID))
        }
        case false: {
            return null;
        }
    }
}

exports.deleteAll = function(data) {
    for (let i of data) {
        Database(true).delete(String(i));
    }
}

exports.getAll = function() {
    return Database(true).list();
}

exports.hasData = function(threadID) {
    return Database(true).has(String(threadID));
}

exports.alreadyUpdate = function(threadID) {
    var Time = Database(true).get(String(threadID)).TimeUpdate;
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
    switch (Database(true).has(String(Name))) {
        case true: {
            if (Number(global.Fca.startTime) >= Number(Database(true).get(String(Name)) + (120 * 1000))) {
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
    Database(true).set(String(Name),String(lastRun(LastRun)));
}

exports.getLastRun = function(Name) {
    switch (Database(true).has(String(Name))) {
        case true: {
            return Database(true).get(String(Name));
        }
        case false: {
            try {
                capture(Name)
                this.setLastRun(Name,Name);
                return Database(true).get(String(Name));
            }
            catch(e) {
                console.log(e);
                return Date.now();
            }
        }
    }
}