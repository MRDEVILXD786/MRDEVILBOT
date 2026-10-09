const axios = require('axios');
const moment = require('moment-timezone');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'welcome',
    eventType: 'log:subscribe',
    description: 'Welcome new members with a stylish message.'
  },
  async run({ api, event, Users, Threads, config }) {
    const { threadID, logMessageData } = event;
    const addedParticipants = logMessageData?.addedParticipants || [];
    const botID = api.getCurrentUserID();

    const settings = Threads.getSettings(threadID);
    if (settings.antijoin) {
      for (const p of addedParticipants) {
        if (p.userFbId === botID) continue;
        try { api.removeUserFromGroup(p.userFbId, threadID); } catch {}
      }
      return;
    }

    const newMembers = addedParticipants.filter(p => p.userFbId !== botID);
    if (!newMembers.length) return;

    const time = moment().tz(config.TIMEZONE || 'Asia/Karachi').format('hh:mm A | DD/MM/YYYY');

    for (const member of newMembers) {
      const isAdmin = config.ADMINBOT?.includes(member.userFbId);
      if (isAdmin) {
        api.sendMessage(
          `👑 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗠𝗬 𝗢𝗪𝗡𝗘𝗥 👑\n\n` +
          `🌹 ${member.fullName || 'Mr Devil'} 🌹\n\n` +
          `💖 Assalam o Alaikum Owner!\n` +
          `🤖 AP ka bot AP ka intezaar kar raha tha!`,
          threadID
        );
      }
    }

    let welcomeMsg = `╭──── 🎊 NEW MEMBER 🎊 ────╮\n`;

    const dbOps = [];
    for (let i = 0; i < newMembers.length; i++) {
      const member = newMembers[i];
      const name = member.fullName || 'New Member';
      welcomeMsg += `│\n│ 🎊 Welcome!\n│ 👤 ${name}\n│ 🆔 ${member.userFbId}\n`;
      dbOps.push(Users.create(member.userFbId, name));
    }

    welcomeMsg += `│\n│ 📅 ${time}\n│ 💡 Type ${config.PREFIX}help\n│ 🌟 Enjoy your stay!\n╰────────────────────────╯`;
    Promise.all(dbOps).catch(() => {});

    try {
      const GIF_URLS = [
        'https://i.ibb.co/WWRt2Vsy/2b3439f71d76.gif',
        'https://i.ibb.co/nNK2TX75/dc82e95aba67.gif'
      ];
      const gifUrl = GIF_URLS[Math.floor(Math.random() * GIF_URLS.length)];
      const gifRes = await axios.get(gifUrl, { responseType: 'stream', timeout: 8000 }).catch(() => null);
      if (gifRes?.data) {
        return api.sendMessage({ body: welcomeMsg, attachment: gifRes.data }, threadID);
      }
    } catch {}

    api.sendMessage(welcomeMsg, threadID);
  }
};
