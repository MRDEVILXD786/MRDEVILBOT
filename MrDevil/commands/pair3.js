const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { Jimp } = require("jimp");
const animateProgress = require('../../controller/utility/animateProgress');
const frames = require('../../controller/utility/frames');

const cacheDir = path.join(__dirname, "cache", "canvas");
const templateUrl = "https://i.ibb.co/xtQrSxrM/e53fffa49219.jpg";
const templatePath = path.join(cacheDir, "pair3_template.png");

const SETTINGS = {
  AVATAR_1: {
    SIZE: 180,
    X: 38,
    Y: 40
  },
  AVATAR_2: {
    SIZE: 182,
    X: 263,
    Y: 38
  }
};

const romanticMessages = [
  "𝐘𝐨𝐮 𝐚𝐫𝐞 𝐦𝐲 𝐬𝐮𝐧𝐬𝐡𝐢𝐧𝐞 ☀️",
  "𝐒𝐭𝐚𝐫𝐬 𝐚𝐥𝐢𝐠𝐧𝐞𝐝 𝐟𝐨𝐫 𝐮𝐬 ⭐",
  "𝐃𝐞𝐬𝐭𝐢𝐧𝐞𝐝 𝐭𝐨 𝐛𝐞 𝐭𝐨𝐠𝐞𝐭𝐡𝐞𝐫 💫",
  "𝐌𝐲 𝐡𝐞𝐚𝐫𝐭 𝐛𝐞𝐚𝐭𝐬 𝐟𝐨𝐫 𝐲𝐨𝐮 💓",
  "𝐋𝐨𝐯𝐞 𝐛𝐞𝐲𝐨𝐧𝐝 𝐰𝐨𝐫𝐝𝐬 💘",
  "𝐘𝐨𝐮 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐞 𝐦𝐞 💕",
  "𝐅𝐨𝐫𝐞𝐯𝐞𝐫 𝐚𝐧𝐝 𝐚𝐥𝐰𝐚𝐲𝐬 💝",
  "𝐌𝐲 𝐬𝐨𝐮𝐥𝐦𝐚𝐭𝐞 🖤✨"
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
    name: "pair3",
    aliases: ["couple3"],
    description: "Romantic pair image banao (Style 3).",
    usage: "pair3 [@mention / reply]",
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

    if (templateUrl === "YOUR_TEMPLATE_URL_HERE") {
      return send.reply("❌ pair3 ka template URL abhi set nahi hua. pair3.js mein templateUrl update karo.");
    }

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

    if (two === one) return send.reply("❌ Apne saath pair nahi kar sakte!");

    const { msgID: loadMsgID, done: animDone } = await animateProgress(api, threadID, messageID, '💞', '𝐏𝐚𝐢𝐫', 'pair3');

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

      const outputPath = path.join(cacheDir, `pair3_${one}_${two}_${Date.now()}.png`);
      await template.write(outputPath);

      const nameOne = await Users.getNameUser(one);
      const nameTwo = await Users.getNameUser(two);
      const msg = romanticMessages[Math.floor(Math.random() * romanticMessages.length)];

      await animDone;

      const frameMsg = `${msg}\n\n🌹 𝐁𝐨𝐲𝐟𝐫𝐢𝐞𝐧𝐝: ${nameOne}\n💕 ─── 𝐂𝐎𝐔𝐏𝐋𝐄 𝐆𝐎𝐀𝐋𝐒 ───\n🌹 𝐆𝐢𝐫𝐥𝐟𝐫𝐢𝐞𝐧𝐝: ${nameTwo}`;
      api.sendMessage(
        {
          body: frames.pair3(frameMsg),
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
      console.error("[pair3]", err);
      send.reply("❌ Image banana fail ho gaya: " + err.message);
    }
  }
};
