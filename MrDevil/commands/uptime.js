const moment = require('moment-timezone');

const sleep   = ms => new Promise(r => setTimeout(r, ms));
const editMsg = (api, text, msgID) => { try { api.editMessage(text, msgID); } catch {} };
const sendMsg = (api, text, threadID, replyTo) => new Promise(r => api.sendMessage(text, threadID, (e, i) => r(i), replyTo));

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'uptime',
    aliases: ['upt', 'runtime'],
    description: 'Bot kab se chal raha hai dekho.',
    usage: 'uptime',
    category: 'Utility',
    prefix: true
  },

  async run({ api, event, config }) {
    const { threadID, messageID } = event;

    const sent = await sendMsg(api,
      `╭─── « ⏰ UPTIME » ───⟡\n│\n│ ⌛ ▱▱▱▱▱▱▱▱▱▱ 𝟬%\n│    Starting...\n│\n╰───────────────⟡`,
      threadID, messageID
    );

    await sleep(700);
    await editMsg(api,
      `╭─── « ⏰ UPTIME » ───⟡\n│\n│ 🔄 ▰▰▰▰▰▱▱▱▱▱ 𝟱𝟬%\n│    Fetching system data...\n│\n╰───────────────⟡`,
      sent.messageID
    );

    await sleep(700);

    const uptime = process.uptime();
    const h   = Math.floor(uptime / 3600);
    const m   = Math.floor((uptime % 3600) / 60);
    const s   = Math.floor(uptime % 60);
    const time = moment().tz(config.TIMEZONE || 'Asia/Karachi').format('hh:mm:ss A | DD/MM/YYYY');
    const mem  = process.memoryUsage();
    const memMB = (mem.heapUsed / 1024 / 1024).toFixed(1);
    const totalMB = (require('os').totalmem() / 1024 / 1024).toFixed(1);

    await editMsg(api,
      `╭─── « ⏰ UPTIME INFO » ───⟡\n` +
      `│\n` +
      `│ ✅ ▰▰▰▰▰▰▰▰▰▰ 𝟭𝟬𝟬%\n` +
      `│\n` +
      `│ ◈ 🕐 Uptime : ${h}h ${m}m ${s}s\n` +
      `│ ◈ 📅 Date   : ${time}\n` +
      `│ ◈ 💾 RAM    : ${memMB} / ${totalMB} MB\n` +
      `│ ◈ 🖥️ Node   : ${process.version}\n` +
      `│ ◈ 🌟 Owner  : MR DEVIL\n` +
      `│\n` +
      `│ 👑 MR DEVIL BOT\n` +
      `╰───────────────⟡`,
      sent.messageID
    );
  }
};
