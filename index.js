const fs = require('fs');

const helper = require('./IPC/Helper'),
  ipc_exception = require('./IPC/IPC_Exception'),
  enums = require('./IPC/Enums'),
  card = require('./IPC/Card'),
  cart = require('./IPC/Cart'),
  customer = require('./IPC/Customer'),

  //Static classes
  purchase = require('./IPC/Purchase'),
  purchaseByIcard = require('./IPC/PurchaseByIcard'),
  refund = require('./IPC/Refund'),
  requestMoney = require('./IPC/RequestMoney'),
  reversal = require('./IPC/Reversal'),
  iaPurchase = require('./IPC/IAPurchase'),
  iaStoreCard = require('./IPC/IAStoreCard'),
  iaStoredCardUpdate = require('./IPC/IAStoredCardUpdate'),
  mandateManagement = require('./IPC/MandateManagement'),

  getTxnLog = require('./IPC/GetTxnLog'),
  getPaymentStatus = require('./IPC/GetPaymentStatus'),
  getTxnStatus = require('./IPC/GetTxnStatus');

const _defaultParams = {
  cardTokenRequest:   enums.CARD_TOKEN_REQUEST.CARD_TOKEN_REQUEST_PAY_AND_STORE,
  purchaseType:       enums.PURCHASE_TYPE.PURCHASE_TYPE_SIMPLIFIED_PAYMENT_PAGE,
  paymentMethod:      enums.PAYMENT_METHOD.PAYMENT_METHOD_STANDARD,
  outputFormat:       enums.COMMUNICATION_FORMAT.COMMUNICATION_FORMAT_JSON,
  cardVerification:   enums.CARD_VERIFICATION.CARD_VERIFICATION_YES,
  accountSettlement:  false
}

function myPOS(production = false, config = {}, urls = {}, params = {}) {
  
  const _defaultConfig = {
    privateKey: production ? undefined : fs.readFileSync(`${__dirname}/certs/test.key`, 'utf-8'),
    APIPublicKey: production ? undefined : fs.readFileSync(`${__dirname}/certs/test.pub`, 'utf-8'),
    encryptPublicKey: production ? undefined : fs.readFileSync(`${__dirname}/certs/test.pub`, 'utf-8'),
    keyIndex: 1,
    sid: '000000000000010',
    wallet: 61938166610,
    lang: 'en',
    version: '1.4',
    developerKey: null,
    source: 'SDK_JS_1.4'
  }

  config.ipcApiUrl = production ? 'https://www.mypos.eu/vmp/checkout' : 'https://www.mypos.eu/vmp/checkout-test';

  config = Object.assign({}, _defaultConfig, config);
  params = Object.assign({}, _defaultParams, params);

  try {
    helper.isValidConfig(config);
  }
  catch (e) {
    throw new ipc_exception(`There is an error in your myPOS config: ${e.message}`);
  }

  try {
    helper.isValidURLs(urls);
  }
  catch (e) {
    throw new ipc_exception(`There is an error in your portal urls: ${e.message}`);
  }

  this.enums = enums;

  this.Card = new card(config);
  this.Cart = cart;
  this.Customer = new customer(params.purchaseType);

  this.Purchase = async function (customer, cart, order, customParams) {
    var _params = Object.assign({}, params, customParams);

    var _props = purchase(config,
      urls,
      customer,
      cart,
      order,
      _params
    );

    return await helper.generateHtmlPostBody(config, _props);
  }

  this.PurchaseByIcard = async function (customer, cart, order) {

    var _props = purchaseByIcard(urls,
      config,
      customer,
      cart,
      order
    );

    return await helper.generateHtmlPostBody(config, _props);
  }

  this.Refund = async function (order, amount, trnref, customParams) {
    var _params = Object.assign({}, params, customParams);

    var _props = refund(config,
      order,
      amount,
      trnref,
      _params
    );

    await helper.doPostRequest(config, _props);
    return true;
  }

  this.RequestMoney = async function (order, amount, mandateReference, customerWalletNumber, reversalIndicator, reason, customParams) {
    var _params = Object.assign({}, params, customParams);

    var _props = requestMoney(config,
      order,
      amount,
      mandateReference,
      customerWalletNumber,
      reversalIndicator,
      reason,
      _params
    );

    await helper.doPostRequest(config, _props);
    return true;
  }

  this.Reversal = async function (trnref, customParams) {
    var _params = Object.assign({}, params, customParams);

    var _props = reversal(config,
      trnref,
      _params
    );

    await helper.doPostRequest(config, _props);
    return true;
  }

  this.IAPurchase = async function (order, card, cart, customParams) {
    var _params = Object.assign({}, params, customParams);

    var _props = iaPurchase(config,
      order,
      card,
      cart,
      _params
    );

    var _purchase = await helper.doPostRequest(config, _props);
    return _purchase.IPC_Trnref;
  }

  this.IAStoreCard = async function (card, currency, amount, customParams) {
    var _params = Object.assign({}, params, customParams);

    var _props = iaStoreCard(config,
      card,
      currency,
      amount,
      _params
    );

    var _storeCard = await helper.doPostRequest(config, _props);

    return {
      token: _storeCard.CardToken,
      cardType: _storeCard.CardType,
      number: _storeCard.PAN,
      year: ~~(20 + _storeCard.ExpDate.substr(0,2)),
      month: ~~(_storeCard.ExpDate.substr(2,2)),
      trnref: _storeCard.IPC_Trnref
    };
  }

  this.IAStoredCardUpdate = async function (card, currency, amount, customParams) {
    var _params = Object.assign({}, params, customParams);

    var _props = iaStoredCardUpdate(config,
      card,
      currency,
      amount,
      _params
    );

    var _storedCardUpdate = await helper.doPostRequest(config, _props);
    return {
      token: _storedCardUpdate.CardToken,
      cardType: _storedCardUpdate.CardType,
      number: _storedCardUpdate.PAN,
      year: ~~(20 + _storedCardUpdate.ExpDate.substr(0,2)),
      month: ~~(_storedCardUpdate.ExpDate.substr(2,2))
    };
  }

  this.GetPaymentStatus = async function (orderId, customParams) {
    var _params = Object.assign({}, params, customParams);

    var _props = getPaymentStatus(config,
      orderId,
      _params
    );

    var _paymentStatus = await helper.doPostRequest(config, _props);
    if(_paymentStatus.PaymentStatus){
      const _status = Object.getOwnPropertyNames(enums.PAYMENT_STATUS)
      .find(x => enums.PAYMENT_STATUS[x] == _paymentStatus.PaymentStatus)
      
      return _status;
    }
    
    return true;
  }

  this.GetTxnLog = async function (orderId, customParams) {
    var _params = Object.assign({}, params, customParams);

    var _props = getTxnLog(config,
      orderId,
      _params
    );

    var _transactionLog = await helper.doPostRequest(config, _props);
    _transactionLog = _transactionLog.log.request;
    _transactionLog = _transactionLog.map(x => x.item);

    _transactionLog.map(x => x.map(y => {
      if(typeof y.result === 'string' && y.result !== 'OK'){
        try{
          y.result = helper.unescape(y.result);
          y.result = JSON.parse(y.result);
        }
        catch(e){}
      }
    }));
    
    return _transactionLog;
  }

  this.GetTxnStatus = async function (orderId, customParams) {
    var _params = Object.assign({}, params, customParams);

    var _props = getTxnStatus(config,
      orderId,
      _params
    );

    var _transactionStatus = await helper.doPostRequest(config, _props);
    return _transactionStatus.OrderStatus;
  }

  this.MandateManagement = async function (mandateReference, customerWalletNumber, action, mandateText, customParams) {
    var _params = Object.assign({}, params, customParams);

    var _props = mandateManagement(config,
      mandateReference,
      customerWalletNumber,
      action,
      mandateText,
      _params
    );

    await helper.doPostRequest(config, _props);
    return true;
  }

  this.ParseResponseSignature = function(response) {
    return helper.parseResponseSignature(config, response);
  }

  return this;
}

module.exports = myPOS;