const UsersModel = require('../database/models/users');

class UsersController {
  constructor(api) {
    this.api = api;
    this.nameCache = new Map();
  }

  isValidName(name) {
    if (!name || typeof name !== 'string' || !name.trim()) return false;
    const inv = ['facebook', 'facebook user', 'user', 'unknown', 'undefined', 'null', ''];
    const lower = name.toLowerCase().trim();
    return !inv.includes(lower) && !lower.includes('facebook user');
  }

  async getNameUser(userID) {
    try {
      if (!userID) return 'User';
      const cached = this.nameCache.get(userID);
      if (this.isValidName(cached)) return cached;
      const dbName = await UsersModel.getName(userID);
      if (this.isValidName(dbName)) { this.nameCache.set(userID, dbName); return dbName; }
      const info = await this.api.getUserInfo(userID);
      if (info?.[userID]) {
        const { name, firstName, alternateName } = info[userID];
        for (const n of [name, firstName, alternateName]) {
          if (this.isValidName(n)) {
            await UsersModel.setName(userID, n);
            this.nameCache.set(userID, n);
            return n;
          }
        }
      }
      return 'User';
    } catch {
      try { const cached = await UsersModel.getName(userID); return this.isValidName(cached) ? cached : 'User'; } catch { return 'User'; }
    }
  }

  async setName(id, name) {
    if (id && this.isValidName(name)) { await UsersModel.setName(id, name); this.nameCache.set(id, name); return true; }
    return false;
  }

  async get(id) { return UsersModel.get(id); }
  async create(id, name = '') { return UsersModel.create(id, name); }
  async update(id, data) { return UsersModel.update(id, data); }
  async ban(id, reason = '') { return UsersModel.ban(id, reason); }
  async unban(id) { return UsersModel.unban(id); }
  async isBanned(id) { return UsersModel.isBanned(id); }
  async getAll() { return UsersModel.getAll(); }
  async getBanned() { return UsersModel.getBanned(); }
  async getData(id) { return UsersModel.getData(id); }
  async setData(id, data) { return UsersModel.setData(id, data); }
}

module.exports = UsersController;
