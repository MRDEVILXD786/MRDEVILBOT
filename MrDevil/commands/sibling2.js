const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { Jimp } = require("jimp");
const animateProgress = require('../../controller/utility/animateProgress');
const frames = require('../../controller/utility/frames');

const cacheDir = path.join(__dirname, "cache", "canvas");
const templateUrl = "https://i.ibb.co/nNxq96TH/cdfbb951da38.jpg";
const templatePath = path.join(cacheDir, "sibling2_template.jpg");

const SETTINGS = {
  AVATAR_1: {
    SIZE: 190,
    X: 106,
    Y: 100
  },
  AVATAR_2: {
    SIZE: 190,
    X: 411,
    Y: 100
  }
};

const siblingMessages = [
  "𝐁𝐫𝐨𝐭𝐡𝐞𝐫 & 𝐒𝐢𝐬𝐭𝐞𝐫 𝐅𝐨𝐫𝐞𝐯𝐞𝐫 💛🦋",
  "𝐘𝐨𝐮 & 𝐌𝐞 𝐅𝐨𝐫𝐞𝐯𝐞𝐫 💛❤️",
  "𝐁𝐡𝐚𝐢 𝐌𝐞𝐫𝐚 𝐁𝐞𝐬𝐭 𝐅𝐫𝐢𝐞𝐧𝐝 💛✨",
  "𝐒𝐢𝐬𝐭𝐞𝐫 𝐌𝐞𝐫𝐢 𝐉𝐚𝐚𝐧 💛🌸",
  "𝐒𝐢𝐛𝐥𝐢𝐧𝐠𝐬 𝐁𝐲 𝐁𝐥𝐨𝐨𝐝 𝐁𝐞𝐬𝐭𝐢𝐞𝐬 𝐁𝐲 𝐇𝐞𝐚𝐫𝐭 💛💕",
  "𝐁𝐫𝐨 & 𝐒𝐢𝐬 𝐅𝐨𝐫𝐞𝐯𝐞𝐫 💛🦋",
  "𝐌𝐲 𝐁𝐫𝐨𝐭𝐡𝐞𝐫 𝐌𝐲 𝐏𝐫𝐢𝐝𝐞 💛✨",
  "𝐌𝐲 𝐒𝐢𝐬𝐭𝐞𝐫 𝐌𝐲 𝐋𝐢𝐟𝐞 💛❤️",
  "𝐒𝐢𝐛𝐥𝐢𝐧𝐠𝐬 𝐀𝐫𝐞 𝐭𝐡𝐞 𝐁𝐞𝐬𝐭 𝐆𝐢𝐟𝐭 💛🌸",
  "𝐀𝐥𝐰𝐚𝐲𝐬 𝐓𝐨𝐠𝐞𝐭𝐡𝐞𝐫 𝐁𝐡𝐚𝐢 𝐉𝐚𝐚𝐧 💛💕"
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
    name: "sibling2",
    aliases: ["sib2", "broandsis", "youandme"],
    description: "Sibling pair image banao — Brother & Sister You & Me Forever style.",
    usage: "sibling2 [@mention / reply]",
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

    const { msgID: loadMsgID, done: animDone } = await animateProgress(api, threadID, messageID, '💛', '𝐒𝐢𝐛𝐥𝐢𝐧𝐠 𝐏𝐚𝐢𝐫', 'sibling2');

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

      const outputPath = path.join(cacheDir, `sibling2_${one}_${two}_${Date.now()}.png`);
      await template.write(outputPath);

      const nameOne = await Users.getNameUser(one);
      const nameTwo = await Users.getNameUser(two);
      const msg = siblingMessages[Math.floor(Math.random() * siblingMessages.length)];

      await animDone;

      const frameMsg = `${msg}\n\n💛 𝐁𝐫𝐨𝐭𝐡𝐞𝐫: ${nameOne}\n°°••── 𝐘𝐎𝐔 & 𝐌𝐄 𝐅𝐎𝐑𝐄𝐕𝐄𝐑 ──••°°\n💛 𝐒𝐢𝐬𝐭𝐞𝐫: ${nameTwo}`;
      api.sendMessage(
        {
          body: frames.sibling2(frameMsg),
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
      console.error("[sibling2]", err);
      send.reply("❌ Image banana fail ho gaya: " + err.message);
    }
  }
};
