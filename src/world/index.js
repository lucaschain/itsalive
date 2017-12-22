import _ from 'lodash'
import Garp from '../garp/entity'
import { squareDistance } from '../utils/physics'

export default class World {
  constructor (engine, options) {
    options = {
      ...this.defaults,
      ...options
    }
    this.engine = engine
    this.inhabitants = {}
    this.size = options.size
    this.initialPopulation = options.initialPopulation
    this.maxPopulation = options.maxPopulation
  }

  get defaults () {
    return {
      maxPopulation: 100,
      initialPopulation: 15,
      size: {
        x: 80,
        y: 45
      }
    }
  }

  bigBang () {
    this._summonInhabitants(this.initialPopulation)
    this.engine.subscribe('world', (delta, ups) => {
      this.step(delta)
    })
    return this
  }

  addInhabitant (parentA, parentB, opts) {
    if (this._population < this.maxPopulation) {
      opts.world = this
      var garp = new Garp(parentA, parentB, this.engine, opts)
      this.inhabitants[garp.id] = garp
    }
  }

  step (delta) {
    if (this.stepping) return
    this.stepping = true

    if (this._population === 0) {
      this._summonInhabitants(this.initialPopulation)
    }
    this.stepping = false
  }

  onSerialize (callback) {
    return this.serializer.onSerialize(callback)
  }

  get randomX () {
    return Math.floor(Math.random() * (this.size.x + 1))
  }

  get randomY () {
    return Math.floor(Math.random() * (this.size.y + 1))
  }

  _summonInhabitants (quantity) {
    for (var i = 0; i < quantity; i++) {
      this.addInhabitant(null, null, {
        world: this
      })
    }
  }

  get _population () {
    return Object.keys(this.inhabitants).length
  }

  removeCorpse (id) {
    delete this.inhabitants[id]
  }

  _distanceBetween (inhabitant, otherInhabitant) {
    return squareDistance(inhabitant, otherInhabitant)
  }

  _isTheSame (inhabitant, possiblyHimself) {
    return inhabitant.id === possiblyHimself.id
  }

  _isNearReducer (inhabitant, sight, otherInhabitant) {
    const distance = this._distanceBetween(inhabitant, otherInhabitant)
    if (distance <= inhabitant.sight) {
      sight.push({
        el: inhabitant,
        distance: distance
      })
    }
    return sight
  }

  inhabitantsNear (inhabitant) {
    const sight = _.reduce(
      this.inhabitants,
      this._isNearReducer.bind(this, inhabitant),
      []
    )

    return sight
  }
}
