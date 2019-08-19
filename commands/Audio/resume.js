const { Command } = require('discord-akairo');

module.exports = class ResumeCommand extends Command {
	constructor() {
		super('resume', {
			aliases: ['resume'],
			category: 'Audio',
			description: {
        content: 'Resume the currently paused audio.'
      },
			channelRestriction: 'guild',
		});
	}

	exec(message) {
		const __ = (k, ...v) => global.getString(message.author.lang, k, ...v);

		let voiceChannel = message.member.voice.channel;
		if (!voiceChannel)
			return message.util.reply(__("in order to use audio commands, you will need to be in a voice channel"));

		let fetched = this.client.audio.active.get(message.guild.id);
		if (!fetched)
			return message.util.reply(__("in order to {0} audio, there needs to be audio playing in the channel", "pause"));

		if (!fetched.dispatcher.paused)
			return message.uitl.reply(__("there is nothing to resume playing: you should be listening to it right now"));

		fetched.dispatcher.resume();
    return message.reply(`I have successfully resumed ${fetched.queue[0].songTitle}.`);
  }
}