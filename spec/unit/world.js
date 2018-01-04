import { expect } from 'chai'

import { buildEngine } from '../helpers/engine'
import World from '../../src/world/'

context('when creating world', function() {
  let engine
  beforeEach(function() {
    engine = buildEngine()
  })

  context('when generating life', function() {
    it ('its population increases', function() {
      const world = new World(engine)

      world.generateLife()

      expect(world.population).to.be.above(0)
    })
  })
})
