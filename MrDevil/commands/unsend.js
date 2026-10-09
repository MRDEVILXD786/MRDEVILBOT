module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'unsend',
    aliases: ['delete', 'del', 'uns'],
    description: 'Delete/unsend a message (reply to it).',
    usage: 'uns (reply to any message)',
    category: 'Utility',
    prefix: true
  },
  async run({ api, event, send, isAdmin }) {
    const { messageReply, senderID } = event;
    const botID = api.getCurrentUserID();

    if (!messageReply) return send.reply('❌ Kisi message ko reply karo phir .uns likho.');

    const isBotMsg = messageReply.senderID === botID;
    const isSenderMsg = messageReply.senderID === senderID;

    if (!isBotMsg && !isSenderMsg && !isAdmin)
      return send.reply('❌ Sirf apna ya bot ka message delete kar sakte ho.');

    try {
      await api.unsendMessage(messageReply.messageID);
    } catch (e) {
      send.reply('❌ Delete nahi hua: ' + e.message);
    }
  }
};
