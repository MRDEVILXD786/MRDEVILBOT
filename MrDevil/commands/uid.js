module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'uid',
    aliases: ['getid', 'myid'],
    description: 'Get user ID of yourself or a tagged person.',
    usage: 'uid [@mention]',
    category: 'Utility',
    prefix: true
  },
  async run({ api, event, send, Users }) {
    const { senderID, mentions } = event;
    const mentionIDs = Object.keys(mentions || {});

    if (mentionIDs.length > 0) {
      let msg = `╭─── 🆔 USER IDs ───╮\n`;
      for (const uid of mentionIDs) {
        const name = await Users.getNameUser(uid);
        msg += `│ 👤 ${name}\n│ 🆔 ${uid}\n│\n`;
      }
      msg += `╰──────────────────╯`;
      return send.reply(msg);
    }

    const name = await Users.getNameUser(senderID);
    await send.reply(
      `╭─── 🆔 YOUR ID ───╮\n` +
      `│ 👤 Name: ${name}\n` +
      `│ 🆔 UID: ${senderID}\n` +
      `╰──────────────────╯`
    );
  }
};
