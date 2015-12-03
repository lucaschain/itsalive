function Engine (cb, options) {
  this.cb = cb || function(){};
  options = options || {};
  this.intervalTime = options.intervalTime || 5;
  this.maxUps = options.maxUps || 60;
  this.start();
};

Engine.prototype.start = function () {
  this.lastUpdate = new Date();
  var self = this;

  this.interval = setInterval(function(){
    self.update()
  }, this.intervalTime);
};

Engine.prototype.update = function () {
  var now = new Date();
  var msPassed = now - this.lastUpdate;
  var delta = msPassed / 1000;
  var ups = 1 / delta;
  if (ups > this.maxUps) return;
  this.lastUpdate = now;
  this.cb(delta, ups);
};

new Engine(function(delta, ups){
  console.log(ups);
});
