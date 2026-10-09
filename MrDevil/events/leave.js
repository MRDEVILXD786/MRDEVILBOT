const moment = require('moment-timezone');
const os = require('os');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'leave',
    eventType: 'log:unsubscribe',
    description: 'Member leave/bot remove detection with NOTIFY_TID alert.'
  },
  async run({ api, event, Users, config }) {
    const { threadID, logMessageData } = event;
    const leftParticipants = logMessageData?.leftParticipants || [];
    const botID = api.getCurrentUserID();
    const time = moment().tz(config.TIMEZONE || 'Asia/Karachi').format('hh:mm A | DD/MM/YYYY');
    const notifyTid = config.NOTIFY_TID;

    for (const member of leftParticipants) {

      if (String(member.userFbId) === String(botID)) {
        if (!notifyTid) continue;
        let groupName = 'Unknown Group';
        try {
          const info = await new Promise((res, rej) => api.getThreadInfo(threadID, (e, d) => e ? rej(e) : res(d)));
          groupName = info.threadName || 'Unknown Group';
        } catch {}

        const uptime = process.uptime();
        const h = Math.floor(uptime / 3600);
        const m = Math.floor((uptime % 3600) / 60);
        const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
        const totalRam = (os.totalmem() / 1024 / 1024).toFixed(1);

        const wasKicked = logMessageData?.leftParticipants?.some?.(p => p.leftBy && String(p.leftBy) !== String(botID));
        const action = wasKicked ? '🔴 BOT KICKED' : '🚪 BOT LEFT';
        const emoji  = wasKicked ? '👢 Kick kiya gaya!' : '🚪 Khud left kiya';

        try {
          await api.sendMessage(
            `╭─── « ${action} » ───⟡\n│\n│ ${emoji}\n│\n│ ◈ 🏠 Group  : ${groupName}\n│ ◈ 🆔 TID    : ${threadID}\n│ ◈ ⏰ Time    : ${time}\n│\n│ 📊 Bot Health\n│ ◈ ⏱️ Uptime : ${h}h ${m}m\n│ ◈ 💾 RAM    : ${ram}/${totalRam} MB\n│\n│ 👑 MR DEVIL BOT\n╰───────────────⟡`,
            notifyTid
          );
        } catch {}
        continue;
      }

      const name = member.fullName || await Users.getNameUser(member.userFbId).catch(() => 'Unknown');
      api.sendMessage(
        `╭─── « 🌅 MEMBER LEFT » ───⟡\n│\n│ 👤 ${name}\n│ 🏷️ ID: ${member.userFbId}\n│ ⏰ ${time}\n│\n│ 💫 Thanks for being with us!\n│ 🌸 Take care!\n│\n╰───────────────⟡`,
        threadID
      );
    }
  }
};
