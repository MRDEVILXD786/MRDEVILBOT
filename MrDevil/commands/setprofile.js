const fs = require('fs-extra');
const path = require('path');

function bold(t) {
  const map = { a:'𝗮',b:'𝗯',c:'𝗰',d:'𝗱',e:'𝗲',f:'𝗳',g:'𝗴',h:'𝗵',i:'𝗶',j:'𝗷',k:'𝗸',l:'𝗹',m:'𝗺',n:'𝗻',o:'𝗼',p:'𝗽',q:'𝗾',r:'𝗿',s:'𝘀',t:'𝘁',u:'𝘂',v:'𝘃',w:'𝘄',x:'𝘅',y:'𝘆',z:'𝘇',A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',E:'𝗘',F:'𝗙',G:'𝗚',H:'𝗛',I:'𝗜',J:'𝗝',K:'𝗞',L:'𝗟',M:'𝗠',N:'𝗡',O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',T:'𝗧',U:'𝗨',V:'𝗩',W:'𝗪',X:'𝗫',Y:'𝗬',Z:'𝗭',0:'𝟬',1:'𝟭',2:'𝟮',3:'𝟯',4:'𝟰',5:'𝟱',6:'𝟲',7:'𝟳',8:'𝟴',9:'𝟵' };
  return String(t).split('').map(c => map[c] || c).join('');
}

module.exports = {
  config: {
    credits: 'MR DEVIL',
    name: 'setprofile',
    aliases: ['setavatar', 'setpfp', 'setdp'],
    description: 'Bot ki profile picture change karo (image ko reply karo)',
    usage: 'setprofile (kisi image ko reply karo)',
    category: 'Admin',
    prefix: true,
    adminOnly: true,
    cooldowns: 10
  },

  async run({ api, event, send, config, isAdmin }) {
    const { senderID, messageReply } = event;
    if (!isAdmin) {
      return send.reply(
        `╭─── « ❌ ACCESS DENIED » ───⟡\n` +
        `│\n` +
        `│ 🚫 Yeh command sirf Bot\n` +
        `│    Admin use kar sakta hai!\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
      return send.reply(
        `╭─── « 🖼️ SET PROFILE » ───⟡\n` +
        `│\n` +
        `│ ❌ Pehle koi image send karo\n` +
        `│    phir us pe reply karo\n` +
        `│    ${bold('.setprofile')} likh ke!\n` +
        `│\n` +
        `│ 💡 ${bold('Tarika:')}\n` +
        `│  1️⃣  Image bhejo chat mein\n` +
        `│  2️⃣  Us image ko reply karo\n` +
        `│  3️⃣  Reply mein likhao:\n` +
        `│      ${bold('.setprofile')}\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    const attachment = messageReply.attachments[0];

    if (attachment.type !== 'photo') {
      return send.reply(
        `╭─── « ❌ GALAT FILE » ───⟡\n` +
        `│\n` +
        `│ ⚠️  Sirf ${bold('photo/image')} ko\n` +
        `│    reply karo!\n` +
        `│\n` +
        `│ 🔴 Attachment type mila:\n` +
        `│    "${attachment.type}"\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    const imageUrl = attachment.largePreviewUrl || attachment.url || attachment.previewUrl || attachment.thumbnailUrl;

    if (!imageUrl || typeof imageUrl !== 'string') {
      return send.reply(
        `╭─── « ❌ URL ERROR » ───⟡\n` +
        `│\n` +
        `│ 😕 Image ka URL nahi mila.\n` +
        `│    Koi aur image try karo.\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    await send.reply(
      `╭─── « ⏳ PROCESSING » ───⟡\n` +
      `│\n` +
      `│ 🔄 Profile picture change\n` +
      `│    ho rahi hai...\n` +
      `│    Thoda wait karo! ✨\n` +
      `│\n` +
      `╰───────────────⟡`
    );

    if (typeof api.changeAvatar !== 'function') {
      return send.reply(
        `╭─── « ❌ NOT SUPPORTED » ───⟡\n` +
        `│\n` +
        `│ ⚠️  Is API version mein\n` +
        `│    profile picture change\n` +
        `│    support nahi hai.\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    return new Promise((resolve) => {
      api.changeAvatar(imageUrl, (err) => {
        if (err) {
          const errMsg = err?.message || err?.error || JSON.stringify(err);
          console.error('[SETPROFILE] changeAvatar FAILED:', errMsg);
          send.reply(
            `╭─── « ❌ UPLOAD FAILED » ───⟡\n` +
            `│\n` +
            `│ 😔 Profile picture upload\n` +
            `│    nahi ho saki!\n` +
            `│\n` +
            `│ ◈ ${errMsg}\n` +
            `│\n` +
            `│ 💡 Facebook aksar bot ki DP\n` +
            `│    change block karta hai.\n` +
            `│    Baad mein try karo.\n` +
            `│\n` +
            `╰───────────────⟡`
          ).then(resolve);
        } else {
          console.log('[SETPROFILE] changeAvatar SUCCESS');
          send.reply(
            `╭─── « ✅ SUCCESS » ───⟡\n` +
            `│\n` +
            `│ 🎉 ${bold('Profile picture update')}\n` +
            `│    ${bold('ho gai!')} 🖼️✨\n` +
            `│\n` +
            `│ ◈ Bot ka naya avatar set\n` +
            `│    ho chuka hai!\n` +
            `│\n` +
            `╰───────────────⟡`
          ).then(resolve);
        }
      });
    });
  }
};
