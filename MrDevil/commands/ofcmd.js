const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'ofcmd',
    aliases: ['offlinecmd'],
    description: 'List all offline/disabled commands and enable them by replying with number',
    usage: 'ofcmd',
    category: 'Admin',
    adminOnly: true,
    prefix: true
  },

  async run({ api, event, send, client, config }) {
    const disabledCommands = config.DISABLED_COMMANDS || [];
    if (disabledCommands.length === 0) return send.reply('✨ No offline commands found!');

    let msg = `
┏━━━━━━━━━━━━━━━━━━━━━━┓
┃   🌑 OFFLINE CMDS 🌑  ┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
`;

    disabledCommands.forEach((cmd, idx) => {
      msg += `┃  ⚡ ${String(idx + 1).padStart(2, '0')} │ ${cmd.padEnd(18)} ┃\n`;
    });

    msg += `┗━━━━━━━━━━━━━━━━━━━━━━┛

💡 Type the number(s) to enable them!
📝 Example: 1 2 3 or 1,2,3`;

    return api.sendMessage(msg, event.threadID, (err, info) => {
      if (!err) {
        client.replies.set(info.messageID, {
          commandName: 'ofcmd',
          author: event.senderID,
          data: disabledCommands
        });
      }
    }, event.messageID);
  },

  async handleReply({ api, event, client, config, data, send }) {
    const { body } = event;
    const selections = body.split(/[\s,]+/).map(s => s.trim()).filter(s => s !== '');
    const enabledResults = [];
    const invalidResults = [];

    for (const selection of selections) {
      const num = parseInt(selection);
      if (isNaN(num) || num < 1 || num > data.length) {
        invalidResults.push(selection);
        continue;
      }
      const commandToEnable = data[num - 1];
      config.DISABLED_COMMANDS = config.DISABLED_COMMANDS.filter(c => c !== commandToEnable);
      enabledResults.push(commandToEnable);
    }

    if (enabledResults.length > 0) {
      fs.writeJsonSync(path.join(process.cwd(), 'config.json'), config, { spaces: 2 });
      let response = `✅ Enabled: ${enabledResults.join(', ')}`;
      if (invalidResults.length > 0) response += `\n❌ Invalid: ${invalidResults.join(', ')}`;
      return send.reply(response);
    } else if (invalidResults.length > 0) {
      return send.reply(`❌ Invalid numbers: ${invalidResults.join(', ')}`);
    }
  }
};
