const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'pasta',
    aliases: ['past', 'spaghetti', 'italian'],
    description: 'Pasta ki tasty image bhejo.',
    usage: 'pasta',
    category: 'Food',
    adminOnly: false,
    prefix: true
  },

  async run({ event, send }) {
    const images = [
      "https://i.ibb.co/3mPrGjLX/a3a35c560d21.jpg",
      "https://i.ibb.co/svpPMcNF/529f231b21c4.jpg",
      "https://i.ibb.co/1pYm415/f66077d1233d.jpg",
      "https://i.ibb.co/rGxTLkKm/c249e78fbac4.jpg",
      "https://i.ibb.co/yndL45Nz/af49533a363c.jpg",
    ];

    const randomImg = images[Math.floor(Math.random() * images.length)];
    const cacheDir = path.join(__dirname, 'cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `pasta_${Date.now()}.jpg`);

    try {
      const response = await axios.get(randomImg, { responseType: 'arraybuffer', timeout: 15000 });
      fs.writeFileSync(imgPath, Buffer.from(response.data));

      await send.reply({
        body: `╭─── « 🍝 PASTA » ───⟡\n│\n│ 🍝 Ye lo garam pasta\n│    aapke liye! 😋\n│\n│ 👑 MR DEVIL BOT\n╰───────────────⟡`,
        attachment: fs.createReadStream(imgPath)
      });
      try { fs.unlinkSync(imgPath); } catch {}
    } catch (err) {
      try { fs.unlinkSync(imgPath); } catch {}
      return send.reply(`╭─── « ❌ ERROR » ───⟡\n│\n│ 😔 Image nahi mili!\n│ Dobara try karo.\n│\n╰───────────────⟡`);
    }
  }
};
