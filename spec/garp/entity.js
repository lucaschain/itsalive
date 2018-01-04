import { expect } from 'chai'
import { buildEngine } from '../helpers'
import Garp from'../../src/garp/entity';

context('when has any other garp in sight', function() {
  let world
  let engine

  beforeEach(function () {
    engine = buildEngine()
    world = new World(engine)
  })

  context('when there is any garp in sight', function () {
    it ('starts chasing if not able to reproduce', function () {
      const eagerReproduction = buildReproduction(true)
      const garp = buildGarp(eagerReproduction)
      const extraGarp = buildGarp()


    })

    it ('starts reproducing if able to reproduce')
  })

});
