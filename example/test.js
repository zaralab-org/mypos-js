const fs = require('fs');

const myPOS = require('../');

const _host = require('./greenlock.d/config').sites[0].subject;

var _myPOS = new myPOS(false, {
  // keyIndex: 1,
  // sid: '000000000000010',
  // wallet: 61938166610,
  // lang: 'en',
  // developerKey: null,  //Currently not used
  // privateKey: fs.readFileSync(`${__dirname}/certs/test.key`, 'utf-8'),
  // APIPublicKey: fs.readFileSync(`${__dirname}/certs/test.pub`, 'utf-8'), //Currently not used
  // encryptPublicKey: fs.readFileSync(`${__dirname}/certs/test.key`, 'utf-8')
  lang: 'bg'
}, {
  cancelUrl: `https://${_host}/mypos/cancel`,
  notifyUrl: `https://${_host}/mypos/notify`,
  okUrl: `https://${_host}/mypos/ok`,
  // reverseUrl: `https://${_host}/mypos/revers` //optional
}, {
  // cardTokenRequest:   enums.CARD_TOKEN_REQUEST.CARD_TOKEN_REQUEST_PAY_AND_STORE,
  // purchaseType:       enums.PURCHASE_TYPE.PURCHASE_TYPE_SIMPLIFIED_PAYMENT_PAGE,
  // paymentMethod:      enums.PAYMENT_METHOD.PAYMENT_METHOD_STANDARD,
  // outputFormat:       enums.COMMUNICATION_FORMAT.COMMUNICATION_FORMAT_JSON,
  // cardVerification:   enums.CARD_VERIFICATION.CARD_VERIFICATION_YES,
  // accountSettlement:  false
});

var _card = new _myPOS.Card({
  firstNames: 'TEST',
  // lastName: 'TEST',
  number: '4006090000000007',
  cvc: 111,
  month: 12,
  year: 2020,
  eci: 1,
  // avv: '',
  // xid: '',
});

var _cart = new _myPOS.Cart();
_cart.addItem('Online book', 1, 9.55);
_cart.addDiscount(3.35);

var _customer = new _myPOS.Customer({
  email: 'god@me.com',
  phone: '+359898000000',
  firstNames: 'Петко',
  lastName: 'Петков',
  country: 'BGR',
  city: 'Стара Загора',
  zip: '6000',
  address: 'Центъра на Вселената'
});


var testSubmitForms = async () => {
  var purchase = await _myPOS.Purchase(_customer, _cart, {
    orderId: 'TEST_ORDER_' + new Date().getTime(),
    currency: 'EUR',
    note: '' // Optional
  })
  fs.writeFileSync('public/index.html', purchase);

  var purchaseByIcard = await _myPOS.PurchaseByIcard(_customer, _cart, {
    orderId: 'TEST_ORDER_' + new Date().getTime(),
    currency: 'EUR',
    note: '' // Optional
  })
  fs.writeFileSync('public/icard.html', purchaseByIcard);
  console.log('index.html or icard.html successfully rended. Load either of them and you should be redirected to the payment gateway portal');
}

var testAPICalls = async () => {
  var storedCard = await _myPOS.IAStoreCard(_card, 'EUR', 1);
  console.log('CC Stored and got object to store: ', storedCard);

  storedCard = new _myPOS.Card({
    token: storedCard.token,
    firstNames: 'UPDATE NAME',
    cvc: 111,
    month: 12,
    year: 2020,
  });

  storedCard = await _myPOS.IAStoredCardUpdate(_card, 'EUR', 1);
  console.log('CC updated and got object to store: ', storedCard);

  storedCard = new _myPOS.Card({
    token: storedCard.token
  });

  const orderId = 'TEST_ORDER_' + new Date().getTime();

  const IPC_Trnref = await _myPOS.IAPurchase({
    orderId: orderId,
    currency: 'EUR',
    note: '' // Optional
  }, storedCard, _cart);
  console.log('Made purchase with tnxref: ' + IPC_Trnref);

  const paymentStatus = await _myPOS.GetPaymentStatus(orderId);
  console.log('Checked payment status: ', paymentStatus);

  const txnStatus = await _myPOS.GetTxnStatus(orderId);
  console.log('Got Txn status: ', txnStatus);

  const txnLog = await _myPOS.GetTxnLog(orderId);
  console.log('Got Txn logs: ', txnLog.length);

  await _myPOS.Refund({
    orderId,
    currency: 'EUR',
    note: '' // Optional
  }, 500, IPC_Trnref);
  console.log('Made refund');

  await _myPOS.Reversal('1582650738');
  console.log('Made reversal');

  const requestMoney = await _myPOS.RequestMoney({
    orderId: orderId,
    currency: 'EUR',
    note: '' // Optional
  }, 500, 'mandateReference', 'customerWalletNumber', 'reversalIndicator', 'reason');
  console.log('Requested money: ', requestMoney);

  const mandateManagement = await _myPOS.MandateManagement('mandateReference', 'customerWalletNumber', 'action', 'mandateText');
  console.log('Mandat management: ', mandateManagement);
}

// testSubmitForms();
testAPICalls();
