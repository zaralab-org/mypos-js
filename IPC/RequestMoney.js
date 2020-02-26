const helper = require('./Helper');

module.exports = (config, order, amount, mandateReference, customerWalletNumber, reversalIndicator, reason, params) => {

  helper.isValidAmount(amount);
  helper.isValidOutputFormat(params.outputFormat);

  var _requestMoney = {
    IPCmethod: 'IPCRequestMoney',
    IPCVersion: config.version,
    IPCLanguage: config.lang,
    SID: config.sid,
    WalletNumber: config.wallet,
    KeyIndex: config.keyIndex,
    Source: config.source,
    OrderID: order.orderId,
    Currency: order.currency,
    Amount: amount,
    
    MandateReference: mandateReference,
    CustomerWalletNumber: customerWalletNumber,
    ReversalIndicator: reversalIndicator,
    Reason: reason,

    OutputFormat: params.outputFormat
  }

  return _requestMoney;
}
