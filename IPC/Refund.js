const helper = require('./Helper');

module.exports = (config, order, amount, trnref, params) => {

  helper.isValidOrder(order);
  helper.isValidAmount(amount);
  helper.isValidTrnRef(trnref);
  helper.isValidOutputFormat(params.outputFormat);

  var _refund = {
    IPCmethod: 'IPCRefund',
    IPCVersion: config.version,
    IPCLanguage: config.lang,
    SID: config.sid,
    WalletNumber: config.wallet,
    KeyIndex: config.keyIndex,
    Source: config.source,
    OrderID: order.orderId,
    Currency: order.currency,
    Amount: amount,
    IPC_Trnref: trnref,
    OutputFormat: params.outputFormat
  }

  return _refund;
}
