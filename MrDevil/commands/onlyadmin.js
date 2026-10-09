const fs = require('fs-extra');
const path = require('path');
const configPath = path.join(__dirname, '../../config.json');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'onlyadmin',
    aliases: ['adminmode', 'adminonly'],
    description: 'Bot ko sirf admin mode mein on/off karo.',
    usage: 'onlyadmin on | onlyadmin off',
    category: 'Admin',
    prefix: true,
    adminOnly: true
  },

  async run({ api, event, args, send, config }) {
    const arg = (args?.[0] || '').toLowerCase().trim();

    if (arg !== 'on' && arg !== 'off') {
      const current = global.config?.ADMIN_ONLY_MODE;
      return send.reply(
        `╭──── 👑 ONLY ADMIN MODE ────╮\n` +
        `│\n` +
        `│  Status: ${current ? '🟢 ON (Active)' : '🔴 OFF (Inactive)'}\n` +
        `│\n` +
        `│  Usage:\n` +
        `│  • onlyadmin on  → Sirf admin\n` +
        `│  • onlyadmin off → Sab use kar sakte\n` +
        `│\n` +
        `╰────────────────────────────╯`
      );
    }

    const enable = arg === 'on';
    const already = global.config?.ADMIN_ONLY_MODE === enable;

    if (already) {
      return send.reply(
        `╭──── 👑 ONLY ADMIN MODE ────╮\n` +
        `│\n` +
        `│  ⚠️ Pehle se ${enable ? 'ON' : 'OFF'} hai!\n` +
        `│\n` +
        `╰────────────────────────────╯`
      );
    }

    try {
      const cfg = fs.readJsonSync(configPath);
      cfg.ADMIN_ONLY_MODE = enable;
      fs.writeJsonSync(configPath, cfg, { spaces: 2 });
      global.config.ADMIN_ONLY_MODE = enable;
    } catch (e) {
      return send.reply(`❌ Config save nahi hua: ${e.message}`);
    }

    if (enable) {
      return send.reply(
        `╭──── 👑 ONLY ADMIN MODE ────╮\n` +
        `│\n` +
        `│  ✅ ON kar diya gaya!\n` +
        `│\n` +
        `│  Ab bot sirf admins ki\n` +
        `│  commands accept karega.\n` +
        `│  Normal users ko koi reply\n` +
        `│  nahi milega.\n` +
        `│\n` +
        `│  Off karne ke liye:\n` +
        `│  onlyadmin off\n` +
        `│\n` +
        `╰────────────────────────────╯`
      );
    } else {
      return send.reply(
        `╭──── 👑 ONLY ADMIN MODE ────╮\n` +
        `│\n` +
        `│  ✅ OFF kar diya gaya!\n` +
        `│\n` +
        `│  Ab sab log commands\n` +
        `│  use kar sakte hain.\n` +
        `│\n` +
        `╰────────────────────────────╯`
      );
    }
  }
};
