const ThreadsModel = require('../database/models/threads');

class ThreadsController {
  constructor(api) { this.api = api; }

  async getInfo(threadID) {
    try {
      const info = await this.api.getThreadInfo(threadID);
      if (info) await ThreadsModel.setName(threadID, info.threadName || info.name || '');
      return info;
    } catch { return null; }
  }

  async get(id) { return ThreadsModel.get(id); }
  async create(id, name = '') { return ThreadsModel.create(id, name); }
  async update(id, data) { return ThreadsModel.update(id, data); }
  async approve(id) { return ThreadsModel.approve(id); }
  async unapprove(id) { return ThreadsModel.unapprove(id); }
  async isApproved(id) { return ThreadsModel.isApproved(id); }
  async ban(id, reason = '') { return ThreadsModel.ban(id, reason); }
  async unban(id) { return ThreadsModel.unban(id); }
  async isBanned(id) { return ThreadsModel.isBanned(id); }
  async getAll() { return ThreadsModel.getAll(); }
  async getApproved() { return ThreadsModel.getApproved(); }
  async getBanned() { return ThreadsModel.getBanned(); }
  async getSettings(id) { return ThreadsModel.getSettings(id); }
  async setSettings(id, settings) { return ThreadsModel.setSettings(id, settings); }
  async setSetting(id, key, value) { return ThreadsModel.setSettings(id, { [key]: value }); }
  async getData(id) { return ThreadsModel.getData(id); }
  async setData(id, data) { return ThreadsModel.setData(id, data); }
  async delete(id) { return ThreadsModel.delete(id); }
}

module.exports = ThreadsController;
