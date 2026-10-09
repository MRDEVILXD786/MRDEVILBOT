const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const cacheDir = path.join(__dirname, "cache", "audio");

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: "ytmp3",
    aliases: ["yt", "ytaudio", "youtubemp3", "ytdl"],
    description: "YouTube video ko MP3 mein convert karke send karo.",
    usage: "ytmp3 [YouTube link]",
    category: "Media",
    prefix: true,
    cooldowns: 15
  },
  async run({ api, event, args, send }) {
    const { threadID, messageID } = event;

    if (!args[0]) {
      return send.reply(
        `❌ YouTube link dena zaroori hai!\n\n` +
        `📌 𝐔𝐬𝐚𝐠𝐞: .ytmp3 [YouTube link]\n` +
        `📌 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: .ytmp3 https://youtu.be/abc123`
      );
    }

    const url = args[0].trim();
    if (!url.includes("youtu.be") && !url.includes("youtube.com")) {
      return send.reply("❌ Valid YouTube link do!\n📌 Example: https://youtu.be/abc123");
    }

    send.reply("⏳ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐡𝐨 𝐫𝐚𝐡𝐚 𝐡𝐚𝐢, 𝐳𝐚𝐫𝐚 𝐫𝐮𝐤𝐨...");

    try {
      const apiRes = await axios.get("https://anabot.my.id/api/download/ytmp3", {
        params: { url, apikey: "freeApikey" },
        headers: { accept: "application/json" },
        timeout: 60000
      });

      const result = apiRes.data?.data?.result;
      if (!result?.success || !result?.urls) {
        return send.reply("❌ Download fail ho gaya. Dobara koshish karo ya doosra link do.");
      }

      const meta = result.metadata || {};
      const title = meta.title || "Unknown Title";
      const duration = meta.duration
        ? `${Math.floor(meta.duration / 60)}:${String(meta.duration % 60).padStart(2, "0")}`
        : "?";
      const channel = meta.channel || meta.uploader || "Unknown";
      const views = meta.view_count ? Number(meta.view_count).toLocaleString() : "?";
      const audioUrl = result.urls;

      fs.mkdirSync(cacheDir, { recursive: true });
      const fileName = `ytmp3_${Date.now()}.mp3`;
      const filePath = path.join(cacheDir, fileName);

      const audioRes = await axios.get(audioUrl, {
        responseType: "arraybuffer",
        timeout: 120000
      });
      fs.writeFileSync(filePath, Buffer.from(audioRes.data));

      const caption =
        `🎵 𝐘𝐨𝐮𝐓𝐮𝐛𝐞 𝐌𝐏𝟑 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📌 𝐓𝐢𝐭𝐥𝐞  : ${title}\n` +
        `🎙️ 𝐂𝐡𝐚𝐧𝐧𝐞𝐥: ${channel}\n` +
        `⏱️ 𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: ${duration}\n` +
        `👁️ 𝐕𝐢𝐞𝐰𝐬  : ${views}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `✅ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐌𝐑 𝐃𝐄𝐕𝐈𝐋 𝐁𝐎𝐓`;

      api.sendMessage(
        {
          body: caption,
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => { try { fs.unlinkSync(filePath); } catch {} },
        messageID
      );

    } catch (err) {
      console.error("[ytmp3]", err.message);
      if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
        return send.reply("⏰ Request timeout ho gaya. Network slow hai, dobara try karo.");
      }
      send.reply("❌ Error aa gaya: " + err.message);
    }
  }
};
