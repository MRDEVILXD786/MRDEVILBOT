module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'work',
    aliases: ['earn', 'job'],
    description: 'Kaam karo aur coins kamao. (30 min cooldown)',
    usage: 'work',
    category: 'Economy',
    prefix: true,
    cooldowns: 3
  },
  async run({ event, send, Users, Currencies }) {
    const { senderID } = event;
    const name = await Users.getNameUser(senderID);

    const result = await Currencies.work(senderID);

    if (!result.success) {
      const mins = result.remaining || 0;
      const hrs = Math.floor(mins / 60);
      const rem = mins % 60;
      const timeStr = hrs > 0 ? `${hrs}h ${rem}m` : `${mins}m`;
      return send.reply(
        `╭─── ⏰ COOLDOWN ───╮\n` +
        `│ 👤 ${name}\n` +
        `│\n` +
        `│ 😴 Tum abhi thak gaye ho!\n` +
        `│ ⏳ ${timeStr} baad kaam karo\n` +
        `│\n` +
        `│ 💡 Tip: Bank mein paisa\n` +
        `│    save karo → .bank dep\n` +
        `╰───────────────────╯`
      );
    }

    const data = await Currencies.getData(senderID);

    return send.reply(
      `╭─── 💼 KAAM KA NATEEJA ───╮\n` +
      `│\n` +
      `│ 👤 Worker: ${name}\n` +
      `│ 👔 Job: ${result.job}\n` +
      `│\n` +
      `│ 💰 Kamaye: +${result.earnings} coins\n` +
      `│ 👛 Wallet: ${data.balance} coins\n` +
      `│ 🏦 Bank: ${data.bank} coins\n` +
      `│\n` +
      `│ ⏰ Agla kaam: 30 min baad\n` +
      `│ 💡 Safe rakhne ke liye\n` +
      `│    → .bank deposit <amount>\n` +
      `╰────────────────────────────╯`
    );
  }
};
