const axios = require('axios');

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'translate',
    aliases: ['trans', 'tr'],
    description: "Translate text to any language.",
    usage: 'translate [lang] [text] or reply to message with translate [lang]',
    category: 'Utility',
    prefix: true
  },

  async run({ api, event, args, send }) {
    const { messageID, messageReply } = event;

    const langCodes = {
      'urdu': 'ur', 'ur': 'ur',
      'english': 'en', 'en': 'en', 'eng': 'en',
      'hindi': 'hi', 'hi': 'hi',
      'arabic': 'ar', 'ar': 'ar',
      'spanish': 'es', 'es': 'es',
      'french': 'fr', 'fr': 'fr',
      'german': 'de', 'de': 'de',
      'italian': 'it', 'it': 'it',
      'portuguese': 'pt', 'pt': 'pt',
      'russian': 'ru', 'ru': 'ru',
      'chinese': 'zh', 'zh': 'zh',
      'japanese': 'ja', 'ja': 'ja',
      'korean': 'ko', 'ko': 'ko',
      'turkish': 'tr', 'tr': 'tr',
      'indonesian': 'id', 'id': 'id',
      'malay': 'ms', 'ms': 'ms',
      'bengali': 'bn', 'bn': 'bn',
      'punjabi': 'pa', 'pa': 'pa',
      'persian': 'fa', 'fa': 'fa',
      'thai': 'th', 'th': 'th',
      'vietnamese': 'vi', 'vi': 'vi'
    };

    let targetLang = args[0]?.toLowerCase();
    let textToTranslate = '';

    if (messageReply && messageReply.body) {
      textToTranslate = messageReply.body;
      if (!targetLang) targetLang = 'en';
    } else {
      if (args.length < 2) {
        return send.reply(
`🌍 ━━━━━ TRANSLATE ━━━━━ 🌍

📋 ʜᴏᴡ ᴛᴏ ᴜsᴇ:

▸ Reply to message:
  translate [language]

▸ Direct text:
  translate [language] [text]

💡 ᴇxᴀᴍᴘʟᴇs:
  translate urdu Hello
  translate en اسلام علیک

🌐 ᴀᴠᴀɪʟᴀʙʟᴇ ʟᴀɴɢᴜᴀɢᴇs:
  urdu, english, hindi, arabic,
  spanish, french, german, chinese,
  japanese, korean, turkish`
        );
      }
      textToTranslate = args.slice(1).join(' ');
    }

    const langCode = langCodes[targetLang] || targetLang;

    if (!langCode || langCode.length > 5) {
      return send.reply('⚠️ Invalid language! Use: urdu, english, hindi, etc.');
    }

    try {
      api.setMessageReaction('⏳', messageID, () => {}, true);

      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langCode}&dt=t&q=${encodeURIComponent(textToTranslate)}`;
      const response = await axios.get(url);

      if (!response.data || !response.data[0]) throw new Error('Translation failed');

      let translatedText = '';
      for (const part of response.data[0]) {
        if (part[0]) translatedText += part[0];
      }

      const detectedLang = response.data[2] || 'auto';

      const result = `🌍 ━━━━ TRANSLATION ━━━━ 🌍

📤 sᴏᴜʀᴄᴇ:
${textToTranslate.substring(0, 180)}${textToTranslate.length > 180 ? '...' : ''}

📥 ${langCode.toUpperCase()} ᴛʀᴀɴsʟᴀᴛɪᴏɴ:
${translatedText}

🔎 ᴅᴇᴛᴇᴄᴛᴇᴅ: ${detectedLang.toUpperCase()} → ${langCode.toUpperCase()}`.trim();

      api.setMessageReaction('✅', messageID, () => {}, true);
      return send.reply(result);
    } catch (error) {
      api.setMessageReaction('❌', messageID, () => {}, true);
      return send.reply(`🚫 Failed: ${error.message}`);
    }
  }
};
