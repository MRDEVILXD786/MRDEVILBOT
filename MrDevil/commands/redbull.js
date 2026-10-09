const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'redbull',
    aliases: ['red', 'bull', 'redbul', 'energydrink'],
    description: 'Red Bull ki energy image bhejo.',
    usage: 'redbull',
    category: 'Food',
    adminOnly: false,
    prefix: true
  },

  async run({ event, send }) {
    const images = [
      "https://i.ibb.co/3YMC5C7d/4139554525fd.jpg",
      "https://i.ibb.co/Q700ZJDg/6ffc43220d2d.jpg",
      "https://i.ibb.co/d1gBLN3/f3f708416c5f.jpg",
      "https://i.ibb.co/gFZ3Nw2R/734b145796f0.jpg",
    ];

    const randomImg = images[Math.floor(Math.random() * images.length)];
    const cacheDir = path.join(__dirname, 'cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `redbull_${Date.now()}.jpg`);

    try {
      const response = await axios.get(randomImg, { responseType: 'arraybuffer', timeout: 15000 });
      fs.writeFileSync(imgPath, Buffer.from(response.data));

      await send.reply({
        body: `╭─── « 🔴 RED BULL » ───⟡\n│\n│ ⚡ Ye lo energy Red Bull\n│    aapke liye! 💪\n│\n│ 👑 MR DEVIL BOT\n╰───────────────⟡`,
        attachment: fs.createReadStream(imgPath)
      });
      try { fs.unlinkSync(imgPath); } catch {}
    } catch (err) {
      try { fs.unlinkSync(imgPath); } catch {}
      return send.reply(`╭─── « ❌ ERROR » ───⟡\n│\n│ 😔 Image nahi mili!\n│ Dobara try karo.\n│\n╰───────────────⟡`);
    }
  }
};
