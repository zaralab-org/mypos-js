const constants = require('constants'),
  crypto = require('crypto'),
  axios = require('axios'),
  flatten = require('flat'),
  he = require('he'),
  creditCardType = require('credit-card-type');

  ipc_exception = require('./IPC_Exception'),
  enums = require('./Enums');

module.exports = (() => {
  this.isValidConfig = (config) => {
    if (!config.keyIndex || !Number.isInteger(config.keyIndex)) {
      throw new ipc_exception('Invalid Key Index');
    }

    if (!config.ipcApiUrl || !this.isValidURL(config.ipcApiUrl)) {
      throw new ipc_exception('Invalid IPC URL');
    }

    if (!config.sid || !~~(config.sid)) {
      throw new ipc_exception('Invalid SID');
    }

    if (!config.wallet || !Number.isInteger(config.wallet)) {
      throw new ipc_exception('Invalid Wallet number');
    }

    if (!config.version) {
      throw new ipc_exception('Invalid IPC Version');
    }

    if (!config.privateKey) {
      throw new ipc_exception('Invalid Private key path');
    }

    if (!config.encryptPublicKey) {
      throw new ipc_exception('Invalid Encrypt Public key path');
    }

    return true;
  }
  this.isValidCard = (card) => {
    if (!card.token) {
      if (!card.number || !this.isValidCardNumber(card.number)) {
        throw new ipc_exception('Invalid card number');
      }

      if (Object.getOwnPropertyNames(enums.CARD_TYPE)
      .map(x => enums.CARD_TYPE[x])
      .indexOf(card.type) == -1) {
        throw new ipc_exception('Invalid value provided for CardType param');
      }

      if (!card.cvc || !this.isValidCVC(card.cvc)) {
        throw new ipc_exception('Invalid card CVC');
      }

      if (!card.month || !Number.isInteger(card.month) || card.month <= 0 || card.month > 12) {
        throw new ipc_exception('Invalid card expire date (MM)');
      }

      if (!card.year || !Number.isInteger(card.year) || card.year < new Date().getFullYear()) {
        throw new ipc_exception('Invalid card expire date (YY)');
      }
    }

    return true;
  }
  this.isValidCustomer = (customer) => {
    if (!customer.firstNames) {
      throw new ipc_exception('Invalid First names');
    }

    if (!customer.lastName) {
      throw new ipc_exception('Invalid Last name');
    }

    if (!customer.email || helper.isValidEmail(customer.email)) {
      throw new ipc_exception('Invalid Email');
    }

    return true;
  }
  this.isValidURLs = (urls) => {
    if (!urls.cancelUrl || !this.isValidURL(urls.cancelUrl)) {
      throw new ipc_exception('Invalid Cancel URL');
    }

    if (!urls.notifyUrl || !this.isValidURL(urls.notifyUrl)) {
      throw new ipc_exception('Invalid Notify URL');
    }

    if (!urls.okUrl || !this.isValidURL(urls.okUrl)) {
      throw new ipc_exception('Invalid Success URL');
    }

    if (urls.reverseUrl && !this.isValidURL(urls.reverseUrl)) {
      throw new ipc_exception('Invalid Reverse URL');
    }
    return true;
  }
  this.isValidCartTokenRequest = (cardTokenRequest) => {
    if (Object.getOwnPropertyNames(enums.CARD_TOKEN_REQUEST)
      .map(x => enums.CARD_TOKEN_REQUEST[x])
      .indexOf(cardTokenRequest) == -1) {
      throw new ipc_exception('Invalid value provided for CardTokenRequest param');
    }
    return true;
  }
  this.isValidPurchaseType = (purchaseType) => {
    if (Object.getOwnPropertyNames(enums.PURCHASE_TYPE)
      .map(x => enums.PURCHASE_TYPE[x])
      .indexOf(purchaseType) == -1) {
      throw new ipc_exception('Invalid value provided for PurchaseType param');
    }
    return true;
  }
  this.isValidPaymentMethod = (paymentMethod) => {
    if (Object.getOwnPropertyNames(enums.PAYMENT_METHOD)
      .map(x => enums.PAYMENT_METHOD[x])
      .indexOf(paymentMethod) == -1) {
      throw new ipc_exception('Invalid value provided for PaymentMethod param');
    }
    return true;
  }
  this.isValidOutputFormat = (outputFormat) => {
    if (Object.getOwnPropertyNames(enums.COMMUNICATION_FORMAT)
      .map(x => enums.COMMUNICATION_FORMAT[x])
      .indexOf(outputFormat) == -1) {
      throw new ipc_exception('Invalid Output format');
    }
    return true;
  }
  this.isValidOrder = (order) => {
    this.isValidCurrency(order.currency);
    if (!order.orderId) {
      throw new ipc_exception('Invalid orderId');
    }
    return true;
  }
  this.isValidCurrency = (currency) => {
    if (!currency) {
      throw new ipc_exception('Invalid currency');
    }
    return true;
  }
  this.isCardTokenRequestOnly = (cardTokenRequest) => {
    return cardTokenRequest === enums.CARD_TOKEN_REQUEST.CARD_TOKEN_REQUEST_ONLY_STORE;
  }
  this.isValidCardVerification = (cardVerification) => {
    if (Object.getOwnPropertyNames(enums.CARD_VERIFICATION)
      .map(x => enums.CARD_VERIFICATION[x])
      .indexOf(cardVerification) == -1) {
      throw new ipc_exception('Invalid card verification');
    }
    return true;
  }
  this.isValidStatus = (statusObj) => {
    if (Object.getOwnPropertyNames(enums.STATUS)
      .map(x => enums.STATUS[x])
      .indexOf(statusObj.Status) == -1) {
      throw new ipc_exception('Invalid status response');
    }
    //myPOS returns 1 always even if succes so:
    else if (statusObj.Status > 1 || statusObj.StatusMsg != 'Success') {
      throw new Error(`Invalid status response: ${statusObj.StatusMsg}`);
    }
    return true
  }

  /*
   * Validate email address
   *
   * @param string email
   *
   * @return boolean
   */
  this.isValidEmail = (email) => {
    new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
      .test(String(email).toLowerCase());
  }

  /**
   * Validate URL address
   *
   * @param string url
   *
   * @return boolean
   */
  this.isValidURL = (url) => {
    return new RegExp('^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', 'i') // fragment locator
      .test(url);
  }

  /**
   * Validate IP address
   *
   * @param string ip
   *
   * @return boolean
   */
  this.isValidIP = (ip) => {
    return new RegExp('^(?!.*\.$)((?!0\d)(1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$')
      .test(ip);
  }

  /**
   * Validate customer names
   *
   * @param string name
   *
   * @return boolean
   */
  this.isValidName = (name) => {
    return new RegExp('^[a-zA-Z ]*$').test(name);
  }

  /**
   * Validate amount.
   *
   * @param float amt
   *
   * @return boolean
   */
  this.isValidAmount = (amt) => {
    return new RegExp('^(-)?[0-9]+(?:\.[0-9]{0,2})?$').test(amt + '');
  }

  /**
   * Validate quantity
   *
   * @param int quantity
   *
   * @return boolean
   */
  this.isValidCartQuantity = (quantity) => {
    return Number.isInteger(quantity) && quantity > 0;
  }

  /**
   * Validate transaction reference
   *
   * @param string trnref
   *
   * @return boolean
   */
  this.isValidTrnRef = (trnref) => {
    if (!trnref) {
      throw new ipc_exception('Invalid trnref');
    }
    return true;
  }

  /**
   * Validate Order ID
   *
   * @param string trnref
   *
   * @return boolean
   */
  this.isValidOrderId = (orderId) => {
    if (!orderId) {
      throw new ipc_exception('Invalid orderId');
    }
    return true;
  }

  /**
   * Validate card number
   *
   * @param cardNo
   *
   * @return boolean
   */
  this.isValidCardNumber = (cardNo) => {
    cardNo = cardNo.split(' ').join('');

    if (~~(cardNo) == 0 || cardNo.length > 19 || cardNo.length < 13) {
      return false;
    }
    var sum = dub = add = chk = 0;
    even = 0;
    for (var i = cardNo.length - 1; i >= 0; i--) {
      if (even == 1) {
        dub = 2 * ~~(cardNo[i]);
        if (dub > 9) {
          add = dub - 9;
        } else {
          add = dub;
        }
        even = 0;
      } else {
        add = ~~(cardNo[i]);
        even = 1;
      }
      sum += add;
    }

    return ((sum % 10) == 0);
  }

  this.getCardType = (number) => {
    var _meta = creditCardType(number);
    if(!_meta.length)
      throw new ipc_exception('Unknown card type');
    
    const _type = _meta[0].type;
    
    switch(_type){
      default:
        throw new ipc_exception('Unsupported card type');
      case 'visa':
        return enums.CARD_TYPE.CARD_TYPE_VISA;
      case 'mastercard':
        return enums.CARD_TYPE.CARD_TYPE_MASTERCARD;
      case 'american-express':
        return enums.CARD_TYPE.CARD_TYPE_AMEX;
      case 'maestro':
        return enums.CARD_TYPE.CARD_TYPE_MAESTRO;
      case 'jcb':
        return enums.CARD_TYPE.CARD_TYPE_JCB;
    }    
  }

  /**
   * Validate card CVC
   *
   * @param cvc
   *
   * @return boolean
   */
  this.isValidCVC = (cvc) => {
    return (Number.isInteger(cvc) && cvc >= 100 && cvc <= 999);
  }

  /**
   * Escape HTML special chars
   *
   * @param string text
   *
   * @return string type
   */
  this.escape = (text) => {
    return he.encode(text);
  }

  /**
   * Unescape HTML special chars
   *
   * @param string text
   *
   * @return string
   */
  this.unescape = (text) => {
    return he.decode(text)
  }

  /**
   * Flatten JS Object prop values
   * Useful when creating and parsing complext object for signature generation
   * Added here aa separate function in case we decide to remove the flatten package for some reasone
   */

  this.flattenObjectValues = function (object) {
    return flatten(object);
  }

  /**
   * Verify signature of API Request params against the API public key
   *
   * @param string data Signed data
   * @param string signature Signature in base64 format
   *
   * @return boolean
   */

  this.parseResponseSignature = (config, _params) => {
    var signature = _params.Signature;
    delete _params.Signature;

    var payload = this.flattenObjectValues(_params);
    payload = Object.getOwnPropertyNames(payload)
      .map(x => payload[x])
      .join('-');

    var _concData = Buffer.from(payload).toString('base64');

    var key = config.encryptPublicKey.trim();
    var verifier = crypto.createVerify('SHA256');
    verifier.update(_concData);
    return verifier.verify(key, signature, 'base64');
  }

  /**
   * Create signature of API Request params against the SID private key
   *
   * @param string data
   *
   * @return string base64 encoded signature
   */

  this.encryptData = (config, data) => {
    var key = config.encryptPublicKey.trim();

    return crypto.publicEncrypt({
      key,
      padding: constants.RSA_PKCS1_PADDING //ENCRYPT_PADDING
    }, Buffer.from(data + '')).toString("base64");
  }

  /**
   * Create signature of API Request params against the SID private key
   *
   * @return string base64 encoded signature
   */

  this.createSignature = (config, props) => {
    const key = config.privateKey.trim();

    var _params = {};
    for (var a in props) {
      _params[a] = decodeURIComponent(props[a] + '');
    }

    var payload = this.flattenObjectValues(_params);
    payload = Object.getOwnPropertyNames(payload)
      .map(x => payload[x])
      .join('-');

    var _concData = Buffer.from(payload).toString('base64');

    const sign = crypto.createSign('SHA256');
    sign.write(_concData);
    sign.end();

    return sign.sign(key, 'base64');
  }

  this.generateHtmlPostBody = async (config, props) => {
    props['Signature'] = this.createSignature(config, props);

    return `<html>
    <head><title>Please wait...</title></head>
    <body onload="document.getElementById('ipcForm').submit()">
      <form id="ipcForm" name="ipcForm" action="${config.ipcApiUrl}" method="post">
${Object.getOwnPropertyNames(props).map(x => {
      return `        <input type="hidden" name="${x}" value="${props[x]}" />`;
    }).join('\n')}
      </form>
    </body>
  </html>`;
  }

  /**
   * Send POST Request to API and returns Response object with validated response data
   *
   * @return Response
   * @throws Error
   */

  this.doPostRequest = async (config, props, headers = {}) => {
    const params = new URLSearchParams();
    Object.getOwnPropertyNames(props)
      .forEach((x, i) => {
        params.append(x, props[x]);
      });
    params.append('Signature', this.createSignature(config, props));

    return await axios.post(config.ipcApiUrl, params, {
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        ...headers
      }
    })
      .then((res) => {

        this.isValidStatus(res.data);

        if (this.parseResponseSignature(config, res.data)) {
          delete res.data.Signature;
          delete res.data.Status;
          delete res.data.StatusMsg;
          return res.data;
        }
        throw new ipc_exception('Invalid Response Signature');
      })
  }

  return this;
})();
