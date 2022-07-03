module.exports = {
	apps: [
		{
			name: 'Horizon', // main name
			script: '../../../index.js', //main 🐧 
			autorestart: true,
			exec_mode: 'fork',
			pmx: false,
			vizion: false,
			cwd: __dirname,
			instances: 1,
			watch: false,
			max_memory_restart: "2G",
			merge_logs: false,
			exec_interpreter: "node",
			args: [ "--color"],
			env: {
				PM2: true
			}
		}
	]
};  