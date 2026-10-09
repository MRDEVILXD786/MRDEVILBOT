module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'daily',
    aliases: ['claim', 'checkin'],
    description: 'Roz ka reward claim karo. Streak se zyada milta hai!',
    usage: 'daily',
    category: 'Economy',
    prefix: true,
    cooldowns: 3
  },
  async run({ event, send, Users, Currencies }) {
    const { senderID } = event;
    const name = await Users.getNameUser(senderID);

    const result = await Currencies.claimDaily(senderID);

    if (!result.success) {
      return send.reply(
        `╭─── ⏰ DAILY CLAIMED ───╮\n` +
        `│ 👤 ${name}\n` +
        `│\n` +
        `│ ✅ Aaj ka reward le chuke ho!\n` +
        `│ 🌙 Kal wapas aana streak\n` +
        `│    band na ho jaye!\n` +
        `│\n` +
        `│ 💡 Abhi karo → .work\n` +
        `╰────────────────────────╯`
      );
    }

    const data = await Currencies.getData(senderID);
    const streak = result.streak;

    let streakBonus = '';
    if (streak >= 30) streakBonus = '🏆 30 din streak! Legendary!';
    else if (streak >= 14) streakBonus = '💎 2 hafta streak! Amazing!';
    else if (streak >= 7) streakBonus = '🔥 1 hafta streak! Fire!';
    else if (streak >= 3) streakBonus = '⚡ 3 din streak! Keep going!';
    else streakBonus = '🌱 Streak start ki hai!';

    return send.reply(
      `╭─── 🎁 DAILY REWARD ───╮\n` +
      `│\n` +
      `│ 👤 ${name}\n` +
      `│\n` +
      `│ 💰 Mila: +${result.reward} coins\n` +
      `│ 🔥 Streak: ${streak} din\n` +
      `│ ${streakBonus}\n` +
      `│\n` +
      `│ 👛 Wallet: ${data.balance} coins\n` +
      `│ 🏦 Bank: ${data.bank} coins\n` +
      `│\n` +
      `│ 💡 Coins safe karo:\n` +
      `│    → .bank deposit <amount>\n` +
      `╰────────────────────────╯`
    );
  }
};
