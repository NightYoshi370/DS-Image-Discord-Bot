import discordAkairo from 'discord-akairo';

export default class HexCommand extends discordAkairo.Command {
	constructor() {
		super('hex', {
			category: 'Text Fun',
			aliases: ["hex"],
			description: {
				content: 'Converts text to hexadecimal.',
				usage: '<text to translate to Hexadecimal Values>',
				examples: ['hello world']
			},
			args: [
				{
					id: 'text',
					type: 'text-fun',
					match: 'content'
				}
			]
		});
	}

	exec(message, { text }) {
		if (!text)
			return message.util.reply(global.translate(message.author.lang, "There were no text I can find to convert to hexadecimal."));

		let embed;
		if (message.guild)
			embed = this.client.util.embed().setFooter(global.translate(message.author.lang, 'This command was ran by {0}', message.member.displayName));

		return message.util.send(Buffer.from(text).toString('hex'), (embed && message.channel.embedable ? {embed} : {}));
	}
};