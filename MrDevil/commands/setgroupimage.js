const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'setgroupimage',
    aliases: ['setgroupphoto', 'groupimage', 'setgroupicon'],
    description: "Change the current group's display image.",
    usage: 'setgroupimage (reply to image)',
    category: 'Group',
    groupOnly: true,
    prefix: true
  },

  async run({ api, event, send }) {
    const { threadID } = event;
    const messageReply = event.messageReply;

    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
      return send.reply('📸 Please reply to an image first!');
    }

    const attachment = messageReply.attachments[0];
    if (attachment.type !== 'photo') {
      return send.reply('🎬 Only images are supported, not videos or files!');
    }

    const imageUrl = attachment.url;
    await send.reply('🎨 Updating group display...');

    try {
      const cacheDir = path.join(__dirname, 'cache');
      fs.ensureDirSync(cacheDir);

      const imagePath = path.join(cacheDir, `grp_${Date.now()}.jpg`);
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(imagePath, Buffer.from(response.data));

      await api.changeGroupImage(fs.createReadStream(imagePath), threadID);

      setTimeout(() => { try { if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath); } catch {} }, 5000);

      return send.reply('🖼️ Group image changed successfully!');
    } catch (error) {
      return send.reply(`🚫 Error: ${error.message}`);
    }
  }
};
