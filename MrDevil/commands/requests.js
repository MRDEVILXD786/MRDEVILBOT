module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'requests',
    aliases: ['friendrequests', 'pending'],
    description: 'Show pending friend requests.',
    usage: 'requests',
    category: 'Utility',
    prefix: true
  },
  async run({ api, send }) {
    if (typeof api.getFriendRequests !== 'function') {
      return send.reply("❌ API function not available. Please restart bot.");
    }

    send.reply("⏳ Fetching friend requests...");

    try {
      const requests = await api.getFriendRequests();
      const incoming = requests.incoming || [];
      const outgoing = requests.outgoing || [];

      if (incoming.length === 0 && outgoing.length === 0) {
        return send.reply("📭 No pending friend requests!");
      }

      let msg = `╭─── 📬 FRIEND REQUESTS ───╮\n`;

      if (incoming.length > 0) {
        msg += `│ 📥 Incoming (${incoming.length}):\n`;
        msg += `├──────────────────────────┤\n`;
        incoming.slice(0, 10).forEach((r, i) => {
          msg += `│ ${i + 1}. ${r.name}\n`;
          msg += `│    🆔 ${r.userID}\n`;
        });
        if (incoming.length > 10) {
          msg += `│    ... +${incoming.length - 10} more\n`;
        }
        msg += `├──────────────────────────┤\n`;
      }

      if (outgoing.length > 0) {
        msg += `│ 📤 Outgoing (${outgoing.length}):\n`;
        msg += `├──────────────────────────┤\n`;
        outgoing.slice(0, 5).forEach((r, i) => {
          msg += `│ ${i + 1}. ${r.name}\n`;
          msg += `│    🆔 ${r.userID}\n`;
        });
      }

      msg += `╰──────────────────────────╯`;

      return send.reply(msg);
    } catch (err) {
      return send.reply(`❌ Error: ${err.message || err.error || 'Unknown error'}`);
    }
  }
};