import { buildEngine } from './engine'

export function buildGarp (world, options = {}) {
  const x = options.x || 0
  const y = options.y || 0

  return world.addInhabitant(null, null, {
    x,
    y,
    world
  })
}
