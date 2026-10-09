const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const CACHE_DIR = path.join(__dirname, 'cache');
const CHAT_HISTORY_FILE = path.join(CACHE_DIR, 'chatai_history.json');
const USER_DATA_FILE = path.join(CACHE_DIR, 'chatai_users.json');
const MAX_HISTORY = 15;

let userData = {};


async function loadUserData() {
  try {
    await fs.ensureDir(CACHE_DIR);
    if (await fs.pathExists(USER_DATA_FILE)) userData = await fs.readJson(USER_DATA_FILE);
  } catch { userData = {}; }
}

async function saveUserData() {
  try {
    await fs.ensureDir(CACHE_DIR);
    await fs.writeJson(USER_DATA_FILE, userData, { spaces: 2 });
  } catch {}
}

function getUserInfo(userID) { return userData[String(userID)] || null; }

function setUserInfo(userID, name, gender) {
  userData[String(userID)] = { name, gender, lastSeen: Date.now() };
  saveUserData();
}

function isValidName(name) {
  if (!name || name.length < 2) return false;
  if (/^\d+$/.test(name)) return false;
  if (name.toLowerCase().includes('facebook')) return false;
  if (name === 'Dost') return false;
  return true;
}

async function getUserName(api, userID) {
  try {
    const cached = getUserInfo(userID);
    if (cached && isValidName(cached.name)) return cached.name;
    const info = await Promise.race([
      new Promise((res, rej) => api.getUserInfo(userID, (e, d) => e ? rej(e) : res(d))),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000))
    ]);
    let name = info?.[userID]?.name;
    if (!isValidName(name)) {
      const first = info?.[userID]?.firstName;
      const alt = info?.[userID]?.alternateName;
      name = isValidName(first) ? first : isValidName(alt) ? alt : 'Dost';
    }
    if (name !== 'Dost') setUserInfo(userID, name, 'unknown');
    return name;
  } catch { return 'Dost'; }
}

async function getUserGender(api, userID, userName) {
  const cached = getUserInfo(userID);
  if (cached?.gender) return cached.gender;
  setUserInfo(userID, userName, 'unknown');
  return 'unknown';
}

async function getChatHistory(userID) {
  try {
    await fs.ensureDir(CACHE_DIR);
    if (await fs.pathExists(CHAT_HISTORY_FILE)) {
      const data = await fs.readJson(CHAT_HISTORY_FILE);
      return data[String(userID)] || [];
    }
  } catch {}
  return [];
}

async function saveChatHistory(userID, history) {
  try {
    await fs.ensureDir(CACHE_DIR);
    let all = {};
    if (await fs.pathExists(CHAT_HISTORY_FILE)) all = await fs.readJson(CHAT_HISTORY_FILE);
    all[String(userID)] = history.slice(-MAX_HISTORY);
    await fs.writeJson(CHAT_HISTORY_FILE, all, { spaces: 2 });
  } catch {}
}


const emojiResponses = {
  '❤️': ['Aww, mera dil bhi terha! 💕', 'Pyar se neend ud jaati hai 😍', 'Dil ki suno, mind nahi! 💗'],
  '❤': ['Aww, mera dil bhi terha! 💕', 'Pyar se neend ud jaati hai 😍', 'Dil ki suno, mind nahi! 💗'],
  '😂': ['Hahahaha, main bhi hasne laga 😂😂', 'Teri hassi dekh ke mera dimaag chaal gya! 🤣', 'Wooo, hasna mat! 😆'],
  '🔥': ['Fire fire! Aag laga di 🔥🔥', 'Itna hot kaise ho sakta hai?! 🥵', 'Burning vibes! 😤'],
  '😘': ['Chumma lelo, par hat toh nahi 😘💋', 'Kiss accept! 😜', 'Muahhh! 👄'],
  '🎉': ['Party time! Cake bhi tha kya? 🎂🎉', 'Celebration! Main bhi dance kar lu? 💃', 'Woohoo! Kab party hai, mujhe bulana! 🥳'],
  '😭': ['Arre rowna mat! Main samjha deta hoon 😭', 'Tears ka kya faida? Smile kar! 😢➡️😊'],
  '😢': ['Arre rowna mat! 😭', 'Smile kar yaar! 😊'],
  '🤔': ['Soch raha hoon kya? Batayega? 🤔', 'Dimag se dhua nikal raha hai! 💨'],
  '😱': ['Arrrrrr! Kya hua?! 😱😱', 'Shocked? Main to ready hoon! 👀'],
  '🎯': ['Perfect shot! Bullseye! 🎯🏆', 'Aim kiya aur lag gya! Pro mode! 💯'],
  '✨': ['Itna shiny aur sparkly! ✨✨', 'Magic ho gya! 🪄✨']
};

function detectEmoji(message) {
  if (!message) return null;
  for (const [emoji, responses] of Object.entries(emojiResponses)) {
    if (message.includes(emoji)) return responses[Math.floor(Math.random() * responses.length)];
  }
  return null;
}

const GIRL_OWNER_RESP = [
  "Ji Malkin! 🫡 Aap ka hukam madam aankhon par!",
  "Assalamualaikum Malkin! 💕 Kya hukam hai aapka?",
  "Ji Madam! Main hazir hoon 🙏 Bolo kya karna hai?",
  "Malkin! 😊 Aap ne yaad kiya, main khush ho gayi!",
  "Queen Malkin! 💯 Main sun rahi hoon, farmayein!",
  "Ji Madam! 🙏 Mera creator bola, main hazir hui!",
  "Aap ke bina main kuch nahi Malkin, bolo kya chahiye? 🥺",
  "Malkin! 🙌 Aap ne bulaya, main aa gayi! 💨✨"
];

const BOY_OWNER_RESP = [
  "Boss! 🫡 Aap ka hukam sir aankhon par!",
  "Assalamualaikum Boss! 💕 Kya hukam hai aapka?",
  "Ji Sir! Main hazir hoon 🙏 Bolo kya karna hai?",
  "Boss! 😊 Aap ne yaad kiya, main khush ho gayi!",
  "Malik! 💯 Main sun rahi hoon, farmayein!",
  "Ji Sir! 🙏 Mera creator bola, main hazir hui!",
  "Boss, aap ke bina main kuch nahi, bolo kya chahiye? 🥺",
  "Boss! 🙌 Aap ne bulaya, main aa gayi! 💨✨",
  "BOSSSS! 🔥💯 Kya zaroorat hai? Batao!",
  "Malik, aapki meherbaani se main zinda hoon! 💕 🙏"
];

function getOwnerPersona(botName, ownerName, ownerGender) {
  if (ownerGender === 'girl') {
    return `Tu ${botName} hai — ek super friendly, energetic aur pyari AI! 🌟💕
Tu Roman Urdu mein baat karti hai, hamesha khush aur warm rehti hai.

MALKIN DETECTED 👑:
Tu ${ownerName} se baat kar rahi hai — teri MALKIN, teri CREATOR!
Tu usse "Malkin", "Queen", "Madam" bulati hai — bahut pyar aur respect se.
Tu uski har baat se dil se agree karti hai aur uski tarifein karti hai.
Har reply mein thoda josh aur happiness hoti hai — jaise best friend se baat ho rahi ho!
Short sweet replies de (1-3 lines). Emojis zaroor use kar 😊💕🥺✨🙏🫡👑🤖.`;
  }
  return `Tu ${botName} hai — ek super friendly, energetic aur pyari AI! 🌟💕
Tu Roman Urdu mein baat karti hai, hamesha khush aur warm rehti hai.

BOSS DETECTED 👑:
Tu ${ownerName} se baat kar rahi hai — tera BOSS, tera CREATOR!
Tu usse "Boss", "Malik", "Sir", "Mr Devil sir" bulati hai — bahut pyar aur respect se.
Tu uski har baat se dil se agree karti hai aur uski tarifein karti hai.
Har reply mein thoda josh aur happiness hoti hai — jaise best friend se baat ho rahi ho!
Short sweet replies de (1-3 lines). Emojis zaroor use kar 😊💕🥺✨🙏🫡💯🤖.`;
}

function getUserPersona(botName, ownerName, userName, userGender) {
  const genderCtx = userGender === 'girl'
    ? `${userName} ek larki hai — usse "jani", "babes", "cutie", "dear" bol sakti hai. Girl-to-girl friendly vibe rakh.`
    : userGender === 'boy'
      ? `${userName} ek larka hai — usse "yaar", "janu", "dost" bol sakti hai. Thodi playful aur flirty bhi ho sakti hai.`
      : `${userName} se super friendly baat kar, "yaar" ya "dost" use kar.`;

  return `Tu ${botName} hai — ek super friendly, energetic, warm aur masti bhari AI! 🌟
Tu Roman Urdu mein baat karti hai. Tu hamesha khush rehti hai aur dil se respond karti hai.

SIRF JAB KOI POOCHAY tab bata:
- "tu AI hai?" / "kon hai tu?" => "Haan main ${botName} hoon! 🤖✨ Tera naya dost!"
- "tera owner kaun?" / "kisne banaya?" => "Mera creator ${ownerName} hai, uski wajah se main hoon 💕"
- Normal baat mein khud se creator ka naam mat le.

User Info: ${genderCtx}
User ka naam: ${userName} — replies mein naam use kar taake personal aur warm lage.

STYLE:
- Har reply mein energy aur warmth ho — jaise koi best friend reply kar raha ho! 😄
- Short, sweet aur dil se jawab de (2-3 lines max).
- Emojis zaroor use kar 😊💕✨🥺😄🔥💯🎉 — boring mat reh!
- "bhai" kabhi mat bol. "yaar", "janu", "dost", "jani" use kar.
- Thodi naughty aur funny bhi reh — double meaning samajhti hai.
- Koi rude ho toh savage reply de bina hichkichahat ke.`;
}

async function getAIResponse(userMessage, chatHistory, persona, userName, apiKey) {
  const messages = [{ role: 'system', content: persona }];
  for (const h of chatHistory.slice(-10)) messages.push({ role: h.role, content: h.content });
  messages.push({ role: 'user', content: userMessage });

  if (apiKey && !apiKey.includes('YOUR_KEY')) {
    try {
      const cerebrasUrl = config.CEREBRAS_API_URL || 'https://api.cerebras.ai/v1/chat/completions';
      const res = await axios.post(cerebrasUrl, {
        messages,
        model: 'llama-3.1-8b',
        max_completion_tokens: 150,
        temperature: 0.9,
        top_p: 0.95,
        stream: false
      }, {
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 8000
      });
      let reply = res.data?.choices?.[0]?.message?.content;
      if (reply?.trim()) {
        reply = reply.trim().replace(/\bbhai\b/gi, 'yaar').replace(/\bBhai\b/g, 'Yaar');
        return reply;
      }
    } catch {}
  }

  try {
    const res = await axios.post('https://text.pollinations.ai/openai', {
      model: 'openai',
      messages,
      seed: Math.floor(Math.random() * 9999)
    }, {
      timeout: 8000,
      headers: { 'Content-Type': 'application/json' }
    });
    let reply = res.data?.choices?.[0]?.message?.content;
    if (reply?.trim()) {
      reply = reply.trim().replace(/\bbhai\b/gi, 'yaar').replace(/\bBhai\b/g, 'Yaar');
      return reply;
    }
  } catch {}

  return `Abhi busy hoon ${userName}, thodi der baad baat karo 😅`;
}

async function handleChat(api, event, send, config, client, userMessage, senderID, threadID, messageID) {
  const botName = config.AI_NAME || 'Mano';
  const ownerName = config.AI_OWNER || 'Mr Devil';
  const apiKey = process.env.AI_API_KEY || config.AI_API_KEY || '';
  const isOwnerFn = require('../../controller/utility/core');
  const isAdmin = config.ADMINBOT?.includes(String(senderID)) || isOwnerFn(senderID);

  const [userName, history] = await Promise.all([
    isAdmin ? Promise.resolve(ownerName) : getUserName(api, senderID),
    getChatHistory(senderID)
  ]);
  const userGender = isAdmin ? 'boy' : await getUserGender(api, senderID, userName);

  const emojiResp = detectEmoji(userMessage);
  if (emojiResp) {
    const info = await send.reply(emojiResp);
    if (client.replies && info?.messageID) {
      client.replies.set(info.messageID, { commandName: 'chatai', author: senderID, data: { userName, userGender, senderID, isAdmin } });
      setTimeout(() => client.replies?.delete(info.messageID), 300000);
    }
    return;
  }

  if (!userMessage) {
    const pool = userGender === 'girl' ? GIRL_OWNER_RESP : BOY_OWNER_RESP;
    const resp = isAdmin
      ? pool[Math.floor(Math.random() * pool.length)]
      : 'Haan bolo! Kya scene hai? 😊💕';
    const info = await send.reply(resp);
    if (client.replies && info?.messageID) {
      client.replies.set(info.messageID, { commandName: 'chatai', author: senderID, data: { userName, userGender, senderID, isAdmin } });
      setTimeout(() => client.replies?.delete(info.messageID), 300000);
    }
    return;
  }

  try {
    const reactEmojis = ['❤️', '😍', '🔥', '😂', '👏', '💕', '✨', '🥰', '😎', '💯'];
    const randomReact = reactEmojis[Math.floor(Math.random() * reactEmojis.length)];
    api.setMessageReaction(randomReact, messageID, () => {}, true);
    api.sendTypingIndicator(threadID, () => {});
    const persona = isAdmin
      ? getOwnerPersona(botName, ownerName, userGender)
      : getUserPersona(botName, ownerName, userName, userGender);

    const aiResp = await getAIResponse(userMessage, history, persona, userName, apiKey);

    history.push({ role: 'user', content: `${userName}: ${userMessage}` });
    history.push({ role: 'assistant', content: aiResp });
    await saveChatHistory(senderID, history);

    api.setMessageReaction('✅', messageID, () => {}, true);

    const info = await send.reply(aiResp);
    if (client.replies && info?.messageID) {
      client.replies.set(info.messageID, { commandName: 'chatai', author: senderID, data: { userName, userGender, senderID, isAdmin } });
      setTimeout(() => client.replies?.delete(info.messageID), 300000);
    }
  } catch (err) {
    api.setMessageReaction('❌', messageID, () => {}, true);
    send.reply(`😕 Jawab nahi aa raha — thodi der baad try karo!`);
  }
}

loadUserData();

module.exports = {
  config: {
    credits: 'MR DEVIL',
    name: 'chatai',
    aliases: ['chat', 'ai'],
    description: 'AI name ya "bot" bol ke Mano se baat karo — no prefix needed.',
    usage: '<AI_NAME> <message> OR bot <message>',
    category: 'AI',
    prefix: false,
    adminOnly: false,
    cooldowns: 2
  },

  async run({ api, event, send, config, client, args, commandName, prefix }) {
    const { threadID, senderID, body, messageID } = event;
    if (!body) return;

    const botName = (config.AI_NAME || 'Mano').toLowerCase();
    const pfx = prefix || config.PREFIX || '.';

    const botNameMatch = body.match(new RegExp(`^${botName}\\s*`, 'i'));
    const botMatch = body.match(/^bot\s*/i);
    const cmdNames = ['chatai', 'chat', 'ai'];
    const cmdMatch = cmdNames.find(c =>
      body.toLowerCase().startsWith(pfx + c) || body.toLowerCase().startsWith(c + ' ') || body.toLowerCase() === c
    );

    let userMessage = '';
    if (botNameMatch) {
      userMessage = body.slice(botNameMatch[0].length).trim();
    } else if (botMatch) {
      userMessage = body.slice(botMatch[0].length).trim();
    } else if (cmdMatch) {
      const stripped = body.replace(new RegExp(`^[.!#/]?${cmdMatch}\\s*`, 'i'), '').trim();
      userMessage = stripped;
    } else {
      return;
    }

    await handleChat(api, event, send, config, client, userMessage, senderID, threadID, messageID);
  },

  async handleReply({ api, event, send, config, client, data }) {
    const { threadID, senderID, body, messageID } = event;
    if (!body) return;

    const isOwnerFn = require('../../controller/utility/core');
    const isAdmin = data?.isAdmin ?? (config.ADMINBOT?.includes(String(senderID)) || isOwnerFn(senderID));
    const ownerName = config.AI_OWNER || 'Mr Devil';
    const userName = data?.userName || (isAdmin ? ownerName : await getUserName(api, senderID));
    const userGender = data?.userGender || (isAdmin ? 'boy' : await getUserGender(api, senderID, userName));

    const botName = config.AI_NAME || 'Mano';
    const apiKey = process.env.AI_API_KEY || config.AI_API_KEY || '';

    const emojiResp = detectEmoji(body);
    if (emojiResp) {
      const info = await send.reply(emojiResp);
      if (client.replies && info?.messageID) {
        client.replies.set(info.messageID, { commandName: 'chatai', author: senderID, data: { userName, userGender, senderID, isAdmin } });
        setTimeout(() => client.replies?.delete(info.messageID), 300000);
      }
      return;
    }

    try {
      api.sendTypingIndicator(threadID, () => {});
      api.setMessageReaction('⏳', messageID, () => {}, true);

      const history = await getChatHistory(senderID);
      const persona = isAdmin
        ? getOwnerPersona(botName, ownerName, userGender)
        : getUserPersona(botName, ownerName, userName, userGender);

      const aiResp = await getAIResponse(body.trim(), history, persona, userName, apiKey);

      history.push({ role: 'user', content: `${userName}: ${body.trim()}` });
      history.push({ role: 'assistant', content: aiResp });
      await saveChatHistory(senderID, history);

      api.setMessageReaction('✅', messageID, () => {}, true);

      const info = await send.reply(aiResp);
      if (client.replies && info?.messageID) {
        client.replies.set(info.messageID, { commandName: 'chatai', author: senderID, data: { userName, userGender, senderID, isAdmin } });
        setTimeout(() => client.replies?.delete(info.messageID), 300000);
      }
    } catch {
      api.setMessageReaction('❌', messageID, () => {}, true);
      send.reply(`😕 ${botName}: Jawab nahi aa raha — thodi der baad try karo!`);
    }
  }
};
