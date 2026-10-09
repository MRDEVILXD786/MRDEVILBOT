const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { Jimp } = require("jimp");
const animateProgress = require('../../controller/utility/animateProgress');
const frames = require('../../controller/utility/frames');

const cacheDir = path.join(__dirname, "cache", "canvas");
const templateUrl = "https://i.ibb.co/wZG4X1yj/c823b74badfd.jpg";
const templatePath = path.join(cacheDir, "brother3_template.jpg");

const SETTINGS = {
  AVATAR_1: {
    W: 160,
    H: 218,
    X: 16,
    Y: 36
  },
  AVATAR_2: {
    W: 160,
    H: 215,
    X: 293,
    Y: 228
  }
};

const brotherMessages = [
  "𝐓𝐞𝐫𝐢 𝐌𝐞𝐫𝐢 𝐘𝐚𝐚𝐫𝐢 𝐒𝐚𝐛 𝐒𝐞 𝐏𝐲𝐚𝐫𝐢 ❤️😈",
  "𝐋𝐨𝐯𝐞 𝐘𝐨𝐮 𝐁𝐫𝐨 ❤️🖤",
  "𝐌𝐲 𝐁𝐫𝐨 𝐌𝐲 𝐁𝐞𝐬𝐭𝐢𝐞 ❤️✨",
  "𝐁𝐫𝐨𝐭𝐡𝐞𝐫𝐬 𝐅𝐨𝐫𝐞𝐯𝐞𝐫 ❤️👑",
  "𝐘𝐚𝐚𝐫𝐢 𝐇𝐨 𝐓𝐨 𝐀𝐢𝐬𝐢 ❤️😈",
  "𝐁𝐫𝐨𝐬 𝐓𝐢𝐥𝐥 𝐓𝐡𝐞 𝐄𝐧𝐝 ❤️🖤",
  "𝐌𝐲 𝐁𝐫𝐨𝐭𝐡𝐞𝐫 𝐌𝐲 𝐏𝐫𝐢𝐝𝐞 ❤️✨",
  "𝐑𝐢𝐝𝐞 𝐎𝐫 𝐃𝐢𝐞 𝐁𝐫𝐨 ❤️👑",
  "𝐋𝐨𝐲𝐚𝐥 𝐘𝐚𝐚𝐫 𝐋𝐨𝐲𝐚𝐥 𝐁𝐨𝐧𝐝 ❤️😈",
  "𝐀𝐥𝐰𝐚𝐲𝐬 𝐓𝐨𝐠𝐞𝐭𝐡𝐞𝐫 𝐁𝐫𝐨 ❤️🖤"
];

async function downloadTemplate() {
  fs.mkdirSync(cacheDir, { recursive: true });
  if (!fs.existsSync(templatePath)) {
    const res = await axios.get(templateUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(templatePath, Buffer.from(res.data));
  }
}

async function getAvatar(uid) {
  const res = await axios.get(
    `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
    { responseType: "arraybuffer" }
  );
  return Buffer.from(res.data);
}

async function makeRect(buffer, w, h) {
  const img = await Jimp.read(buffer);
  img.resize({ w, h });
  return img;
}

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: "brother3",
    aliases: ["bro3", "brotherforever", "loveyoubhai"],
    description: "Brother Forever pair image banao — rectangular avatar style.",
    usage: "brother3 [@mention / reply]",
    category: "Love",
    prefix: true,
    cooldowns: 5
  },
  async run({ api, event, send, Users, Currencies }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    // ── 10 coin cost ──────────────────────────────────────────
    const COST = 10;
    const userBal = await Currencies.getBalance(senderID);
    if (userBal < COST) {
      return send.reply(
        `╭─── « 𝗖𝗢𝗜𝗡𝗦 𝗞𝗔𝗠 𝗛𝗔𝗜𝗡 » ───⟡
` +
        `│
` +
        `│ ❌ Ye command 10 coins leta hai!
` +
        `│ 💰 Tumhare paas: ${userBal} coins
` +
        `│
` +
        `│ 💡 .work  → +10 coins
` +
        `│ 💡 .daily → +5 coins
` +
        `│
` +
        `╰───────────────⟡`
      );
    }
    await Currencies.removeBalance(senderID, COST);
    // ─────────────────────────────────────────────────────────


    const botID = api.getCurrentUserID();

    let one = senderID;
    let two = null;

    const mentionKeys = Object.keys(mentions || {});
    if (mentionKeys.length > 0) {
      two = mentionKeys[mentionKeys.length - 1];
    } else if (messageReply) {
      two = messageReply.senderID;
    } else {
      try {
        const threadInfo = await api.getThreadInfo(threadID);
        const members = threadInfo.participantIDs.filter(m => m !== senderID && m !== botID);
        if (members.length === 0) return send.reply("❌ Group mein koi aur member nahi!");
        two = members[Math.floor(Math.random() * members.length)];
      } catch {
        return send.reply("❌ Thread info load nahi ho saka. Kisi ko mention karo!");
      }
    }

    if (two === one) return send.reply("❌ Apne saath brother nahi ban sakte!");

    const { msgID: loadMsgID, done: animDone } = await animateProgress(api, threadID, messageID, '❤️', '𝐁𝐫𝐨𝐭𝐡𝐞𝐫 𝐅𝐨𝐫𝐞𝐯𝐞𝐫', 'brother3');

    try {
      await downloadTemplate();

      const [bufOne, bufTwo] = await Promise.all([getAvatar(one), getAvatar(two)]);
      const [rectOne, rectTwo] = await Promise.all([
        makeRect(bufOne, SETTINGS.AVATAR_1.W, SETTINGS.AVATAR_1.H),
        makeRect(bufTwo, SETTINGS.AVATAR_2.W, SETTINGS.AVATAR_2.H)
      ]);

      const template = await Jimp.read(templatePath);
      template.composite(rectOne, SETTINGS.AVATAR_1.X, SETTINGS.AVATAR_1.Y);
      template.composite(rectTwo, SETTINGS.AVATAR_2.X, SETTINGS.AVATAR_2.Y);

      const outputPath = path.join(cacheDir, `brother3_${one}_${two}_${Date.now()}.png`);
      await template.write(outputPath);

      const nameOne = await Users.getNameUser(one);
      const nameTwo = await Users.getNameUser(two);
      const msg = brotherMessages[Math.floor(Math.random() * brotherMessages.length)];

      await animDone;

      const frameMsg = `${msg}\n\n❤️ 𝐁𝐫𝐨 1: ${nameOne}\n•◦இ 𝐁𝐑𝐎𝐓𝐇𝐄𝐑 𝐅𝐎𝐑𝐄𝐕𝐄𝐑 இ◦•\n❤️ 𝐁𝐫𝐨 2: ${nameTwo}`;
      api.sendMessage(
        {
          body: frames.brother3(frameMsg),
          attachment: fs.createReadStream(outputPath),
          mentions: [
            { tag: nameOne, id: one },
            { tag: nameTwo, id: two }
          ]
        },
        threadID,
        () => { try { fs.unlinkSync(outputPath); } catch {} },
        messageID
      );

    } catch (err) {
      console.error("[brother3]", err);
      send.reply("❌ Image banana fail ho gaya: " + err.message);
    }
  }
};
