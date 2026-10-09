const moment = require('moment-timezone');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'info',
    aliases: ['botinfo', 'about'],
    description: 'Show bot information.',
    usage: 'info',
    category: 'Utility',
    prefix: true
  },
  async run({ api, event, send, config, client, Users }) {
    const { senderID } = event;
    const userName = await Users.getNameUser(senderID);
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600), m = Math.floor((uptime % 3600) / 60), s = Math.floor(uptime % 60);
    const time = moment().tz(config.TIMEZONE || 'Asia/Karachi').format('hh:mm:ss A | DD/MM/YYYY');
    let cmdCount = 0;
    const seen = new Set();
    client.commands.forEach(c => { if (c.config?.name) seen.add(c.config.name.toLowerCase()); });
    cmdCount = seen.size;

    await send.reply(
      `╭─── 🤖 BOT INFORMATION ───╮\n` +
      `│\n` +
      `│ 🌟 ${config.BOTNAME || 'MR DEVIL BOT'}\n` +
      `│\n` +
      `│ 👑 Owner: MR DEVIL\n` +
      `│ 🔧 Prefix: ${config.PREFIX || '.'}\n` +
      `│ 📊 Commands: ${cmdCount}\n` +
      `│ ⚡ Events: ${client.events.size}\n` +
      `│ ⏰ Uptime: ${h}h ${m}m ${s}s\n` +
      `│ 📅 Time: ${time}\n` +
      `│ 💾 Node: ${process.version}\n` +
      `│ 🚀 FCA: MRDEVIL-FCA\n` +
      `│\n` +
      `│ 👤 User: ${userName}\n` +
      `╰──────────────────────────╯`
    );
  }
};
