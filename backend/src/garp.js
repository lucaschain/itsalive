var Engine = require("./engine.js");
var brain = require("brain");
var Math = require("./math.js");

function Garp (parentA, parentB, options) {
  if (parentA) {
    parentA = parentA;
    this.parentAID = parentA.id;
  } else {
    parentA = false;
    this.parentAID = false;
  }


  if (parentB) {
    parentB = parentB;
    this.parentBID = parentB.id;
  } else {
    parentB = false;
    this.parentBID = false;
  }

  this.options = options || {};
  this.world = this.options.world || global.GarpWorld;
  this.x = this.options.x || this.world.randomX();
  this.y = this.options.y || this.world.randomY();
  this.net = new brain.NeuralNetwork();
  this.isVirgin = true;

  this.state = "idle";
  this.base = [];
  this.partnerCache = {};
  this.friction = .95;
  this.boostFactor = 20;
  this.accel = {
    x: 0,
    y: 0
  };
  this.stepping = false;
  
  this.reproductionDistance = 1;
  this.reproductionRestTime = 10;
  this.reproductionCooldown = this.reproductionRestTime;

  this.nextBoostCooldown = 0;
  this.nextBoostTime = 2;

  this.nature = (Math.random() >= 0.5) ? 1 : -1;
  this.lifeRemaining = 100;
  
  this.generateID();
  this.generateBase(parentA, parentB);
  this.rise(parentA, parentB);
}

Garp.prototype.generateBase = function (parentA, parentB) {
  var baseA = (parentA) 
    ? parentA.base 
    : [1,1,1,1,1,1,1,1,1,1,1,1,1];

  var baseB = (parentB) 
    ? parentB.base 
    : [0,0,0,0,0,0,0,0,0,0,0,0,0];

  var randomFactor = 0.1;

  var newBase = [];

  for (var i = 0; i < 13; i++) {
    var a = baseA[i];
    var b = baseB[i];
    
    var c, diff;
    if (Math.random() >= .5) {
      diffPart = (a - b) / 5;
      c = a + diffPart;
    } else {
      diffPart = (a - b) / 5;
      c = b + diffPart;
    }
    
    newBase.push(c);
  }
  
  this.base = newBase;
}

Garp.prototype.rise = function (parentA, parentB) {
  if (parentA) {
    parentA.newChild(parentB, this);
  }
  if (parentB) {
    parentB.newChild(parentA, this);
  }

  var self = this;
  this.engine = new Engine(function(delta, ups){
    self.step(delta)
  });
};

Garp.prototype.step = function (delta) {
  if (this.stepping) return;
  this.stepping = true;

  var visionElements = this.seek();
  var recentlyReproduced = this.reproductionCooldown > 0;

  // Anyone in sight?
  if (visionElements.length) {
    for (var v in visionElements) {
      var ve = visionElements[v];
      var distance = ve.distance;

      if (distance <= this.reproductionDistance &&
        !recentlyReproduced &&
        !ve.el.recentlyReproduced){
        this.state = "reproducing";
        this.reproduce(ve.el);
      } else {
        this.state = "chasing";
        var attraction = this.calculateNaturalForce(ve.el, distance);
        this.move(attraction, delta);
      }
    }

  // Wander  
  } else {
    if (recentlyReproduced) {
      this.state = "reproduced";
    } else {
      this.state = "wandering";
    }
    this.randomBoost();
  } 

  this.growOld(delta);
  this.reproductionCooldown -= delta;
  this.nextBoostCooldown -= delta;
  this.applyMovement(delta);
  this.stepping = false;
}

Garp.prototype.growOld = function (delta) {
  this.lifeRemaining -= delta * this.agingFactor();
  if (this.lifeRemaining < 0) {
    this.die();
  }
};

Garp.prototype.agingFactor = function () {
  
  var sum = 0;
  var avg = this.base.length / 2;
  
  for (var p in this.base) {
    sum += this.base[p];
  }

  return Math.abs(avg - sum) + 0.3;

}

Garp.prototype.seek = function () {
  var arr = this.world.inhabitantsNearMe(this);
  var available = [];
  for (var a in arr) {
    available.push(arr[a]);
  }
  return available;
};

Garp.prototype.randomBoost = function (delta) {
  if (this.nextBoostCooldown > 0) return;
  var randomForce = {
    x: ((Math.random() * 2) - 1) * 5,
    y: ((Math.random() * 2) - 1) * 5
  };
  this.nextBoostCooldown = (Math.random() * this.nextBoostTime) + this.nextBoostTime / 2;
  this.boostTo(randomForce);
};

Garp.prototype.calculateNaturalForce = function(el, distance) {
  var naturalBaseA = this.naturalBase();
  var naturalBaseB = el.naturalBase();

  var empathy = 1;
  if (!this.isVirgin) {
    empathy = this.getEmpathy(el);
  }

  var sum = 0;
  var totalProps = naturalBaseA.length;
  
  for (var i = 0; i < totalProps; i++) {
    var aVal = naturalBaseA[i] * this.nature;
    var bVal = naturalBaseB[i] * el.nature;

    sum += (aVal + bVal);
  }

  var vect = Math.forceVector(this, el, sum);

  return vect;
};

Garp.prototype.getEmpathy = function(el) {
  if (typeof this.partnerCache[el.id] !== "undefined") {
    return this.partnerCache[el.id];
  }
  var empathyData = el.base.slice();
  var BNature = el.nature > 0 ? 1 : 0;
  empathyData.push(BNature);
  var empathy = this.net.run(empathyData)[0];
  this.partnerCache[el.id] = empathy;
  return empathy;
};

Garp.prototype.naturalBase = function () {
  var naturalBase = []
  for (var bi in this.base) {
    if (bi == 0)
      naturalBase.push(this.base[bi]);
    else if (this.nature === 1 && parseInt(bi) % 2 === 0) {
      naturalBase.push(this.base[bi]);
    } 
    else if (this.nature === -1 && parseInt(bi) % 2 !== 0) {
      naturalBase.push(this.base[bi]);
    }
  }
  return naturalBase;
};

Garp.prototype.boostTo = function(force) {
  this.accel.x += force.x * this.boostFactor;
  this.accel.y += force.y * this.boostFactor;
};


Garp.prototype.move = function(attraction) {
  this.accel.x += attraction.x * 0.2
  this.accel.y += attraction.y * 0.2;
};

Garp.prototype.applyMovement = function(delta) {
  this.accel.x *= this.friction;
  this.accel.y *= this.friction;

  this.x += this.accel.x * delta;
  this.y += this.accel.y * delta;

  if (this.x > this.world.size.x)
    this.x = 0;
  else if (this.x < 0) 
    this.x = this.world.size.x;
  
  
  if (this.y > this.world.size.y)
    this.y = 0;
  else if (this.y < 0) 
    this.y = this.world.size.y;
};


Garp.prototype.die = function () {
  this.state = "dead";
  this.engine.stop();
  this.world.removeCorpse(this.id);
}

Garp.prototype.generateID = function () {
  this.id = Math.random().toString(35).substring(2, 40);
};

Garp.prototype.reproduce = function(el) {
  this.reproductionCooldown = this.reproductionRestTime;
  el.reproductionCooldown = el.reproductionRestTime;

  this.world.addInhabitant(this, el, {
    x: this.x,
    y: this.y,
    parentAID: this.id,
    parentBID: el.id
  });
};

Garp.prototype.serialize = function () {
  return {
    x: this.x,
    y: this.y,
    base: this.base,
    state: this.state,
    id: this.id,
    parentAID: this.parentAID,
    parentBID: this.parentBID,
		lifeRemaining: this.lifeRemaining
  };
};

Garp.prototype.newChild = function (otherParent, child) {
  var trainData = {
    input: otherParent.base.slice(),
    output: []
  };
  var nature = otherParent.nature > 0 ? 1 : 0;
  trainData.input.push(nature);

  var childBase = child.base;
  var childSum = 0;
  for (var b in childBase) {
    childSum += childBase[b];
  }

  var equilibrium = childBase.length / 2;
  var sickness = Math.abs(equilibrium - childSum);
  if (sickness < 2) {
    trainData.output.push(1);
  } else {
    trainData.output.push(0);
  }

  if (this.isVirgin)
    this.isVirgin = false;
  
  this.net.train(trainData);

  this.partnerCache = {};
};

Garp.prototype.sightRadius = function () {
  return 7;
};

module.exports = Garp;
