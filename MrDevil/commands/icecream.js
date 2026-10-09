const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'icecream',
    aliases: ['ice', 'icecrem', 'frozen'],
    description: 'Ice cream ki tasty image bhejo.',
    usage: 'icecream',
    category: 'Food',
    adminOnly: false,
    prefix: true
  },

  async run({ event, send }) {
    const images = [
      "https://i.ibb.co/35n6QnJS/012361b81d6f.jpg",
      "https://i.ibb.co/BHgST4Tk/29f1d99187db.jpg",
      "https://i.ibb.co/PGVvmvKN/5ab35a4a2f3c.jpg",
      "https://i.ibb.co/nM7Hm2rk/7525463b4bb9.jpg",
      "https://i.ibb.co/CT0BrK5/eeb711969a10.jpg",
    ];

    const randomImg = images[Math.floor(Math.random() * images.length)];
    const cacheDir = path.join(__dirname, 'cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `icecream_${Date.now()}.jpg`);

    try {
      const response = await axios.get(randomImg, { responseType: 'arraybuffer', timeout: 15000 });
      fs.writeFileSync(imgPath, Buffer.from(response.data));

      await send.reply({
        body: `╭─── « 🍦 ICE CREAM » ───⟡\n│\n│ 🍦 Ye lo thandi ice cream\n│    aapke liye! 😋\n│\n│ 👑 MR DEVIL BOT\n╰───────────────⟡`,
        attachment: fs.createReadStream(imgPath)
      });
      try { fs.unlinkSync(imgPath); } catch {}
    } catch (err) {
      try { fs.unlinkSync(imgPath); } catch {}
      return send.reply(`╭─── « ❌ ERROR » ───⟡\n│\n│ 😔 Image nahi mili!\n│ Dobara try karo.\n│\n╰───────────────⟡`);
    }
  }
};
