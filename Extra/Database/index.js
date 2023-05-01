var get = require('lodash/get'),
    set = require('lodash/set'),
    got = require("got"),
    BetterDB = require("better-sqlite3"),
    db = new BetterDB(__dirname + "/SyntheticDatabase.sqlite");
var ReplitURL = process.env.REPLIT_DB_URL
var ReplID = ReplID
module.exports = { 
    get: function(key, ops,forceFuction) {
        if (ReplID == undefined || forceFuction) {
            if (!key)
                throw new TypeError(
                    "No key specified."
                );
            return arbitrate("fetch", { id: key, ops: ops || {} });
        }   
        else return got(ReplitURL + "/" + key)
        .then((StrValue) => {
            var strValue = StrValue.body

            if (ops && ops.raw) return strValue;
                if (!strValue) return null;
            try {
                var value = JSON.parse(strValue);
            } catch (_err) {
                throw new SyntaxError(
                `Failed to parse value of ${key}, try passing a raw option to get the raw value`
                );
            }
            if (value === null || value === undefined) {
                return null;
            }
            return value;
        });
    },

    set: function(key, value,forceFuction) {
        if (ReplID == undefined || forceFuction) {
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
        else return got(ReplitURL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: encodeURIComponent(key) + "=" + encodeURIComponent(JSON.stringify(value)),
        });
    },
    has: function(key,forceFuction) {
        if (ReplID == undefined || forceFuction) {
            if (!key)
                throw new TypeError(
                    "No key specified."
                );
            return arbitrate("has", { id: key, ops: {} });
        }
        else return got(ReplitURL + "/" + key)
            .then((StrValue) => {          
                var strValue = StrValue.body
                if (strValue === "") return false;
                return true;
            });
    },
    delete: function(key,forceFuction) {
        if (ReplID == undefined || forceFuction) {
            if (!key)
                throw new TypeError(
                    "No key specified."
                );
            return arbitrate("delete", { id: key, ops: {} });
        }
        else return got(ReplitURL + "/" + key, {
            method: "DELETE",
        });
    },

    deleteMultiple: function(forceFuction,...args) {
        if (ReplID == undefined || forceFuction) {
            if (!key)
                throw new TypeError(
                    "No key specified."
                );
                try {
                    for (let i of args) {
                        arbitrate("delete", { id: i, ops: {} });
                    }
                    return true;
                } 
            catch (err) {
                return false;
            }
        }
        else {
            const promises = [];

            for (const arg of args) {
                promises.push(this.delete(arg));
            }
        
            Promise.all(promises);
        
            return this;
        }
    },

    empty: async function(forceFuction) {
        if (ReplID == undefined || forceFuction) {
            return arbitrate("clear");
        }
        else {
            const promises = [];
            for (const key of await this.list()) {
                promises.push(this.delete(key));
            }
        
            Promise.all(promises);
        
            return this;
        }
    },

    list: async function(forceFuction) {
        if (ReplID == undefined || forceFuction) {
            return arbitrate("all",{ ops: {} });
        }
        else {
            return got(
                ReplitURL + `?encode=true&prefix=${encodeURIComponent(true)}`
            )
                .then((t) => {
                var strValue = t.body
                if (strValue.length === 0) {
                    return [];
                }
                return strValue.split("\n").map(decodeURIComponent);
            });
        }
    }
}

var methods = {
    fetch: function(db, params, options) {
        let fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
        if (!fetched) return null;
        try { 
            fetched = JSON.parse(fetched.json)
        } catch (e) {
            fetched = fetched.json;
        }
        if (params.ops.target) fetched = get(fetched, params.ops.target);
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
                fetched = JSON.parse(fetched) 
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
                fetched.json = JSON.parse(fetched) 
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
        try { fetched = JSON.parse(fetched) } catch (e) {}
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
            newData = JSON.parse(newData)
        try { newData = JSON.parse(newData) } catch (e) {}
        return newData
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
        try { fetched = JSON.parse(fetched) } catch (e) {}
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

function arbitrate(method, params, tableName) {
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