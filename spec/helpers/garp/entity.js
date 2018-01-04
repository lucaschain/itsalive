import Garp from '../../../src/garp/entity'
import { buildEngine } from '../engine'
import { buildReproduction } from './reproduction'

export function buildGarp (world, options = {}) {
  const x = options.x || 0
  const y = options.y || 0
  const engine = options.engine || buildEngine()
  const reproduction = options.reproduction || buildReproduction()

  return new Garp(null, null, engine, {
    x,
    y,
    world,
    reproduction
  })
}
