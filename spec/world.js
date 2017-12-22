import { expect } from 'chai'
import { buildEngine } from '../helpers'
import World from'../src/world/index'

let engine;
beforeEach(function() {
  engine = buildEngine()
})

context('when creating world', function() {
  it ('creates inhabitants at bigbang', function() {
    const world = new World(engine)

    world.bigBang()

    expect(world.population).to.be.above(0)
  })
})
