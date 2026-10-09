module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'creategroup',
    aliases: ['newgroup', 'makegroup'],
    description: 'Naya group banao mentioned logon ke saath.',
    usage: 'creategroup [name] | @mention1 @mention2',
    category: 'Utility',
    adminOnly: true,
    prefix: true
  },

  async run({ api, event, args, send, config, isAdmin }) {
    const { senderID, mentions } = event;

    if (!isAdmin) {
      return send.reply(
        `╭─── « ❌ ACCESS DENIED » ───⟡\n` +
        `│\n` +
        `│ 🚫 Sirf Bot Admin yeh\n` +
        `│    command use kar sakta hai!\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    const mentionIDs = Object.keys(mentions);
    if (mentionIDs.length < 1) {
      return send.reply(
        `╭─── « ℹ️ CREATE GROUP » ───⟡\n` +
        `│\n` +
        `│ ⚠️  Kam az kam 1 banda\n` +
        `│    mention karo!\n` +
        `│\n` +
        `│ ◈ Usage:\n` +
        `│   .creategroup Name | @user\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    const input = args.join(' ');
    const parts = input.split('|');
    const groupName = parts.length > 1 ? parts[0].trim() || 'New Group' : 'New Group';

    mentionIDs.push(senderID);

    try {
      if (typeof api.createNewGroup !== 'function') {
        return send.reply(
          `╭─── « ❌ NOT SUPPORTED » ───⟡\n` +
          `│\n` +
          `│ ⚠️  Yeh feature current\n` +
          `│    API mein available\n` +
          `│    nahi hai.\n` +
          `│\n` +
          `╰───────────────⟡`
        );
      }

      const threadID = await api.createNewGroup(mentionIDs, groupName);
      return send.reply(
        `╭─── « ✅ GROUP CREATED » ───⟡\n` +
        `│\n` +
        `│ 🎉 Group ban gaya!\n` +
        `│\n` +
        `│ ◈ Name : ${groupName}\n` +
        `│ ◈ TID  : ${threadID}\n` +
        `│\n` +
        `│ 👑 MR DEVIL BOT\n` +
        `╰───────────────⟡`
      );
    } catch (error) {
      return send.reply(
        `╭─── « ❌ ERROR » ───⟡\n` +
        `│\n` +
        `│ 😔 Group nahi bana!\n` +
        `│ ◈ ${error.message || 'Unknown error'}\n` +
        `│\n` +
        `│ 🔁 Dobara try karo.\n` +
        `╰───────────────⟡`
      );
    }
  }
};
