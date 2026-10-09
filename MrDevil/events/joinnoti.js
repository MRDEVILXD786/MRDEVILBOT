const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const moment = require('moment-timezone');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'joinnoti',
    eventType: 'log:subscribe',
    version: '1.0.0',
    description: 'Send message when bot joins group and notify admin'
  },
  async run({ api, event, config }) {
    const { threadID, logMessageData } = event;
    const addedParticipants = logMessageData?.addedParticipants || [];
    const botID = api.getCurrentUserID();
    const botJoined = addedParticipants.some(p => p.userFbId === botID);
    if (!botJoined) return;

    try {
      const botnick = config.BOTNICK || config.BOTNAME || "bot";
      try {
        await api.changeNickname(botnick, threadID, botID);
      } catch (e) {}

      let threadName = "Unknown Group";
      try {
        const info = await api.getThreadInfo(threadID);
        threadName = info.threadName || "Unknown Group";
      } catch (e) {}

      const msg1 = "Hello Everyone🙋‍♂️ 𝐁𝐨𝐭 𝐢𝐬 𝐍𝐨𝐰 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐞𝐝⛓️";
      const msg2 = `┏━━━━ ⚡ 𝐌𝐑 𝐃𝐄𝐕𝐈𝐋 𝐁𝐎𝐓 ⚡ ━━━━┓
┃
┃   🌹 ꧁ 𝐌𝐑 𝐃𝐄𝐕𝐈𝐋 ꧂ 🌹
┃
┃   ✨ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 ✨
┃
┃ 🕊️ 𝑴𝒚 𝑶𝒘𝒏𝒆𝒓 𝒊𝒔 𝑴𝒓 𝑫𝒆𝒗𝒊𝒍...
┃ 📱 𝑰𝒔𝒔𝒖𝒆𝒔? 𝑻𝒚𝒑𝒆: ${config.PREFIX}call
┃
┃ 👑 【 𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎 】 👑
┃ 👤 𝐍𝐚𝐦𝐞: Mr Devil
┃
┃ ⚠️ 【 𝐈𝐌𝐏𝐎𝐑𝐓𝐀𝐍𝐓 】 ⚠️
┃ 📍 Bot ID active for 5 days.
┃ 📍 Add developer to keep bot.
┃ 📍 Contact for custom bots.
┃
┃ 💖 𝑻𝒉𝒂𝒏𝒌𝒔 𝑭𝒐𝒓 𝑼𝒔𝒊𝒏𝒈 𝑴𝑹 𝑫𝑬𝑽𝑰𝑳 𝑩𝒐𝒕
┃
┗━━━━━━━━━━━━━━━━━━━┛
      🎀🧸🌸 𝐌𝐑 𝐃𝐄𝐕𝐈𝐋 🌸🧸🎀`;

      const videoPath = path.join(__dirname, "cache", "botjoin.mp4");

      try { await api.sendMessage(msg1, threadID); } catch {}
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        if (fs.existsSync(videoPath)) {
          await api.sendMessage({
            body: msg2,
            attachment: fs.createReadStream(videoPath)
          }, threadID);
        } else {
          await api.sendMessage(msg2, threadID);
        }
      } catch (err) {
        console.log("Video send error:", err.message);
        try { await api.sendMessage(msg2, threadID); } catch {}
      }

      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);

      const freeMem = os.freemem();
      const totalMem = os.totalmem();
      const ramUsage = ((totalMem - freeMem) / 1024 / 1024 / 1024).toFixed(2);
      const ramTotal = (totalMem / 1024 / 1024 / 1024).toFixed(2);

      const NOTIFY_GROUP = config.NOTIFY_TID;

      const adminMsg = `╭─────────────────╮̩̩̩̩̩̩̩̩
│ 🟢 BOT ADDED TO GROUP 
├─────────────────┤
│ 🏠 Group: ${threadName}
│ 🆔 TID: ${threadID}
├─────────────────┤
│ 📊 [ Bot Health ]
│ ⏳ Uptime: ${hours}h ${minutes}m
│ 🧠 RAM: ${ramUsage}GB / ${ramTotal}GB
│ 🚀 Status: Healthy
│ ⏰ ${moment().tz('Asia/Karachi').format('hh:mm:ss A')}
╰─────────────────╯`;

      if (NOTIFY_GROUP) {
        try {
          await api.sendMessage(adminMsg, NOTIFY_GROUP);
        } catch (err) {
          console.log("Admin notification error:", err.message);
        }
      }
    } catch (globalErr) {
      console.log("Global joinNoti error:", globalErr.message);
    }
  }
};