const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'gajar',
    aliases: ['gajarkahalwa', 'halwa', 'carrot', 'gajrela'],
    description: 'Gajar ka halwa ki tasty image bhejo.',
    usage: 'gajar',
    category: 'Food',
    adminOnly: false,
    prefix: true
  },

  async run({ event, send }) {
    const images = [
      "https://i.ibb.co/v6h1YM7T/ae3f779ec4f5.jpg",
      "https://i.ibb.co/d45HQY2L/9e84433f0914.jpg",
      "https://i.ibb.co/p6d4cxh7/50ee6c736197.jpg",
      "https://i.ibb.co/2YpfC094/815483cb4031.jpg",
    ];

    const randomImg = images[Math.floor(Math.random() * images.length)];
    const cacheDir = path.join(__dirname, 'cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `gajar_${Date.now()}.jpg`);

    try {
      const response = await axios.get(randomImg, { responseType: 'arraybuffer', timeout: 15000 });
      fs.writeFileSync(imgPath, Buffer.from(response.data));

      await send.reply({
        body: `╭─── « 🧡 GAJAR KA HALWA » ───⟡\n│\n│ 🧡 Ye lo meetha gajar halwa\n│    aapke liye! 😋\n│\n│ 👑 MR DEVIL BOT\n╰───────────────⟡`,
        attachment: fs.createReadStream(imgPath)
      });
      try { fs.unlinkSync(imgPath); } catch {}
    } catch (err) {
      try { fs.unlinkSync(imgPath); } catch {}
      return send.reply(`╭─── « ❌ ERROR » ───⟡\n│\n│ 😔 Image nahi mili!\n│ Dobara try karo.\n│\n╰───────────────⟡`);
    }
  }
};
