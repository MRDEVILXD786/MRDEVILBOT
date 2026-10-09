module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'broadcast',
    aliases: ['bc', 'announce'],
    description: 'Broadcast a message to all groups.',
    usage: 'broadcast [message]',
    category: 'Admin',
    prefix: true,
    adminOnly: true
  },
  async run({ api, event, args, send, Threads }) {
    if (!args.length) return send.reply('❌ Usage: .broadcast [message]');

    const msg = args.join(' ');
    const threads = Threads.getAll();
    let sent = 0, failed = 0;

    await send.reply(`📡 Broadcasting to ${threads.length} groups...\nMessage: "${msg}"`);

    for (const thread of threads) {
      try {
        await api.sendMessage(`📢 BROADCAST\n\n${msg}\n\n— MR DEVIL BOT`, thread.id);
        sent++;
        await new Promise(r => setTimeout(r, 500));
      } catch { failed++; }
    }

    send.reply(`✅ Broadcast done!\n📤 Sent: ${sent}\n❌ Failed: ${failed}`);
  }
};
