const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const cacheDir = path.join(__dirname, "cache", "slap");

const slapVideos = [
  "https://i.giphy.com/Gf3AUz3eBNbTW.mp4",
  "https://i.giphy.com/xUNd9HZq1itMkiK652.mp4",
  "https://i.giphy.com/WvzGVdiVRNq8qtWPKu.mp4",
  "https://i.giphy.com/xUO4t2gkWBxDi.mp4",
  "https://i.giphy.com/M6mU7e31K1yH6.mp4"
];

const slapCaptions = [
  "💥 *SLAP ATTACK!* 💥\n\n👋 Yaar ne thappar maar diya @VICTIM ko!\n\n😤 Agli baar adab se aaana!",
  "👋 *THAPAR MAAR DIYA!* 👋\n\n😵 @VICTIM bechara!\n\n🤣 Yeh thappar yaad rahega!",
  "💢 *SLAP OF JUSTICE!* 💢\n\n🔥 @VICTIM ko sabaq mil gaya!\n\n😂 Ab theek se rehna!",
  "\u{1F91C} *MEGA SLAP!* \u{1F91B}\n\n😂 @VICTIM ko thappar raseed!\n\n👊 MR DEVIL BOT se panga mat lo!"
];

async function getSlapVideo() {
  const url = slapVideos[Math.floor(Math.random() * slapVideos.length)];
  const res = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(res.data);
}

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: "slap",
    aliases: ["thappar", "chhapad", "slapvideo"],
    description: "Kisi ko thappar maar do — with animation video!",
    usage: "slap [@mention / reply]",
    category: "Fun",
    prefix: true,
    cooldowns: 3
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



    let victimID = null;

    const mentionKeys = Object.keys(mentions || {});
    if (mentionKeys.length > 0) {
      victimID = mentionKeys[0];
    } else if (messageReply) {
      victimID = messageReply.senderID;
    }

    if (!victimID) {
      return send.reply("👋 *Slap Command*\n\n*Use karo:*\n.slap @username\n\nYa kisi ke message pe reply karke .slap likho!");
    }

    if (victimID === senderID) {
      return send.reply("❌ Apne aap ko thappar nahi maar sakte bhai! 😂");
    }

    try {
      api.setMessageReaction("👋", messageID, () => {}, true);
    } catch {}

    try {
      const buf = await getSlapVideo();
      const tmpPath = path.join(cacheDir, `slap_${Date.now()}.mp4`);
      await fs.ensureDir(cacheDir);
      await fs.writeFile(tmpPath, buf);

      const victimName = await Users.getNameUser(victimID).catch(() => "User");
      const randomCaption = slapCaptions[Math.floor(Math.random() * slapCaptions.length)]
        .replace(/@VICTIM/g, victimName);

      await new Promise((resolve, reject) => {
        api.sendMessage(
          {
            body: randomCaption,
            attachment: fs.createReadStream(tmpPath),
            mentions: [{ tag: victimName, id: victimID }]
          },
          threadID,
          async (err, info) => {
            await fs.unlink(tmpPath).catch(() => {});
            if (err) return reject(err);
            resolve(info);
          },
          messageID
        );
      });

    } catch (err) {
      console.error("[slap]", err);
      send.reply("❌ Slap nahi maar saka! Shayad internet ya video source ka masla hai. Dobara try karo. 😅");
    }
  }
};
