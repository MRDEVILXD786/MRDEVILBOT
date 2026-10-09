const moment = require('moment-timezone');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'groupinfo',
    aliases: ['ginfo', 'threadinfo'],
    description: 'Show information about the current group.',
    usage: 'groupinfo',
    category: 'Group',
    prefix: true,
    groupOnly: true
  },
  async run({ api, event, send, config }) {
    const { threadID } = event;
    try {
      const info = await api.getThreadInfo(threadID);
      const time = moment().tz(config.TIMEZONE || 'Asia/Karachi').format('hh:mm A | DD/MM/YYYY');
      const admins = info.adminIDs?.length || 0;

      await send.reply(
        `╭─── 👥 GROUP INFO ───╮\n` +
        `│ 📛 Name: ${info.threadName || 'No name'}\n` +
        `│ 🆔 ID: ${threadID}\n` +
        `│ 👥 Members: ${info.participantIDs?.length || 0}\n` +
        `│ 👑 Admins: ${admins}\n` +
        `│ 🎨 Emoji: ${info.emoji || 'None'}\n` +
        `│ 📅 Checked: ${time}\n` +
        `╰─────────────────────╯`
      );
    } catch (e) {
      send.reply('❌ Failed to get group info: ' + e.message);
    }
  }
};
