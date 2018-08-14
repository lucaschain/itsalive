export function squareDistance (a, b) {
  var higherX = Math.max(a.x, b.x)
  var higherY = Math.max(a.y, b.y)
  var lowerX = Math.min(a.x, b.x)
  var lowerY = Math.min(a.y, b.y)

  var xDistancePow = Math.pow(higherX - lowerX, 2)
  var yDistancePow = Math.pow(higherY - lowerY, 2)
  var straightDistance = Math.sqrt(xDistancePow + yDistancePow)
  return straightDistance
};

function absoluteLimit (limit) {
  if (limit > 0) {
    return {
      maxLimit: limit,
      minLimit: -limit
    }
  }
  return {
    maxLimit: -limit,
    minLimit: limit
  }
}

export function absoluteClamp (value, limit) {
  const { minLimit, maxLimit } = absoluteLimit(limit)

  const min = Math.max(minLimit, value)
  return Math.min(maxLimit, min)
}

export function lookAt (locationFrom, locationTo) {
  var dx = locationTo.x - locationFrom.x
  var dy = locationTo.y - locationFrom.y
  var angle = Math.atan2(dy, dx) * 180 / Math.PI

  return angle
};

export function raycast (angle, force) {
  var rad = angle * Math.PI / 180
  var vect = {
    x: Math.cos(rad) * force,
    y: Math.sin(rad) * force
  }
  return vect
}

export function forceVector (a, b, force) {
  var angle = lookAt(a, b)
  var rad = angle * Math.PI / 180
  var vect = {
    x: Math.cos(rad) * force,
    y: Math.sin(rad) * force
  }
  return vect
};

export function vectorMultiply (vec, factor) {
  return {
    x: vec.x * factor,
    y: vec.y * factor
  }
}
