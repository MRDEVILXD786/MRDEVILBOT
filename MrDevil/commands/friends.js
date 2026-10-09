module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'friends',
    aliases: ['friendlist', 'flist'],
    description: 'Show bot friends list.',
    usage: 'friends',
    category: 'Utility',
    prefix: true
  },
  async run({ api, send }) {
    if (typeof api.getFriendsList !== 'function') {
      return send.reply("❌ API function not available. Please restart bot.");
    }

    send.reply("⏳ Fetching friends list...");

    try {
      const friends = await api.getFriendsList();

      if (!friends || friends.length === 0) {
        return send.reply("❌ No friends found!");
      }

      let msg = `╭─── 👥 BOT FRIENDS LIST ───╮\n`;
      msg += `│ Total Friends: ${friends.length}\n`;
      msg += `├──────────────────────────┤\n`;

      const displayFriends = friends.slice(0, 20);
      displayFriends.forEach((f, i) => {
        const name = f.firstName || f.fullName || 'Unknown';
        msg += `│ ${i + 1}. ${name}\n`;
        msg += `│    🆔 ${f.userID}\n`;
      });

      if (friends.length > 20) {
        msg += `│\n│ ... and ${friends.length - 20} more\n`;
      }

      msg += `╰──────────────────────────╯`;

      return send.reply(msg);
    } catch (err) {
      return send.reply(`❌ Error: ${err.message || err.error || 'Unknown error'}`);
    }
  }
};