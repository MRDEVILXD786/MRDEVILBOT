const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'dahibhaly',
    aliases: ['dahi', 'bhaly', 'dahibhali', 'daihibaly'],
    description: 'Dahi bhaly ki tasty image bhejo.',
    usage: 'dahibhaly',
    category: 'Food',
    adminOnly: false,
    prefix: true
  },

  async run({ event, send }) {
    const images = [
      "https://i.ibb.co/NdzhhYTD/fa1d7e1e7642.jpg",
      "https://i.ibb.co/mr9vTSR3/a5fbba67bdab.jpg",
      "https://i.ibb.co/KzbZrDMh/0401565279d5.jpg",
      "https://i.ibb.co/wrPfFSkM/aa94c365de29.jpg",
    ];

    const randomImg = images[Math.floor(Math.random() * images.length)];
    const cacheDir = path.join(__dirname, 'cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `dahibhaly_${Date.now()}.jpg`);

    try {
      const response = await axios.get(randomImg, { responseType: 'arraybuffer', timeout: 15000 });
      fs.writeFileSync(imgPath, Buffer.from(response.data));

      await send.reply({
        body: `╭─── « 🥄 DAHI BHALY » ───⟡\n│\n│ 🥄 Ye lo thande dahi bhaly\n│    aapke liye! 😋\n│\n│ 👑 MR DEVIL BOT\n╰───────────────⟡`,
        attachment: fs.createReadStream(imgPath)
      });
      try { fs.unlinkSync(imgPath); } catch {}
    } catch (err) {
      try { fs.unlinkSync(imgPath); } catch {}
      return send.reply(`╭─── « ❌ ERROR » ───⟡\n│\n│ 😔 Image nahi mili!\n│ Dobara try karo.\n│\n╰───────────────⟡`);
    }
  }
};
