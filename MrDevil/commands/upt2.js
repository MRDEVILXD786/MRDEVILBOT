const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const moment = require('moment-timezone');

const remoteBgUrl = "https://i.ibb.co/fYVBxsHR/a5d5f38e5a81.jpg";

const sleep   = ms => new Promise(r => setTimeout(r, ms));
const editMsg = (api, text, msgID) => { try { api.editMessage(text, msgID); } catch {} };
const sendMsg = (api, text, threadID, replyTo) => new Promise(r => api.sendMessage(text, threadID, (e, i) => r(i), replyTo));

function bold(t) {
  const map = { a:'𝗮',b:'𝗯',c:'𝗰',d:'𝗱',e:'𝗲',f:'𝗳',g:'𝗴',h:'𝗵',i:'𝗶',j:'𝗷',k:'𝗸',l:'𝗹',m:'𝗺',n:'𝗻',o:'𝗼',p:'𝗽',q:'𝗾',r:'𝗿',s:'𝘀',t:'𝘁',u:'𝘂',v:'𝘃',w:'𝘄',x:'𝘅',y:'𝘆',z:'𝘇',A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',E:'𝗘',F:'𝗙',G:'𝗚',H:'𝗛',I:'𝗜',J:'𝗝',K:'𝗞',L:'𝗟',M:'𝗠',N:'𝗡',O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',T:'𝗧',U:'𝗨',V:'𝗩',W:'𝗪',X:'𝗫',Y:'𝗬',Z:'𝗭',0:'𝟬',1:'𝟭',2:'𝟮',3:'𝟯',4:'𝟰',5:'𝟱',6:'𝟲',7:'𝟳',8:'𝟴',9:'𝟵' };
  return String(t).split('').map(c => map[c] || c).join('');
}

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'upt2',
    aliases: ['uptime2', 'status2'],
    description: 'Bot ki uptime image ke saath dekho.',
    usage: 'upt2',
    category: 'Utility',
    prefix: true
  },

  async run({ api, event, config, client }) {
    const { threadID, messageID } = event;

    const cacheDir = path.join(__dirname, 'cache', 'upt');
    fs.ensureDirSync(cacheDir);
    const tempPath   = path.join(cacheDir, 'temp_bg_upt2.jpg');
    const outputPath = path.join(cacheDir, `upt2_${threadID}_${Date.now()}.png`);

    const sent = await sendMsg(api,
      `╭─── « ⚡ UPT2 » ───⟡\n│\n│ ⌛ ▱▱▱▱▱▱▱▱▱▱ 𝟬%\n│    Starting...\n│\n╰───────────────⟡`,
      threadID, messageID
    );

    await sleep(600);
    await editMsg(api,
      `╭─── « ⚡ UPT2 » ───⟡\n│\n│ 🔄 ▰▰▰▱▱▱▱▱▱▱ 𝟯𝟬%\n│    Downloading bg image...\n│\n╰───────────────⟡`,
      sent.messageID
    );

    try {
      if (!fs.existsSync(tempPath)) {
        const bgRes = await axios.get(remoteBgUrl, { responseType: 'arraybuffer', timeout: 20000 });
        fs.writeFileSync(tempPath, Buffer.from(bgRes.data));
      }

      await editMsg(api,
        `╭─── « ⚡ UPT2 » ───⟡\n│\n│ ⚙️ ▰▰▰▰▰▰▱▱▱▱ 𝟲𝟬%\n│    Rendering canvas...\n│\n╰───────────────⟡`,
        sent.messageID
      );

      const uptime  = process.uptime();
      const days    = Math.floor(uptime / 86400);
      const hours   = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const pad     = n => String(n).padStart(2, '0');
      const uptStr  = `${days}D:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

      const timeStr = moment().tz(config.TIMEZONE || 'Asia/Karachi').format('hh:mm:ss A');
      const dateStr = moment().tz(config.TIMEZONE || 'Asia/Karachi').format('DD/MM/YYYY');
      const botName = config.BOTNAME || 'MR DEVIL';

      const uniqueCmds = new Set();
      if (client?.commands) {
        client.commands.forEach(cmd => { if (cmd.config?.name) uniqueCmds.add(cmd.config.name.toLowerCase()); });
      }
      const cmdCount = uniqueCmds.size;
      const evtCount = client?.events?.size || 0;

      const image  = await loadImage(tempPath);
      const canvas = createCanvas(image.width, image.height);
      const ctx    = canvas.getContext('2d');

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#00ff66';
      ctx.font = 'bold 34px Arial';
      ctx.fillText('• SYSTEM ONLINE •', canvas.width / 2, 110);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 80px Georgia';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00f7ff';
      ctx.fillText('MR DEVIL BOT', canvas.width / 2, 190);

      ctx.font = 'italic bold 45px Georgia';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 20;
      ctx.fillText(`UPTIME: ${uptStr}`, canvas.width / 2, 270);

      ctx.shadowBlur = 0;
      ctx.font = 'bold 33px Arial';
      ctx.fillText('TIME:', canvas.width / 5.7, 400);
      ctx.font = '20px Arial';
      ctx.fillText(timeStr, canvas.width / 2.6, 400);
      ctx.font = 'bold 33px Arial';
      ctx.fillText('DATE:', canvas.width / 1.6, 400);
      ctx.font = '20px Arial';
      ctx.fillText(dateStr, canvas.width / 1.2, 400);

      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(outputPath, buffer);

      await editMsg(api,
        `╭─── « ⚡ UPT2 » ───⟡\n│\n│ ✅ ▰▰▰▰▰▰▰▰▰▰ 𝟭𝟬𝟬%\n│    Done! Image sending...\n│\n╰───────────────⟡`,
        sent.messageID
      );

      await api.sendMessage({
        body:
          `╭─── « ✨ MR DEVIL BOT » ───⟡\n` +
          `│\n` +
          `│ ◈ ${bold('Bot')}      : ${botName}\n` +
          `│ ◈ ${bold('Uptime')}  : ${uptStr}\n` +
          `│ ◈ ${bold('Status')}  : 🟢 Online\n` +
          `│ ◈ ${bold('Date')}    : ${dateStr}\n` +
          `│\n` +
          `│ 📊 ${bold('Statistics')}\n` +
          `│ ┣ 📂 Commands : ${cmdCount}\n` +
          `│ ┗ ⚡ Events   : ${evtCount}\n` +
          `│\n` +
          `│ 👑 MR DEVIL BOT\n` +
          `╰───────────────⟡`,
        attachment: fs.createReadStream(outputPath)
      }, threadID, () => {
        try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
      }, messageID);

    } catch (error) {
      try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
      await editMsg(api,
        `╭─── « ❌ ERROR » ───⟡\n│\n│ 😔 ${error.message}\n│\n│ 🔁 Dobara try karo.\n╰───────────────⟡`,
        sent.messageID
      );
    }
  }
};
