module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'bank',
    aliases: ['bk'],
    description: 'Bank system — deposit, withdraw, transfer coins.',
    usage: 'bank [deposit/withdraw/transfer] [amount] [@mention]',
    category: 'Economy',
    prefix: true,
    cooldowns: 3
  },
  async run({ api, event, send, Users, Currencies }) {
    const { senderID, mentions, body } = event;
    const args = body.trim().split(/\s+/).slice(1);
    const sub = (args[0] || '').toLowerCase();
    const name = await Users.getNameUser(senderID);

    const helpMsg =
      `╭─── 🏦 BANK SYSTEM ───╮\n` +
      `│\n` +
      `│ 👤 ${name}\n` +
      `│\n` +
      `│ 📋 Commands:\n` +
      `│\n` +
      `│ 💾 Deposit (wallet → bank)\n` +
      `│  .bank deposit <amount>\n` +
      `│  .bank dep all\n` +
      `│\n` +
      `│ 💸 Withdraw (bank → wallet)\n` +
      `│  .bank withdraw <amount>\n` +
      `│  .bank with all\n` +
      `│\n` +
      `│ 🔁 Transfer (kisi ko bhejo)\n` +
      `│  .bank transfer <amount> @user\n` +
      `│\n` +
      `│ 📊 Balance check:\n` +
      `│  .balance\n` +
      `╰────────────────────────╯`;

    if (!sub || sub === 'help') {
      const data = await Currencies.getData(senderID);
      return send.reply(
        `╭─── 🏦 TERA BANK ───╮\n` +
        `│\n` +
        `│ 👤 ${name}\n` +
        `│ 👛 Wallet: ${(data.balance || 0).toLocaleString()} coins\n` +
        `│ 🏦 Bank:   ${(data.bank || 0).toLocaleString()} coins\n` +
        `│ 💎 Total:  ${((data.balance || 0) + (data.bank || 0)).toLocaleString()} coins\n` +
        `│\n` +
        `│ 📋 Sub-commands:\n` +
        `│  deposit | withdraw | transfer\n` +
        `│\n` +
        `│ 📌 Example:\n` +
        `│  .bank deposit 500\n` +
        `│  .bank withdraw all\n` +
        `╰─────────────────────╯`
      );
    }

    if (sub === 'deposit' || sub === 'dep') {
      const data = await Currencies.getData(senderID);
      const wallet = data.balance || 0;

      if (wallet <= 0) {
        return send.reply(`❌ ${name}, tera wallet khali hai!\nPehle .work ya .daily karo.`);
      }

      let amount;
      if (!args[1] || args[1].toLowerCase() === 'all') {
        amount = wallet;
      } else {
        amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0) {
          return send.reply(`❌ Sahi amount likho!\nExample: .bank deposit 500`);
        }
      }

      if (amount > wallet) {
        return send.reply(
          `❌ Itne coins nahi hain!\n👛 Wallet mein sirf: ${wallet.toLocaleString()} coins`
        );
      }

      const ok = await Currencies.deposit(senderID, amount);
      if (!ok) return send.reply(`❌ Deposit fail ho gaya, dobara try karo.`);

      const newData = await Currencies.getData(senderID);
      return send.reply(
        `╭─── 🏦 DEPOSIT ───╮\n` +
        `│\n` +
        `│ 👤 ${name}\n` +
        `│ ✅ Deposit: +${amount.toLocaleString()} coins\n` +
        `│\n` +
        `│ 👛 Wallet: ${(newData.balance || 0).toLocaleString()} coins\n` +
        `│ 🏦 Bank:   ${(newData.bank || 0).toLocaleString()} coins\n` +
        `╰───────────────────╯`
      );
    }

    if (sub === 'withdraw' || sub === 'with' || sub === 'wd') {
      const data = await Currencies.getData(senderID);
      const bankBal = data.bank || 0;

      if (bankBal <= 0) {
        return send.reply(`❌ ${name}, bank khali hai!\nPehle .bank deposit karo.`);
      }

      let amount;
      if (!args[1] || args[1].toLowerCase() === 'all') {
        amount = bankBal;
      } else {
        amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0) {
          return send.reply(`❌ Sahi amount likho!\nExample: .bank withdraw 500`);
        }
      }

      if (amount > bankBal) {
        return send.reply(
          `❌ Bank mein itne coins nahi!\n🏦 Bank mein sirf: ${bankBal.toLocaleString()} coins`
        );
      }

      const ok = await Currencies.withdraw(senderID, amount);
      if (!ok) return send.reply(`❌ Withdraw fail ho gaya, dobara try karo.`);

      const newData = await Currencies.getData(senderID);
      return send.reply(
        `╭─── 💸 WITHDRAW ───╮\n` +
        `│\n` +
        `│ 👤 ${name}\n` +
        `│ ✅ Nikale: +${amount.toLocaleString()} coins\n` +
        `│\n` +
        `│ 👛 Wallet: ${(newData.balance || 0).toLocaleString()} coins\n` +
        `│ 🏦 Bank:   ${(newData.bank || 0).toLocaleString()} coins\n` +
        `╰────────────────────╯`
      );
    }

    if (sub === 'transfer' || sub === 'send' || sub === 'tf') {
      const mentionIDs = Object.keys(mentions || {});
      if (mentionIDs.length === 0) {
        return send.reply(`❌ Kisi ko mention karo!\nExample: .bank transfer 500 @username`);
      }

      const toID = mentionIDs[0];
      if (toID === senderID) {
        return send.reply(`❌ Khud ko transfer nahi kar sakte!`);
      }

      const amount = parseInt(args[1]);
      if (isNaN(amount) || amount <= 0) {
        return send.reply(`❌ Sahi amount likho!\nExample: .bank transfer 500 @username`);
      }

      const senderData = await Currencies.getData(senderID);
      if ((senderData.balance || 0) < amount) {
        return send.reply(
          `❌ Wallet mein itne coins nahi!\n👛 Wallet: ${(senderData.balance || 0).toLocaleString()} coins`
        );
      }

      const toName = await Users.getNameUser(toID);
      const ok = await Currencies.transfer(senderID, toID, amount);
      if (!ok) return send.reply(`❌ Transfer fail ho gaya, dobara try karo.`);

      const newData = await Currencies.getData(senderID);
      return send.reply(
        `╭─── 🔁 TRANSFER ───╮\n` +
        `│\n` +
        `│ 📤 Se:  ${name}\n` +
        `│ 📥 Ko:  ${toName}\n` +
        `│ 💰 Amount: ${amount.toLocaleString()} coins\n` +
        `│\n` +
        `│ 👛 Tera Wallet: ${(newData.balance || 0).toLocaleString()} coins\n` +
        `╰────────────────────╯`
      );
    }

    return send.reply(helpMsg);
  }
};
