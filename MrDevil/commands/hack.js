const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: "hack",
    aliases: ["hk", "hacker"],
    description: "Kisi ka virtual 'hack' prank karo — fun only!",
    usage: "hack [@mention / reply]",
    category: "Fun",
    prefix: true,
    cooldowns: 5
  },

  async run({ api, event, send, Users }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    let targetID = null;
    const mentionKeys = Object.keys(mentions || {});
    if (mentionKeys.length > 0) {
      targetID = mentionKeys[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    } else {
      targetID = senderID;
    }

    const getNameFromApi = (userId) =>
      new Promise((resolve) => {
        try {
          api.getUserInfo(userId, (err, info) => {
            if (err || !info?.[userId]?.name) return resolve(null);
            resolve(info[userId].name);
          });
        } catch {
          resolve(null);
        }
      });

    try {
      api.setMessageReaction("💻", messageID, () => {}, true);
    } catch {}

    send.reply(
      `╭─── « 💻 𝐇𝐀𝐂𝐊 𝐒𝐓𝐀𝐑𝐓𝐄𝐃 » ───⟡\n│\n│ 🔍 Target scan ho raha hai...\n│ ⚡ System access hो raha hai...\n│ 🛡️ Firewall bypass...\n│\n│ ⏳ Kuch second ruko!\n│\n╰───────────────⟡`
    );

    try {
      let targetName = await getNameFromApi(targetID);
      if (!targetName && typeof Users?.getNameUser === "function") {
        targetName = await Users.getNameUser(targetID).catch(() => null);
      }
      if (!targetName) targetName = "Unknown";

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const imgPath = path.join(cacheDir, `hack_${Date.now()}.png`);

      const apiUrl = `http://172.81.128.14:20541/hack?userId=${encodeURIComponent(targetID)}&name=${encodeURIComponent(targetName)}`;
      const res = await axios.get(apiUrl, { responseType: "arraybuffer", timeout: 20000 });

      const contentType = res.headers?.["content-type"] || "";
      if (!contentType.startsWith("image/")) {
        const text = Buffer.from(res.data).toString("utf8");
        return send.reply(
          `╭─── « ❌ HACK FAILED » ───⟡\n│\n│ ⚠️ Server se image nahi aayi!\n│ ${text.slice(0, 100)}\n│\n╰───────────────⟡`
        );
      }

      await fs.writeFile(imgPath, Buffer.from(res.data));

      await new Promise((resolve, reject) => {
        api.sendMessage(
          {
            body:
              `╭─── « 💀 𝐇𝐀𝐂𝐊 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 » ───⟡\n` +
              `│\n` +
              `│ 🎯 Target  : ${targetName}\n` +
              `│ 🔐 Password: ••••••••••\n` +
              `│ 📧 Data    : LEAKED ✅\n` +
              `│\n` +
              `│ ⚠️ Owner ko bhej diya gaya!\n` +
              `│ 😈 Next time careful rehna!\n` +
              `│\n` +
              `│ 💻 — MR DEVIL BOT\n` +
              `╰───────────────⟡`,
            attachment: fs.createReadStream(imgPath),
            mentions: [{ tag: targetName, id: targetID }]
          },
          threadID,
          async (err, info) => {
            await fs.unlink(imgPath).catch(() => {});
            if (err) return reject(err);
            resolve(info);
          },
          messageID
        );
      });
    } catch (err) {
      console.error("[hack]", err);
      send.reply(
        `╭─── « ❌ HACK FAILED » ───⟡\n│\n│ ⚠️ Hack karna fail ho gaya!\n│ ${err.message?.slice(0, 80) || "Unknown error"}\n│\n│ 🔄 Dobara try karo!\n│\n╰───────────────⟡`
      );
    }
  }
};
