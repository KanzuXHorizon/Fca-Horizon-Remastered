/* eslint-disable linebreak-style */

const chalk = require('chalk');
var log = require("npmlog");
var isHexcolor = require('is-hexcolor');
var getText = require('gettext.js')();
const languageFile = require('./Language/index.json');

module.exports = (str, end) => {
	if (isHexcolor(require("../../FastConfigFca.json").MainColor || "#00CCCC") != true) {
		var Language = languageFile.find(i => i.Language == require("../../FastConfigFca.json").Language).Folder.Index;
		log.warn("FastConfig-MainColor", getText.gettext(Language.InvaildMainColor,require("../../FastConfigFca.json").MainColor));
		process.exit(0);
	}	
	console.log(chalk.hex(require("../../FastConfigFca.json").MainColor || "00CCCC").bold(`${end || '[ FCA-HZI ]'} > `) + str);
};

module.exports.onLogger = (str,end) => console.log(chalk.hex('#00CCCC').bold(`${end || '[ FCA-HZI ]'} > `) + str);

module.exports.Error = () => console.log(chalk.bold.red('Đã Có Lỗi, Xin Vui Lòng Liên Hệ Với: Facebook.com/Lazic.Kanzu'));

