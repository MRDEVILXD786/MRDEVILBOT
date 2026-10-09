const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'barfi',
    aliases: ['barf', 'barfee', 'burfi', 'mithai'],
    description: 'Barfi ki tasty image bhejo.',
    usage: 'barfi',
    category: 'Food',
    adminOnly: false,
    prefix: true
  },

  async run({ event, send }) {
    const images = [
      "https://i.ibb.co/SXtJ8wBV/d3f4a1c07616.jpg",
      "https://i.ibb.co/ds1krGZL/62a5888c271d.jpg",
      "https://i.ibb.co/fdRP6hhN/707a3f235d0c.jpg",
      "https://i.ibb.co/27tNQK6h/6060868fba1e.jpg",
      "https://i.ibb.co/Tzwy0Bp/17d315cd68f7.jpg",
      "https://i.ibb.co/m5cXnW7m/9e08926c9689.jpg",
    ];

    const randomImg = images[Math.floor(Math.random() * images.length)];
    const cacheDir = path.join(__dirname, 'cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `barfi_${Date.now()}.jpg`);

    try {
      const response = await axios.get(randomImg, { responseType: 'arraybuffer', timeout: 15000 });
      fs.writeFileSync(imgPath, Buffer.from(response.data));

      await send.reply({
        body: `╭─── « 🤎 BARFI » ───⟡\n│\n│ 🍬 Ye lo meethi barfi\n│    aapke liye! 😋\n│\n│ 👑 MR DEVIL BOT\n╰───────────────⟡`,
        attachment: fs.createReadStream(imgPath)
      });
      try { fs.unlinkSync(imgPath); } catch {}
    } catch (err) {
      try { fs.unlinkSync(imgPath); } catch {}
      return send.reply(`╭─── « ❌ ERROR » ───⟡\n│\n│ 😔 Image nahi mili!\n│ Dobara try karo.\n│\n╰───────────────⟡`);
    }
  }
};
