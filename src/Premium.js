"use strict";

var { join } = require('path')
var fs = require('fs')


module.exports = function (defaultFuncs, api, ctx) {
    return function(Name, args){
        var Method = {}
        fs.readdirSync(join(__dirname, "../Func")).filter((/** @type {string} */File) => File.endsWith(".js") && !File.includes('Dev_')).map((/** @type {string} */File) => Method[File.split('.').slice(0, -1).join('.')] = require(`../Func/${File}`)(defaultFuncs, api, ctx));
        if (Method[Name] == undefined) {
            return (`Method ${Name} not found`);
        }
        else {
            try {
                if (process.env.HalzionVersion == 1973 && global.Fca.Data.PremText.includes("Premium")) {
                    return Method[Name](args).then((/** @type {string} */Data) => {
                        return Data;
                    })
                }
                else {
                    return ("Mua Premium Đi Rồi Sài Ông Cháu Ơi !!");
                }
            }
            catch (e) {
                console.log(e);
            }
        }
    }    
};