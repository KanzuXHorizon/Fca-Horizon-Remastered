var fs = require('fs-extra')
module.exports = function() {
    if (fs.existsSync(__dirname + '/History.js')) {
        return true
    }
    else return false;
}   