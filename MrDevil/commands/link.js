const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { Jimp } = require("jimp");

const cacheDir = path.join(__dirname, "cache", "canvas");
const templatePath = path.join(cacheDir, "pair4_template.png");

const SETTINGS = {
  AVATAR_1: {
    SIZE: 245,
    X: 48,
    Y: 68
  },
  AVATAR_2: {
    SIZE: 245,
    X: 428,
    Y: 68
  }
};

const loveMessages = [
  "💘 𝐓𝐮𝐦 𝐌𝐞𝐫𝐞 𝐃𝐢𝐥 𝐊𝐢 𝐃𝐡𝐚𝐝𝐤𝐚𝐧 𝐇𝐨 💘",
  "💞 𝐇𝐚𝐦𝐞𝐬𝐡𝐚 𝐓𝐮𝐦𝐡𝐚𝐫𝐞 𝐒𝐚𝐚𝐭𝐡 𝐇𝐮𝐧 💞",
  "❤️ 𝐌𝐞𝐫𝐢 𝐉𝐚𝐚𝐧, 𝐌𝐞𝐫𝐚 𝐏𝐲𝐚𝐚𝐫 ❤️",
  "🌹 𝐈𝐬𝐡𝐪 𝐊𝐚 𝐑𝐢𝐬𝐡𝐭𝐚 𝐇𝐚𝐢 𝐇𝐚𝐦𝐚𝐚𝐫𝐚 🌹",
  "💑 𝐓𝐮𝐦 𝐁𝐢𝐧 𝐀𝐝𝐡𝐮𝐫𝐚 𝐇𝐮𝐧 𝐌𝐚𝐢𝐧 💑",
  "🥰 𝐌𝐞𝐫𝐞 𝐃𝐢𝐥 𝐊𝐢 𝐁𝐚𝐚𝐭 𝐇𝐨 𝐓𝐮𝐦 🥰",
  "💌 𝐏𝐲𝐚𝐚𝐫 𝐊𝐚 𝐃𝐢𝐥 𝐒𝐞 𝐁𝐚𝐧𝐝𝐡𝐚𝐧 💌",
  "✨ 𝐋𝐢𝐧𝐤𝐞𝐝 𝐅𝐨𝐫𝐞𝐯𝐞𝐫 𝐖𝐢𝐭𝐡 𝐋𝐨𝐯𝐞 ✨"
];


async function getAvatar(uid) {
  const res = await axios.get(
    `https://graph.facebook.com/${uid}/picture?width=1500&height=1500&redirect=true`,
    { responseType: "arraybuffer", maxRedirects: 10 }
  );
  return Buffer.from(res.data);
}

async function makeCircle(buffer, size) {
  const img = await Jimp.read(buffer);
  img.resize({ w: size, h: size });
  const mask = new Jimp({ width: size, height: size, color: 0x00000000 });
  const center = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (Math.sqrt((x - center) ** 2 + (y - center) ** 2) <= center) {
        mask.setPixelColor(0xFFFFFFFF, x, y);
      }
    }
  }
  img.mask(mask, 0, 0);
  return img;
}

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: "link",
    aliases: ["couplelink", "lovelink"],
    description: "Dil se dil ka rishta banao — Love canvas image.",
    usage: "link [@mention / reply]",
    category: "Love",
    prefix: true,
    cooldowns: 5
  },
  async run({ api, event, send, Users }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;
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

    if (two === one) return send.reply("❌ Apne saath link nahi kar sakte!");

    send.reply("💞 Love canvas bana raha hun...");

    try {
      if (!fs.existsSync(templatePath)) return send.reply("❌ Template image nahi mili! pair4_template.png cache mein rakho.");

      const [bufOne, bufTwo] = await Promise.all([getAvatar(one), getAvatar(two)]);
      const [circOne, circTwo] = await Promise.all([
        makeCircle(bufOne, SETTINGS.AVATAR_1.SIZE),
        makeCircle(bufTwo, SETTINGS.AVATAR_2.SIZE)
      ]);

      const template = await Jimp.read(templatePath);
      template.composite(circOne, SETTINGS.AVATAR_1.X, SETTINGS.AVATAR_1.Y);
      template.composite(circTwo, SETTINGS.AVATAR_2.X, SETTINGS.AVATAR_2.Y);

      const outputPath = path.join(cacheDir, `link_${one}_${two}_${Date.now()}.png`);
      await template.write(outputPath);

      const nameOne = await Users.getNameUser(one);
      const nameTwo = await Users.getNameUser(two);
      const msg = loveMessages[Math.floor(Math.random() * loveMessages.length)];

      api.sendMessage(
        {
          body:
            `♥️━━━━━━━━━━━━━━━━━━♥️\n\n` +
            `${msg}\n\n` +
            `👤 ${nameOne}\n` +
            `💞 𝐋𝐈𝐍𝐊𝐄𝐃 𝐖𝐈𝐓𝐇 💞\n` +
            `👤 ${nameTwo}\n\n` +
            `♥️━━━━━━━━━━━━━━━━━━♥️`,
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
      console.error("[link]", err);
      send.reply("❌ Canvas banana fail ho gaya: " + err.message);
    }
  }
};
