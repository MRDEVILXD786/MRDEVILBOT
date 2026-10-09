const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'rasgullah',
    aliases: ['rasgula', 'rassgule', 'rasgulah'],
    description: 'Ras gullah ki tasty image bhejo.',
    usage: 'rasgullah',
    category: 'Food',
    adminOnly: false,
    prefix: true
  },

  async run({ event, send }) {
    const images = [
      "https://i.ibb.co/dJVgHVN4/b9089737b1bc.jpg",
      "https://i.ibb.co/b5SWKh1T/cc829d8b6e28.jpg",
      "https://i.ibb.co/pBGt1t31/60c3fb1b010b.jpg",
      "https://i.ibb.co/R4gbNJs0/9f3cc7800b32.jpg",
      "https://i.ibb.co/k2XH8tGg/cab866c42522.jpg",
    ];

    const randomImg = images[Math.floor(Math.random() * images.length)];
    const cacheDir = path.join(__dirname, 'cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `rasgullah_${Date.now()}.jpg`);

    try {
      const response = await axios.get(randomImg, { responseType: 'arraybuffer', timeout: 15000 });
      fs.writeFileSync(imgPath, Buffer.from(response.data));

      await send.reply({
        body: `╭─── « 🤎 RAS GULLAH » ───⟡\n│\n│ 🍮 Ye lo meethe ras gullah\n│    aapke liye! 😋\n│\n│ 👑 MR DEVIL BOT\n╰───────────────⟡`,
        attachment: fs.createReadStream(imgPath)
      });
      try { fs.unlinkSync(imgPath); } catch {}
    } catch (err) {
      try { fs.unlinkSync(imgPath); } catch {}
      return send.reply(`╭─── « ❌ ERROR » ───⟡\n│\n│ 😔 Image nahi mili!\n│ Dobara try karo.\n│\n╰───────────────⟡`);
    }
  }
};
