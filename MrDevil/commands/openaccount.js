function bold(str) {
  const map = {
    A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',E:'𝗘',F:'𝗙',G:'𝗚',H:'𝗛',I:'𝗜',J:'𝗝',K:'𝗞',
    L:'𝗟',M:'𝗠',N:'𝗡',O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',T:'𝗧',U:'𝗨',V:'𝗩',
    W:'𝗪',X:'𝗫',Y:'𝗬',Z:'𝗭',
    a:'𝗮',b:'𝗯',c:'𝗰',d:'𝗱',e:'𝗲',f:'𝗳',g:'𝗴',h:'𝗵',i:'𝗶',j:'𝗷',k:'𝗸',
    l:'𝗹',m:'𝗺',n:'𝗻',o:'𝗼',p:'𝗽',q:'𝗾',r:'𝗿',s:'𝘀',t:'𝘁',u:'𝘂',v:'𝘃',
    w:'𝘄',x:'𝘅',y:'𝘆',z:'𝘇',
    '0':'𝟬','1':'𝟭','2':'𝟮','3':'𝟯','4':'𝟰','5':'𝟱','6':'𝟲','7':'𝟳','8':'𝟴','9':'𝟵'
  };
  return [...str].map(c => map[c] || c).join('');
}

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'openaccount',
    aliases: ['register', 'signup', 'account'],
    description: 'Bot ka account open karo — coins hamesha safe rahein!',
    usage: 'openaccount',
    category: 'Economy',
    prefix: true,
    cooldowns: 5
  },

  async run({ api, event, send, client, Currencies }) {
    const { threadID, messageID, senderID } = event;

    // Already registered check
    const existing = await Currencies.get(senderID);
    if (existing?.accountOpen) {
      const bal = existing.balance || 0;
      return send.reply(
        `╭─── « 𝗔𝗖𝗖𝗢𝗨𝗡𝗧 𝗔𝗖𝗧𝗜𝗩𝗘 » ───⟡\n` +
        `│\n` +
        `│ ✅ Tumhara account pehle se open hai!\n` +
        `│\n` +
        `│ ◈ 𝗡𝗮𝗺𝗲  : ${existing.accountName || '—'}\n` +
        `│ ◈ 𝗔𝗴𝗲   : ${existing.accountAge || '—'} saal\n` +
        `│ ◈ 𝗖𝗼𝗶𝗻𝘀 : ${bal} 💰\n` +
        `│\n` +
        `│ 🛡️ Tumhare coins midnight mein safe rahein ge!\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    // Step 1 — ask name
    const msg = await new Promise(resolve =>
      api.sendMessage(
        `╭─── « 𝗔𝗖𝗖𝗢𝗨𝗡𝗧 𝗢𝗣𝗘𝗡𝗜𝗡𝗚 » ───⟡\n` +
        `│\n` +
        `│ 🏦 MR DEVIL BOT mein khush aamdeed!\n` +
        `│\n` +
        `│ 📋 Step [ 𝟭 / 𝟮 ]\n` +
        `│\n` +
        `│ ❓ ${bold('What is your name?')}\n` +
        `│\n` +
        `│ 💬 Is message ka reply karo aur\n` +
        `│    apna asli naam likho!\n` +
        `│\n` +
        `╰───────────────⟡`,
        threadID,
        (err, info) => resolve(info),
        messageID
      )
    );

    client.replies.set(msg.messageID, {
      commandName: 'openaccount',
      author: senderID,
      data: { step: 1 }
    });
  },

  async handleReply({ api, event, client, send, Currencies, data }) {
    const { threadID, messageID, senderID, messageReply } = event;
    const { step, name } = data;

    // Delete previous bot step message
    const prevMsgID = messageReply?.messageID;
    if (prevMsgID) {
      try { api.unsendMessage(prevMsgID); } catch {}
    }

    // ── Step 1: Got name, now ask age ──────────────────────────
    if (step === 1) {
      const inputName = (event.body || '').trim();

      if (!inputName || inputName.length < 2) {
        const retry = await new Promise(resolve =>
          api.sendMessage(
            `╭─── « ❌ INVALID NAME » ───⟡\n` +
            `│\n` +
            `│ Naam kam se kam 2 characters ka ho!\n` +
            `│\n` +
            `│ ❓ ${bold('Dobara apna naam likho:')}\n` +
            `│\n` +
            `╰───────────────⟡`,
            threadID, (err, info) => resolve(info), messageID
          )
        );
        client.replies.set(retry.messageID, {
          commandName: 'openaccount',
          author: senderID,
          data: { step: 1 }
        });
        return;
      }

      const msg = await new Promise(resolve =>
        api.sendMessage(
          `╭─── « 𝗔𝗖𝗖𝗢𝗨𝗡𝗧 𝗢𝗣𝗘𝗡𝗜𝗡𝗚 » ───⟡\n` +
          `│\n` +
          `│ ✅ Name: ${bold(inputName)}\n` +
          `│\n` +
          `│ 📋 Step [ 𝟮 / 𝟮 ]\n` +
          `│\n` +
          `│ ❓ ${bold('What is your age?')}\n` +
          `│\n` +
          `│ ⚠️  Age limit: 18 se 40 saal\n` +
          `│\n` +
          `│ 💬 Is message ka reply karo aur\n` +
          `│    apni umar likho!\n` +
          `│\n` +
          `╰───────────────⟡`,
          threadID, (err, info) => resolve(info), messageID
        )
      );

      client.replies.set(msg.messageID, {
        commandName: 'openaccount',
        author: senderID,
        data: { step: 2, name: inputName }
      });
      return;
    }

    // ── Step 2: Got age, validate and open account ─────────────
    if (step === 2) {
      const inputBody = (event.body || '').trim();
      const age = parseInt(inputBody);

      if (isNaN(age)) {
        const retry = await new Promise(resolve =>
          api.sendMessage(
            `╭─── « ❌ INVALID AGE » ───⟡\n` +
            `│\n` +
            `│ Sirf number likho! Jaise: 22\n` +
            `│\n` +
            `│ ❓ ${bold('Dobara apni umar likho:')}\n` +
            `│\n` +
            `╰───────────────⟡`,
            threadID, (err, info) => resolve(info), messageID
          )
        );
        client.replies.set(retry.messageID, {
          commandName: 'openaccount',
          author: senderID,
          data: { step: 2, name }
        });
        return;
      }

      if (age < 18) {
        const retry = await new Promise(resolve =>
          api.sendMessage(
            `╭─── « ❌ TOO YOUNG » ───⟡\n` +
            `│\n` +
            `│ ⛔ Minimum age 18 saal hai!\n` +
            `│\n` +
            `│ ❓ ${bold('Sahi umar likho (18-40):')}\n` +
            `│\n` +
            `╰───────────────⟡`,
            threadID, (err, info) => resolve(info), messageID
          )
        );
        client.replies.set(retry.messageID, {
          commandName: 'openaccount',
          author: senderID,
          data: { step: 2, name }
        });
        return;
      }

      if (age > 40) {
        const retry = await new Promise(resolve =>
          api.sendMessage(
            `╭─── « ❌ TOO OLD » ───⟡\n` +
            `│\n` +
            `│ ⛔ Maximum age 40 saal hai!\n` +
            `│ Age limit sirf 18 se 40 hai.\n` +
            `│\n` +
            `│ ❓ ${bold('Sahi umar likho (18-40):')}\n` +
            `│\n` +
            `╰───────────────⟡`,
            threadID, (err, info) => resolve(info), messageID
          )
        );
        client.replies.set(retry.messageID, {
          commandName: 'openaccount',
          author: senderID,
          data: { step: 2, name }
        });
        return;
      }

      // ✅ Valid — open account
      const WELCOME_COINS = 50;
      const cur = await Currencies.get(senderID) || await Currencies.create(senderID);
      const oldBal = cur.balance || 0;

      await Currencies.update(senderID, {
        accountOpen: true,
        accountName: name,
        accountAge: age,
        balance: oldBal + WELCOME_COINS
      });

      const newBal = oldBal + WELCOME_COINS;

      send.reply(
        `╭─── « 𝗔𝗖𝗖𝗢𝗨𝗡𝗧 𝗢𝗣𝗘𝗡𝗘𝗗 » ───⟡\n` +
        `│\n` +
        `│ 🎉 Mubarak ho ${bold(name)}!\n` +
        `│ Account successfully open ho gaya!\n` +
        `│\n` +
        `│ ◈ 𝗡𝗮𝗺𝗲    : ${bold(name)}\n` +
        `│ ◈ 𝗔𝗴𝗲     : ${bold(String(age))} saal\n` +
        `│ ◈ 𝗜𝗗      : ${senderID}\n` +
        `│\n` +
        `│ 🎁 Welcome Bonus: +${WELCOME_COINS} coins!\n` +
        `│ ◈ 𝗖𝗼𝗶𝗻𝘀   : ${newBal} 💰\n` +
        `│\n` +
        `│ 🛡️ Tumhare coins midnight ke\n` +
        `│    baad bhi safe rahein ge!\n` +
        `│\n` +
        `│ 💡 .balance  — coins dekho\n` +
        `│ 💡 .work     — coins kamao\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }
  }
};

