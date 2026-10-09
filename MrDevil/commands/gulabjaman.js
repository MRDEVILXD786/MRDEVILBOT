const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'gulabjaman',
    aliases: ['gulab', 'jamun', 'gulabkajaman'],
    description: 'Gulab jaman ki tasty image bhejo.',
    usage: 'gulabjaman',
    category: 'Food',
    adminOnly: false,
    prefix: true
  },

  async run({ event, send }) {
    const images = [
      "https://i.ibb.co/5W1G69Sp/8a24d98be3f8.jpg",
      "https://i.ibb.co/B5nBK19p/588bb17d06fc.jpg",
      "https://i.ibb.co/DPCtv0R4/2344db972873.jpg",
      "https://i.ibb.co/4ZzPcPgK/32f091005182.jpg",
    ];

    const randomImg = images[Math.floor(Math.random() * images.length)];
    const cacheDir = path.join(__dirname, 'cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `gulabjaman_${Date.now()}.jpg`);

    try {
      const response = await axios.get(randomImg, { responseType: 'arraybuffer', timeout: 15000 });
      fs.writeFileSync(imgPath, Buffer.from(response.data));

      await send.reply({
        body: `╭─── « 🤎 GULAB JAMAN » ───⟡\n│\n│ 🍮 Ye lo meethe gulab jaman\n│    aapke liye! 😋\n│\n│ 👑 MR DEVIL BOT\n╰───────────────⟡`,
        attachment: fs.createReadStream(imgPath)
      });
      try { fs.unlinkSync(imgPath); } catch {}
    } catch (err) {
      try { fs.unlinkSync(imgPath); } catch {}
      return send.reply(`╭─── « ❌ ERROR » ───⟡\n│\n│ 😔 Image nahi mili!\n│ Dobara try karo.\n│\n╰───────────────⟡`);
    }
  }
};
