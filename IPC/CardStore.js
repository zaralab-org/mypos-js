
const helper = require('./Helper');

module.exports = function (currency, amount, cardVerification) {
  helper.isValidCardVerification(cardVerification);

  if (cardVerification == enums.CARD_VERIFICATION.CARD_VERIFICATION_YES) {
    helper.isValidCurrency(currency);
  }

  this.currency = currency;
  this.amount = amount;
  this.cardVerification = cardVerification;

  return this;
}