function Camera (options) {
	options = options || {};
  this.proportionRatio = options.proportionRatio || 5;
  this.currentAngle = 0;
  
  if (!window.state) return;
  this.createCanvas();
  document.body.appendChild(this.canvas);
}

Camera.prototype.start = function () {
  this.step();
  return this;
}

Camera.prototype.createCanvas = function () {
  this.canvas = document.createElement("canvas");
  this.canvas.width = window.state.size.x * this.proportionRatio;
  this.canvas.height = window.state.size.y * this.proportionRatio;
  this.canvas.style.width = window.innerWidth + "px";
  this.canvas.style.height = window.innerHeight + "px";
	this.screen = this.canvas.getContext("2d");
};

Camera.prototype.step = function () {
  if (this.stepping) return;
  this.stepping = true;
  if (!window.state) return;
  var self = this;
  this.draw();
  this.stepping = false;
};

Camera.prototype.draw = function () {

  var garps = window.state.inhabitants;
  //this.screen.clearRect(0, 0, window.state.size.x * this.proportionRatio, window.state.size.y * this.proportionRatio);
  this.screen.fillStyle = "rgba(20, 20, 20, 0.6)";
  this.screen.fillRect(0, 0, window.state.size.x * this.proportionRatio, window.state.size.y * this.proportionRatio);
  
  for (var g in garps) {
    this.drawGarpLines(garps[g]);
  }
  for (var g in garps) {
    this.drawGarpBody(garps[g]);
    this.drawGarpAura(garps[g]);
  }
};

Camera.prototype.drawGarpLines = function (garp) {
  var lineStyle = "rgba(255, 0, 50, 0.14)";

	if ( this.screen.setLineDash !== undefined )   this.screen.setLineDash([6,2]);
	if ( this.screen.mozDash !== undefined )       this.screen.mozDash = [5,10];

  if (garp.parentAID) {
    var parentAPos = this.getGarpPositionById(garp.parentAID);
    this.screen.beginPath();
    var x = (garp.x) * this.proportionRatio;
    var y = (garp.y) * this.proportionRatio;
    this.screen.moveTo(x, y);
    var parentAX = (parentAPos.x) * this.proportionRatio;
    var parentAY = (parentAPos.y) * this.proportionRatio;
    this.screen.lineTo(parentAX, parentAY);
    this.screen.strokeStyle = lineStyle;
    this.screen.stroke();
  }
  if (garp.parentBID) {
    var parentBPos = this.getGarpPositionById(garp.parentAID);
    this.screen.beginPath();
    var x = (garp.x) * this.proportionRatio;
    var y = (garp.y) * this.proportionRatio;
    this.screen.moveTo(x, y);
    var parentBX = (parentBPos.x) * this.proportionRatio;
    var parentBY = (parentBPos.y) * this.proportionRatio;
    this.screen.lineTo(parentBX, parentBY);
    this.screen.strokeStyle = lineStyle;
    this.screen.stroke();
  }
};

Camera.prototype.drawGarpAura = function (garp) {
  var style = "";
  switch (garp.state) {
    case "idle":
      style = "rgba(255,255,110, 0.15)";
      break;
    case "wandering":
      style = "rgba(40,255,10, 0.15)";
      break;
    case "chasing":
      style = "rgba(240,255,10, 0.15)";
      break;
    case "reproducing":
    case "reproduced":
      style = "rgba(70,105,120, 0.15)";
      break;
      break;
    case "dead":
      style = "black";
      break;
  }

  var lifeRatio = garp.lifeRemaining / 15;
  var x = garp.x * this.proportionRatio;
  var y = garp.y * this.proportionRatio;
  var radius = lifeRatio * this.proportionRatio / 3;
	
  var radgrad = this.screen.createRadialGradient(x, y, radius / 2, x, y, radius);
  radgrad.addColorStop(0, style);
  radgrad.addColorStop(0.99, 'rgba(0, 0, 0, 0)');
  
  this.screen.fillStyle = radgrad;
  this.screen.beginPath();

  this.screen.arc(x, y, radius, 0, 2 * Math.PI, false);
  this.screen.closePath();
  this.screen.fill();
};

Camera.prototype.drawGarpBody = function (garp) {
  var totalProps = garp.base.length;
  var angleBetween = 360 / totalProps;


  this.screen.beginPath();

  for (var p in garp.base) {
    var pos = Camera.raycast(angleBetween * p, garp.base[p]);
    
    var x = (pos.x + garp.x) * this.proportionRatio;
    var y = (pos.y + garp.y) * this.proportionRatio;

    if (p == 0) {
      this.screen.moveTo(x, y);
    } else {
      this.screen.lineTo(x, y);
    }
  }

  this.screen.closePath();
  var clr = this.getGarpColors(garp);
  this.screen.fillStyle = "rgb(" + clr.r + ", " + clr.g + ", " + clr.b + ")";
  this.screen.fill(); 
  this.screen.strokeStyle = "black"; 
  this.screen.stroke(); 
};

Camera.prototype.getGarpColors = function (garp) {
  var redRatio = 0;
  var greenRatio = 0;
  var blueRatio = 0;

  for (var b in garp.base) {
    var val = garp.base[b];
    if (b == 0) {
      redRatio += val;
      greenRatio += val;
      blueRatio += val;
    } else if (b < 5) {
      redRatio += val;
    } else if (b < 9) {
      greenRatio += val;
    } else {
      blueRatio += val;
    }
  }

  var r = (redRatio / 5) * 255;
  var g = (greenRatio / 5) * 255;
  var b = (blueRatio / 5) * 255;
  return {
    r: Math.floor(r),
    g: Math.floor(g),
    b: Math.floor(b)
  };
};

Camera.prototype.getGarpPositionById = function (id) {
  var foundGarpPos = false;
  for (var g in window.state.inhabitants) {
    var garp = window.state.inhabitants[g];
    if (garp.id == id) {
      foundGarpPos = {
        x: garp.x,
        y: garp.y
      };
      break;
    }
  }
  return foundGarpPos;
};

Camera.raycast = function (angle, force) {
	var rad = angle * Math.PI / 180;
  var vect = {
    x: Math.cos(rad) * force,
    y: Math.sin(rad) * force
  };
  return vect;
};
