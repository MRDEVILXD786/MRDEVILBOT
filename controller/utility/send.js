const logs = require('./logs');

class Send {
  constructor(api, event) {
    this.api = api;
    this.event = event;
    this.threadID = event.threadID;
    this.messageID = event.messageID;
  }

  async _checkMembership(threadID) {
    try {
      if (!this.api || !this.api.getCurrentUserID) return { ok: true };
      const botID = this.api.getCurrentUserID();
      const info = await new Promise((res) =>
        this.api.getThreadInfo(threadID, (err, d) => res(err ? null : d))
      );
      if (!info) return { ok: true };
      if (info.isGroup && Array.isArray(info.participantIDs)) {
        if (!info.participantIDs.includes(botID)) {
          return { ok: false, reason: 'NOT_PARTICIPANT' };
        }
      }
      return { ok: true, info };
    } catch (e) {
      return { ok: true };
    }
  }

  async _attemptSend(fn) {
    const MAX_RETRIES = 2;
    let attempt = 0;
    while (attempt <= MAX_RETRIES) {
      try {
        return await fn();
      } catch (err) {
        const isTransient = err && (err.error === 1545012 || err.transientError);
        const notParticipant = err?.errorSummary?.toLowerCase().includes('not part of the conversation');
        if (notParticipant) { logs.warn('SEND', `Bot not in conversation: ${this.threadID}`); throw err; }
        if (!isTransient || attempt === MAX_RETRIES) throw err;
        attempt++;
        await new Promise(r => setTimeout(r, 500 * attempt));
      }
    }
  }

  async reply(message, callback) {
    const membership = await this._checkMembership(this.threadID);
    if (!membership.ok) throw new Error(`Reply prevented: ${membership.reason}`);
    return this._attemptSend(() => new Promise((resolve, reject) => {
      this.api.sendMessage(message, this.threadID, (err, info) => {
        if (err) return reject(err);
        if (callback) callback(info);
        resolve(info);
      }, this.messageID);
    }));
  }

  async send(message, threadID = this.threadID, callback) {
    const membership = await this._checkMembership(threadID);
    if (!membership.ok) throw new Error(`Send prevented: ${membership.reason}`);
    return this._attemptSend(() => new Promise((resolve, reject) => {
      this.api.sendMessage(message, threadID, (err, info) => {
        if (err) return reject(err);
        if (callback) callback(info);
        resolve(info);
      });
    }));
  }

  async reaction(emoji, messageID = this.messageID) {
    return new Promise((resolve, reject) => {
      this.api.setMessageReaction(emoji, messageID, (err) => {
        if (err) reject(err);
        else resolve(true);
      }, true);
    });
  }

  async unsend(messageID) {
    return new Promise((resolve, reject) => {
      this.api.unsendMessage(messageID, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }

  async replyAndAutoUnsend(message, delay = 15000) {
    const info = await this.reply(message);
    setTimeout(() => this.unsend(info.messageID).catch(() => {}), delay);
    return info;
  }

  async shareContact(message, userID, callback) {
    const membership = await this._checkMembership(this.threadID);
    if (!membership.ok) throw new Error(`ShareContact prevented: ${membership.reason}`);
    return new Promise((resolve, reject) => {
      this.api.shareContact(message, userID, this.threadID, (err, info) => {
        if (err) return reject(err);
        if (callback) callback(info);
        resolve(info);
      }, this.messageID);
    });
  }
}

module.exports = Send;
