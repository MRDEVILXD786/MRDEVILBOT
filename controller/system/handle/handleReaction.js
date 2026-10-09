const logs = require('../../utility/logs');

async function handleReaction({ api, event, config }) {
  const { threadID, messageID, userID, reaction } = event;
  if (!reaction) return;

  const deleteEmoji = config.REACT_DELETE_EMOJI || '😡';
  if (reaction === deleteEmoji) {
    try {
      const botID = api.getCurrentUserID();
      if (userID === botID) return;
      await api.unsendMessage(messageID);
      logs.info('REACTION', `Deleted msg by ${deleteEmoji} reaction from ${userID}`);
    } catch (e) { logs.error('REACTION', e.message); }
    return;
  }

  if (!global.client?.handleReaction) return;
  const reactionData = global.client.handleReaction.find(item => item.messageID === messageID);
  if (!reactionData) return;

  try {
    const command = global.client.commands.get(reactionData.name);
    if (!command?.handleReaction) return;
    await command.handleReaction({ api, event, config, handleReaction: reactionData });
  } catch (e) { logs.error('REACTION_CMD', e.message); }
}

module.exports = handleReaction;
