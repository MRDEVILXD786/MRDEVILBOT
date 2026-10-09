const db = require('../index');

const Users = {
  async get(id) {
    return db.findOne(db.users, { id });
  },

  async getAll() {
    return db.findAll(db.users);
  },

  async create(id, name = '') {
    const existing = await this.get(id);
    if (existing) return existing;
    const doc = { id, name, exp: 0, money: 0, banned: false, banReason: '', data: {} };
    return db.insert(db.users, doc);
  },

  async update(id, data) {
    let user = await this.get(id);
    if (!user) user = await this.create(id);
    await db.update(db.users, { id }, { $set: data });
    return this.get(id);
  },

  async setName(id, name) { return this.update(id, { name }); },

  async getName(id) {
    const u = await this.get(id);
    return u?.name || 'Unknown';
  },

  async ban(id, reason = '') { return this.update(id, { banned: true, banReason: reason }); },
  async unban(id) { return this.update(id, { banned: false, banReason: '' }); },
  async isBanned(id) { const u = await this.get(id); return !!u?.banned; },
  async getBanned() { return db.findAll(db.users, { banned: true }); },

  async getData(id) {
    const u = await this.get(id);
    return u?.data || {};
  },

  async setData(id, data) { return this.update(id, { data }); }
};

module.exports = Users;
