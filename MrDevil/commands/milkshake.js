const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'milkshake',
    aliases: ['milk', 'shake', 'milshake'],
    description: 'Milkshake ki tasty image bhejo.',
    usage: 'milkshake',
    category: 'Food',
    adminOnly: false,
    prefix: true
  },

  async run({ event, send }) {
    const images = [
      "https://i.ibb.co/ZpdzGc8q/308fee130a99.jpg",
      "https://i.ibb.co/hx83fS0w/7112d609c43f.jpg",
      "https://i.ibb.co/JWstZH8H/c85a112aaaca.jpg",
      "https://i.ibb.co/GgFXdRX/a5be66e9f6e2.jpg",
      "https://i.ibb.co/Lzz81Ld5/aa6cdf96b80a.jpg",
      "https://i.ibb.co/FkJVdVf8/6b276c407771.jpg",
      "https://i.ibb.co/VccHhKdd/d4b82bd3fea8.jpg",
    ];

    const randomImg = images[Math.floor(Math.random() * images.length)];
    const cacheDir = path.join(__dirname, 'cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `milkshake_${Date.now()}.jpg`);

    try {
      const response = await axios.get(randomImg, { responseType: 'arraybuffer', timeout: 15000 });
      fs.writeFileSync(imgPath, Buffer.from(response.data));

      await send.reply({
        body: `╭─── « 🥛 MILKSHAKE » ───⟡\n│\n│ 🥛 Ye lo meetha milkshake\n│    aapke liye! 😋\n│\n│ 👑 MR DEVIL BOT\n╰───────────────⟡`,
        attachment: fs.createReadStream(imgPath)
      });
      try { fs.unlinkSync(imgPath); } catch {}
    } catch (err) {
      try { fs.unlinkSync(imgPath); } catch {}
      return send.reply(`╭─── « ❌ ERROR » ───⟡\n│\n│ 😔 Image nahi mili!\n│ Dobara try karo.\n│\n╰───────────────⟡`);
    }
  }
};
