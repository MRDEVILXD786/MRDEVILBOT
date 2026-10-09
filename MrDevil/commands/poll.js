module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'poll',
    aliases: ['vote', 'survey'],
    description: 'Create a poll in the group.',
    usage: 'poll [title] | [option1] | [option2] ...',
    category: 'Fun',
    prefix: true,
    groupOnly: true
  },
  async run({ api, event, args, send }) {
    const { threadID } = event;
    const input = args.join(' ');
    const parts = input.split('|').map(s => s.trim()).filter(Boolean);

    if (parts.length < 3) {
      return send.reply('❌ Usage: .poll [title] | [option1] | [option2] ...\n\nExample:\n.poll Best food? | Pizza | Biryani | Burger');
    }

    const title = parts[0];
    const options = parts.slice(1);

    try {
      await api.createPoll(title, threadID, Object.fromEntries(options.map(o => [o, false])));
      send.reply(`✅ Poll created: "${title}"\nOptions: ${options.join(', ')}`);
    } catch (e) {
      send.reply('❌ Failed to create poll: ' + e.message);
    }
  }
};
