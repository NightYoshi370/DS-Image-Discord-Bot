const { Listener } = require('discord-akairo');

module.exports = class inhibitorLoadListener extends Listener {
	constructor() {
		super('inhibitorHandlerLoad', {
			emitter: 'inhibitorHandler',
			event: 'load',
			category: 'inhibitorHandler'
		});
	}

	exec(cmd, reload) {
		if (reload)
			console.log(`[INHIBITOR][RELOAD] ${cmd.id} reloaded`);
		else
			console.log(`[INHIBITOR][LOAD] ${cmd.id} loaded`);
	}
}