const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'lassi',
    aliases: ['lassee', 'lassy', 'yogurtdrink'],
    description: 'Lassi ki thandi image bhejo.',
    usage: 'lassi',
    category: 'Food',
    adminOnly: false,
    prefix: true
  },

  async run({ event, send }) {
    const images = [
      "https://i.ibb.co/Q7zzN5Dd/90674709056d.jpg",
      "https://i.ibb.co/cSg2mYDr/c97a0916274f.jpg",
      "https://i.ibb.co/gMx83j43/aa6b14a22144.jpg",
      "https://i.ibb.co/h1BQsGfr/2d566af526b1.jpg",
    ];

    const randomImg = images[Math.floor(Math.random() * images.length)];
    const cacheDir = path.join(__dirname, 'cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `lassi_${Date.now()}.jpg`);

    try {
      const response = await axios.get(randomImg, { responseType: 'arraybuffer', timeout: 15000 });
      fs.writeFileSync(imgPath, Buffer.from(response.data));

      await send.reply({
        body: `╭─── « 🥤 LASSI » ───⟡\n│\n│ 🥤 Ye lo thandi lassi\n│    aapke liye! 😋\n│\n│ 👑 MR DEVIL BOT\n╰───────────────⟡`,
        attachment: fs.createReadStream(imgPath)
      });
      try { fs.unlinkSync(imgPath); } catch {}
    } catch (err) {
      try { fs.unlinkSync(imgPath); } catch {}
      return send.reply(`╭─── « ❌ ERROR » ───⟡\n│\n│ 😔 Image nahi mili!\n│ Dobara try karo.\n│\n╰───────────────⟡`);
    }
  }
};
