module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'reload',
    aliases: ['load', 'rl'],
    description: "Reload bot commands and configurations.",
    usage: 'reload [command/event name] | reload all | reload events | reload cmds',
    category: 'Admin',
    adminOnly: true,
    prefix: true
  },

  async run({ api, event, args, send, client }) {
    const { loadCommands, loadEvents, reloadCommand, reloadEvent, loadNewCommand } = require('../../controller/system/handle/handleRefresh');
    const path = require('path');

    const commandsPath = path.join(__dirname);
    const eventsPath = path.join(__dirname, '../events');

    const target = args[0]?.toLowerCase();
    const secondArg = args[1]?.toLowerCase();

    const getUniqueCount = () => {
      const unique = new Set();
      client.commands.forEach(cmd => {
        if (cmd.config && cmd.config.name) unique.add(cmd.config.name.toLowerCase());
      });
      return unique.size;
    };

    if (!target) {
      return send.reply(
        `╭─────────────╮\n` +
        `       🔄 𝐒𝐘𝐒𝐓𝐄𝐌 𝐑𝐄𝐋𝐎𝐀𝐃\n` +
        `╰─────────────╯\n\n` +
        `┏━━━━━━━━━━━━━━┓\n` +
        `┃ 📂 .reload all      ┃\n` +
        `┃ 📦 .reload cmds     ┃\n` +
        `┃ 📡 .reload events   ┃\n` +
        `┃ 🎯 .reload [name]   ┃\n` +
        `┃ ✨ .reload new [name] ┃\n` +
        `┗━━━━━━━━━━━━━━┛\n\n` +
        `📊 𝐒𝐭𝐚𝐭𝐢𝐬𝐭𝐢𝐜𝐬:\n` +
        `┣ 📦 Commands: ${getUniqueCount()}\n` +
        `┗ 📡 Events: ${client.events.size}\n` +
        `━━━━━━━━━━━━━━━`
      );
    }

    if (target === 'all') {
      await loadCommands(client, commandsPath);
      await loadEvents(client, eventsPath);
      return send.reply(
        `╭─────────────╮\n` +
        `       ✅ 𝐅𝐔𝐋𝐋 𝐑𝐄𝐋𝐎𝐀𝐃\n` +
        `╰─────────────╯\n` +
        `✨ All systems updated!\n\n` +
        `📊 𝐍𝐞𝐰 𝐒𝐭𝐚𝐭𝐬:\n` +
        `┣ 📦 Commands: ${getUniqueCount()}\n` +
        `┗ 📡 Events: ${client.events.size}\n` +
        `━━━━━━━━━━━━━━━`
      );
    }

    if (target === 'commands' || target === 'cmds' || target === 'cmd') {
      const result = await loadCommands(client, commandsPath);
      if (result.success) {
        return send.reply(
          `╭─────────────╮\n` +
          `       📦 𝐂𝐌𝐃𝐒 𝐑𝐄𝐋𝐎𝐀𝐃\n` +
          `╰─────────────╯\n` +
          `✨ Command module refreshed!\n\n` +
          `📊 Total: ${getUniqueCount()} unique\n` +
          `━━━━━━━━━━━━━━━`
        );
      }
      return send.reply(`❌ Error: ${result.error}`);
    }

    if (target === 'events' || target === 'evt') {
      const result = await loadEvents(client, eventsPath);
      if (result.success) {
        return send.reply(
          `╭─────────────╮\n` +
          `       📡 𝐄𝐕𝐓𝐒 𝐑𝐄𝐋𝐎𝐀𝐃\n` +
          `╰─────────────╯\n` +
          `✨ Event module refreshed!\n\n` +
          `📊 Total: ${client.events.size} events\n` +
          `━━━━━━━━━━━━━━━`
        );
      }
      return send.reply(`❌ Error: ${result.error}`);
    }

    if (target === 'event' && secondArg) {
      const result = await reloadEvent(client, eventsPath, secondArg);
      if (result.success) {
        return send.reply(
          `╭─────────────╮\n` +
          `       📡 𝐄𝐕𝐄𝐍𝐓 𝐑𝐄𝐋𝐎𝐀𝐃\n` +
          `╰─────────────╯\n` +
          `✨ Event [${result.name}] updated!\n` +
          `━━━━━━━━━━━━━━━`
        );
      }
      return send.reply(`❌ ${result.error}`);
    }

    if (target === 'new' && secondArg) {
      const result = await loadNewCommand(client, commandsPath, secondArg);
      if (result.success) {
        return send.reply(
          `╭─────────────╮\n` +
          `       ✨ 𝐍𝐄𝐖 𝐋𝐎𝐀𝐃𝐄𝐃\n` +
          `╰─────────────╯\n` +
          `✨ New command [${result.name}] is live!\n\n` +
          `📊 Total: ${getUniqueCount()}\n` +
          `━━━━━━━━━━━━━━━`
        );
      }
      return send.reply(`❌ ${result.error}`);
    }

    const result = await reloadCommand(client, commandsPath, target);
    if (result.success) {
      return send.reply(
        `╭─────────────╮\n` +
        `       📦 𝐂𝐌𝐃 𝐑𝐄𝐋𝐎𝐀𝐃\n` +
        `╰─────────────╯\n` +
        `✨ Command [${result.name}] updated!\n` +
        `━━━━━━━━━━━━━━━`
      );
    }
    return send.reply(`❌ ${result.error}`);
  }
};
