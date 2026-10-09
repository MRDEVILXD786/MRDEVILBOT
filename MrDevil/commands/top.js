module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'top',
    aliases: ['leaderboard', 'rich'],
    description: 'Show top richest users.',
    usage: 'top',
    category: 'Economy',
    prefix: true
  },
  async run({ event, send, Users, Currencies }) {
    const topUsers = Currencies.getTop(10);
    if (!topUsers.length) return send.reply('❌ No users in the database yet.');

    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    let msg = `╭─── 💰 TOP RICHEST ───╮\n│\n`;

    for (let i = 0; i < topUsers.length; i++) {
      const user = topUsers[i];
      const name = await Users.getNameUser(user.id);
      msg += `│ ${medals[i] || `${i + 1}.`} ${name}\n│    💎 ${user.total || 0} coins\n│\n`;
    }

    msg += `╰──────────────────────╯`;
    send.reply(msg);
  }
};
