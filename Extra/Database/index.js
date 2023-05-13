/* eslint-disable no-self-assign */
/* eslint-disable linebreak-style */
const get = require('lodash/get');
const set = require('lodash/set');
const BetterDB = require("better-sqlite3");
const fs = require('fs-extra');
const request = require('request');
const deasync = require('deasync');

if (!fs.existsSync(process.cwd() + '/Horizon_Database')) {
    fs.mkdirSync(process.cwd() + '/Horizon_Database');
    fs.writeFileSync(process.cwd() + '/Horizon_Database/A_README.md', 'This folder is used by ChernobyL(NANI =)) ) to store data. Do not delete this folder or any of the files in it.', 'utf8');
}
var db = new BetterDB(process.cwd() + "/Horizon_Database/SyntheticDatabase.sqlite");

function Lset(key, value) {
    if (!key)
        throw new TypeError(
            "No key specified."
        );
    return arbitrate("set",{
        stringify: false,
        id: key,
        data: value,
        ops:  {},
    });
}

function Lget(key) {
    if (!key)
        throw new TypeError(
            "No key specified."
        );
    return arbitrate("fetch", { id: key, ops: {} || {} });
}

function Lhas(key) {
    if (!key)
        throw new TypeError(
            "No key specified."
        );
    return arbitrate("has", { id: key, ops: {} });
}

function Lremove(key) {
    if (!key)
        throw new TypeError(
            "No key specified."
        );
    return arbitrate("delete", { id: key, ops: {} });
}

function LremoveMultiple(key) {
    if (!key)
        throw new TypeError(
            "No key specified."
        );
        try {
            for (let i of key) {
                arbitrate("delete", { id: i, ops: {} });
            }
            return true;
        } 
    catch (err) {
        return false;
    }
}

function Llist() {
    return arbitrate("all",{ ops: {} });
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


var methods = {
    fetch: function(db, params, options) {
        let fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
        if (!fetched) return null;
        try { 
            fetched = JSON.parse(fetched.json);
        } catch (e) {
            fetched = fetched.json;
        }
        return fetched;
    },
    set: function(db, params, options) {
        let fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
        if (!fetched) {
            db.prepare(`INSERT INTO ${options.table} (ID,json) VALUES (?,?)`).run(params.id, '{}');
            fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
        }
        try { 
            fetched = JSON.parse(fetched); 
        } catch (e) {
            fetched = fetched;
        }
        if (typeof fetched === 'object' && params.ops.target) {
            params.data = JSON.parse(params.data);
            params.data = set(fetched, params.ops.target, params.data);
        } 
        else if (params.ops.target) throw new TypeError('Cannot target a non-object.');
        db.prepare(`UPDATE ${options.table} SET json = (?) WHERE ID = (?)`).run(JSON.stringify(params.data), params.id);
        let newData = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id).json;
        if (newData === '{}') return null;
        else {
            try { newData = JSON.parse(newData); 
            } 
            catch (e) {
                newData = newData;
            }
            return newData;
        }
    },
    add: function addDB(db, params, options) {
        let fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
        if (!fetched) {
            db.prepare(`INSERT INTO ${options.table} (ID,json) VALUES (?,?)`).run(params.id, '{}');
            fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id); 
        }
        if (params.ops.target) {
            try { 
                fetched = JSON.parse(fetched); 
            }
            catch (e) {
                fetched = fetched;
            }
            let oldValue = get(fetched, params.ops.target);
            if (oldValue === undefined) oldValue = 0;
            else if (isNaN(oldValue)) throw new Error(`Data @ ID: "${params.id}" IS NOT A number.\nFOUND: ${fetched}\nEXPECTED: number`);
            params.data = set(fetched, params.ops.target, oldValue + JSON.parse(params.data));
        } 
        else {
            if (fetched.json === '{}') fetched.json = 0;
            try { 
                fetched.json = JSON.parse(fetched); 
            } catch (e) {
                fetched.json = fetched.json;
            }
            if (isNaN(fetched.json)) throw new Error(`Data @ ID: "${params.id}" IS NOT A number.\nFOUND: ${fetched.json}\nEXPECTED: number`);
            params.data = parseInt(fetched.json, 10) + parseInt(params.data, 10);
        }
        db.prepare(`UPDATE ${options.table} SET json = (?) WHERE ID = (?)`).run(JSON.stringify(params.data), params.id);
        let newData = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id).json;
        if (newData === '{}') return null;
        else {
            try {  
                newData = JSON.parse(newData); 
            } 
            catch (e) {
                newData = newData;
            }
            return newData;
        }
    },
    subtract: function subtractDB(db, params, options) {
       let fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
        if (!fetched) {
            db.prepare(`INSERT INTO ${options.table} (ID,json) VALUES (?,?)`).run(params.id, '{}');
            fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id); 
        }
        if (params.ops.target) {
            try { fetched = JSON.parse(fetched); } catch (e) {}
            params.data = JSON.parse(params.data);
            let oldValue = get(fetched, params.ops.target);
            if (oldValue === undefined) oldValue = 0;
            else if (isNaN(oldValue)) throw new Error('Target is not a number.');
            params.data = set(fetched, params.ops.target, oldValue - params.data);
        } else {
            if (fetched.json === '{}') fetched.json = 0;
            else fetched.json = JSON.parse(fetched.json);
            try { fetched.json = JSON.parse(fetched); } catch (e) {}
            if (isNaN(fetched.json)) throw new Error('Target is not a number.');
            params.data = parseInt(fetched.json, 10) - parseInt(params.data, 10);
        }
        params.data = JSON.stringify(params.data);
        db.prepare(`UPDATE ${options.table} SET json = (?) WHERE ID = (?)`).run(params.data, params.id);
        let newData = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id).json;
        if (newData === '{}') return null;
        else {
            try { newData = JSON.parse(newData); } catch (e) {}
            return newData;
        }
    },
    push: function pushDB(db, params, options) {
        let fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
        if (!fetched) {
            db.prepare(`INSERT INTO ${options.table} (ID,json) VALUES (?,?)`).run(params.id, '{}');
            fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id); 
        }
        if (params.ops.target) {
            fetched = JSON.parse(fetched.json);
        try { fetched = JSON.parse(fetched); } catch (e) {}
            params.data = JSON.parse(params.data);
        if (typeof fetched !== 'object') throw new TypeError('Cannot push into a non-object.');
        let oldArray = get(fetched, params.ops.target);
        if (oldArray === undefined) oldArray = [];
        else if (!Array.isArray(oldArray)) throw new TypeError('Target is not an array.');
            oldArray.push(params.data);
            params.data = set(fetched, params.ops.target, oldArray);
        } else {
        if (fetched.json === '{}') fetched.json = [];
        else fetched.json = JSON.parse(fetched.json);
        try { fetched.json = JSON.parse(fetched.json); } catch (e) {}
            params.data = JSON.parse(params.data);
        if (!Array.isArray(fetched.json)) throw new TypeError('Target is not an array.');
            fetched.json.push(params.data);
            params.data = fetched.json;
        }
        params.data = JSON.stringify(params.data);
        db.prepare(`UPDATE ${options.table} SET json = (?) WHERE ID = (?)`).run(params.data, params.id);
        let newData = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id).json;
        if (newData === '{}') return null;
        else {
            newData = JSON.parse(newData);
        try { newData = JSON.parse(newData); } catch (e) {}
        return newData;
        }
    },
    delete: function deleteDB(db, params, options) {
        const unset = require('lodash/unset');
        let fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
        if (!fetched) return false;
        else fetched = JSON.parse(fetched.json);
        try { fetched = JSON.parse(fetched); } catch (e) {}
        if (typeof fetched === 'object' && params.ops.target) {
            unset(fetched, params.ops.target);
            fetched = JSON.stringify(fetched);
            db.prepare(`UPDATE ${options.table} SET json = (?) WHERE ID = (?)`).run(fetched, params.id);
        return true;
        }
        else if (params.ops.target) throw new TypeError('Target is not an object.');
        else db.prepare(`DELETE FROM ${options.table} WHERE ID = (?)`).run(params.id);
        return true;
    },
    has: function hasDB(db, params, options) {
        let fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
        if (!fetched) return false;
        else fetched = JSON.parse(fetched.json);
        try { fetched = JSON.parse(fetched); } catch (e) {}
        if (params.ops.target) fetched = get(fetched, params.ops.target);
        return (typeof fetched != 'undefined');
    },
    all: function allDB(db, params, options) {
        var stmt = db.prepare(`SELECT * FROM ${options.table} WHERE ID IS NOT NULL`);
        let resp = [];
        for (var row of stmt.iterate()) {
            try {
            resp.push({
                ID: row.ID,
                data: JSON.parse(row.json)
            });
            } 
            catch (e) {
                return [];
            }
        }
        return resp;
    },
    type: function typeDB(db, params, options) {
        let fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
        if (!fetched) return null; // If empty, return null
        fetched = JSON.parse(fetched.json);
        try { fetched = JSON.parse(fetched); } catch (e) {}
        if (params.ops.target) fetched = get(fetched, params.ops.target); // Get prop using dot notation
        return typeof fetched;
    },
    clear: function clearDB(db, params, options) {
        let fetched = db.prepare(`DELETE FROM ${options.table}`).run();
        if(!fetched) return null;
        return fetched.changes;
        
    }
};


function arbitrate(method, params) {
    let options = {table: "json"};
    db.prepare(`CREATE TABLE IF NOT EXISTS ${options.table} (ID TEXT, json TEXT)`).run();
    if (params.ops.target && params.ops.target[0] === ".") params.ops.target = params.ops.target.slice(1); // Remove prefix if necessary
    if (params.data && params.data === Infinity) throw new TypeError(`You cannot set Infinity into the database @ ID: ${params.id}`);
    if (params.id && typeof params.id == "string" && params.id.includes(".")) {
        let unparsed = params.id.split(".");
        params.id = unparsed.shift();
        params.ops.target = unparsed.join(".");
    }
    return methods[method](db, params, options);
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