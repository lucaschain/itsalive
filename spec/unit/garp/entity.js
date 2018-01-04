import { expect } from 'chai'

import { buildWorld } from '../../helpers/world'
import { buildGarp } from '../../helpers/garp/entity'
import { buildReproduction } from '../../helpers/garp/reproduction'

import Garp from'../../../src/garp/entity';

context('when has any other garp in sight', function() {
  let world

  beforeEach(function () {
    world = buildWorld()
  })

  context('when there is any garp in sight', function () {
    it ('starts chasing if not able to reproduce', function () {
      const eagerReproduction = buildReproduction(true)
      const garp = buildGarp(world, eagerReproduction)
      const extraGarp = buildGarp(world)
    })

    it ('starts reproducing if able to reproduce')
  })

});
