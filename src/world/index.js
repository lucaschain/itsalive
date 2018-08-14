import _ from 'lodash'
import Garp from '../garp/entity'
import { squareDistance } from '../utils/physics'

export default class World {
  constructor (engine, options) {
    options = {
      ...this.defaults,
      ...options
    }
    this.inhabitants = {}
    this.size = options.size
    this.initialPopulation = options.initialPopulation
    this.maxPopulation = options.maxPopulation
    this._initializeEngine(engine)
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

  generateLife () {
    this._summonInhabitants(this.initialPopulation)
    return this
  }

  addInhabitant (parentA, parentB, opts) {
    if (parentA && parentB) {
      console.log(parentA.id, parentB.id)
    }
    if (this.population < this.maxPopulation) {
      opts.world = this
      var garp = new Garp(parentA, parentB, this.engine, opts)
      this.inhabitants[garp.id] = garp
      return garp
    }
    console.warn('max population achieved')
  }

  step (delta) {
    if (this.stepping) return
    this.stepping = true

    if (this.population === 0) {
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

  get population () {
    return Object.keys(this.inhabitants).length
  }

  removeCorpse (id) {
    delete this.inhabitants[id]
  }

  inhabitantsNear (inhabitant) {
    const otherInhabitants = _.filter(
      this.inhabitants,
      this._notTheSame.bind(null, inhabitant)
    )
    const mappedInhabitants = _.map(
      otherInhabitants,
      this._isNearMapper.bind(this, inhabitant)
    )
    return _.filter(mappedInhabitants, this._isNear)
  }

  _isNear ({distance, garp}) {
    return distance <= garp.sightRadius
  }

  _notTheSame (inhabitant, otherInhabitant) {
    return inhabitant.id !== otherInhabitant.id
  }

  _isNearMapper (inhabitant, otherInhabitant) {
    const distance = this._distanceBetween(inhabitant, otherInhabitant)
    return {
      distance,
      garp: otherInhabitant
    }
  }

  _summonInhabitants (quantity) {
    for (var i = 0; i < quantity; i++) {
      this.addInhabitant(null, null, {
        world: this
      })
    }
  }

  _distanceBetween (inhabitant, otherInhabitant) {
    return squareDistance(inhabitant, otherInhabitant)
  }

  _isTheSame (inhabitant, possiblyHimself) {
    return inhabitant.id === possiblyHimself.id
  }

  _initializeEngine (engine) {
    this.engine = engine
    this.engine.subscribe('world', (delta, ups) => {
      this.step(delta)
    })
  }
}
