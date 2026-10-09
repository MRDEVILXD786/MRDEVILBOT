const db = require('../index');

const Currencies = {
  async get(id) { return db.findOne(db.currencies, { id }); },

  async create(id) {
    const existing = await this.get(id);
    if (existing) return existing;
    const doc = { id, name: '', balance: 0, bank: 0, exp: 0, lastDaily: null, dailyStreak: 0, lastWork: null };
    return db.insert(db.currencies, doc);
  },

  async update(id, data) {
    let c = await this.get(id);
    if (!c) c = await this.create(id);
    await db.update(db.currencies, { id }, { $set: data });
    return this.get(id);
  },

  async getBalance(id) { const c = await this.get(id) || await this.create(id); return c.balance || 0; },
  async getBank(id) { const c = await this.get(id) || await this.create(id); return c.bank || 0; },
  async getTotal(id) { const c = await this.get(id) || await this.create(id); return (c.balance || 0) + (c.bank || 0); },

  async addBalance(id, amt) {
    const c = await this.get(id) || await this.create(id);
    return this.update(id, { balance: (c.balance || 0) + amt });
  },

  async removeBalance(id, amt) {
    const c = await this.get(id) || await this.create(id);
    return this.update(id, { balance: Math.max(0, (c.balance || 0) - amt) });
  },

  async deposit(id, amt) {
    const c = await this.get(id) || await this.create(id);
    if ((c.balance || 0) < amt) return false;
    await this.update(id, { balance: (c.balance || 0) - amt, bank: (c.bank || 0) + amt });
    return true;
  },

  async withdraw(id, amt) {
    const c = await this.get(id) || await this.create(id);
    if ((c.bank || 0) < amt) return false;
    await this.update(id, { balance: (c.balance || 0) + amt, bank: (c.bank || 0) - amt });
    return true;
  },

  async transfer(fromId, toId, amt) {
    const from = await this.get(fromId) || await this.create(fromId);
    if ((from.balance || 0) < amt) return false;
    await this.create(toId);
    await this.removeBalance(fromId, amt);
    await this.addBalance(toId, amt);
    return true;
  },

  async getBankData(id) { return db.findOne(db.bank, { userId: id }); },
  async hasBankAccount(id) { const b = await this.getBankData(id); return !!(b && b.registration_step >= 1); },

  async claimDaily(id) {
    const c = await this.get(id) || await this.create(id);
    const now = new Date().toDateString();
    if (c.lastDaily === now) return { success: false, reason: 'already_claimed' };
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const streak = c.lastDaily === yesterday.toDateString() ? (c.dailyStreak || 0) + 1 : 1;
    const reward = 5;
    await this.update(id, { balance: (c.balance || 0) + reward, dailyStreak: streak, lastDaily: now });
    return { success: true, reward, streak };
  },

  async work(id) {
    const c = await this.get(id) || await this.create(id);
    const now = Date.now();
    const lastWork = c.lastWork ? new Date(c.lastWork).getTime() : 0;
    const cooldown = 30 * 60 * 1000;
    if (now - lastWork < cooldown) return { success: false, remaining: Math.ceil((cooldown - (now - lastWork)) / 60000) };
    const jobs = ['Developer', 'Teacher', 'Doctor', 'Driver', 'Chef', 'Artist', 'Engineer', 'Writer', 'Designer', 'Trader'];
    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const earnings = 10;
    await this.update(id, { balance: (c.balance || 0) + earnings, lastWork: new Date().toISOString() });
    return { success: true, job, earnings };
  },

  async getTop(limit = 10) {
    const all = await db.findAll(db.currencies);
    return all
      .map(c => ({ id: c.id, balance: c.balance || 0, bank: c.bank || 0, total: (c.balance || 0) + (c.bank || 0) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  },

  async getExp(id) { const c = await this.get(id) || await this.create(id); return c.exp || 0; },
  async addExp(id, amt) { const c = await this.get(id) || await this.create(id); return this.update(id, { exp: (c.exp || 0) + amt }); },

  async getData(id) {
    const c = await this.get(id) || await this.create(id);
    return { exp: c.exp || 0, balance: c.balance || 0, bank: c.bank || 0 };
  },

  async setData(id, data) {
    const upd = {};
    if (data.exp !== undefined) upd.exp = data.exp;
    if (data.balance !== undefined) upd.balance = data.balance;
    if (data.bank !== undefined) upd.bank = data.bank;
    if (Object.keys(upd).length) return this.update(id, upd);
    return this.get(id) || this.create(id);
  },

  async resetAllData() {
    try { await db.remove(db.currencies, {}, { multi: true }); await db.remove(db.bank, {}, { multi: true }); return { success: true }; }
    catch (e) { return { success: false, error: e.message }; }
  },

  async getAllCount() { return db.count(db.currencies); },

  async dailyMidnightReset() {
    try { await db.update(db.currencies, {}, { $set: { exp: 0 } }, { multi: true }); return { success: true, message: 'EXP reset done.' }; }
    catch (e) { return { success: false, error: e.message }; }
  },

  async midnightCoinsReset() {
    try {
      await db.update(
        db.currencies,
        { accountOpen: { $ne: true } },
        { $set: { balance: 0, bank: 0 } },
        { multi: true }
      );
      return { success: true, message: 'Coins reset for unregistered users.' };
    } catch (e) { return { success: false, error: e.message }; }
  }
};

module.exports = Currencies;
