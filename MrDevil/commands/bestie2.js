const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { Jimp } = require("jimp");
const animateProgress = require('../../controller/utility/animateProgress');
const frames = require('../../controller/utility/frames');

const cacheDir = path.join(__dirname, "cache", "canvas");
const templateUrl = "https://i.ibb.co/23YL0Drr/1e3bad92576f.jpg";
const templatePath = path.join(cacheDir, "bestie2_template.png");

const SETTINGS = {
  AVATAR_1: {
    SIZE: 138,
    X: 110,
    Y: 134
  },
  AVATAR_2: {
    SIZE: 138,
    X: 471,
    Y: 134
  }
};

const bestieMessages = [
  "𝐍𝐚𝐭𝐩𝐮 𝐓𝐡𝐚𝐧 𝐒𝐨𝐭𝐡𝐮 𝐍𝐚𝐦𝐚𝐤𝐮 🖤👑",
  "𝐁𝐞𝐬𝐭 𝐅𝐫𝐢𝐞𝐧𝐝𝐬? 𝐅𝐨𝐫𝐞𝐯𝐞𝐫! 🖤🐾",
  "𝐁𝐞𝐬𝐭𝐢𝐞𝐬 𝐓𝐢𝐥𝐥 𝐓𝐡𝐞 𝐄𝐧𝐝 👑🖤",
  "𝐒𝐢𝐝𝐞 𝐁𝐲 𝐒𝐢𝐝𝐞 𝐅𝐨𝐫𝐞𝐯𝐞𝐫 🖤🐾",
  "𝐌𝐲 𝐁𝐞𝐬𝐭𝐢𝐞 𝐌𝐲 𝐒𝐨𝐮𝐥𝐬𝐢𝐬𝐭𝐞𝐫 👑🖤",
  "𝐓𝐨𝐦 & 𝐉𝐞𝐫𝐫𝐲 𝐁𝐅𝐅 🐱🐭🖤",
  "𝐅𝐫𝐢𝐞𝐧𝐝𝐬𝐡𝐢𝐩 𝐈𝐬 𝐄𝐯𝐞𝐫𝐲𝐭𝐡𝐢𝐧𝐠 🖤👑",
  "𝐓𝐡𝐞 𝐁𝐞𝐬𝐭 𝐎𝐧𝐞 𝐈𝐬 𝐀𝐥𝐫𝐞𝐚𝐝𝐲 𝐌𝐢𝐧𝐞 🖤🐾",
  "𝐁𝐞𝐬𝐭𝐢𝐞𝐬 𝐅𝐨𝐫 𝐋𝐢𝐟𝐞 👑🖤",
  "𝐘𝐨𝐮 𝐀𝐧𝐝 𝐌𝐞 𝐀𝐥𝐰𝐚𝐲𝐬 🖤🐾"
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
    name: "bestie2",
    aliases: ["bff2", "bestfriend2", "tomjerry"],
    description: "Tom & Jerry Besties pair image banao — Grunge Circle style (Bestie 2).",
    usage: "bestie2 [@mention / reply]",
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

    if (two === one) return send.reply("❌ Apne saath bestie nahi ban sakte!");

    const { msgID: loadMsgID, done: animDone } = await animateProgress(api, threadID, messageID, '🐱', '𝐁𝐞𝐬𝐭𝐢𝐞 𝐏𝐚𝐢𝐫', 'bestie2');

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

      const outputPath = path.join(cacheDir, `bestie2_${one}_${two}_${Date.now()}.png`);
      await template.write(outputPath);

      const nameOne = await Users.getNameUser(one);
      const nameTwo = await Users.getNameUser(two);
      const msg = bestieMessages[Math.floor(Math.random() * bestieMessages.length)];

      await animDone;

      const frameMsg = `${msg}\n\n🌸 𝐁𝐞𝐬𝐭𝐢𝐞 1: ${nameOne}\n✿ ════ 𝐁𝐄𝐒𝐓𝐈𝐄𝐒 𝐅𝐎𝐑𝐄𝐕𝐄𝐑 ════ ✿\n🌸 𝐁𝐞𝐬𝐭𝐢𝐞 2: ${nameTwo}`;
      api.sendMessage(
        {
          body: frames.bestie2(frameMsg),
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
      console.error("[bestie2]", err);
      send.reply("❌ Image banana fail ho gaya: " + err.message);
    }
  }
};
