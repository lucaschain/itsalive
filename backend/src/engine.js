function Engine (cb, options) {
  this.cb = cb || function(){};
  options = options || {};
  this.intervalTime = options.intervalTime || 1;
  this.maxUps = options.maxUps || 60;
  this.upsLimitRate = options.upsLimitRate || 1.05;
  this.start();
};

Engine.prototype.start = function () {
  this.lastUpdate = new Date();
  var self = this;

  this.interval = setInterval(function(){
    self.update()
  }, this.intervalTime);
};

Engine.prototype.stop = function () {
  clearInterval(this.interval);
};

Engine.prototype.update = function () {
  var now = new Date();
  var msPassed = now - this.lastUpdate;
  var delta = msPassed / (1000 * 4);
  var ups = 1 / delta;
  if (ups > (this.maxUps * this.upsLimitRate)) return;
  this.lastUpdate = now;
  this.cb(delta, ups);
};

module.exports = Engine;
