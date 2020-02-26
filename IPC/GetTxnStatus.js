const helper = require('./Helper');

module.exports = (config, orderId, params) => {

  helper.isValidOrderId(orderId);
  helper.isValidOutputFormat(params.outputFormat);

  var _transactionStatus = {
    IPCmethod: 'IPCGetTxnStatus',
    IPCVersion: config.version,
    IPCLanguage: config.lang,
    SID: config.sid,
    WalletNumber: config.wallet,
    KeyIndex: config.keyIndex,
    Source: config.source,

    OrderID: orderId,
    OutputFormat: params.outputFormat
  }

  return _transactionStatus;
}
