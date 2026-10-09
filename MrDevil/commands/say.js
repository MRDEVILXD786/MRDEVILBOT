const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const cacheDir = path.join(__dirname, "..", "cache", "audio");

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'say',
    aliases: ['tts', 'speak'],
    description: 'Text ko audio mein convert karke send karo.',
    usage: 'say [message]',
    category: 'Fun',
    prefix: true,
    adminOnly: false
  },

  async run({ api, event, args, send }) {
    const { threadID, messageID } = event;

    if (!args.length) {
      return send.reply(
        `╭──── 🔊 SAY COMMAND ────╮\n` +
        `│\n` +
        `│  Text ko audio mein\n` +
        `│  convert karta hai!\n` +
        `│\n` +
        `│  📌 Usage:\n` +
        `│     .say Hello MR DEVIL Bot\n` +
        `│\n` +
        `╰────────────────────╯`
      );
    }

    const text = args.join(' ');
    const statusMsg = await api.sendMessage(`🎙️ Audio bana raha hun...\n📝 "${text.slice(0, 60)}${text.length > 60 ? '...' : ''}"`, threadID);
    const sid = statusMsg?.messageID;

    try {
      const apiRes = await axios.get("https://anabot.my.id/api/ai/geminiVoice", {
        params: { text, apikey: "freeApikey" },
        headers: { accept: "application/json" },
        timeout: 30000,
        validateStatus: () => true
      });

      if (apiRes.status !== 200 || !apiRes.data?.success || !apiRes.data?.data?.result) {
        try { api.unsendMessage(sid); } catch {}
        return send.reply("❌ Audio nahi ban saka. Thodi der baad try karo.");
      }

      const audioUrl = apiRes.data.data.result;
      console.log(`[say] Audio URL: ${audioUrl}`);

      fs.mkdirSync(cacheDir, { recursive: true });
      const filePath = path.join(cacheDir, `say_${Date.now()}.ogg`);

      const dlRes = await axios.get(audioUrl, {
        responseType: "arraybuffer",
        timeout: 30000,
        headers: { "User-Agent": "Mozilla/5.0" },
        maxRedirects: 5
      });

      if (!dlRes.data || dlRes.data.byteLength < 100) {
        try { api.unsendMessage(sid); } catch {}
        return send.reply("❌ Audio file empty aayi. Dobara try karo.");
      }

      fs.writeFileSync(filePath, Buffer.from(dlRes.data));

      try { api.unsendMessage(sid); } catch {}

      api.sendMessage(
        {
          body: `🎙️ "${text.slice(0, 80)}${text.length > 80 ? '...' : ''}"`,
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => { try { fs.unlinkSync(filePath); } catch {} },
        messageID
      );

    } catch (err) {
      console.error("[say] Error:", err.message);
      try { api.unsendMessage(sid); } catch {}
      send.reply("❌ Error: " + err.message);
    }
  }
};
