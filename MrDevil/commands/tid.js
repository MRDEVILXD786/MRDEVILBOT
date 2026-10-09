module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'tid',
    aliases: ['threadid', 'groupid'],
    description: 'Get current thread/group ID.',
    usage: 'tid',
    category: 'Utility',
    prefix: true
  },
  async run({ event, send }) {
    const { threadID, isGroup } = event;
    await send.reply(
      `╭─── 🆔 THREAD ID ───╮\n` +
      `│ ${isGroup ? '👥 Group' : '💬 Chat'} ID:\n` +
      `│ ${threadID}\n` +
      `╰────────────────────╯`
    );
  }
};
