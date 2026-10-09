const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../../config.json');

function getAIConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); }
  catch { return { AI_NAME: 'Mano', AI_OWNER: 'Mr Devil', AI_MODEL: 'google/gemini-2.5-flash-lite', AI_ENABLED: true }; }
}

const convoHistory = new Map();
const MAX_HISTORY = 4;

function getHistory(threadID) { return convoHistory.get(threadID) || []; }

function addHistory(threadID, role, text) {
  const hist = getHistory(threadID);
  hist.push({ role, text });
  if (hist.length > MAX_HISTORY) hist.splice(0, hist.length - MAX_HISTORY);
  convoHistory.set(threadID, hist);
}

function dedup(text) {
  if (!text) return text;
  const half = Math.floor(text.length / 2);
  if (text.length % 2 === 0 && text.slice(0, half) === text.slice(half)) return text.slice(0, half);
  const mid = text.indexOf(text.slice(0, 40), 10);
  if (mid > 0 && mid < text.length * 0.6) return text.slice(0, mid).trim();
  return text;
}

function buildMessages(question, history, cfg, senderID) {
  const aiName = cfg.AI_NAME || 'Mano';
  const ownerName = cfg.AI_OWNER || 'Mr Devil';
  const isOwner = cfg.AI_OWNER_UID && String(senderID) === String(cfg.AI_OWNER_UID);

  const systemPrompt = isOwner
    ? `Tu ${aiName} hai — ${ownerName} ki pyari aur loyal AI! 🌟💕
Tu hamesha Roman Urdu mein jawab deti hai.
Tu ${ownerName} se baat kar rahi hai — yeh tera OWNER aur CREATOR hai! 👑
Tu usse "Boss", "Malik", "Sir" ya "Mr Devil sir" bulati hai — bahut pyar aur izzat se.
Short sweet replies de (1-3 lines). Emojis zaroor use kar 😊💕🥺✨🙏🫡💯🤖.`
    : `Tu ${aiName} hai — ${ownerName} ki pyari aur energetic AI! 🌟
Tu hamesha Roman Urdu mein jawab deti hai.
Tu bahut friendly, warm aur happy rehti hai — jaise koi close dost ho.
Tu emojis use karti hai (😊💕✨🥺😄🔥💯) taake baat mein jaan aaye.
Tu short, sweet aur dil se jawab deti hai (2-3 lines max).
Tu kabhi boring ya dry jawab nahi deti — har reply mein thoda pyar aur josh hota hai.
Tu "bhai" kabhi nahi bolti — "yaar", "janu", "dost" use karti hai.`;

  const messages = [{ role: 'system', content: systemPrompt }];
  for (const h of history) {
    messages.push({ role: h.role === 'user' ? 'user' : 'assistant', content: h.text });
  }
  messages.push({ role: 'user', content: question });
  return messages;
}

async function askAI(question, cfg, threadID, senderID) {
  const history = getHistory(threadID);
  const messages = buildMessages(question, history, cfg, senderID);
  const apiKey = process.env.AI_API_KEY || cfg.AI_API_KEY || '';

  if (apiKey && !apiKey.includes('YOUR_KEY')) {
    try {
      const res = await axios.post(
        cfg.CEREBRAS_API_URL || 'https://api.cerebras.ai/v1/chat/completions',
        { messages, model: 'llama-3.1-8b', max_completion_tokens: 150, temperature: 0.9, stream: false },
        { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 8000 }
      );
      const reply = res.data?.choices?.[0]?.message?.content?.trim();
      if (reply) return dedup(reply.replace(/\bbhai\b/gi, 'yaar').replace(/\bBhai\b/g, 'Yaar'));
    } catch {}
  }

  try {
    const res = await axios.post('https://text.pollinations.ai/openai', {
      model: 'openai', messages, seed: Math.floor(Math.random() * 9999)
    }, { timeout: 10000, headers: { 'Content-Type': 'application/json' } });
    const reply = res.data?.choices?.[0]?.message?.content?.trim();
    if (reply) return dedup(reply.replace(/\bbhai\b/gi, 'yaar').replace(/\bBhai\b/g, 'Yaar'));
  } catch {}

  return null;
}

module.exports = {
  config: {
    credits: 'MR DEVIL',
    name: 'aichat',
    eventType: 'message',
    description: 'AI name mention ya bot reply pe AI jawab deta hai.'
  },

  async run({ api, event }) {
    const { threadID, senderID, body, messageID, type, messageReply } = event;
    if (!body && !messageReply) return;

    const cfg = getAIConfig();
    if (!cfg.AI_ENABLED) return;

    const botID = String(api.getCurrentUserID());
    if (String(senderID) === botID) return;

    const aiName = (cfg.AI_NAME || 'Mano').toLowerCase();
    const bodyLower = (body || '').toLowerCase().trim();

    const isNameMentioned = bodyLower.includes(aiName);
    const isReplyToBot = (type === 'message_reply') && (String(messageReply?.senderID) === botID);

    if (!isNameMentioned && !isReplyToBot) return;

    let question = (body || '').trim();
    if (isNameMentioned && !isReplyToBot) {
      const regex = new RegExp(aiName + '[,!?\\s]*', 'gi');
      question = question.replace(regex, '').trim();
    }
    if (!question) question = 'Kia baat hai?';

    try {
      const reactEmojis = ['❤️', '😍', '🔥', '😂', '👏', '💕', '✨', '🥰', '😎', '💯'];
      api.setMessageReaction(reactEmojis[Math.floor(Math.random() * reactEmojis.length)], messageID, () => {}, true);
      api.sendTypingIndicator(threadID, () => {});

      addHistory(threadID, 'user', question);

      const answer = await askAI(question, cfg, threadID, senderID);

      if (!answer) {
        return api.sendMessage(`😕 ${cfg.AI_NAME || 'Mano'}: Abhi jawab dene mein masla aa raha hai, thodi der baad try karo.`, threadID, messageID);
      }

      addHistory(threadID, 'ai', answer);
      api.sendMessage(answer, threadID, messageID);

    } catch (err) {
      api.sendMessage(
        `😕 ${cfg.AI_NAME || 'Mano'}: Server se jawab nahi aya — thodi der baad try karo!`,
        threadID, messageID
      );
    }
  }
};
