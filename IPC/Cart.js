const helper = require('./Helper'),
      ipc_exception = require('./IPC_Exception');

module.exports = function() {
  var _items = [];
  var _discount = 0;
  /**
   *
   * @param string Name Item name
   * @param int quantity Items quantity
   * @param float price Single item price
   *
   * @return Cart
   * @throws Exception
   */
  this.addItem = (name, quantity, price) => {
    if (!name) {
      throw new ipc_exception('Invalid cart item name');
    }
    if (!quantity || !helper.isValidCartQuantity(quantity)) {
      throw new ipc_exception('Invalid cart item quantity');
    }
    if (!price || !helper.isValidAmount(price)) {
      throw new ipc_exception('Invalid cart item price');
    }
    _items.push({
      name,
      quantity,
      price
    })
    // return _items;
  }

  this.addDiscount = (amount) => {
    _discount = amount;
  }

  /**
   * Returns cart total amount
   *
   * @return float
   */

  this.getTotal = () => {
    var sum = 0;
    if (_items.length) {
      for (var a in _items) {
        var _item = _items[a];
        sum += _item.quantity * _item.price;
      }
    }
    if(_discount !== 0){
      sum -= _discount;
    }
    return sum;
  }

  this.getItems = () => {
    if (!helper.isValidCartQuantity(_items.length)) {
      throw new ipc_exception('Missing cart items');
    }
    if(_discount === 0)
      return _items;
      
    return _items.concat([{
      name: 'Discount',
      quantity:  1,
      price: _discount * -1
    }]);
  }

  /**
   * Returns count of items in cart
   *
   * @return int
   */

  this.getItemsCount = () => {
    return _discount === 0 ? _items.length : _items.length + 1;
  }

  this.getDiscount = () => {
    return _discount;
  }

  return this;
}