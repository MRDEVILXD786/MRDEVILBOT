module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'balance',
    aliases: ['bal', 'coins', 'money', 'wallet'],
    description: 'Apna ya kisi ka bhi balance check karo.',
    usage: 'balance [@mention]',
    category: 'Economy',
    prefix: true,
    cooldowns: 3
  },
  async run({ api, event, send, Users, Currencies }) {
    const { senderID, mentions } = event;
    const targetID = Object.keys(mentions || {})[0] || senderID;
    const isSelf = targetID === senderID;

    const name = await Users.getNameUser(targetID);
    const data = await Currencies.getData(targetID);

    const balance = data.balance || 0;
    const bank = data.bank || 0;
    const total = balance + bank;
    const exp = data.exp || 0;
    const level = Math.max(1, Math.floor(Math.sqrt(exp / 12.5)));
    const nextLevel = Math.pow(level + 1, 2) * 12.5;
    const progress = Math.min(Math.floor((exp / nextLevel) * 10), 10);
    const bar = '█'.repeat(progress) + '░'.repeat(10 - progress);

    let rank = '🌱 Beginner';
    if (total >= 50000) rank = '👑 Billionaire';
    else if (total >= 20000) rank = '💎 Diamond';
    else if (total >= 10000) rank = '🥇 Gold';
    else if (total >= 5000) rank = '🥈 Silver';
    else if (total >= 1000) rank = '🥉 Bronze';

    return send.reply(
      `╭─── 💰 ${isSelf ? 'TERA' : name + ' KA'} BALANCE ───╮\n` +
      `│\n` +
      `│ 👤 ${name}\n` +
      `│ ${rank}\n` +
      `│\n` +
      `│ 👛 Wallet:  ${balance.toLocaleString()} coins\n` +
      `│ 🏦 Bank:    ${bank.toLocaleString()} coins\n` +
      `│ 💎 Total:   ${total.toLocaleString()} coins\n` +
      `│\n` +
      `│ ⭐ EXP: ${exp} | Lv.${level}\n` +
      `│ [${bar}]\n` +
      `│\n` +
      `│ 💡 Commands:\n` +
      `│  .work | .daily | .bank\n` +
      `╰───────────────────────────╯`
    );
  }
};
