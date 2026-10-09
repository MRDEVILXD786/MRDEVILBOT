const path = require('path');
const fs = require('fs-extra');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'prefix',
    aliases: ['setprefix', 'changeprefix'],
    description: 'Bot ka current prefix dikhao ya change karo.',
    usage: 'prefix | prefix [naya_prefix]',
    category: 'Info',
    prefix: 'both'
  },

  async run({ event, args, send, config, isAdmin }) {
    const { body } = event;
    const currentPrefix = config.PREFIX || '.';

    if (!args[0]) {
      return send.reply(
        `╭──── 🔧 BOT PREFIX ────╮\n` +
        `│\n` +
        `│  📌 Current Prefix : ${currentPrefix}\n` +
        `│\n` +
        `│  💡 Example:\n` +
        `│     ${currentPrefix}help  →  sab commands\n` +
        `│     ${currentPrefix}ping  →  bot check\n` +
        `│     ${currentPrefix}ai    →  AI chat\n` +
        `│\n` +
        `│  👑 Admin prefix change:\n` +
        `│     ${currentPrefix}prefix [naya]\n` +
        `│\n` +
        `╰────────────────────╯`
      );
    }

    if (!isAdmin) {
      return send.reply(
        `╭──── ❌ ACCESS DENIED ────╮\n` +
        `│\n` +
        `│  🚫 Prefix change sirf\n` +
        `│     Bot Admin kar sakta hai!\n` +
        `│\n` +
        `│  📌 Current Prefix : ${currentPrefix}\n` +
        `│\n` +
        `╰─────────────────────────╯`
      );
    }

    const newPrefix = args[0].trim();
    if (newPrefix.length > 5) {
      return send.reply(
        `╭──── ❌ ERROR ────╮\n` +
        `│\n` +
        `│  Prefix max 5 characters\n` +
        `│  ka hona chahiye!\n` +
        `│\n` +
        `╰──────────────────╯`
      );
    }

    config.PREFIX = newPrefix;
    global.config.PREFIX = newPrefix;
    try {
      const configPath = path.join(__dirname, '../../config.json');
      const cfg = fs.readJsonSync(configPath);
      cfg.PREFIX = newPrefix;
      fs.writeJsonSync(configPath, cfg, { spaces: 2 });
    } catch {}

    send.reply(
      `╭──── ✅ PREFIX CHANGED ────╮\n` +
      `│\n` +
      `│  📌 Naya Prefix : ${newPrefix}\n` +
      `│\n` +
      `│  💡 Ab aise use karo:\n` +
      `│     ${newPrefix}help\n` +
      `│     ${newPrefix}ping\n` +
      `│\n` +
      `╰───────────────────────────╯`
    );
  }
};
