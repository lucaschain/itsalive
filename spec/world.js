import { expect } from 'chai'
import { buildEngine } from '../helpers'
import World from'../src/world/index'

context('when creating world', function() {
  let engine
  beforeEach(function() {
    engine = buildEngine()
  })

  it ('creates inhabitants at bigbang', function() {
    const world = new World(engine)

    world.generateLife()

    expect(world.population).to.be.above(0)
  })
})
