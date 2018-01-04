export function buildEngine() {
  return {
    subscribe(label, cb) {
      cb(1)
    }
  }
}

export function buildWorld ({ engine = buildEngine}) {
  return new World(engine)
}

export function buildReproduction (eagerReproducer) {
  return {
    isAbleToReproduce () => eagerReproducer
  }
}

export function buildGarp (options = {}) {
  x = options.x || 0
  y = options.y || 0
  world = options.world || buildWorld()
  engine = options.engine || buildEngine()
  reproduction = options.reproduction || buildReproduction()

  return new Garp([], [], engine, {
    x,
    y,
    world
    reproduction
  })
}
