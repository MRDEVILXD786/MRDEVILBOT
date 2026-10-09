const { createCanvas, loadImage } = require('@napi-rs/canvas');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const BG_PATH = path.join(__dirname, 'cache', 'rankup', 'bg.jpg');
const cacheDir = path.join(__dirname, 'cache', 'rankup');

// ════════════════════════════════════════════════════════
//   SETTINGS — yahan se sab kuch adjust karo
//   X    = left/right  (bara = zyada right side)
//   Y    = upar/neeche (bara = zyada neeche)
//   SIZE = bada/chota
// ════════════════════════════════════════════════════════
const SETTINGS = {

  CARD: {
    WIDTH:  900,   // card ki chaurai
    HEIGHT: 328,   // card ki unchai
  },

  AVATAR: {
    X:    222,   // left/right
    Y:    160,   // upar/neeche
    SIZE: 102,   // circle ka size (radius)
    RING_COLOR: '#00d4ff',   // ring ka rang
    RING_WIDTH: 4,           // ring ki moti
    RING_GLOW:  20,          // glow kitna bara
  },

  LEVELUP_TEXT: {
    X:    480,   // left/right
    Y:    80,   // upar/neeche
    SIZE: 54,    // font ka size
    COLOR: '#00d4ff',   // rang
  },

  BAR: {
    X:      420,   // left/right
    Y:      250,   // upar/neeche
    WIDTH:  548,   // bar ki lambai
    HEIGHT: 26,    // bar ki moti
    COLOR_LEFT:  '#0055cc',   // bar ka left rang
    COLOR_RIGHT: '#00d4ff',   // bar ka right rang
  },

  BOTNAME_TEXT: {
    X:    405,   // left/right
    Y:    315,   // upar/neeche
    SIZE: 22,    // font ka size
    COLOR: 'rgba(120,200,255,0.85)',   // rang
  },

};

async function makeRankCard({ name, avatarURL, level, exp, expForNext, progress, isLevelUp, newLevel }) {

  const W = SETTINGS.CARD.WIDTH;
  const H = SETTINGS.CARD.HEIGHT;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Background
  const bg = await loadImage(BG_PATH);
  ctx.drawImage(bg, 0, 0, W, H);

  // Dark overlay
  ctx.fillStyle = 'rgba(0, 8, 35, 0.38)';
  ctx.fillRect(0, 0, W, H);

  // Profile photo
  const avtURL = `https://graph.facebook.com/${avatarURL}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
  const avtRes = await axios.get(avtURL, { responseType: 'arraybuffer' });
  const avtImg = await loadImage(Buffer.from(avtRes.data));

  const { X: AX, Y: AY, SIZE: AR } = SETTINGS.AVATAR;

  // Avatar circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(AX, AY, AR, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avtImg, AX - AR, AY - AR, AR * 2, AR * 2);
  ctx.restore();

  // Avatar ring
  ctx.save();
  ctx.strokeStyle = SETTINGS.AVATAR.RING_COLOR;
  ctx.lineWidth   = SETTINGS.AVATAR.RING_WIDTH;
  ctx.shadowColor = SETTINGS.AVATAR.RING_COLOR;
  ctx.shadowBlur  = SETTINGS.AVATAR.RING_GLOW;
  ctx.beginPath();
  ctx.arc(AX, AY, AR + 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // ── "LEVEL UP" TEXT ──
  ctx.save();
  ctx.font      = `bold ${SETTINGS.LEVELUP_TEXT.SIZE}px Arial`;
  ctx.fillStyle = SETTINGS.LEVELUP_TEXT.COLOR;
  ctx.shadowColor = SETTINGS.LEVELUP_TEXT.COLOR;
  ctx.shadowBlur  = 20;
  ctx.fillText('LEVEL UP', SETTINGS.LEVELUP_TEXT.X, SETTINGS.LEVELUP_TEXT.Y);
  ctx.restore();

  // ── PROGRESS BAR ──
  const BX = SETTINGS.BAR.X;
  const BY = SETTINGS.BAR.Y;
  const BW = SETTINGS.BAR.WIDTH;
  const BH = SETTINGS.BAR.HEIGHT;

  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.roundRect(BX, BY, BW, BH, BH / 2);
  ctx.fill();
  ctx.restore();

  const fillW = Math.max(BH, Math.floor(BW * (progress / 100)));
  ctx.save();
  const grad = ctx.createLinearGradient(BX, 0, BX + fillW, 0);
  grad.addColorStop(0, SETTINGS.BAR.COLOR_LEFT);
  grad.addColorStop(1, SETTINGS.BAR.COLOR_RIGHT);
  ctx.fillStyle   = grad;
  ctx.shadowColor = SETTINGS.BAR.COLOR_RIGHT;
  ctx.shadowBlur  = 10;
  ctx.beginPath();
  ctx.roundRect(BX, BY, fillW, BH, BH / 2);
  ctx.fill();
  ctx.restore();

  // ── "MR DEVIL BOT" TEXT ──
  ctx.save();
  ctx.font      = `bold ${SETTINGS.BOTNAME_TEXT.SIZE}px Arial`;
  ctx.fillStyle = SETTINGS.BOTNAME_TEXT.COLOR;
  ctx.shadowColor = '#00d4ff';
  ctx.shadowBlur  = 10;
  ctx.fillText('MR DEVIL BOT', SETTINGS.BOTNAME_TEXT.X, SETTINGS.BOTNAME_TEXT.Y);
  ctx.restore();

  fs.mkdirSync(cacheDir, { recursive: true });
  const outPath = path.join(cacheDir, `rank_${Date.now()}.png`);
  fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
  return outPath;
}

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'rankup',
    aliases: ['rank', 'level', 'xp'],
    description: 'Check your rank and EXP.',
    usage: 'rankup [@mention]',
    category: 'Economy',
    prefix: true
  },

  async run({ api, event, send, Users, Currencies, config, newLevel }) {
    const { threadID, messageID, senderID, mentions } = event;
    const targetID = Object.keys(mentions || {})[0] || senderID;
    const name = await Users.getNameUser(targetID);
    const data = Currencies.getData(targetID);
    const exp = data.exp || 0;
    const level = Math.max(1, Math.floor(Math.sqrt(exp / 12.5)));
    const expForNext = Math.ceil((level + 1) * (level + 1) * 12.5);
    const progress = Math.min(100, Math.floor((exp / expForNext) * 100));

    try {
      const cardPath = await makeRankCard({
        name, avatarURL: targetID, level, exp, expForNext, progress,
        isLevelUp: !!newLevel, newLevel: newLevel || level
      });

      let body;
      if (newLevel) {
        const LEVELUP_COINS = 5;
        await Currencies.addBalance(targetID, LEVELUP_COINS);
        const newBal = (data.balance || 0) + LEVELUP_COINS;
        body =
          `🎉 LEVEL UP! 🎉\n\n` +
          `👤 ${name}\n` +
          `🎖️ NEW LEVEL: ${newLevel}\n` +
          `⭐ EXP: ${exp}\n` +
          `💰 +${LEVELUP_COINS} coins mily! (Total: ${newBal})\n\n` +
          `🌟 Keep chatting to level up more!`;
      } else {
        const bar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));
        body =
          `╭── 🎖️ RANK INFO ──╮\n` +
          `│ 👤 ${name}\n` +
          `│ 🎯 Level: ${level}\n` +
          `│ ⭐ EXP: ${exp} / ${expForNext}\n` +
          `│ 📊 [${bar}] ${progress}%\n` +
          `│ 💵 Balance: ${data.balance || 0}\n` +
          `│ 🏦 Bank: ${data.bank || 0}\n` +
          `╰────────────────╯`;
      }

      api.sendMessage(
        { body, attachment: fs.createReadStream(cardPath) },
        threadID,
        () => { try { fs.unlinkSync(cardPath); } catch {} },
        messageID
      );
    } catch (err) {
      console.error('[rankup]', err);
      const bar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));
      await send.reply(
        `╭── 🎖️ RANK INFO ──╮\n` +
        `│ 👤 ${name}\n` +
        `│ 🎯 Level: ${level}\n` +
        `│ ⭐ EXP: ${exp} / ${expForNext}\n` +
        `│ 📊 [${bar}] ${progress}%\n` +
        `╰────────────────╯`
      );
    }
  }
};
