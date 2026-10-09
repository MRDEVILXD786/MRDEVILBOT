const db = require('../index');

const Threads = {
  async get(id) { return db.findOne(db.threads, { id }); },
  async getAll() { return db.findAll(db.threads); },

  async create(id, name = '') {
    const existing = await this.get(id);
    if (existing) return existing;
    const doc = { id, name, approved: false, banned: false, banReason: '', settings: {}, data: {} };
    return db.insert(db.threads, doc);
  },

  async update(id, data) {
    let t = await this.get(id);
    if (!t) t = await this.create(id);
    await db.update(db.threads, { id }, { $set: data });
    return this.get(id);
  },

  async setName(id, name) { return this.update(id, { name }); },
  async approve(id) { return this.update(id, { approved: true }); },
  async unapprove(id) { return this.update(id, { approved: false }); },
  async isApproved(id) { const t = await this.get(id); return !!t?.approved; },
  async ban(id, reason = '') { return this.update(id, { banned: true, banReason: reason }); },
  async unban(id) { return this.update(id, { banned: false, banReason: '' }); },
  async isBanned(id) { const t = await this.get(id); return !!t?.banned; },
  async getApproved() { return db.findAll(db.threads, { approved: true }); },
  async getBanned() { return db.findAll(db.threads, { banned: true }); },

  async getSettings(id) {
    const t = await this.get(id);
    return t?.settings || {};
  },

  async setSettings(id, settings) {
    const cur = await this.getSettings(id);
    return this.update(id, { settings: { ...cur, ...settings } });
  },

  async getData(id) { const t = await this.get(id); return t?.data || {}; },
  async setData(id, data) { return this.update(id, { data }); },
  async delete(id) { return db.remove(db.threads, { id }); }
};

module.exports = Threads;
