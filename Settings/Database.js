module.exports = class Database {
    constructor() {
        this.database = {};
    }
    get(key) {
        return this.database[key];
    }
    set(key, value) {
        this.database[key] = value;
    }
    has (key) {
        return this.database.hasOwnProperty(key);
    }
    remove(key) {
        delete this.database[key];
    }
    clear() {
        this.database = {};
    }
}

