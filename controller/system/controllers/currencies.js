const CurrenciesModel = require('../database/models/currencies');

class CurrenciesController {
  constructor(api) { this.api = api; }

  async get(id) { return CurrenciesModel.get(id); }
  async create(id) { return CurrenciesModel.create(id); }
  async getBalance(id) { return CurrenciesModel.getBalance(id); }
  async getBank(id) { return CurrenciesModel.getBank(id); }
  async getTotal(id) { return CurrenciesModel.getTotal(id); }
  async addBalance(id, amt) { return CurrenciesModel.addBalance(id, amt); }
  async removeBalance(id, amt) { return CurrenciesModel.removeBalance(id, amt); }
  async deposit(id, amt) { return CurrenciesModel.deposit(id, amt); }
  async withdraw(id, amt) { return CurrenciesModel.withdraw(id, amt); }
  async transfer(from, to, amt) { return CurrenciesModel.transfer(from, to, amt); }
  async getBankData(id) { return CurrenciesModel.getBankData(id); }
  async hasBankAccount(id) { return CurrenciesModel.hasBankAccount(id); }
  async claimDaily(id) { return CurrenciesModel.claimDaily(id); }
  async work(id) { return CurrenciesModel.work(id); }
  async getTop(limit = 10) { return CurrenciesModel.getTop(limit); }
  async getData(id) { return CurrenciesModel.getData(id); }
  async setData(id, data) { return CurrenciesModel.setData(id, data); }
  async getExp(id) { return CurrenciesModel.getExp(id); }
  async addExp(id, amt) { return CurrenciesModel.addExp(id, amt); }
  async resetAllData() { return CurrenciesModel.resetAllData(); }
  async getAllCount() { return CurrenciesModel.getAllCount(); }
  async dailyMidnightReset() { return CurrenciesModel.dailyMidnightReset(); }
  async midnightCoinsReset() { return CurrenciesModel.midnightCoinsReset(); }
  async update(id, data) { return CurrenciesModel.update(id, data); }
}

module.exports = CurrenciesController;
