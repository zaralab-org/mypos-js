'use strict';
const morgan = require('morgan'),
      express = require('express'),
      bodyParser = require('body-parser');

const _host = require('./greenlock.d/config').sites[0].subject;

const myPOS = require('../');

const _myPOS = new myPOS(false, {
  privateKey: '../certs/test.key',
  APIPublicKey: '../certs/test.pub', //Currently not used
  encryptPublicKey: '../certs/test.pub',
  // lang: 'bg'
}, {
  cancelUrl: `https://${_host}/mypos/cancel`,
  notifyUrl: `https://${_host}/mypos/notify`,
  okUrl: `https://${_host}/mypos/ok`
});

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('dev'));

app.post('/mypos/notify', function (req, res) {
  if(_myPOS.ParseResponseSignature(req.body)){
    console.log('Got body:', req.body);
  }
  else {
    console.log('Got invalid signature for body:', req.body);
  }
  res.send('OK');
});

app.post('/mypos/ok', function (req, res) {
  if(_myPOS.ParseResponseSignature(req.body)){
    console.log('Got body:', req.body);
  }
  else {
    console.log('Got invalid signature for body:', req.body);
  }
  res.send('OK');
});

app.post('/mypos/cancel', function (req, res) {
  if(_myPOS.ParseResponseSignature(req.body)){
    console.log('Got body:', req.body);
  }
  else {
    console.log('Got invalid signature for body:', req.body);
  }
  res.send('OK');
});

app.post('/mypos/reverse', function (req, res) {
  if(_myPOS.ParseResponseSignature(req.body)){
    console.log('Got body:', req.body);
  }
  else {
    console.log('Got invalid signature for body:', req.body);
  }
  res.send('OK');
});

app.get('/', function (req, res) {
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
  
  _myPOS.Purchase(_customer, _cart, {
    orderId: 'TEST_ORDER_' + new Date().getTime(),
    currency: 'EUR',
    note: '' // Optional
  })
  .then((data) => {
    res.send(data);
  });
});

module.exports = app;

