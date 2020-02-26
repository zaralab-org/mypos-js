var IPC_Exception = function (message) {
  var err = new Error(message);
  err.name = 'IPC_Exception';
  this.name = err.name;
  this.message = err.message;
  
  if (err.stack) {
    this.stack = err.stack;
  }
  
  this.toString = function () {
    return this.name + ': ' + this.message;
  };
};

IPC_Exception.prototype = new Error();
IPC_Exception.prototype.name = 'IPC_Exception';

module.exports = IPC_Exception;