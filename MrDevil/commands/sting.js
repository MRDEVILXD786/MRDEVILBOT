const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'sting',
    aliases: ['stng', 'stingenergy', 'yellowdrink'],
    description: 'Sting energy drink ki image bhejo.',
    usage: 'sting',
    category: 'Food',
    adminOnly: false,
    prefix: true
  },

  async run({ event, send }) {
    const images = [
      "https://i.ibb.co/x8MH5rPs/40d90aea8633.jpg",
      "https://i.ibb.co/V0p7gC3P/4aa2ae423871.jpg",
      "https://i.ibb.co/6c49Gs5c/7394af30090d.jpg",
      "https://i.ibb.co/DPVg89ct/43c07f110c0c.jpg",
      "https://i.ibb.co/PGkj6nsh/9fe07eea7a37.jpg",
    ];

    const randomImg = images[Math.floor(Math.random() * images.length)];
    const cacheDir = path.join(__dirname, 'cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `sting_${Date.now()}.jpg`);

    try {
      const response = await axios.get(randomImg, { responseType: 'arraybuffer', timeout: 15000 });
      fs.writeFileSync(imgPath, Buffer.from(response.data));

      await send.reply({
        body: `╭─── « 💛 STING » ───⟡\n│\n│ ⚡ Ye lo Sting energy drink\n│    aapke liye! 💪\n│\n│ 👑 MR DEVIL BOT\n╰───────────────⟡`,
        attachment: fs.createReadStream(imgPath)
      });
      try { fs.unlinkSync(imgPath); } catch {}
    } catch (err) {
      try { fs.unlinkSync(imgPath); } catch {}
      return send.reply(`╭─── « ❌ ERROR » ───⟡\n│\n│ 😔 Image nahi mili!\n│ Dobara try karo.\n│\n╰───────────────⟡`);
    }
  }
};
