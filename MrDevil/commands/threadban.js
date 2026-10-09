module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'threadban',
    aliases: ['groupban', 'tban'],
    description: 'Ban a group from using the bot.',
    usage: 'threadban [on/off] [reason]',
    category: 'Admin',
    prefix: true,
    adminOnly: true
  },
  async run({ event, args, send, Threads }) {
    const { threadID } = event;
    const action = args[0]?.toLowerCase();
    if (!action || !['on', 'off'].includes(action)) return send.reply('❌ Usage: .threadban [on/off] [reason]');

    if (action === 'on') {
      const reason = args.slice(1).join(' ') || 'No reason';
      Threads.ban(threadID, reason);
      send.reply(`🚫 This group has been banned!\nReason: ${reason}`);
    } else {
      Threads.unban(threadID);
      send.reply('✅ This group has been unbanned!');
    }
  }
};
