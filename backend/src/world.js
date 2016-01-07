var Garp = require("./garp.js");
var Math = require("./math.js");
var Engine = require("./engine.js");
var fs = require("fs");

function World (options) {
  options = options || {};
  this.inhabitants = {};
  this.serializeCbs = [];
  this.size = options.size || {
    x: 80,
    y: 45
  };
  this.civilization = 0;
  this.initialPopulation = options.initialPopulation || 15;
  this.maxPopulation = options.maxPopulation || 300;
  this.serialize();
};

World.prototype.bigBang = function () {
  this.summonInhabitants(this.initialPopulation);
  var self = this;
  this.engine = new Engine(function(delta, ups){
    self.step(delta)
  });
};

World.prototype.randomX = function () {
  return Math.floor( Math.random() * (this.size.x + 1) );
};

World.prototype.randomY = function () {
  return Math.floor( Math.random() * (this.size.y + 1) );
};

World.prototype.summonInhabitants = function (quantity) {
  for (var i = 0; i < quantity; i++) {
    this.addInhabitant();
  }
};

World.prototype.addInhabitant = function (parentA, parentB, opts) {
  var inhLength = Object.keys(this.inhabitants).length;
  if (inhLength < this.maxPopulation) {
    var garp = new Garp(parentA, parentB, opts);
    this.inhabitants[garp.id] = garp;
  }
}

World.prototype.step = function (delta) {
  if (this.stepping) return;

  var population = Object.keys(this.inhabitants).length;
  //console.log(population);
  //console.log(delta);

  this.stepping = true;

  var self = this;
  if (population === 0) {
    this.summonInhabitants(this.initialPopulation);
    this.civilization++;
  }
  this.serialize(function(){
    self.stepping = false;
  });
};

World.prototype.removeCorpse = function (id) {
  delete this.inhabitants[id];
};

World.prototype.serialize = function (cb) {
  var state = {};
  state.size = this.size;
  state.inhabitants = [];

  for (var i in this.inhabitants) {
    var inh = this.inhabitants[i];
    var cleanInh = inh.serialize();
    state.inhabitants.push(cleanInh);
  }

  var jsonString = JSON.stringify(state);
  this.fireOnSerialize(state);
  fs.writeFile("state.json", jsonString, cb);
};

World.prototype.onSerialize = function (cb) {
  this.serializeCbs.push(cb);
};

World.prototype.fireOnSerialize = function (state) {
  for (var s in this.serializeCbs) {
    this.serializeCbs[s](state);
  }
};

World.prototype.inhabitantsNearMe = function (me) {
  var sight = [];

  for (var i in this.inhabitants) {
    var inh = this.inhabitants[i];
    if (inh.id !== me.id) {
      var distance = Math.squareDistance(me, inh);

      if (distance <= me.sightRadius()) {
        sight.push({
          el: inh, 
          distance: distance
        });
      }
    }
  }

  return sight;
};

module.exports = World;
