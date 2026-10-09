const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'biryani',
    aliases: ['biryaan', 'biryan', 'rice'],
    description: 'Biryani ki tasty image bhejo.',
    usage: 'biryani',
    category: 'Food',
    adminOnly: false,
    prefix: true
  },

  async run({ event, send }) {
    const images = [
      "https://i.ibb.co/n8L11FJ0/45561f6e3fbc.jpg",
      "https://i.ibb.co/PZHHpgZ2/4ca534cc31d8.jpg",
      "https://i.ibb.co/20gdynzC/41fdac1bbf8a.jpg",
      "https://i.ibb.co/Fk2f0TPZ/513d4286a3cd.jpg",
      "https://i.ibb.co/mC7CWS3h/193d24795e73.jpg",
    ];

    const randomImg = images[Math.floor(Math.random() * images.length)];
    const cacheDir = path.join(__dirname, 'cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `biryani_${Date.now()}.jpg`);

    try {
      const response = await axios.get(randomImg, { responseType: 'arraybuffer', timeout: 15000 });
      fs.writeFileSync(imgPath, Buffer.from(response.data));

      await send.reply({
        body: `╭─── « 🍚 BIRYANI » ───⟡\n│\n│ 🍛 Ye lo garam garam\n│    biryani aapke liye! 😋\n│\n│ 👑 MR DEVIL BOT\n╰───────────────⟡`,
        attachment: fs.createReadStream(imgPath)
      });
      try { fs.unlinkSync(imgPath); } catch {}
    } catch (err) {
      try { fs.unlinkSync(imgPath); } catch {}
      return send.reply(`╭─── « ❌ ERROR » ───⟡\n│\n│ 😔 Image nahi mili!\n│ Dobara try karo.\n│\n╰───────────────⟡`);
    }
  }
};
