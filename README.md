# myPOS Checkout SDK for the JS programming language

```
npm install --save mypos-js
```

Please note this SDK is not currently developed or supported in anyway by **myPOS**. It has been barely tested too. It is based mostly on the php sdk and the [developer documentation](https://developers.mypos.eu/en/doc/online_payments/v1_4/20-api-reference). Currently passes all tests described the integration section ot the documentation:
* implements all of the **myPOS** SDK 1.4 endpoints
* handles both checkout experiences
* implements signature on all API calls including verification on complex object responses
* implements all crypto functions needed for communicating to **myPOS** servers
* handles all necessary validations upon any new object instance
* implements transliteration on customer details, so it wont bother if you send those written in cyrillic for example.
* autodetect card type, based on the card bin (please note it does not recognise VPAY and BANCONTACT cards)
* by default it handles the demo/test data, so it is really easy to start.
* Includes a sample with fully functional server based on express, that handles all request to and from **myPOS** servers (please note that to be able to debug a transaction scenario, you need to configure a public hostname to your machines IP and exposing port 80 and 443. The server will pick up an SSL for your host and only then you will be able to simulate the process)
* includes a sample that calls all client exposed functions in a row

* ##### This SDK has the "SDK_JS_1.4" source tag and is based on the 1.4 version of **myPOS**  SDK specification.
* The library was developed and tested against node 10.16, but it should work with any version of node beyond 10.

* ### Requires OpenSSL to be pressent on the host


```javascript
const  myPOS = require('mypos-js');
var  _myPOS = new  myPOS(false, {
	// keyIndex: 1,
	// sid: '000000000000010',
	// wallet: 61938166610,
	// lang: 'en',
	// developerKey: null, //Currently not used
	// privateKey: fs.readFileSync(`${__dirname}/certs/test.key`, 'utf-8'),
	// APIPublicKey: fs.readFileSync(`${__dirname}/certs/test.pub`, 'utf-8'), //Currently not used
	// encryptPublicKey: fs.readFileSync(`${__dirname}/certs/test.key`, 'utf-8'),
	lang:  'bg'
}, {
	cancelUrl:  `https://${_host}/mypos/cancel`,
	notifyUrl:  `https://${_host}/mypos/notify`,
	okUrl:  `https://${_host}/mypos/ok`,
	// reverseUrl: `https://${_host}/mypos/reverse` //optional
}, {
	// cardTokenRequest: enums.CARD_TOKEN_REQUEST.CARD_TOKEN_REQUEST_PAY_AND_STORE,
	// purchaseType: enums.PURCHASE_TYPE.PURCHASE_TYPE_SIMPLIFIED_PAYMENT_PAGE,
	// paymentMethod: enums.PAYMENT_METHOD.PAYMENT_METHOD_STANDARD,
	// outputFormat: enums.COMMUNICATION_FORMAT.COMMUNICATION_FORMAT_JSON,
	// cardVerification: enums.CARD_VERIFICATION.CARD_VERIFICATION_YES,
	// accountSettlement: false
});
```

1. first argument defines production or test environment. True will make the sdk connect to the production servers.
2. if you are using the test data, none of the properties that are commented out are needed. Set their values only when testing with your own store or when going into production.
3. urls are mandatory and should point to your public IP address. You can configure the host inside the greenlock.d/config.json replace "your.dev.server.com" with your fqdn.
4. The last argument has all the default values for parameters. You can overwrite any of them on per call bases, or set them globaly on the first init of the sdk as shown the this sample.

***
Please do not forget that while using js Date objects, the month prop always starts at 0, so be carefull when making new instances of Card.

```javascript
var  _card = new  _myPOS.Card({
	// token:  'IF SET, THE CC NUMBER AND OTHER PROPS ARE NO LONGER NEEDED',
	firstNames:  'TEST',
	// lastName: 'TEST',
	number:  '4006090000000007',
	cvc:  111,
	month:  12,
	year:  2020,
	eci:  1,
	// avv: '',
	// xid: '',
});

var  _cart = new  _myPOS.Cart();
_cart.addItem('Online book', 1, 9.55);
_cart.addDiscount(3.35); //You can still add discount as normal item as shown in the documentation, but I added that function as it makes more sence to me when having the discount on a sepparate call.

var  _customer = new  _myPOS.Customer({
	email:  'god@me.com',
	phone:  '+359898000000',
	firstNames:  'Петко',
	lastName:  'Петков',
	country:  'BGR',
	city:  'Стара Загора',
	zip:  '6000',
	address:  'Центъра на Вселената'
});
```

## You have two options
1. Print a blank webpage that triggers submit ones loaded at the client side and get redirected to the **myPOS** payment gateway. To do that, just call

```javascript
var  html = await  _myPOS.Purchase(_customer, _cart, {
	orderId:  'TEST_ORDER_' + new  Date().getTime(),
	currency:  'EUR',
	note:  ''  // Optional
})
```

2. You can call the APIs internally within your application, but depending on your case and functions, you have to comply with some further regulations that you should first consider before proceeding with this option.  [Read the full details here](https://developers.mypos.eu/en/doc/online_payments/v1_4/39-api-call--ipciapurchase) . In most cases you should be fine if you understand the basic concepts of their API logic and if you correctly handle the 3D Secure code it will work pretty straightforward.

```javascript
const  IPC_Trnref = await  _myPOS.IAPurchase({
	orderId:  _card,
	currency:  'EUR',
	note:  ''  // Optional
	}, storedCard, _cart);
```

## Check out all the examples. Spot any issue? I am happy to accept any PR. Happy codding ✌️