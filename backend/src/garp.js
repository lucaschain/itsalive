var Engine = require("./engine.js");
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

  this.state = "idle";
  this.base = [];
  this.stepping = false;
  
  this.reproductionDistance = 1;
  this.reproductionRestTime = 5;
  this.reproductionCooldown = this.reproductionRestTime;

  this.nextRoamCooldown = 0;
  this.nextRoamTime = 5;

  this.nature = (Math.random() >= 0.5) ? 1 : -1;
  this.lifeRemaining = 25;
  
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

  var newBase = [];

  for (var i = 0; i < 13; i++) {
    var a = baseA[i];
    var b = baseB[i];

    var c = Math.abs(Math.random() * (a - b) + b);
    newBase.push(c);
  }
  
  this.base = newBase;
}

Garp.prototype.rise = function (parentA, parentB) {
  if (parentA) {
    parentA.newChild();
  }
  if (parentB) {
    parentB.newChild();
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
  if (visionElements.length && !recentlyReproduced) {
    for (var v in visionElements) {
      var ve = visionElements[v];
      var distance = ve.distance;

      if (distance <= this.reproductionDistance){
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
    var attraction = this.calculateRandomForce();
    this.move(attraction, delta);
  } 

  this.growOld(delta);
  this.reproductionCooldown -= delta;
  this.nextRoamCooldown -= delta;

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
    if (arr[a].el.state !== "reproducing" && arr[a].el.state !== "reproduced"){
      available.push(arr[a]);
    }
  }
  return available;
};

Garp.prototype.calculateRandomForce = function () {
  if (this.nextRoamCooldown > 0) {
    return this.randomForce;
  }
  this.randomForce = {
    x: ((Math.random() * 2) - 1) * 5,
    y: ((Math.random() * 2) - 1) * 5
  };
  this.nextRoamCooldown = (Math.random() * this.nextRoamTime) + this.nextRoamTime / 2;
  return this.randomForce;
};

Garp.prototype.calculateNaturalForce = function(el, distance) {
  var naturalBaseA = this.naturalBase();
  var naturalBaseB = el.naturalBase();

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


Garp.prototype.move = function(attraction, delta) {
  this.x += attraction.x * delta;
  this.y += attraction.y * delta;

  if (this.x > this.world.size.x)
    this.x = this.world.size.x;
  else if (this.x < 0) 
    this.x = 0;
  
  
  if (this.y > this.world.size.y)
    this.y = this.world.size.y;
  else if (this.y < 0) 
    this.y = 0;
  
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

Garp.prototype.newChild = function () {};

Garp.prototype.sightRadius = function () {
  return 7;
};

module.exports = Garp;
