/* eslint-disable linebreak-style */

const chalk = require('chalk');
var isHexcolor = require('is-hexcolor');

module.exports = (str, end) => {
var log = global.Require.log;
var getText = global.Require.getText;
	if (isHexcolor(global.Require.FastConfig.MainColor) != true) {
		var Language = global.Require.Language.Index;
		log.warn("FastConfig-MainColor", getText.gettext(Language.InvaildMainColor,global.Require.FastConfig.MainColor));
		process.exit(0);
	}	
	console.log(chalk.hex(global.Require.FastConfig.MainColor || "00CCCC").bold(`${global.Require.FastConfig.MainName || '[ FCA-HZI ]'} > `) + str);
};

module.exports.onLogger = (str,end) => console.log(chalk.hex('#00CCCC').bold(`${global.Require.FastConfig.MainName || '[ FCA-HZI ]'} > `) + str);

module.exports.Error = () => console.log(chalk.bold.red('Already Faulty, Please Contact: Facebook.com/Lazic.Kanzu'));

