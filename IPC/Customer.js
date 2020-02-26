const helper = require('./Helper'),
      enums = require('./Enums'),
      tr = require('transliteration');

module.exports = function(purchaseType) {
  return function(customer) {
    if(customer.firstNames)
      customer.firstNames = tr.transliterate(customer.firstNames);

    if(customer.lastName)
      customer.lastName = tr.transliterate(customer.lastName);

    if(customer.city)
      customer.city = tr.transliterate(customer.city);

    if(customer.address)
      customer.address = tr.transliterate(customer.address);

    //validate in helper
    if (purchaseType == enums.PURCHASE_TYPE.PURCHASE_TYPE_FULL) {
      helper.isValidCustomer(customer);
    }

    return customer;
  }
}