import { expect } from 'chai'

import { buildWorld } from '../mock/world'
import { buildEngine } from '../mock/engine'
import { buildGarp } from '../mock/garp'

import Garp from'../../src/garp/entity'
import { CHASING, REPRODUCING } from '../../src/enums/states'

context('when has any other garp in sight', function() {
  let world
  let engine

  beforeEach(function () {
    engine = buildEngine()
    world = buildWorld(engine)
  })

  context('when there is any garp in sight', function () {
    context('and subject is able to reproduce', function () {
      context('and subject is not near enough to reproduce', function () {
        it ('starts chasing', function () {
          const garp = buildGarp(world, {
            x: 10,
            y: 10,
            engine
          })
          garp.reproduction.reproductionCooldown = 0
          const extraGarp = buildGarp(world, {
            x: 13,
            y: 13,
            engine
          })

          engine.forceStep()

          expect(garp.state).to.be.equal(CHASING);
        })
      })

      context('and subject is not near enough to reproduce', function () {
        it ('reproduces', function () {
          const garp = buildGarp(world, {
            x: 10,
            y: 10,
            engine
          })
          garp.reproduction.reproductionCooldown = 0

          const extraGarp = buildGarp(world, {
            x: 10,
            y: 10,
            engine
          })
          extraGarp.reproduction.reproductionCooldown = 0

          engine.forceStep()

          expect(garp.state).to.be.equal(REPRODUCING);
        })
      })
    })

    it ('starts reproducing if able to reproduce', function () {
      
    })
  })
});
