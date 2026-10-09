module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'unban',
    aliases: ['unbanuser'],
    description: 'Unban a user.',
    usage: 'unban @mention',
    category: 'Admin',
    prefix: true,
    adminOnly: true
  },
  async run({ api, event, send, Users }) {
    const mentionIDs = Object.keys(event.mentions || {});
    if (!mentionIDs.length) return send.reply('❌ Please mention a user to unban.');

    let msg = '✅ UNBAN RESULTS:\n';
    for (const uid of mentionIDs) {
      Users.unban(uid);
      const name = await Users.getNameUser(uid);
      msg += `✅ Unbanned: ${name} (${uid})\n`;
    }
    send.reply(msg);
  }
};
