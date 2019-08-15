const Command = require('../../struct/Command');

module.exports = class CODMW3Command extends Command {
  constructor() {
    super('callOfDutyModernWarfare3', {
      category: 'Game Server Statistics',
      aliases: ["callOfDutyModernWarfare3", "codmw3"],
      clientPermissions: ['EMBED_LINKS'],
      description: 'Get stats of any Call of Duty: Modern Warfare 3 game server.',
      args: [
        {
          id: 'IP',
          prompt: {
            start: 'Which server would you like to get `Call of Duty: Modern Warfare 3` statistics from?',
            retry: 'That\'s not a server we can get stats from! Try again.'
          },
          type: 'externalIP',
          match: 'content'
        }
      ]
    });

    this.examples = ['callOfDutyModernWarfare3 139.59.31.129:27019'];
  }

  async exec(message, { IP }) {
    let {embed, data} = await this.gameDigServer('codmw3', IP)
    embed
      .setColor("#739B19")
      .setThumbnail('http://icons.iconarchive.com/icons/3xhumed/call-of-duty-modern-warfare-3/512/CoD-Modern-Warfare-3-1a-icon.png');

    let text = `Information on the "${data.name}" Call of Duty: Modern Warfare 3 server`;
    if (message.guild)
      text += `, requested by ${message.member.displayName}`

    message.util.send(text, {embed});
  }
};