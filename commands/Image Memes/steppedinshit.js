const Command = require('../../struct/Image-Command');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = class SteppedInShitCommand extends Command {
  constructor() {
    super('steppedinshit', {
      aliases: ["steppedinshit", 'stepinshit'],
      category: "Image Memes",
      description: {
        content: "Step in shit aka your image"
      },
      clientPermissions: ['ATTACH_FILES'],
      args: [
	      {
	  			id: "images",
					type: "image"
				},
        {
          id: 'overlay',
          match: 'flag',
					flag: '--overlay'
        }
			],
    });
  }

  async exec(message, { images, overlay }) {
    try {
      const attachment = await this.stepInShit(images, overlay);
      if (Buffer.byteLength(attachment) > 8e+6) return message.reply('Resulting image was above 8 MB.');
			return message.util.send({ files: [{ attachment, name: 'stepinshit.png' }] });
    } catch (e) {
      return message.reply(`Oh no, an error occurred: \`${e.message}\`. Try again later!`);
    }
  }

  async stepInShit(image, overlay) {
    const base = await loadImage(path.join(__dirname, '..', 'assets', 'images', 'stepinshit.png'));

		const data = await loadImage(image);
		const canvas = createCanvas(base.width, base.height);
		const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(0, 0, base.width, base.height);

    if (overlay) {
      ctx.drawImage(base, 0, 0, base.width, base.height);
    }

		ctx.rotate(-0.6);
		ctx.drawImage(data, -350, 800, 430, 170);
		ctx.rotate(0.6);

    if (!overlay) {
      ctx.drawImage(base, 0, 0, base.width, base.height);
    }

    return canvas.toBuffer();
  }
}