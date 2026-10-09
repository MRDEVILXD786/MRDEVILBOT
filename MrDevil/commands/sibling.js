const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { Jimp } = require("jimp");
const animateProgress = require('../../controller/utility/animateProgress');
const frames = require('../../controller/utility/frames');

const cacheDir = path.join(__dirname, "cache", "canvas");
const templateUrl = "https://i.ibb.co/20SV9j4q/2f2316e1bbff.jpg";
const templatePath = path.join(cacheDir, "sibling_template.jpg");

const SETTINGS = {
  AVATAR_1: {
    SIZE: 117,
    X: 30,
    Y: 119
  },
  AVATAR_2: {
    SIZE: 117,
    X: 474,
    Y: 257
  }
};

const siblingMessages = [
  "𝐌𝐲 𝐒𝐢𝐬𝐭𝐞𝐫 𝐌𝐲 𝐒𝐮𝐤𝐨𝐨𝐧 🖤🦋",
  "𝐋𝐢𝐟𝐞 → 𝐒𝐢𝐬 → 𝐒𝐮𝐤𝐨𝐨𝐧 🖤✨",
  "𝐂𝐚𝐧'𝐭 𝐒𝐭𝐨𝐩 𝐋𝐨𝐯𝐢𝐧𝐠 𝐘𝐨𝐮 🖤💗",
  "𝐌𝐲 𝐒𝐢𝐛𝐥𝐢𝐧𝐠 𝐌𝐲 𝐋𝐢𝐟𝐞 𝐋𝐢𝐧𝐞 🖤🐼",
  "𝐁𝐥𝐚𝐜𝐤 𝐋𝐨𝐯𝐞𝐫 𝐒𝐢𝐛𝐥𝐢𝐧𝐠 🖤👑",
  "𝐒𝐢𝐛𝐥𝐢𝐧𝐠𝐬 𝐅𝐨𝐫𝐞𝐯𝐞𝐫 🖤🦋",
  "𝐌𝐲 𝐑𝐞𝐚𝐥 𝐒𝐮𝐤𝐨𝐨𝐧 🖤✨",
  "𝐋𝐨𝐯𝐞 𝐘𝐨𝐮 𝐒𝐢𝐛𝐥𝐢𝐧𝐠 🖤💗",
  "𝐌𝐲 𝐒𝐢𝐬 𝐌𝐲 𝐁𝐡𝐚𝐢 𝐌𝐲 𝐏𝐫𝐢𝐝𝐞 🖤👑",
  "𝐀𝐥𝐰𝐚𝐲𝐬 𝐓𝐨𝐠𝐞𝐭𝐡𝐞𝐫 🖤🐼"
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
    name: "sibling",
    aliases: ["sib", "blacklover", "sukoonsibling"],
    description: "Sibling pair image banao — Black Lover Life→Sis→Sukoon style.",
    usage: "sibling [@mention / reply]",
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

    const { msgID: loadMsgID, done: animDone } = await animateProgress(api, threadID, messageID, '🖤', '𝐒𝐢𝐛𝐥𝐢𝐧𝐠 𝐏𝐚𝐢𝐫', 'sibling');

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

      const outputPath = path.join(cacheDir, `sibling_${one}_${two}_${Date.now()}.png`);
      await template.write(outputPath);

      const nameOne = await Users.getNameUser(one);
      const nameTwo = await Users.getNameUser(two);
      const msg = siblingMessages[Math.floor(Math.random() * siblingMessages.length)];

      await animDone;

      const frameMsg = `${msg}\n\n🖤 𝐌𝐲 𝐒𝐢𝐬: ${nameOne}\n✿ ❀ ══ 𝐋𝐈𝐅𝐄 → 𝐒𝐈𝐒 → 𝐒𝐔𝐊𝐎𝐎𝐍 ══ ❀ ✿\n🖤 𝐌𝐲 𝐁𝐡𝐚𝐢: ${nameTwo}`;
      api.sendMessage(
        {
          body: frames.sibling(frameMsg),
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
      console.error("[sibling]", err);
      send.reply("❌ Image banana fail ho gaya: " + err.message);
    }
  }
};
