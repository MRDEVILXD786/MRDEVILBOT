const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'golgapy',
    aliases: ['golgappy', 'panipuri', 'golgappa'],
    description: 'Golgapy ki chatpati image bhejo.',
    usage: 'golgapy',
    category: 'Food',
    adminOnly: false,
    prefix: true
  },

  async run({ event, send }) {
    const images = [
      "https://i.ibb.co/k2NwGgc8/ede759508160.jpg",
      "https://i.ibb.co/Kj9MhpZL/68e42e07c04b.jpg",
      "https://i.ibb.co/4ZvVcSnk/a14c13ec5c55.jpg",
      "https://i.ibb.co/LDNKH0mt/f9f099213dec.jpg",
    ];

    const randomImg = images[Math.floor(Math.random() * images.length)];
    const cacheDir = path.join(__dirname, 'cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `golgapy_${Date.now()}.jpg`);

    try {
      const response = await axios.get(randomImg, { responseType: 'arraybuffer', timeout: 15000 });
      fs.writeFileSync(imgPath, Buffer.from(response.data));

      await send.reply({
        body: `╭─── « 💦 GOLGAPY » ───⟡\n│\n│ 💦 Ye lo chatpate golgapy\n│    aapke liye! 😋\n│\n│ 👑 MR DEVIL BOT\n╰───────────────⟡`,
        attachment: fs.createReadStream(imgPath)
      });
      try { fs.unlinkSync(imgPath); } catch {}
    } catch (err) {
      try { fs.unlinkSync(imgPath); } catch {}
      return send.reply(`╭─── « ❌ ERROR » ───⟡\n│\n│ 😔 Image nahi mili!\n│ Dobara try karo.\n│\n╰───────────────⟡`);
    }
  }
};
