/* eslint-disable linebreak-style */

const chalk = require('chalk');
var isHexcolor = require('is-hexcolor');

module.exports = (str, cb) => {
var log = global.Fca.Require.log;
var getText = global.Fca.Require.getText;
	if (isHexcolor(global.Fca.Require.FastConfig.MainColor) != true) {
		var Language = global.Fca.Require.Language.Index;
		log.warn("FastConfig-MainColor", getText(Language.InvaildMainColor,global.Fca.Require.FastConfig.MainColor));
		process.exit(0);
	}	
	console.log(chalk.hex(global.Fca.Require.FastConfig.MainColor || "#00CCCC").bold(`${global.Fca.Require.FastConfig.MainName || '[ FCA-HZI ]'} > `) + str);
};

module.exports.onLogger = (str,cb) => {
	console.log(chalk.hex('#00CCCC').bold(`${global.Fca.Require.FastConfig.MainName || '[ FCA-HZI ]'} > `) + str);
};

module.exports.Error = () => console.log(chalk.bold.red('Already Faulty, Please Contact: Facebook.com/Lazic.Kanzu'));
