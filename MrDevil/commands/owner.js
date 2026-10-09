const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'owner',
    aliases: ['dev', 'creator', 'ownerinfo', 'developer'],
    description: 'Show bot owner information',
    usage: 'owner',
    category: 'Info',
    prefix: false
  },

  async run({ api, event, send, config }) {
    const { threadID } = event;

    const ownerName = config.AI_OWNER || config.BOTNAME;
    const botName = config.BOTNAME;
    const prefix = config.PREFIX || '.';
    const adminID = config.ADMINBOT?.[0] || null;

    const ownerPics = [
      'https://i.ibb.co/6ckwbv4V/06291e1dc09d.jpg'
    ];

    const randomPic = ownerPics[Math.floor(Math.random() * ownerPics.length)];

    const ownerInfo = `
✨ ━━━━━━━━━━━━━━━━━━━ ✨
       👑 𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎 👑
✨ ━━━━━━━━━━━━━━━━━━━ ✨

┌──────────────────────┐
│  👤 ɴᴀᴍᴇ            │
│  ➤ ${ownerName.padEnd(18)}│
└──────────────────────┘

┌──────────────────────┐
│  🤖 ʙᴏᴛ ᴅᴇᴛᴀɪʟꜱ     │
└──────────────────────┘

  📛 ɴᴀᴍᴇ: ${botName}
  ⌨️ ᴘʀᴇꜰɪx: ${prefix}
  📦 ᴠᴇʀꜱɪᴏɴ: 2.0.0
  🛠️ ꜰʀᴀᴍᴇᴡᴏʀᴋ: MRDEVIL-FCA v2

✨ ━━━━━━━━━━━━━━━━━━━ ✨
   💝 𝐓𝐡𝐚𝐧𝐤𝐬 𝐟𝐨𝐫 𝐔𝐬𝐢𝐧𝐠 💝
✨ ━━━━━━━━━━━━━━━━━━━ ✨`.trim();

    try {
      const cacheDir = path.join(__dirname, 'cache');
      fs.ensureDirSync(cacheDir);
      const imgPath = path.join(cacheDir, `owner_${Date.now()}.jpg`);

      const response = await axios.get(randomPic, { responseType: 'arraybuffer', timeout: 15000 });
      fs.writeFileSync(imgPath, Buffer.from(response.data));

      await api.sendMessage({ body: ownerInfo, attachment: fs.createReadStream(imgPath) }, threadID);
      try { fs.unlinkSync(imgPath); } catch {}

      if (adminID) {
        const contactMsg = "╭──────◇──────╮\n   👑 OWNER 👑\n╰──────◇──────╯\n\nOwner Profile:";
        return api.shareContact(contactMsg, adminID, threadID);
      }
    } catch {
      return send.reply(ownerInfo);
    }
  }
};
