/* eslint-disable linebreak-style */
var { join } = require('path');
/*
function location() {
    return {    
        Extra: {
            ExtraAddons: join(__dirname, '../Extra','ExtraAddons.js'),
            ExtraFindUID: join(__dirname, '../Extra','ExtraFindUID.js'),
            ExtraGetThread: join(__dirname, '../Extra','ExtraGetThread.js'),
            ExtraTranslate: join(__dirname, '../Extra','ExtraTranslate.js'),
            ExtraUptimeRobot: join(__dirname, '../Extra','ExtraUptimeRobot.js'),
            Src: {
                "Last-Run": join(__dirname, '../Extra','Src','Last-Run.js')
            },
            Database: {
                index: join(__dirname, '../Extra','Database','index.js'),
                methods: join(__dirname, '../Extra','Database','methods.js')
            }
        },
        Language: join(__dirname, '../Language','index.json'),
        broadcast: join(__dirname, '../broadcast.js'),
        CountTime: join(__dirname, '../CountTime.json'),
        index: join(__dirname, '../index.js'),
        logger: join(__dirname, '../logger.js'),
        StateCrypt: join(__dirname, '../StateCrypt.js'),
        utils: join(__dirname, '../utils.js'),
        Settings: join(__dirname, 'Settings.js')
    };
}
*/

class location {
    constructor() {
        this.Extra = {
            ExtraAddons: join(__dirname, '../Extra','ExtraAddons.js'),
            ExtraFindUID: join(__dirname, '../Extra','ExtraFindUID.js'),
            ExtraGetThread: join(__dirname, '../Extra','ExtraGetThread.js'),
            ExtraTranslate: join(__dirname, '../Extra','ExtraTranslate.js'),
            ExtraUptimeRobot: join(__dirname, '../Extra','ExtraUptimeRobot.js'),
            Src: {
                "Last-Run": join(__dirname, '../Extra','Src','Last-Run.js')
            },
            Database: {
                index: join(__dirname, '../Extra','Database','index.js'),
                methods: join(__dirname, '../Extra','Database','methods.js')
            }
        },
        this.Language = join(__dirname, '../Language','index.json'),
        this.broadcast = join(__dirname, '../broadcast.js'),
        this.CountTime = join(__dirname, '../CountTime.json'),
        this.index = join(__dirname, '../index.js'),
        this.logger = join(__dirname, '../logger.js'),
        this.StateCrypt = join(__dirname, '../StateCrypt.js'),
        this.utils = join(__dirname, '../utils.js'),
        this.Settings = join(__dirname, 'Settings.js');
    }
}

module.exports = location;