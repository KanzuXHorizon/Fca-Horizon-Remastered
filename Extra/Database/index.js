/* eslint-disable no-self-assign */
/* eslint-disable linebreak-style */
const fs = require('fs-extra');
const sqlite3 = require('sqlite3');
const request = require('request');
const deasync = require('deasync');

if (!fs.existsSync(process.cwd() + '/Horizon_Database')) {
    fs.mkdirSync(process.cwd() + '/Horizon_Database');
    fs.writeFileSync(process.cwd() + '/Horizon_Database/A_README.md', 'This folder is used by ChernobyL(NANI =)) ) to store data. Do not delete this folder or any of the files in it.', 'utf8');
}
const Database = new sqlite3.Database(process.cwd() + "/Horizon_Database/SyntheticDatabase.sqlite");

Database.serialize(function() {
    Database.run("CREATE TABLE IF NOT EXISTS json (ID TEXT, json TEXT)");
});

function Lset(key, value) {
    try {
        //check if key is exists if yes then update it
        if (Lhas(key)) {
            let done = false;
            Database.run(`UPDATE json SET json = (?) WHERE ID = (?)`, [JSON.stringify(value), key], function(err) {
                done = true;
            });
            deasync.loopWhile(function(){
                return !done;
            });
            return;
        }
        else {
            let done = false;
            Database.run(`INSERT INTO json(ID, json) VALUES(?, ?)`, [key, JSON.stringify(value)], function(err) {
                done = true;
            });
            deasync.loopWhile(function(){
                return !done;
            });
            return;
        }
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

function Lget(key) {
    try {
        var done = false;
        var Data = undefined;
        Database.get(`SELECT * FROM json WHERE ID = (?)`, [key], function(err, row) {
            Data = row;
            done = true;
        });
        deasync.loopWhile(function(){
            return !done;
        });
        if (Data === undefined) return undefined;
        return JSON.parse(Data.json);
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

function Lhas(key) {
    try {
        var done = false;
        var Data = undefined;
        Database.get(`SELECT * FROM json WHERE ID = (?)`, [key], function(err, row) {
            Data = row;
            done = true;
        });
        deasync.loopWhile(function(){
            return !done;
        });
        if (Data === undefined) return false;
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

function Lremove(key) {
    try {
        var done = false;
        Database.run(`DELETE FROM json WHERE ID = (?)`, [key], function(err) {
            done = true;
        });
        deasync.loopWhile(function(){
            return !done;
        });
        return;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

function LremoveMultiple(keys) {
    try {
        for (const key of keys) {
            Database.run(`DELETE FROM json WHERE ID = (?)`, [key], function(err) {});
        }
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

function Llist() {
    var done = false;
    var Data = undefined;
    Database.all(`SELECT * FROM json`,[], function(err, rows) {
        Data = rows;
        done = true;
    });
    deasync.loopWhile(function(){
        return !done;
    });
    return Data;
}

function Replit_Set(key, value) {
    try {
        var done = false;
        
        request({
            url: process.env.REPLIT_DB_URL,
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },  
            body: `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`
        
        }, function (error, response, body) {
            done = true;
        });

        deasync.loopWhile(function(){
            return !done;
        });

        return;
        
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

function Replit_Get(key) {
    try {
        var done = false;
        var response = null;
    
        request(process.env.REPLIT_DB_URL + "/" + key, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                response = body;
            }
            done = true;
        });
    
        deasync.loopWhile(function(){
            return !done;
        });
    
        return JSON.parse(response);
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

function Replit_Has(key) {
    try {
        var done = false;
        var response = null;

        request(process.env.REPLIT_DB_URL + "/" + key, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                response = body;
            }
            done = true;
        });

        deasync.loopWhile(function(){
            return !done;
        });

        return response != null;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

function Replit_Remove(key) {
    try {
        var done = false;
        request.delete(process.env.REPLIT_DB_URL + "/" + key , function (error, response, body) {
            done = true;
        });

        deasync.loopWhile(function(){
            return !done;
        });

        return;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}
function Replit_RemoveMultiple(keys) {
    try {
        for (const key of keys) {
            request.delete(process.env.REPLIT_DB_URL + "/" + key , function (error, response, body) {});
        }
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

function Replit_List() {
    var done = false;
    var response = null;

    request(process.env.REPLIT_DB_URL + "?encode=true" + `&prefix=${encodeURIComponent("")}`, function (error, res, body) {
        if (!error && res.statusCode == 200) {
            response = body;
        }
        done = true;

    });

    deasync.loopWhile(function(){
        return !done;
    });

    if (response.length === 0) {
        return [];
    }
    return response.split("\n").map(decodeURIComponent);
}

module.exports = function ChernobyL(Local) {
    if (Local && process.env["REPL_ID"]) {
        return {
            set: Lset,
            get: Lget,
            has: Lhas,
            delete: Lremove,
            deleteMultiple: LremoveMultiple,
            list: Llist
        };
    } else if (!Local && process.env["REPL_ID"]) {
        return {
            set: Replit_Set,
            get: Replit_Get,
            has: Replit_Has,
            delete: Replit_Remove,
            deleteMultiple: Replit_RemoveMultiple,
            list: Replit_List
        };
    }
    else if (Local && !process.env["REPL_ID"]) {
        return {
            set: Lset,
            get: Lget,
            has: Lhas,
            delete: Lremove,
            deleteMultiple: LremoveMultiple,
            list: Llist
        };
    }
    else if (!Local && !process.env["REPL_ID"]) {
        return {
            set: Lset,
            get: Lget,
            has: Lhas,
            delete: Lremove,
            deleteMultiple: LremoveMultiple,
            list: Llist
        };
    }
    else {
        return {
            set: Lset,
            get: Lget,
            has: Lhas,
            delete: Lremove,
            deleteMultiple: LremoveMultiple,
            list: Llist
        };
    }
};