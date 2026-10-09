const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { Jimp } = require("jimp");
const animateProgress = require('../../controller/utility/animateProgress');
const frames = require('../../controller/utility/frames');

const cacheDir = path.join(__dirname, "cache", "canvas");
const templateUrl = "https://i.ibb.co/dwDLCJmH/1043a477d147.jpg";
const templatePath = path.join(cacheDir, "pair5_template.png");

const SETTINGS = {
  AVATAR_1: {
    SIZE: 130,
    X: 168,
    Y: 125
  },
  AVATAR_2: {
    SIZE: 130,
    X: 438,
    Y: 125
  }
};

const romanticMessages = [
  "𝐘𝐨𝐮 𝐚𝐫𝐞 𝐦𝐲 𝐊𝐢𝐧𝐠 / 𝐐𝐮𝐞𝐞𝐧 👑",
  "𝐂𝐚𝐧'𝐭 𝐒𝐭𝐨𝐩 𝐋𝐨𝐯𝐢𝐧𝐠 𝐘𝐨𝐮 💖",
  "𝐈 𝐋𝐨𝐯𝐞 𝐘𝐨𝐮 𝐭𝐨 𝐭𝐡𝐞 𝐌𝐨𝐨𝐧 & 𝐁𝐚𝐜𝐤 🌙",
  "𝐌𝐲 𝐊𝐢𝐧𝐠 𝐚𝐧𝐝 𝐐𝐮𝐞𝐞𝐧 𝐅𝐨𝐫𝐞𝐯𝐞𝐫 👑💕",
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

async function makeSquare(buffer, size) {
  const img = await Jimp.read(buffer);
  img.resize({ w: size, h: size });
  return img;
}

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: "pair5",
    aliases: ["couple5", "kingqueen"],
    description: "Romantic King & Queen pair image banao (Style 5).",
    usage: "pair5 [@mention / reply]",
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

    if (two === one) return send.reply("❌ Apne saath pair nahi kar sakte!");

    const { msgID: loadMsgID, done: animDone } = await animateProgress(api, threadID, messageID, '👑', '𝐊𝐢𝐧𝐠 & 𝐐𝐮𝐞𝐞𝐧', 'pair5');

    try {
      await downloadTemplate();

      const [bufOne, bufTwo] = await Promise.all([getAvatar(one), getAvatar(two)]);
      const [circOne, circTwo] = await Promise.all([
        makeSquare(bufOne, SETTINGS.AVATAR_1.SIZE),
        makeSquare(bufTwo, SETTINGS.AVATAR_2.SIZE)
      ]);

      const template = await Jimp.read(templatePath);
      template.composite(circOne, SETTINGS.AVATAR_1.X, SETTINGS.AVATAR_1.Y);
      template.composite(circTwo, SETTINGS.AVATAR_2.X, SETTINGS.AVATAR_2.Y);

      const outputPath = path.join(cacheDir, `pair5_${one}_${two}_${Date.now()}.png`);
      await template.write(outputPath);

      const nameOne = await Users.getNameUser(one);
      const nameTwo = await Users.getNameUser(two);
      const msg = romanticMessages[Math.floor(Math.random() * romanticMessages.length)];

      await animDone;

      const frameMsg = `${msg}\n\n🤴 𝐊𝐢𝐧𝐠: ${nameOne}\n♛ ─── 𝐑𝐎𝐘𝐀𝐋 𝐂𝐎𝐔𝐏𝐋𝐄 ───\n👸 𝐐𝐮𝐞𝐞𝐧: ${nameTwo}`;
      api.sendMessage(
        {
          body: frames.pair5(frameMsg),
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
      console.error("[pair5]", err);
      send.reply("❌ Image banana fail ho gaya: " + err.message);
    }
  }
};
