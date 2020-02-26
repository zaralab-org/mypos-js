const helper = require('./Helper');

module.exports = (config, trnref, params) => {
  helper.isValidTrnRef(trnref);
  helper.isValidOutputFormat(params.outputFormat);

  var _reversal = {
    IPCmethod: 'IPCReversal',
    IPCVersion: config.version,
    IPCLanguage: config.lang,
    SID: config.sid,
    WalletNumber: config.wallet,
    KeyIndex: config.keyIndex,
    Source: config.source,
    IPC_Trnref: trnref,
    OutputFormat: params.outputFormat
  }

  return _reversal;
}
