module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'setemoji',
    aliases: ['emoji', 'changemoji'],
    description: 'Change the group emoji.',
    usage: 'setemoji [emoji]',
    category: 'Group',
    prefix: true,
    groupOnly: true
  },
  async run({ api, event, args, send }) {
    const { threadID } = event;
    if (!args[0]) return send.reply('❌ Usage: .setemoji [emoji]\nExample: .setemoji 🔥');
    const emoji = args[0].trim();
    try {
      await api.changeThreadEmoji(emoji, threadID);
      send.reply(`✅ Group emoji changed to: ${emoji}`);
    } catch (e) {
      send.reply('❌ Failed: ' + e.message);
    }
  }
};
