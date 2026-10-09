module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'addfriend',
    aliases: ['add', 'friendrequest'],
    description: 'Send friend request to mentioned user.',
    usage: 'addfriend [reply/mention/uid]',
    category: 'Utility',
    prefix: true
  },
  async run({ api, event, send, args }) {
    let targetID;

    if (event.messageReply) {
      targetID = event.messageReply.senderID;
    } else if (args[0]) {
      if (args[0].startsWith('uid:')) {
        targetID = args[0].replace('uid:', '');
      } else if (args[0].match(/^\d+$/)) {
        targetID = args[0];
      } else if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      }
    }

    if (!targetID) {
      return send.reply("❌ Please mention user or provide UID.\n\nUsage: addfriend @user or addfriend uid:123456789");
    }

    if (targetID === api.getCurrentUserID()) {
      return send.reply("❌ You cannot send friend request to yourself!");
    }

    send.reply("📤 Sending friend request...");

    if (typeof api.addUserToFriend === 'function') {
      try {
        await api.addUserToFriend(targetID);
        return send.reply(`✅ Friend request sent to: ${targetID}`);
      } catch (err) {
        return send.reply(`❌ Facebook has blocked this feature via API.\n\nPlease send friend request manually via Facebook app.`);
      }
    } else {
      return send.reply(`❌ Feature not available.\nPlease send friend request manually via Facebook app.`);
    }
  }
};