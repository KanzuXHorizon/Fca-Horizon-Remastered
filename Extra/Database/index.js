/* eslint-disable linebreak-style */
/* eslint-disable no-global-assign */

/**
 * 
 */

// Require Database
var Database = require("better-sqlite3");
var db;
// Create Database Under Conditions
if (!db) db = new Database(__dirname + "/Databasethread.sqlite");


var { fetch,set,add,subtract,push,deleteDB,has,all,type,clear } = require("./methods");

// Declare Methods
var methods = {
    fetch: fetch,
    set: set,
    add: add,
    subtract: subtract,
    push: push,
    delete: deleteDB,
    has: has,
    all: all,
    type: type,
    clear: clear
};

module.exports = {
    /**
     * Package version. Community requested feature.
     * console.log(require('quick.db').version);
     */
    version: "1.1.1",

    /**
     * This function fetches data from a key in the database. (alias: .get())
     * @param {key} input any string as a key. Also allows for dot notation following the key.
     * @param {options} [input={ target: null }] Any options to be added to the request.
     * @returns {data} the data requested.
     */

    fetch: function (key, ops) {
        if (!key)
            throw new TypeError(
                "No key specified."
            );
        return arbitrate("fetch", { id: key, ops: ops || {} });
    },
    get: function (key, ops) {
        if (!key)
            throw new TypeError(
                "No key specified."
            );
        return arbitrate("fetch", { id: key, ops: ops || {} });
    },

    /**
     * This function sets new data based on a key in the database.
     * @param {key} input any string as a key. Also allows for dot notation following the key.
     * @param {options} [input={ target: null }] Any options to be added to the request.
     * @returns {data} the updated data.
     */

    set: function (key, value, ops) {
        if (!key)
            throw new TypeError(
                "No key specified."
            );
        if (value === undefined)
            throw new TypeError(
                "No value specified."
            );
        return arbitrate("set", {
            stringify: false,
            id: key,
            data: value,
            ops: ops || {},
        });
    },

    /**
     * This function adds a number to a key in the database. (If no existing number, it will add to 0)
     * @param {key} input any string as a key. Also allows for dot notation following the key.
     * @param {options} [input={ target: null }] Any options to be added to the request.
     * @returns {data} the updated data.
     */

    add: function (key, value, ops) {
        if (!key)
            throw new TypeError(
                "No key specified."
            );
        if (isNaN(value))
            throw new TypeError(
                "Must specify value to add."
            );
        return arbitrate("add", { id: key, data: value, ops: ops || {} });
    },

    /**
     * This function subtracts a number to a key in the database. (If no existing number, it will subtract from 0)
     * @param {key} input any string as a key. Also allows for dot notation following the key.
     * @param {options} [input={ target: null }] Any options to be added to the request.
     * @returns {data} the updated data.
     */

    subtract: function (key, value, ops) {
        if (!key)
            throw new TypeError(
                "No key specified."
            );
        if (isNaN(value))
            throw new TypeError(
                "Must specify value to add."
            );
        return arbitrate("subtract", { id: key, data: value, ops: ops || {} });
    },

    /**
     * This function will push into an array in the database based on the key. (If no existing array, it will create one)
     * @param {key} input any string as a key. Also allows for dot notation following the key.
     * @param {options} [input={ target: null }] Any options to be added to the request.
     * @returns {data} the updated data.
     */

    push: function (key, value, ops) {
        if (!key)
            throw new TypeError(
                "No key specified."
            );
        if (!value && value != 0)
            throw new TypeError(
                "Must specify value to push."
            );
        return arbitrate("push", {
            stringify: true,
            id: key,
            data: value,
            ops: ops || {},
        });
    },

    /**
  
 */

    /**
     * This function will delete an object (or property) in the database.
     * @param {key} input any string as a key. Also allows for dot notation following the key, this will delete the prop in the object.
     * @param {options} [input={ target: null }] Any options to be added to the request.
     * @returns {boolean} if it was a success or not.
     */

    delete: function (key, ops) {
        if (!key)
            throw new TypeError(
                "No key specified."
            );
        return arbitrate("delete", { id: key, ops: ops || {} });
    },

    /**
     * This function returns a boolean indicating whether an element with the specified key exists or not.
     * @param {key} input any string as a key. Also allows for dot notation following the key, this will return if the prop exists or not.
     * @param {options} [input={ target: null }] Any options to be added to the request.
     * @returns {boolean} if it exists.
     */

    has: function (key, ops) {
        if (!key)
            throw new TypeError(
                "No key specified."
            );
        return arbitrate("has", { id: key, ops: ops || {} });
    },

    includes: function (key, ops) {
        if (!key)
            throw new TypeError(
                "No key specified."
            );
        return arbitrate("has", { id: key, ops: ops || {} });
    },

    /**
     * This function fetches the entire active table
     * @param {options} [input={ target: null }] Any options to be added to the request.
     * @returns {boolean} if it exists.
     */

    all: function (ops) {
        return arbitrate("all", { ops: ops || {} });
    },

    fetchAll: function (ops) {
        return arbitrate("all", { ops: ops || {} });
    },

    /*
     * Used to get the type of the value.
     */

    type: function (key, ops) {
        if (!key)
            throw new TypeError(
                "No key specified."
            );
        return arbitrate("type", { id: key, ops: ops || {} });
    },

    /**
     * Using 'new' on this function creates a new instance of a table.
     * @param {name} input any string as the name of the table.
     * @param {options} options.
     */

    table: function (tableName, options = {}) {
        // Set Name
        if (typeof tableName !== "string")
            throw new TypeError(
                "Table name has to be a string."
            );
        else if (tableName.includes(" "))
            throw new TypeError(
                "Table name cannot include spaces."
            );
        this.tableName = tableName;

        // Methods
        this.fetch = function (key, ops) {
            if (!key)
                throw new TypeError(
                    "No key specified."
                );
            return arbitrate(
                "fetch",
                { id: key, ops: ops || {} },
                this.tableName
            );
        };

        this.get = function (key, ops) {
            if (!key)
                throw new TypeError(
                    "No key specified."
                );
            return arbitrate(
                "fetch",
                { id: key, ops: ops || {} },
                this.tableName
            );
        };

        this.set = function (key, value, ops) {
            if (!key)
                throw new TypeError(
                    "No key specified."
                );
            if (!value && value != 0)
                throw new TypeError(
                    "No value specified."
                );
            return arbitrate(
                "set",
                { stringify: true, id: key, data: value, ops: ops || {} },
                this.tableName
            );
        };

        this.add = function (key, value, ops) {
            if (!key)
                throw new TypeError(
                    "No key specified."
                );
            if (isNaN(value))
                throw new TypeError(
                    "Must specify value to add."
                );
            return arbitrate(
                "add",
                { id: key, data: value, ops: ops || {} },
                this.tableName
            );
        };

        this.subtract = function (key, value, ops) {
            if (!key)
                throw new TypeError(
                    "No key specified."
                );
            if (isNaN(value))
                throw new TypeError(
                    "Must specify value to add."
                );
            return arbitrate(
                "subtract",
                { id: key, data: value, ops: ops || {} },
                this.tableName
            );
        };

        this.push = function (key, value, ops) {
            if (!key)
                throw new TypeError(
                    "No key specified."
                );
            if (!value && value != 0)
                throw new TypeError(
                    "Must specify value to push."
                );
            return arbitrate(
                "push",
                { stringify: true, id: key, data: value, ops: ops || {} },
                this.tableName
            );
        };

        this.delete = function (key, ops) {
            if (!key)
                throw new TypeError(
                    "No key specified."
                );
            return arbitrate(
                "delete",
                { id: key, ops: ops || {} },
                this.tableName
            );
        };

        this.has = function (key, ops) {
            if (!key)
                throw new TypeError(
                    "No key specified."
                );
            return arbitrate(
                "has",
                { id: key, ops: ops || {} },
                this.tableName
            );
        };

        this.includes = function (key, ops) {
            if (!key)
                throw new TypeError(
                    "No key specified."
                );
            return arbitrate(
                "has",
                { id: key, ops: ops || {} },
                this.tableName
            );
        };

        this.fetchAll = function (ops) {
            return arbitrate("all", { ops: ops || {} }, this.tableName);
        };

        this.all = function (ops) {
            return arbitrate("all", { ops: ops || {} }, this.tableName);
        };
    },
};

function arbitrate(method, params, tableName) {
    // Configure Options
    let options = {table: tableName || params.ops.table || "json",};

    // Access Database
    db.prepare(`CREATE TABLE IF NOT EXISTS ${options.table} (ID TEXT, json TEXT)`).run();

    // Verify Options
    if (params.ops.target && params.ops.target[0] === ".") params.ops.target = params.ops.target.slice(1); // Remove prefix if necessary
    if (params.data && params.data === Infinity) throw new TypeError(`You cannot set Infinity into the database @ ID: ${params.id}`);

    // Stringify
    // if (params.stringify) {
    //     try {
    //         params.data = JSON.stringify(params.data);
    //     } catch (e) {
    //         throw new TypeError(
    //             `Please supply a valid input @ ID: ${params.id}\nError: ${e.message}`
    //         );
    //     }
    // }

    // Translate dot notation from keys
    if (params.id && typeof params.id == "string" && params.id.includes(".")) {
        let unparsed = params.id.split(".");
        params.id = unparsed.shift();
        params.ops.target = unparsed.join(".");
    }

    // Run & Return Method
    return methods[method](db, params, options);
    }