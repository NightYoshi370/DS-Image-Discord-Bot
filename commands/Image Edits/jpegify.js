const { Command } = require('discord-akairo');
const { createCanvas, loadImage } = require('canvas');

module.exports = class JPEGifyCommand extends Command {
	constructor() {
		super('JPEGify', {
			aliases: ["jpegify", "needs-more-jpeg", "jpeg"],
			category: 'Image Edits',
			description: 'Draws an image as a low quality JPEG.',
      cooldown: 10000,
      ratelimit: 1,
			clientPermissions: ['ATTACH_FILES'],
			args: [
        {
					id: 'image',
					type: 'image'
				},
				{
					id: 'level',
					type: 'float',
					default: 0.5
				}
			]
		});
	}

	async exec(msg, { image, level }) {
    if (level < 0.01) level = 0.01;
    if (level > 10) level = 10;

		try {
			const data = await loadImage(image);
      const canvas = createCanvas(data.width, data.height);
			const ctx = canvas.getContext('2d');

      ctx.drawImage(data, 0, 0, data.width, data.height)

      const attachment = canvas.toBuffer('image/jpeg', { quality: level / 10 });
			if (Buffer.byteLength(attachment) > 8e+6) return msg.reply('Resulting image was above 8 MB.');
			return msg.channel.send({ files: [{ attachment, name: 'image.jpg' }] });
		} catch (err) {
			return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}
};