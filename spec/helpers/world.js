import World from '../../src/world'
import { buildEngine } from './engine'

export function buildWorld (engine = buildEngine()) {
  return new World(engine)
}

