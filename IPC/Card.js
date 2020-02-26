
const helper = require('./Helper'),
      ipc_exception = require('./IPC_Exception'),
      tr = require('transliteration');

module.exports = function(config) {
  return function (card) {

    if(card.number) {
      card.type = helper.getCardType(card.number);
      if(!card.type)
        throw new ipc_exception('This card is not supported by the platform');
    }

    helper.isValidCard(card);

    if(card.firstNames)
      card.firstNames = tr.transliterate(card.firstNames);

    if(card.lastName)
      card.lastName = tr.transliterate(card.lastName);

    if(card.token)
      card.token = helper.encryptData(config, card.token);

    if(card.number)
      card.number = helper.encryptData(config, card.number);

    if(card.year && (card.month || card.month == 0)){
      card.year+='';
      card.expDate = helper.encryptData(config, `${card.year.substring(2, 4)}${card.month}`);
    }

    if(card.cvc)
      card.cvc = helper.encryptData(config, card.cvc);
    /**
     * Date in format YYMM
     *
     * @return string
     */
    this.getExpDate = () => {
      return card.expDate;
    }
    this.getCardType = () => {
      return card.type;
    }
    this.getCardholderName = () => {
      return `${card.firstNames || ''}${card.lastName ? ' ' + card.lastName : ''}`;
    }
    this.getCardToken = () => {
      return card.token;
    }
    this.getCardNumber = () => {
      return card.number;
    }
    this.getCVC = () => {
      return card.cvc;
    }
    this.getAVV = () => {
      return card.avv;
    }
    this.getECI = () => {
      return card.eci;
    }
    this.getXID = () => {
      return card.xid;
    }

    return this;
  }
}