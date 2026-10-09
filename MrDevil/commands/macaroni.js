const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'macaroni',
    aliases: ['mac', 'maca', 'macapasta'],
    description: 'Macaroni ki tasty image bhejo.',
    usage: 'macaroni',
    category: 'Food',
    adminOnly: false,
    prefix: true
  },

  async run({ event, send }) {
    const images = [
      "https://i.ibb.co/4GDNw07/bbc47d61254c.jpg",
      "https://i.ibb.co/6Jgr4yjJ/509bab38ea67.jpg",
      "https://i.ibb.co/VWpg4TVM/358e414c2016.jpg",
      "https://i.ibb.co/67PLXjmG/63beae17c265.jpg",
      "https://i.ibb.co/WWr9JwFS/e5b7f1bf0346.jpg",
    ];

    const randomImg = images[Math.floor(Math.random() * images.length)];
    const cacheDir = path.join(__dirname, 'cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `macaroni_${Date.now()}.jpg`);

    try {
      const response = await axios.get(randomImg, { responseType: 'arraybuffer', timeout: 15000 });
      fs.writeFileSync(imgPath, Buffer.from(response.data));

      await send.reply({
        body: `╭─── « 🍝 MACARONI » ───⟡\n│\n│ 🍝 Ye lo garam macaroni\n│    aapke liye! 😋\n│\n│ 👑 MR DEVIL BOT\n╰───────────────⟡`,
        attachment: fs.createReadStream(imgPath)
      });
      try { fs.unlinkSync(imgPath); } catch {}
    } catch (err) {
      try { fs.unlinkSync(imgPath); } catch {}
      return send.reply(`╭─── « ❌ ERROR » ───⟡\n│\n│ 😔 Image nahi mili!\n│ Dobara try karo.\n│\n╰───────────────⟡`);
    }
  }
};
