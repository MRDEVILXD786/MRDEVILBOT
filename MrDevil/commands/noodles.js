const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'noodles',
    aliases: ['noodle', 'nodles', 'nood', 'noddles'],
    description: 'Noodles ki tasty image bhejo.',
    usage: 'noodles',
    category: 'Food',
    adminOnly: false,
    prefix: true
  },

  async run({ event, send }) {
    const images = [
      "https://i.ibb.co/tTf4PF1h/8e7bf0697f4e.jpg",
      "https://i.ibb.co/DgCmqL4J/e0de79d575ff.jpg",
      "https://i.ibb.co/spKkfD5Q/f7303a22f824.jpg",
      "https://i.ibb.co/7xM2YNdh/c89536807a92.jpg",
      "https://i.ibb.co/84xT96pW/576a5659629a.jpg",
    ];

    const randomImg = images[Math.floor(Math.random() * images.length)];
    const cacheDir = path.join(__dirname, 'cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `noodles_${Date.now()}.jpg`);

    try {
      const response = await axios.get(randomImg, { responseType: 'arraybuffer', timeout: 15000 });
      fs.writeFileSync(imgPath, Buffer.from(response.data));

      await send.reply({
        body: `╭─── « 🍜 NOODLES » ───⟡\n│\n│ 🍜 Ye lo garam noodles\n│    aapke liye! 😋\n│\n│ 👑 MR DEVIL BOT\n╰───────────────⟡`,
        attachment: fs.createReadStream(imgPath)
      });
      try { fs.unlinkSync(imgPath); } catch {}
    } catch (err) {
      try { fs.unlinkSync(imgPath); } catch {}
      return send.reply(`╭─── « ❌ ERROR » ───⟡\n│\n│ 😔 Image nahi mili!\n│ Dobara try karo.\n│\n╰───────────────⟡`);
    }
  }
};
