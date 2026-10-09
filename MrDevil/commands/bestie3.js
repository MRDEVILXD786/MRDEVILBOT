const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { Jimp } = require("jimp");
const animateProgress = require('../../controller/utility/animateProgress');
const frames = require('../../controller/utility/frames');

const cacheDir = path.join(__dirname, "cache", "canvas");
const templateUrl = "https://i.ibb.co/N6csgyQh/187c3efe93e9.jpg";
const templatePath = path.join(cacheDir, "bestie3_template.png");

const SETTINGS = {
  AVATAR_1: {
    SIZE: 210,
    X: 95,
    Y: 129
  },
  AVATAR_2: {
    SIZE: 210,
    X: 418,
    Y: 129
  }
};

const bestieMessages = [
  "𝐅𝐫𝐢𝐞𝐧𝐝𝐬𝐡𝐢𝐩 𝐖𝐚𝐫𝐦𝐬 𝐓𝐡𝐞 𝐇𝐞𝐚𝐫𝐭 🖤🦋",
  "𝐁𝐞𝐬𝐭𝐢𝐞𝐬 𝐅𝐨𝐫𝐞𝐯𝐞𝐫 🦋🖤",
  "𝐅𝐫𝐢𝐞𝐧𝐝𝐬𝐡𝐢𝐩 𝐈𝐬 𝐌𝐚𝐠𝐢𝐜 🦋✨",
  "𝐘𝐨𝐮 𝐀𝐧𝐝 𝐌𝐞 𝐀𝐥𝐰𝐚𝐲𝐬 🖤🦋",
  "𝐁𝐞𝐬𝐭 𝐅𝐫𝐢𝐞𝐧𝐝𝐬 𝐅𝐨𝐫 𝐋𝐢𝐟𝐞 🦋🖤",
  "𝐌𝐲 𝐁𝐞𝐬𝐭𝐢𝐞 𝐌𝐲 𝐒𝐨𝐮𝐥 🖤🦋",
  "𝐒𝐢𝐝𝐞 𝐁𝐲 𝐒𝐢𝐝𝐞 𝐅𝐨𝐫𝐞𝐯𝐞𝐫 🦋✨",
  "𝐓𝐡𝐞 𝐁𝐞𝐬𝐭 𝐈𝐬 𝐀𝐥𝐫𝐞𝐚𝐝𝐲 𝐌𝐢𝐧𝐞 🖤🦋",
  "𝐅𝐫𝐢𝐞𝐧𝐝𝐬𝐡𝐢𝐩 𝐍𝐞𝐯𝐞𝐫 𝐄𝐧𝐝𝐬 🦋🖤",
  "𝐌𝐲 𝐑𝐢𝐝𝐞 𝐎𝐫 𝐃𝐢𝐞 🖤🦋"
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

function isInsideHexagon(x, y, cx, cy, r) {
  const dx = Math.abs(x - cx);
  const dy = Math.abs(y - cy);
  if (dx > r * Math.sqrt(3) / 2) return false;
  if (dy > r) return false;
  return dy + dx / Math.sqrt(3) <= r;
}

async function makeHexagon(buffer, size) {
  const img = await Jimp.read(buffer);
  img.resize({ w: size, h: size });
  const mask = new Jimp({ width: size, height: size, color: 0x00000000 });
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isInsideHexagon(x, y, cx, cy, r)) {
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
    name: "bestie3",
    aliases: ["bff3", "bestfriend3", "hexbff"],
    description: "Friendship Hexagon pair image banao — Hex style (Bestie 3).",
    usage: "bestie3 [@mention / reply]",
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

    const { msgID: loadMsgID, done: animDone } = await animateProgress(api, threadID, messageID, '🦋', '𝐅𝐫𝐢𝐞𝐧𝐝𝐬𝐡𝐢𝐩 𝐏𝐚𝐢𝐫', 'bestie3');

    try {
      await downloadTemplate();

      const [bufOne, bufTwo] = await Promise.all([getAvatar(one), getAvatar(two)]);
      const [hexOne, hexTwo] = await Promise.all([
        makeHexagon(bufOne, SETTINGS.AVATAR_1.SIZE),
        makeHexagon(bufTwo, SETTINGS.AVATAR_2.SIZE)
      ]);

      const template = await Jimp.read(templatePath);
      template.composite(hexOne, SETTINGS.AVATAR_1.X, SETTINGS.AVATAR_1.Y);
      template.composite(hexTwo, SETTINGS.AVATAR_2.X, SETTINGS.AVATAR_2.Y);

      const outputPath = path.join(cacheDir, `bestie3_${one}_${two}_${Date.now()}.png`);
      await template.write(outputPath);

      const nameOne = await Users.getNameUser(one);
      const nameTwo = await Users.getNameUser(two);
      const msg = bestieMessages[Math.floor(Math.random() * bestieMessages.length)];

      await animDone;

      const frameMsg = `${msg}\n\n🖤 𝐁𝐞𝐬𝐭𝐢𝐞 1: ${nameOne}\n☆♡☆ 𝐅𝐑𝐈𝐄𝐍𝐃𝐒𝐇𝐈𝐏 𝐅𝐎𝐑𝐄𝐕𝐄𝐑 ☆♡☆\n🖤 𝐁𝐞𝐬𝐭𝐢𝐞 2: ${nameTwo}`;
      api.sendMessage(
        {
          body: frames.bestie3(frameMsg),
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
      console.error("[bestie3]", err);
      send.reply("❌ Image banana fail ho gaya: " + err.message);
    }
  }
};
