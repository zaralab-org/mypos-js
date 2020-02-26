const helper = require('./Helper');
/**
 * Process IPC method: IPCIAPurchase.
 * Collect, validate and send API params
 */
module.exports = (config, order, card, cart, params) => {
  /**
   * Validate all set purchase details
   *
   * @throws Error
   */

  helper.isValidOrder(order);
  helper.isValidOutputFormat(params.outputFormat);

  var _purchase = {
    IPCmethod: 'IPCIAPurchase',
    IPCVersion: config.version,
    IPCLanguage: config.lang,
    SID: config.sid,
    WalletNumber: config.wallet,
    KeyIndex: config.keyIndex,
    Source: config.source,
    OrderID: order.orderId,
    Amount: cart.getTotal(),
    Currency: order.currency,
    
    OutputFormat: params.outputFormat,
    CartItems: cart.getItemsCount()
  }

  if(params.accountSettlement)
    _purchase.AccountSettlement = params.accountSettlement;
  
  if(order.note)
    _purchase.Note = order.note;

  if (card.getCardToken()) {
    _purchase['CardToken'] = card.getCardToken();
  }
  else {
    _purchase['CardType'] = card.getCardType();
    _purchase['PAN'] = card.getCardNumber();
    _purchase['CardholderName'] = card.getCardholderName();
    _purchase['ExpDate'] = card.getExpDate();
    _purchase['CVC'] = card.getCVC();
    if(card.getECI())
      _purchase['ECI'] = card.getECI();
    if(card.getAVV())
      _purchase['AVV'] = card.getAVV();
    if(card.getXID())
      _purchase['XID'] = card.getXID();
  }

  cart.getItems().map((x, i) => {
    _purchase[`Article_${i + 1}`] = x.name;
    _purchase[`Quantity_${i + 1}`] = x.quantity;
    _purchase[`Price_${i + 1}`] = x.price;
    _purchase[`Amount_${i + 1}`] = x.price * x.quantity;
    _purchase[`Currency_${i + 1}`] = order.currency;
  });

  return _purchase;
}
