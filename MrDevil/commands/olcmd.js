const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'olcmd',
    aliases: ['onlinecmd'],
    description: 'List all online commands and disable them by replying with number',
    usage: 'olcmd',
    category: 'Admin',
    adminOnly: true,
    prefix: true
  },

  async run({ api, event, send, client, config }) {
    const uniqueCommands = new Map();
    for (const [name, cmd] of client.commands) {
      if (cmd.config && cmd.config.name) {
        if (!uniqueCommands.has(cmd.config.name)) {
          uniqueCommands.set(cmd.config.name, cmd.config);
        }
      }
    }

    const commandsArray = Array.from(uniqueCommands.values());
    const disabledCommands = config.DISABLED_COMMANDS || [];
    const onlineCommands = commandsArray.filter(cmd => !disabledCommands.includes(cmd.name));

    if (onlineCommands.length === 0) return send.reply('✨ No online commands found!');

    let msg = `
┍━━━━━━━━━━━━━━━━━━━━━━━━━┑
│    🌐 ONLINE COMMANDS    │
┝━━━━━━━━━━━━━━━━━━━━━━━━━┥
`;

    onlineCommands.forEach((cmd, idx) => {
      const num = String(idx + 1).padStart(2, '0');
      msg += `│  ◇ ${num} → ${cmd.name.padEnd(18)} │\n`;
    });

    msg += `┕━━━━━━━━━━━━━━━━━━━━━━━━━┙

📌 Reply with number to disable
💬 Example: 1 3 5 or 1,3,5`;

    return api.sendMessage(msg, event.threadID, (err, info) => {
      if (!err) {
        client.replies.set(info.messageID, {
          commandName: 'olcmd',
          author: event.senderID,
          data: onlineCommands.map(c => c.name)
        });
      }
    }, event.messageID);
  },

  async handleReply({ api, event, client, config, data, send }) {
    const { body } = event;
    const selections = body.split(/[\s,]+/).map(s => s.trim()).filter(s => s !== '');
    const disabledResults = [];
    const invalidResults = [];

    if (!config.DISABLED_COMMANDS) config.DISABLED_COMMANDS = [];

    for (const selection of selections) {
      const num = parseInt(selection);
      if (isNaN(num) || num < 1 || num > data.length) {
        invalidResults.push(selection);
        continue;
      }
      const commandToDisable = data[num - 1];
      if (!config.DISABLED_COMMANDS.includes(commandToDisable)) {
        config.DISABLED_COMMANDS.push(commandToDisable);
        disabledResults.push(commandToDisable);
      }
    }

    if (disabledResults.length > 0) {
      fs.writeJsonSync(path.join(process.cwd(), 'config.json'), config, { spaces: 2 });
      let response = `🔴 Disabled: ${disabledResults.join(', ')}`;
      if (invalidResults.length > 0) response += `\n⚠️ Invalid: ${invalidResults.join(', ')}`;
      return send.reply(response);
    } else if (invalidResults.length > 0) {
      return send.reply(`⚠️ Invalid numbers: ${invalidResults.join(', ')}`);
    }
  }
};
