module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'cmd',
    aliases: ['commandlist', 'allcmds'],
    description: 'Show all commands in one list.',
    usage: 'cmd',
    category: 'Utility',
    prefix: true
  },
  async run({ event, send, client, config }) {
    const seen = new Set();
    const cmds = [];
    client.commands.forEach(c => {
      if (c.config?.name && !seen.has(c.config.name)) {
        seen.add(c.config.name);
        cmds.push(c.config.name);
      }
    });

    const half = Math.ceil(cmds.length / 2);
    let msg = `╭─── 📋 ALL COMMANDS (${cmds.length}) ───╮\n│\n`;
    cmds.forEach((c, i) => { msg += `│ ${config.PREFIX}${c}\n`; });
    msg += `│\n│ Total: ${cmds.length} commands\n│ Prefix: ${config.PREFIX}\n╰──────────────────────────────╯`;

    send.reply(msg);
  }
};
