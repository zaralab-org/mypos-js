const helper = require('./Helper'),
      enums = require('./Enums');

module.exports = (config, card, currency, amount, params) => {
  helper.isValidOutputFormat(params.outputFormat);

  var _storeCard = {
    IPCmethod: 'IPCIAStoreCard',
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

    _storeCard.Amount = amount;
    _storeCard.Currency = currency;
  }

  _storeCard.CardVerification = params.cardVerification;

  _storeCard['CardType'] = card.getCardType();
  _storeCard['PAN'] = card.getCardNumber();
  _storeCard['CardholderName'] = card.getCardholderName();
  _storeCard['ExpDate'] = card.getExpDate();
  _storeCard['CVC'] = card.getCVC();
  if(card.getECI())
    _storeCard['ECI'] = card.getECI();
  if(card.getAVV())
    _storeCard['AVV'] = card.getAVV();
  if(card.getXID())
    _storeCard['XID'] = card.getXID();

  return _storeCard;
}
