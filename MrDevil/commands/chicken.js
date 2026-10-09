const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'chicken',
    aliases: ['chick', 'murghi', 'murgh', 'murga'],
    description: 'Chicken ki tasty image bhejo.',
    usage: 'chicken',
    category: 'Food',
    adminOnly: false,
    prefix: true
  },

  async run({ event, send }) {
    const images = [
      "https://i.ibb.co/C3s0kL6D/b8d5bf18fdd4.jpg",
      "https://i.ibb.co/wFgySXxD/5a6f068f3b5c.jpg",
      "https://i.ibb.co/fdRD7zK0/4f48e07c4cb2.jpg",
      "https://i.ibb.co/gZgRfddC/54bf19e537bc.jpg",
      "https://i.ibb.co/tT56PvDp/8289efdb75fb.jpg",
      "https://i.ibb.co/677HmDGy/2f1120a8dd24.jpg",
    ];

    const randomImg = images[Math.floor(Math.random() * images.length)];
    const cacheDir = path.join(__dirname, 'cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `chicken_${Date.now()}.jpg`);

    try {
      const response = await axios.get(randomImg, { responseType: 'arraybuffer', timeout: 15000 });
      fs.writeFileSync(imgPath, Buffer.from(response.data));

      await send.reply({
        body: `╭─── « 🍗 CHICKEN » ───⟡\n│\n│ 🍗 Ye lo crispy chicken\n│    aapke liye! 😋\n│\n│ 👑 MR DEVIL BOT\n╰───────────────⟡`,
        attachment: fs.createReadStream(imgPath)
      });
      try { fs.unlinkSync(imgPath); } catch {}
    } catch (err) {
      try { fs.unlinkSync(imgPath); } catch {}
      return send.reply(`╭─── « ❌ ERROR » ───⟡\n│\n│ 😔 Image nahi mili!\n│ Dobara try karo.\n│\n╰───────────────⟡`);
    }
  }
};
