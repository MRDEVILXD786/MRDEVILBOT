const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'chocolate',
    aliases: ['choco', 'chokolate', 'choccy', 'cocoa'],
    description: 'Chocolate ki tasty image bhejo.',
    usage: 'chocolate',
    category: 'Food',
    adminOnly: false,
    prefix: true
  },

  async run({ event, send }) {
    const images = [
      "https://i.ibb.co/KcVJtqBC/719e0aa8285f.jpg",
      "https://i.ibb.co/1JBJwSn2/fc5210230941.jpg",
      "https://i.ibb.co/C5YJ5Vp7/b5aaa66ffae0.jpg",
      "https://i.ibb.co/rGJ4snZm/b4da882bdd6a.jpg",
    ];

    const randomImg = images[Math.floor(Math.random() * images.length)];
    const cacheDir = path.join(__dirname, 'cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `chocolate_${Date.now()}.jpg`);

    try {
      const response = await axios.get(randomImg, { responseType: 'arraybuffer', timeout: 15000 });
      fs.writeFileSync(imgPath, Buffer.from(response.data));

      await send.reply({
        body: `╭─── « 🍫 CHOCOLATE » ───⟡\n│\n│ 🍫 Ye lo meetha chocolate\n│    aapke liye! 😋\n│\n│ 👑 MR DEVIL BOT\n╰───────────────⟡`,
        attachment: fs.createReadStream(imgPath)
      });
      try { fs.unlinkSync(imgPath); } catch {}
    } catch (err) {
      try { fs.unlinkSync(imgPath); } catch {}
      return send.reply(`╭─── « ❌ ERROR » ───⟡\n│\n│ 😔 Image nahi mili!\n│ Dobara try karo.\n│\n╰───────────────⟡`);
    }
  }
};
