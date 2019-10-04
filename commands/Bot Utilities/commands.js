const Command = require('../../struct/Command');

const fs = require('fs')
const path = require('path')

module.exports = class CommandsCommand extends Command {
	constructor() {
		super('commands', {
			aliases: ['commands', "cmds", 'コマンド'],
			category: 'Bot Utilities',
			clientPermissions: ['EMBED_LINKS'],
			description: {
				content: 'Sends information on bot commands.'
			},
			args: [
				{
					id: 'commandName',
					type: 'string',
					default: null,
					match: "content"
				}
			]
		});
	}

	async exec(msg, { commandName }) {
		const __ = (k, ...v) => global.getString(msg.author.lang, k, ...v);
		let embed = this.client.util.embed()

		let description;
		let command;

		let categories = Array.from(this.client.commandHandler.categories.entries());
		let cats = categories.map(arr => arr[1]).sort((c1, c2) => c1.id.localeCompare(c2.id));

		let cmds = cats.map(cat => Array.from(cat.entries()).map(c => c[1])).flat();

		if (this.isGood(commandName)) {
			let commandExists = this.client.commandHandler.aliases.get(commandName);
			if (this.isGood(commandExists)) {
				command = this.client.commandHandler.modules.get(commandExists);
				if (command.description) {
					description = command.description
					if (command.description.content)
						description = command.description.content;
				}

				if (command.aliases && command.aliases.filter && command.aliases.filter(al => al !== command.id).length)
					embed.addField(__("Aliases"), command.aliases.filter(al => al !== command.id).map(alias => `\`${alias}\``).join(", "))

				if (command.category)
					embed.addInline(__("Category"), __(command.category.id))

				let usage;
				if (command.description && command.description.usage)	usage = command.description.usage;
				if (command.usage)										usage = command.usage;

				if (usage)
					embed.addField(__("Usage"), `\`${usage}\``)

				if (command.args) {
					for (var arg of command.args) {
						if (!arg.description) {
							switch (arg.id) {
								case 'IP':
									arg.description = "This is the server's IP address.";
									break;
								case 'images':
									arg.description = 'These are the images for the command. This can be either attachments, user mentions, user IDs, user names, links or if the channel has an image posted beforehand within the past 50 messages: none. If you use multiple links and/or attachments, you can even layer the image.';
									break;
							}
						}
					}

					embed.addField("Command Arguments", command.args.map(arg => `**${arg.id}** - ${arg.description}`).join("\n"))
				}

				let commandPermissions = [];
				if (this.isGood(command.userPermissions)) {
					if (typeof command.userPermissions == 'function')
						commandPermissions.push("Special Case");
					else
						command.userPermissions.forEach(perm => commandPermissions.push('`' + perm + '`'))
				}

				switch (command.channel) {
					case 'guild':
						commandPermissions.push(__('Server Only'));
						break;
					case 'dm':
						commandPermissions.push(__('Direct Messages Only'));
						break;
				}

				if (command.ownerOnly)
					commandPermissions.push(__('Owner only'));

				if (this.isGood(commandPermissions))
					embed.addInline('Restrictions', commandPermissions.join(' | '));

				let examples;
				if (command.description && command.description.examples)	examples = command.description.examples;
				if (command.examples)										examples = command.examples;

				if (examples)
					embed.addField(__("Examples"), (typeof examples == 'string' ? `\`${examples}\`` : examples.map(example => "`" + example + "`").join("\n")))

				let exmplist = fs.readdirSync(path.join(process.cwd(), 'website', 'public', 'examples'));
				let iconlist = fs.readdirSync(path.join(process.cwd(), 'website', 'public', 'icons'));

				if (exmplist.filter(item => item === `${command.id}.png`).length)
					embed.setImage(`${this.client.website.URL}/examples/${command.id}.png`);

				if (iconlist.filter(item => item === `${command.id}.png`).length)
					embed.setThumbnail(`${this.client.website.URL}/icons/${command.id}.png`);

				return msg.channel.send(command.id + (description ? ': ' + (description.join ? description.map(d => __(d)).join(" - ") : __(description)) : ''), {embed});
			}

			let category = this.client.commandHandler.categories.get(titleCase(__(commandName)))
			if (!this.isGood(category))
				category = this.client.commandHandler.categories.get(titleCase(commandName))

			if (!this.isGood(category))
				return msg.util.send(__("Invalid command/category name. Please try again"));

			let commands = cmds && cmds.filter ? cmds.filter(c => c.category.id == category).sort((a, b) => a.id.localeCompare(b.id)) : cmds;
			let makeFields = commands.length < 20;

			description = "";

			let commandList = [];
			commands.forEach(command => {
				description = "";

				if (!makeFields) {
					description += `**${command.id}**`;

					if (command.description) {
						description += ': ';

						if (command.description.content)
							description += (command.description.content.join ? command.description.content.map(d => __(d)).join("\n") : __(command.description.content));
						else {
							description += (command.description.join ? command.description.map(d => __(d)).join("\n") : __(command.description));
						}
					}

					commandList.push(description)
				} else {
					if (command.description) {
						if (command.description.content)
							description += (command.description.content.join ? command.description.content.map(d => __(d)).join("\n") : __(command.description.content));
						else
							description += (command.description.join ? command.description.map(d => __(d)).join("\n") : __(command.description));
					}

					embed.addField(command.id, description || __(command.description.content ? command.description.content : command.description) || __('No description available'))
				}
			});

			if (commands.length > 0) {
				if (!makeFields)
					embed.setDescription(commandList.join('\n'))

				embed.setFooter(__("Total Commands in this category: {0}", commands.length));

				if (category.color)
					embed.setColor(category.color)

				return msg.channel.send(__("Category listing: {0}", __(category.id)), embed);
			}
		} else {
			// General command listing
			// {id: <name>, aliases: [<name>, <name>...], description: <desc>, category.id: <category>}
			let prefix = await this.handler.prefix(msg);
			let text = __("{0}'s Command Listing", this.client.user.username) + "\n\n"
					 + __("To view a list of all the commands, please go to our website's command page: {0}", `${this.client.website.URL}/commands`) + " \n"
					 + __("To view a list of a command of a specific category, type `{0}commands (category name)`.", prefix)

			cats.forEach(category => {
				let catCmds = cmds.filter(c => c.category.id == category).sort((a, b) => a.id.localeCompare(b.id));
				if (catCmds.length > 0) embed.addInline(`${__(category.id)} [${catCmds.length}]`, category.description ? __(category.description) : __('No description available.'));
			});

			embed.setFooter(__("Total Commands: {0}", cmds.length));

			return msg.util.send(text, embed);
		}
	}
};

// Polyfill
if (!Array.prototype.flat) {
	Array.prototype.flat = function() {
		var depth = arguments[0];
		depth = depth === undefined ? 1 : Math.floor(depth);
		if (depth < 1)
			return Array.prototype.slice.call(this);

		return (function flat(arr, depth) {
			var len = arr.length >>> 0;
			var flattened = [];
			var i = 0;
			while (i < len) {
				if (i in arr) {
					var el = arr[i];
					if (Array.isArray(el) && depth > 0)
						flattened = flattened.concat(flat(el, depth - 1));
					else
						flattened.push(el);
				}
				i++;
			}
			return flattened;
		})(this, depth);
	};
}

function isEmpty(value) { //Function to check if value is really empty or not
	return (value == null || value.length === 0);
}

function titleCase(str) {
	str = str.toLowerCase().split(' ');
	let final = [];
	for (let word of str) {
		final.push(word.charAt(0).toUpperCase() + word.slice(1));
	}
	return final.join(' ')
}
