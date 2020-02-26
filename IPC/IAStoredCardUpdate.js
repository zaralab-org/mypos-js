const helper = require('./Helper'),
      enums = require('./Enums');

module.exports = (config, card, currency, amount, params) => {
  helper.isValidOutputFormat(params.outputFormat);

  var _storedCardUpdate = {
    IPCmethod: 'IPCIAStoredCardUpdate',
    IPCVersion: config.version,
    IPCLanguage: config.lang,
    SID: config.sid,
    WalletNumber: config.wallet,
    KeyIndex: config.keyIndex,
    Source: config.source,

    OutputFormat: params.outputFormat
  }

  if (params.cardVerification == enums.CARD_VERIFICATION.CARD_VERIFICATION_YES) {
    helper.isValidCurrency(currency);
    helper.isValidAmount(amount);

    _storedCardUpdate.Amount = amount;
    _storedCardUpdate.Currency = currency;
  }

  _storedCardUpdate.CardVerification = params.cardVerification;

  _storedCardUpdate['CardType'] = card.getCardType();
  _storedCardUpdate['CardToken'] = card.getCardToken();
  _storedCardUpdate['CardholderName'] = card.getCardholderName();
  _storedCardUpdate['ExpDate'] = card.getExpDate();
  _storedCardUpdate['CVC'] = card.getCVC();
  if(card.getECI())
    _storedCardUpdate['ECI'] = card.getECI();
  if(card.getAVV())
    _storedCardUpdate['AVV'] = card.getAVV();
  if(card.getXID())
    _storedCardUpdate['XID'] = card.getXID();

  return _storedCardUpdate;
}
