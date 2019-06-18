const { Listener } = require('discord-akairo');

module.exports = class messageReactionRemoveListener extends Listener {
  constructor() {
    super('messageReactionRemove', {
      emitter: 'client',
      event: 'messageReactionRemove',
      category: 'guild'
    });
  }

  async exec(reaction, user) {
    const client = await this.client;
		const message = reaction.message;
    const channel = require("./../../Configuration").getKey(client, message, "starboardchannel");
    if (message.partial) await reaction.message.fetch();

		if (!message.guild) return;
		if (message.author.bot) return;
		if (reaction.emoji.name !== '⭐') return;
		if (message.author.id === user.id) return;
		if (message.channel.id == channel.id) return;

		const reacount = await (await reaction.users.fetch()).filter(r => r.id !== message.author.id && !r.bot).size;

		const starChannel = channel // message.guild.channels.find("name", "starboard");
		if (starChannel) {
			const image = message.attachments.size > 0 ? extension(message.attachments.array()[0].url) : '';

			const fetchedMessages = starChannel.messages.fetch({ limit: 100 });
			const stars = fetchedMessages.find(m => m.embeds[0] && m.embeds[0].footer && m.embeds[0].footer.text.startsWith('⭐') && m.embeds[0].footer.text.endsWith(message.id));
			if (stars) {
				const star = /^\⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(stars.embeds[0].footer.text);
				const foundStar = stars.embeds[0];
				const embed = this.client.util.embed()
					.setColor(foundStar.color)
					.setAuthor(`${message.author.username} (#${message.channel.name})`, message.author.displayAvatarURL({format: 'png'}))
					.setThumbnail(message.guild.iconURL({format: 'png'}))
					.setTimestamp(foundStar.timestamp)
					.setFooter(`⭐ ${reacount} | ${message.id}`);

				if(!isEmpty(foundStar.description))	embed.setDescription(foundStar.description);
				if(!isEmpty(image))	embed.setImage(image);

				const starMsg = starChannel.fetchMessage(stars.id);
				if(reacount < 4)	starMsg.delete(1000);
				else 				starMsg.edit({ embed });
			} else {
				if(reacount < 4) return;

				if (isEmpty(image) && isEmpty(message.content)) return;
				const embed = this.client.util.embed()
					.setColor(message.member.displayHexColor)
					.setAuthor(`${message.author.username} (#${message.channel.name})`, message.author.displayAvatarURL({format: 'png'}))
					.setThumbnail(message.guild.iconURL({format: 'png'}))
					.setTimestamp(new Date())
					.setFooter(`⭐ ${reacount} | ${message.id}`);

				if(!isEmpty(message.cleanContent)) embed.setDescription(message.content);
				if(!isEmpty(image))	embed.setImage(image);

				starChannel.send({ embed });
			}
		}

		let key = `${message.guild.id}-${message.author.id}`;
		this.client.points.ensure(key, {user: message.author.id, guild: message.guild.id, points: 0, level: 1 });
		let currentPoints = this.client.points.getProp(key, "points");

		if((reacount+1) > 3) {
			// If the reaction count was 3, the user gets -5 points
			this.client.points.setProp(key, "points", currentPoints - 5);
		} else if ((reacount+1) == 3) {
			// If it was above 3, they will get -20 points
			this.client.points.setProp(key, "points", currentPoints - 20);
		}
	}
}

// Here we add the this.extension function to check if there's anything attached to the message.
function extension(attachment) {
	const imageLink = attachment.split('.');
	const typeOfImage = imageLink[imageLink.length - 1];
	const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
	if (!image) return '';
	return attachment;
}

function isEmpty(value) {
	return (value == null || value.length === 0);
}