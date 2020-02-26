const helper = require('./Helper');

module.exports = (config, mandateReference, customerWalletNumber, action, mandateText, params) => {
  helper.isValidOutputFormat(params.outputFormat);
  
  var _mandateManagement = {
    IPCmethod: 'IPCMandateManagement',
    IPCVersion: config.version,
    IPCLanguage: config.lang,
    SID: config.sid,
    WalletNumber: config.wallet,
    KeyIndex: config.keyIndex,
    Source: config.source,

    MandateReference: mandateReference,
    CustomerWalletNumber: customerWalletNumber,
    Action: action,
    MandateText: mandateText,

    OutputFormat: params.outputFormat
  }

  return _mandateManagement;
}
