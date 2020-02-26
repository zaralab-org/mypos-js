const helper = require('./Helper'),
      ipc_exception = require('./IPC_Exception'),
      enums = require('./Enums');

module.exports = function (config, urls, customer, cart, order, params) {

  /**
   * Validate all set purchase details
   *
   * @throws Error
   */
  
  helper.isValidCartTokenRequest(params.cardTokenRequest);
  helper.isValidPurchaseType(params.purchaseType);
  
  helper.isValidOrder(order);

  if (!helper.isCardTokenRequestOnly(params.cardTokenRequest)) {
    try {
      cart.getItems();
    } catch (e) {
      throw new ipc_exception('Invalid Cart details: ' + e.message);
    }
  }

  var _purchase = {
    IPCmethod: 'IPCPurchase',
    IPCVersion: config.version,
    IPCLanguage: config.lang,
    SID: config.sid,
    WalletNumber: config.wallet,
    KeyIndex: config.keyIndex,
    Source: config.source,
    Currency: order.currency,
    OrderID: order.orderId,

    URL_OK: urls.okUrl,
    URL_Cancel: urls.cancelUrl,
    URL_Notify: urls.notifyUrl
  }

  if(params.accountSettlement)
    _purchase.AccountSettlement = params.accountSettlement;

  if(order.note)
    _purchase.Note = order.note;

  if (params.purchaseType != enums.PURCHASE_TYPE.PURCHASE_TYPE_SIMPLIFIED_PAYMENT_PAGE) {
    _purchase.CustomerEmail = customer.email;
    _purchase.CustomerPhone = customer.phone;
    _purchase.CustomerFirstNames = customer.firstName;
    _purchase.CustomerFamilyName = customer.lastName;
    _purchase.CustomerCountry = customer.country;
    _purchase.CustomerCity = customer.city;
    _purchase.CustomerZIPCode = customer.zip;
    _purchase.CustomerAddress = customer.address;
  }

  if (!helper.isCardTokenRequestOnly()) {

    _purchase[`CartItems`] = cart.getItemsCount();
    _purchase[`Amount`] = cart.getTotal();

    cart.getItems().map((x, i) => {
      _purchase[`Article_${i + 1}`] = x.name;
      _purchase[`Quantity_${i + 1}`] = x.quantity;
      _purchase[`Price_${i + 1}`] = x.price;
      _purchase[`Amount_${i + 1}`] = x.price * x.quantity;
      _purchase[`Currency_${i + 1}`] = order.currency;
    });
  }

  _purchase['CardTokenRequest'] = params.cardTokenRequest;
  _purchase['PaymentParametersRequired'] = params.purchaseType;

  return _purchase;
}
