const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: "edit",
    aliases: ["aiedit", "imageedit"],
    description: "Edit images using NanoBanana AI",
    usage: "edit [prompt] - Reply to an image",
    category: "Media",
    adminOnly: false,
    prefix: true
  },

  async run({ api, event, args, send }) {
    const { threadID, messageID, messageReply } = event;

    if (!messageReply) {
      return send.reply("🔄 Please reply to an image with your edit prompt!\n\n💭 Example: .edit make it vintage style");
    }

    if (!messageReply.attachments || messageReply.attachments.length === 0) {
      return send.reply("🖼️ No image found in replied message!\n\nReply to an image message.");
    }

    const attachment = messageReply.attachments[0];
    if (attachment.type !== "photo") {
      return send.reply("📸 Only images are supported! Not " + attachment.type);
    }

    const prompt = args.join(" ");
    if (!prompt) {
      return send.reply("✍️ Provide an edit prompt!\n\n🎯 Example: .edit add sparkles around");
    }

    const imageUrl = attachment.url;
    const processingMsg = await send.reply("🎭 Working on your edit...\n⏱️ Please wait a moment...");

    try {
      const cacheDir = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheDir);

      const cookie = "AEC=AVh_V2iyBHpOrwnn7CeXoAiedfWn9aarNoKT20Br2UX9Td9K-RAeS_o7Sg; HSID=Ao0szVfkYnMchTVfk; SSID=AGahZP8H4ni4UpnFV; APISID=SD-Q2DJLGdmZcxlA/AS8N0Gkp_b9sJC84f; SAPISID=9BY2tOwgEz4dK4dY/Acpw5_--fM7PV-aw4; __Secure-1PAPISID=9BY2tOwgEz4dK4dY/Acpw5_--fM7PV-aw4; __Secure-3PAPISID=9BY2tOwgEz4dK4dY/Acpw5_--fM7PV-aw4; SEARCH_SAMESITE=CgQI354B; SID=g.a0002wiVPDeqp9Z41WGZdsMDSNVWFaxa7cmenLYb7jwJzpe0kW3bZzx09pPfc201wUcRVKfh-wACgYKAXUSARMSFQHGX2MiU_dnPuMOs-717cJlLCeWOBoVAUF8yKpYTllPAbVgYQ0Mr_GyeXxV0076; __Secure-1PSID=g.a0002wiVPDeqp9Z41WGZdsMDSNVWFaxa7cmenLYb7jwJzpe0kW3b_Pt9L1eqcIAVeh7ZdRBOXgACgYKAYESARMSFQHGX2MicAK_Acu_-NCkzEz2wjCHmxoVAUF8yKp9xk8gQ82f-Ob76ysTXojB0076; __Secure-3PSID=g.a0002wiVPDeqp9Z41WGZdsMDSNVWFaxa7cmenLYb7jwJzpe0kW3bUudZTunPKtKbLRSoGKl1dAACgYKAYISARMSFQHGX2MimdzCEq63UmiyGU-3eyZx9RoVAUF8yKrc4ycLY7LGaJUyDXk_7u7M0076";

      const apiUrl = `https://anabot.my.id/api/ai/geminiOption?prompt=${encodeURIComponent(prompt)}&type=NanoBanana&imageUrl=${encodeURIComponent(imageUrl)}&cookie=${encodeURIComponent(cookie)}&apikey=freeApikey`;

      const response = await axios.get(apiUrl, {
        headers: { 'Accept': 'application/json' },
        timeout: 60000,
        validateStatus: (status) => status < 600
      });

      if (response.status === 500 && response.data?.error) {
        throw new Error(`API Error: ${response.data.error} - ${response.data.details || 'Server issue'}`);
      }

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.error || "API request failed or returned no data");
      }

      const resultUrl = response.data.data?.result?.url;
      if (!resultUrl) throw new Error("No edited image URL returned from API");

      const fileName = `edit_${Date.now()}.png`;
      const filePath = path.join(cacheDir, fileName);

      const imageResponse = await axios({ url: resultUrl, method: "GET", responseType: "stream", timeout: 60000 });
      const writer = fs.createWriteStream(filePath);
      imageResponse.data.pipe(writer);

      writer.on("finish", () => {
        api.unsendMessage(processingMsg.messageID);
        api.sendMessage(
          { body: `🎉 Edit complete!\n\n✏️ Prompt: ${prompt}\n\n⚡ Powered by NanoBanana AI`, attachment: fs.createReadStream(filePath) },
          threadID,
          () => { try { fs.unlinkSync(filePath); } catch {} },
          messageID
        );
      });

      writer.on("error", () => {
        api.unsendMessage(processingMsg.messageID);
        api.sendMessage("📥 Couldn't download the edited image. Try again!", threadID, messageID);
      });

    } catch (error) {
      try { api.unsendMessage(processingMsg.messageID); } catch {}

      let errorMessage = "⚡ Something went wrong while editing.";
      if (error.message?.includes('ENOSPC')) {
        errorMessage = "🛑 API server is full.\n\nTry again in a few minutes.";
      } else if (error.response?.status === 500) {
        errorMessage = "🔧 Server error (500). The service is down.\n\nPlease try later.";
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        errorMessage = "⏰ Request timed out.\n\nPlease try again.";
      } else if (error.message) {
        errorMessage += `\n\n🔍 ${error.message}`;
      }

      send.reply(errorMessage);
    }
  }
};
