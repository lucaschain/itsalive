Math.squareDistance = function (a, b) {
  var higherX = Math.max(a.x, b.x);
  var higherY = Math.max(a.y, b.y);
  var lowerX = Math.min(a.x, b.x);
  var lowerY = Math.min(a.y, b.y);


  var xDistancePow = Math.pow(higherX - lowerX, 2);
  var yDistancePow = Math.pow(higherY - lowerY, 2);
  var straightDistance = Math.sqrt(xDistancePow + yDistancePow);
  return straightDistance;
};

Math.lookAt = function(locationFrom, locationTo) {
  var dx = locationTo.x - locationFrom.x;
  var dy = locationTo.y - locationFrom.y;
  var angle = Math.atan2(dy, dx) * 180 / Math.PI;

  return angle;
};

Math.raycast = function(angle, force) {
	var rad = angle * Math.PI / 180;
  var vect = {
    x: Math.cos(rad) * force,
    y: Math.sin(rad) * force
  };
  return vect;
}

Math.forceVector = function (a, b, force) {
	var angle = Math.lookAt(a, b);
	var rad = angle * Math.PI / 180;
  var vect = {
    x: Math.cos(rad) * force,
    y: Math.sin(rad) * force
  };
  return vect;
};

Math.vectorMultiply = function (vec, factor) {
  
  return {
    x: vec.x * factor,
    y: vec.y * factor
  };
}

module.exports = Math;
