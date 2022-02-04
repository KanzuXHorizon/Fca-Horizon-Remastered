const chalk = require('chalk');
//const notifier = require('node-notifier');

module.exports = (str, end) => {
	console.log(chalk.hex('#9900FF')(`${end} • `) + str);
};
