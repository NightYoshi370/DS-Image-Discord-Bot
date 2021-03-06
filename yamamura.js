try { require('cache-require-paths'); } catch {}

require("./utils/extraFunctions.js");

const { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } = require('discord-akairo');
const config = require("./config.js");
const List = require("list-array");
const BackEmbed = require('./embed.js');

require("./struct/DMChannel.js");
require("./struct/TextChannel.js");

console.logs = {
	log: [],
	err: [],
};

// This is used to debug the errors.
// Defaults to 20 lines max
const util = require('util');
var logStdout = process.stdout;
var logStderr = process.stderr;

console.log = function () {
	console.logs.log.push(util.format.apply(null, arguments));
	logStdout.write(util.format.apply(null, arguments) + '\n');
	if (console.logs.log.length > 20) console.logs.log.shift();
}
console.error = function () {
	console.logs.err.push(util.format.apply(null, arguments));
	logStderr.write(util.format.apply(null, arguments) + '\n');
	if (console.logs.err.length > 20) console.logs.err.shift();
}


class YamamuraClient extends AkairoClient {
	constructor() {
		super({
			ownerID: config.owners,
		}, {
			disableEveryone: true,
			disabledEvents: ['TYPING_START'],
			partials: ['MESSAGE', 'CHANNEL']
		});

		this.db = require('./utils/database.js');
		this.supportServer = config.supportServer;

		this.commandHandler = new CommandHandler(this, {
			directory: './commands/',
			prefix: 'time!',
			handleEdits: true,
			commandUtil: true,
			commandUtilLifetime: 300000,
			storeMessages: true,
			allowMention: true,
			argumentDefaults: {
				prompt: {
					modifyStart: (message, text) => text && `${message.author} **::** ${text}\n` + "Type `cancel` to cancel this command.",
					modifyRetry: (message, text) => text && `${message.author} **::** ${text}\n` + "Type `cancel` to cancel this command.",
					timeout: message => `${message.author} **::** ` + "Time ran out, command has been cancelled.",
					ended: message => `${message.author} **::** ` + "Too many retries, command has been cancelled.",
					cancel: message => `${message.author} **::** ` + "Command has been cancelled.",
					retries: 4,
					time: 30000
				}
			}
		})

		this.commandHandler.resolver.addTypes(require('./utils/types.js'));
		this.commandHandler.games = new Map();

		this.inhibitorHandler = new InhibitorHandler(this, { directory: './inhibitors/' });
		this.listenerHandler = new ListenerHandler(this, { directory: './events/' }).setEmitters({
			process: process,
			inhibitorHandler: this.inhibitorHandler
		});

		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.listenerHandler.load(process.cwd() +'/events/botHandler/ready.js');

		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.inhibitorHandler.loadAll();

		this.util.embed = () => {return new BackEmbed();}
	};
}

const client = new YamamuraClient();
client.login(config.token);

function isEmpty(value) { //Function to check if value is really empty or not
	return (value == null || value.length === 0);
}

global.List = List;
module.exports = client;
