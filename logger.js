/* eslint-disable linebreak-style */
const chalk = require('chalk');
//const notifier = require('node-notifier');

module.exports = (str, end) => {
	console.log(chalk.hex('#9900FF').bold(`${end || '[ FCA-HZI ]'} > `) + str);
};
module.exports.onLogger = (str,end,ctscolor) => { 
	var checkbutdak = ctscolor.replace("#",'');
	if (ctscolor.indexOf('#') != 1) {
		console.log(chalk.hex('#00CCCC').bold(`${end || '[ FCA-HZI ]'} > `) + str);
	}
	else if (!isNaN(checkbutdak)) {
		console.log(chalk.hex(ctscolor).bold(`${end || '[ FCA-HZI ]'} > `) + str);
	} 
	else console.log(chalk.hex('#00CCCC').bold(`${end || '[ FCA-HZI ]'} > `) + str);
};
module.exports.Error = () =>  {
	console.log(chalk.bold.red('Đã Có Lỗi, Xin Vui Lòng Liên Hệ Với: Facebook.com/Lazic.Kanzu'));
};