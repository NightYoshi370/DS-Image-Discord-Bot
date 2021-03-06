const { Listener } = require('discord-akairo');

module.exports = class CommandBlockedListener extends Listener {
	constructor() {
		super('commandBlocked', {
			emitter: 'commandHandler',
			event: 'commandBlocked',
			category: 'commandHandler'
		});
	}

	exec(message, command, reason) {
		const __ = (k, ...v) => global.translate(message.author.lang, k, ...v);

		const text = {
			owner: () => `we're sorry, but the ${command.id} command may only be used by the bot owners.`,
			guild: () => `we're sorry, but the ${command.id} command may only be used in a server.`
		}[reason];

		const tag = message.guild ? message.guild.name : `DM`;
		console.log(`${message.author.username} (#${message.author.id}) was blocked from using ${command.id} in ${tag} because of ${reason}!`);

		if (!text) return;
		if (!message.channel.sendable) return;

		message.util.reply(text());
	}
};