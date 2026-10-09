const axios = require('axios');

function extractFromUrl(url) {
  try {
    const parsed = new URL(url);

    const idParam = parsed.searchParams.get('id');
    if (idParam && /^\d+$/.test(idParam)) {
      return { uid: idParam, username: null, type: 'direct' };
    }

    const pathMatch = parsed.pathname.match(/^\/([^/?]+)/);
    if (pathMatch) {
      const slug = pathMatch[1];
      if (/^\d+$/.test(slug)) return { uid: slug, username: null, type: 'path_id' };
      if (slug && slug !== 'profile.php') return { uid: null, username: slug, type: 'username' };
    }
  } catch {}
  return null;
}

async function resolveUsernameToUID(username) {
  try {
    const res = await axios.get(`https://www.facebook.com/${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 15000,
      maxRedirects: 5
    });

    const html = res.data;

    const patterns = [
      /"userID":"(\d+)"/,
      /"USER_ID":"(\d+)"/,
      /entity_id["\s:]+(\d{8,})/,
      /"id":"(\d{8,})"/,
      /profile_id=(\d{8,})/,
      /"owner":{"__typename":"User","id":"(\d+)"/,
      /content="https:\/\/www\.facebook\.com\/([^"]+)"/,
      /"identifier"\s*:\s*"(\d{8,})"/,
      /\\"userID\\":\\"(\d+)\\"/
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && /^\d{8,}$/.test(match[1])) {
        return match[1];
      }
    }

    return null;
  } catch {
    return null;
  }
}

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: "getuid",
    aliases: ["finduid", "profileuid", "fbuid"],
    description: "Facebook profile link se UID aur Browser ID nikalo.",
    usage: "getuid <facebook profile link>",
    category: "Utility",
    prefix: true,
    adminOnly: false,
    cooldowns: 5
  },

  async run({ api, event, args, send }) {
    const { messageID } = event;

    const link = args[0];
    if (!link) {
      return send.reply(
        `╭─── « 🔍 GETUID » ───⟡\n` +
        `│\n` +
        `│ ❓ Facebook profile\n` +
        `│    link bhejo!\n` +
        `│\n` +
        `│ 📌 Usage:\n` +
        `│ .getuid <profile link>\n` +
        `│\n` +
        `│ 📌 Examples:\n` +
        `│ .getuid fb.com/username\n` +
        `│ .getuid fb.com/profile\n` +
        `│    .php?id=100009...\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    let cleanLink = link.trim();
    if (!cleanLink.startsWith('http')) {
      cleanLink = 'https://' + cleanLink
        .replace(/^(www\.)?(fb|facebook)\.com\//, 'facebook.com/')
        .replace(/^facebook\.com\//, 'https://www.facebook.com/');
      if (!cleanLink.startsWith('https://')) {
        cleanLink = 'https://www.facebook.com/' + cleanLink.replace(/^.*facebook\.com\//, '');
      }
    }

    cleanLink = cleanLink
      .replace('https://fb.com/', 'https://www.facebook.com/')
      .replace('http://fb.com/', 'https://www.facebook.com/')
      .replace('https://m.facebook.com/', 'https://www.facebook.com/')
      .replace('http://m.facebook.com/', 'https://www.facebook.com/')
      .replace('https://facebook.com/', 'https://www.facebook.com/');

    api.setMessageReaction('🔍', messageID, () => {}, true);

    const parsed = extractFromUrl(cleanLink);
    if (!parsed) {
      api.setMessageReaction('❌', messageID, () => {}, true);
      return send.reply(`❌ Yeh valid Facebook link nahi hai!\n\nExample: .getuid https://www.facebook.com/username`);
    }

    let uid = parsed.uid;
    let username = parsed.username;
    let browserID = null;

    if (!uid && username) {
      uid = await resolveUsernameToUID(username);
    }

    if (!uid) {
      if (username) {
        const altPatterns = [
          `https://www.facebook.com/${username}`,
          `https://www.facebook.com/profile.php?id=${username}`
        ];
        for (const altUrl of altPatterns) {
          uid = await resolveUsernameToUID(username);
          if (uid) break;
        }
      }
    }

    if (!uid) {
      api.setMessageReaction('❌', messageID, () => {}, true);
      return send.reply(
        `╭─── « ❌ NOT FOUND » ───⟡\n` +
        `│\n` +
        `│ 😕 UID nahi mila!\n` +
        `│\n` +
        `│ 💡 Tips:\n` +
        `│ • Profile public honi\n` +
        `│   chahiye\n` +
        `│ • Direct ID link try\n` +
        `│   karo (profile.php?id)\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    try {
      const info = await new Promise((resolve) => {
        api.getUserInfo(uid, (err, data) => {
          if (err || !data) return resolve(null);
          resolve(data[uid] || null);
        });
      });

      const name = info?.name || info?.firstName || 'Unknown';
      browserID = uid;

      const profileUrl = username
        ? `https://www.facebook.com/${username}`
        : `https://www.facebook.com/profile.php?id=${uid}`;

      api.setMessageReaction('✅', messageID, () => {}, true);

      return send.reply(
        `╭──── « 🆔 UID FOUND » ────⟡\n` +
        `│\n` +
        `│ 👤 Name    : ${name}\n` +
        `│\n` +
        `│ 🔢 UID     : ${uid}\n` +
        `│ 🌐 Browser ID: ${browserID}\n` +
        `│\n` +
        (username ? `│ 🔗 Username: @${username}\n│\n` : '') +
        `│ 🔗 Profile :\n│ ${profileUrl}\n` +
        `│\n` +
        `│ ✅ Powered by MR DEVIL\n` +
        `╰───────────────────────⟡`
      );

    } catch {
      api.setMessageReaction('✅', messageID, () => {}, true);

      const profileUrl = username
        ? `https://www.facebook.com/${username}`
        : `https://www.facebook.com/profile.php?id=${uid}`;

      return send.reply(
        `╭──── « 🆔 UID FOUND » ────⟡\n` +
        `│\n` +
        `│ 🔢 UID     : ${uid}\n` +
        `│ 🌐 Browser ID: ${uid}\n` +
        `│\n` +
        (username ? `│ 🔗 Username: @${username}\n│\n` : '') +
        `│ 🔗 Profile :\n│ ${profileUrl}\n` +
        `│\n` +
        `│ ✅ Powered by MR DEVIL\n` +
        `╰───────────────────────⟡`
      );
    }
  }
};
