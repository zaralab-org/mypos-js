module.exports = (urls, config, customer, cart, order) => {

  var _purchaseByiCard = {
    IPCmethod: 'IPCPurchaseByIcard',
    IPCVersion: config.version,
    IPCLanguage: config.lang,
    SID: config.sid,
    WalletNumber: config.wallet,
    KeyIndex: config.keyIndex,
    Source: config.source,
    OrderID: order.orderID,
    Currency: order.currency,

    CartItems: cart.getItemsCount(),
    Amount: cart.getTotal(),

    URL_OK: urls.okUrl,
    URL_Cancel: urls.cancelUrl,
    URL_Notify: urls.notifyUrl,

    CustomerEmail: customer.email
  }

  if(customer.phone)
    _purchaseByiCard.CustomerPhone = customer.phone;

  cart.getItems().map((x, i) => {
    _purchaseByiCard[`Article_${i + 1}`] = x.name;
    _purchaseByiCard[`Quantity_${i + 1}`] = x.quantity;
    _purchaseByiCard[`Price_${i + 1}`] = x.price;
    _purchaseByiCard[`Amount_${i + 1}`] = x.price * x.quantity;
    _purchaseByiCard[`Currency_${i + 1}`] = order.currency;
  });

  return _purchaseByiCard;
}
