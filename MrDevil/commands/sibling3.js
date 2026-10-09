const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { Jimp } = require("jimp");
const animateProgress = require('../../controller/utility/animateProgress');
const frames = require('../../controller/utility/frames');

const cacheDir = path.join(__dirname, "cache", "canvas");
const templateUrl = "https://i.ibb.co/Df7cNZ75/ecf348fe529f.jpg";
const templatePath = path.join(cacheDir, "sibling3_template.jpg");

const SETTINGS = {
  AVATAR_1: {
    SIZE: 190,
    X: 93,
    Y: 115
  },
  AVATAR_2: {
    SIZE: 190,
    X: 433,
    Y: 109
  }
};

const siblingMessages = [
  "𝐁𝐫𝐨𝐭𝐡𝐞𝐫 & 𝐒𝐢𝐬𝐭𝐞𝐫 𝐅𝐨𝐫𝐞𝐯𝐞𝐫 👑🖤",
  "𝐋𝐎𝐕𝐄 𝐁𝐞𝐭𝐰𝐞𝐞𝐧 𝐒𝐢𝐛𝐥𝐢𝐧𝐠𝐬 👑❤️",
  "𝐁𝐡𝐚𝐢 𝐌𝐞𝐫𝐚 𝐊𝐢𝐧𝐠 👑✨",
  "𝐒𝐢𝐬𝐭𝐞𝐫 𝐌𝐞𝐫𝐢 𝐐𝐮𝐞𝐞𝐧 👑💗",
  "𝐁𝐫𝐨 & 𝐒𝐢𝐬 𝐁𝐨𝐧𝐝 𝐈𝐬 𝐔𝐧𝐛𝐫𝐞𝐚𝐤𝐚𝐛𝐥𝐞 👑🦋",
  "𝐌𝐲 𝐁𝐫𝐨𝐭𝐡𝐞𝐫 𝐌𝐲 𝐊𝐢𝐧𝐠 👑🖤",
  "𝐌𝐲 𝐒𝐢𝐬𝐭𝐞𝐫 𝐌𝐲 𝐐𝐮𝐞𝐞𝐧 👑✨",
  "𝐒𝐢𝐛𝐥𝐢𝐧𝐠𝐬 𝐖𝐢𝐭𝐡 𝐋𝐎𝐕𝐄 👑❤️",
  "𝐁𝐥𝐨𝐨𝐝 𝐁𝐨𝐧𝐝 𝐅𝐨𝐫𝐞𝐯𝐞𝐫 👑💗",
  "𝐀𝐥𝐰𝐚𝐲𝐬 𝐓𝐨𝐠𝐞𝐭𝐡𝐞𝐫 𝐁𝐡𝐚𝐢 & 𝐁𝐡𝐚𝐧 👑🦋"
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
    name: "sibling3",
    aliases: ["sib3", "brothersister", "lovesibling"],
    description: "Sibling pair image banao — Brother Sister LOVE Crown style.",
    usage: "sibling3 [@mention / reply]",
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

    if (two === one) return send.reply("❌ Apne saath sibling nahi ban sakte!");

    const { msgID: loadMsgID, done: animDone } = await animateProgress(api, threadID, messageID, '👑', '𝐒𝐢𝐛𝐥𝐢𝐧𝐠 𝐏𝐚𝐢𝐫', 'sibling3');

    try {
      await downloadTemplate();

      const [bufOne, bufTwo] = await Promise.all([getAvatar(one), getAvatar(two)]);
      const [circOne, circTwo] = await Promise.all([
        makeCircle(bufOne, SETTINGS.AVATAR_1.SIZE),
        makeCircle(bufTwo, SETTINGS.AVATAR_2.SIZE)
      ]);

      const template = await Jimp.read(templatePath);
      template.composite(circOne, SETTINGS.AVATAR_1.X, SETTINGS.AVATAR_1.Y);
      template.composite(circTwo, SETTINGS.AVATAR_2.X, SETTINGS.AVATAR_2.Y);

      const outputPath = path.join(cacheDir, `sibling3_${one}_${two}_${Date.now()}.png`);
      await template.write(outputPath);

      const nameOne = await Users.getNameUser(one);
      const nameTwo = await Users.getNameUser(two);
      const msg = siblingMessages[Math.floor(Math.random() * siblingMessages.length)];

      await animDone;

      const frameMsg = `${msg}\n\n👑 𝐒𝐢𝐬𝐭𝐞𝐫: ${nameOne}\n⋅ ── ✩ 𝐁𝐑𝐎 & 𝐒𝐈𝐒 ✩ ── ⋅\n👑 𝐁𝐫𝐨𝐭𝐡𝐞𝐫: ${nameTwo}`;
      api.sendMessage(
        {
          body: frames.sibling3(frameMsg),
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
      console.error("[sibling3]", err);
      send.reply("❌ Image banana fail ho gaya: " + err.message);
    }
  }
};
