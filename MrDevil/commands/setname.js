module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'setname',
    aliases: ['groupname', 'rename'],
    description: 'Change the group name.',
    usage: 'setname [new name]',
    category: 'Group',
    prefix: true,
    groupOnly: true,
    adminOnly: true
  },
  async run({ api, event, args, send }) {
    const { threadID } = event;
    if (!args.length) return send.reply('❌ Usage: .setname [new name]');
    const newName = args.join(' ');
    try {
      await api.setTitle(newName, threadID);
      send.reply(`✅ Group name changed to:\n"${newName}"`);
    } catch (e) {
      send.reply('❌ Failed: ' + e.message);
    }
  }
};
