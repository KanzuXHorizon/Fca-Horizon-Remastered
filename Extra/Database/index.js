/* eslint-disable linebreak-style */
const fs = require('fs-extra');

if (!fs.existsSync(process.cwd() + '/Horizon_Database')) {
    fs.mkdirSync(process.cwd() + '/Horizon_Database');
    fs.writeFileSync(process.cwd() + '/Horizon_Database/A_README.md', 'This folder is used by ChernobyL(NANI =)) ) to store data. Do not delete this folder or any of the files in it.', 'utf8');
}

function Lset(key, value) {
    try {
        fs.writeFileSync(process.cwd() + '/Horizon_Database/' + key + '.json', JSON.stringify(value), 'utf8');
        return true;
    }
    catch (e) {
        return false;
    }
}

function Lget(key) {
    try {
        if (!fs.existsSync(process.cwd() + '/Horizon_Database/' + key + '.json')) return false;
        else {
            try {
                var Data = fs.readFileSync(process.cwd() + '/Horizon_Database/' + key + '.json', 'utf8');
            }
            catch (e) {
                fs.unlinkSync(process.cwd() + '/Horizon_Database/' + key + '.json');
                return false;
            }
            return JSON.parse(Data);
        }
    }
    catch (e) {
        return false;
    }
}

function Lhas(key) {
    try {
        return fs.existsSync(process.cwd() + '/Horizon_Database/' + key + '.json');
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

function Lremove(key) {
    try {
        fs.unlinkSync(process.cwd() + '/Horizon_Database/' + key + '.json');
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

function LremoveMultiple(keys) {
    try {
        for (const key of keys) {
            fs.unlinkSync(process.cwd() + '/Horizon_Database/' + key + '.json');
        }
        return true;
    }
    catch (e) {
        return false;
    }
}

function Llist() {
    try {
        return fs.readdirSync(process.cwd() + '/Horizon_Database');
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

const request = require('sync-request');

function Replit_Set(key, value) {
    try {
        return request('POST', process.env.REPLIT_DB_URL,{
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: encodeURIComponent(key) + "=" + encodeURIComponent(JSON.stringify(value))
        });
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

function Replit_Get(key) {
    try {
        return JSON.parse(request('GET', process.env.REPLIT_DB_URL + "/" + key).body.toString());
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

function Replit_Has(key) {
    try {
        return (request('GET', process.env.REPLIT_DB_URL + "/" + key)).body.toString() !== "null";
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

function Replit_Remove(key) {
    try {
        request('DELETE', process.env.REPLIT_DB_URL + "/" + key);
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}
function Replit_RemoveMultiple(keys) {
    try {
        for (const key of keys) {
            request('DELETE', process.env.REPLIT_DB_URL + "/" + key);
        }
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

function Replit_List() {
    try {
        return JSON.parse(request('GET', process.env.REPLIT_DB_URL).body.toString());
    }
    catch (e) {
        console.log(e);
        return false;
    }
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