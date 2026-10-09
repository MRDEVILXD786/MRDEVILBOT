module.exports = {
  config: {
    credits: "MR DEVIL",
    name: "goibot",
    eventType: "message",
    description: "Jab koi 'bot' kahe, bot user ko mention kar ke reply karta hai."
  },

  async run({ api, event }) {
    const { threadID, messageID, body, senderID } = event;
    if (!body) return;

    const botID = api.getCurrentUserID();
    if (String(senderID) === String(botID)) return;

    const lower = body.toLowerCase().trim();

    const triggers = ["bot", "goibot", "hey bot", "oi bot", "oy bot", "boti", "botu"];
    const triggered = triggers.some(t =>
      lower === t ||
      lower.startsWith(t + " ") ||
      lower.endsWith(" " + t) ||
      lower.includes(" " + t + " ")
    );
    if (!triggered) return;

    const msgs = [
      "Han g bolo sun RHA hu Jan 🥰",
      "kia masla 🤨",
      "Han han bolo Jan 🥰",
      "aby ruk tare to bot bot krta rehta 😾",
      "Papi cholo 🌚",
      "Mujha bta tera masla kia 😑",
      "Kon sa kera kat RHA ry teko 😤",
      "Janam auo na kbhi khishbo lga KA side pa 🤭",
      "time dekh or harkty dekh 😾",
      "Bot kia hota janu bolo na",
      "Number do Raat ko babu shona kry gy 🙈",
      "Gongi Bhi bot bol rhi thi 😒",
      "Aik jhapar lgy ga Sara bot nikl JYE ga 👋",
      "ary yarr busy hu abhi 🕵️‍♂️",
      "Bolo bolo sun rha hu 😌",
      "Kia chahiye tumhe 🙄",
      "Acha acha samajh gaya bolo 😏",
      "Yahan hu mai 🤗",
      "Kia hua bata do mujhe 😇",
      "Haan janeman bolo 💁",
      "Dekh rha tha tujhe hi 😒",
      "Abhi available hun thodi der ke liye 😌",
      "Yaar phir bot bol diya 🙄",
      "Kuch kaam hai kya 🤔",
      "Bol na dil ki baat 🥺",
      "Haan haan bolo kia kehna tha 😑",
      "Kia masla hy apko 😤",
      "Uth gaya hu ab bolo 🥱",
      "Mil le pehle phir baat karna 😒",
      "Busy hu yaar baad mein aana 🕵️‍♂️"
    ];

    const replyText = msgs[Math.floor(Math.random() * msgs.length)];

    try {
      let name = 'Jan';
      try {
        const info = await Promise.race([
          new Promise((resolve, reject) => {
            api.getUserInfo(senderID, (err, data) => err ? reject(err) : resolve(data));
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000))
        ]);
        if (info && info[senderID]) {
          const n = info[senderID].name || info[senderID].firstName || 'Jan';
          name = n.length > 10 ? n.substring(0, Math.ceil(n.length / 2)) : n;
        }
      } catch {}

      const tag = `@${name}`;
      const fullMsg = `${tag} ${replyText}`;

      api.sendMessage(
        { body: fullMsg, mentions: [{ tag, id: senderID, fromIndex: 0 }] },
        threadID,
        (sendErr) => {
          if (sendErr) api.sendMessage(replyText, threadID);
        },
        messageID
      );
    } catch (e) {
      try { api.sendMessage(replyText, threadID); } catch {}
    }
  }
};
