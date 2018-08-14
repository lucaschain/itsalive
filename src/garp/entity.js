import { forceVector, absoluteClamp } from '../utils/physics'
import {
  IDLE,
  CHASING,
  REPRODUCING,
  WANDERING,
  DEAD
} from '../enums/states'
import Reproduction from './reproduction'

export default class Garp {
  constructor (parentA, parentB, engine, options) {
    this.state = IDLE
    this.base = []
    this.stepping = false

    this.nextBoostCooldown = 0
    this._initializeParent(parentA)
    this._initializeParent(parentB)
    this._initializeLifeAndDeath()
    this._initializeDefaultOptions(options)
    this._initializePositioning()
    this._initializeMovement()
    this._initializeNature()
    this._initializeID()
    this._initializeBase(parentA, parentB)
    this._rise(engine)
  }

  _initializeBase (parentA, parentB) {
    const baseA = (parentA)
    ? parentA.base
    : [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]

    const baseB = (parentB)
    ? parentB.base
    : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    var newBase = []

    for (var i = 0; i < 13; i++) {
      var a = baseA[i]
      var b = baseB[i]

      var c, diffPart
      if (Math.random() >= 0.5) {
        diffPart = (a - b) / 5
        c = a + diffPart
      } else {
        diffPart = (a - b) / 5
        c = b + diffPart
      }

      newBase.push(c)
    }

    this.base = newBase
  }

  _rise (engine) {
    this.engine = engine
    var self = this
    this.engine.subscribe(this.id, function (delta, ups) {
      self.step(delta)
    })
  }

  _wander () {
    this.state = WANDERING
    this._randomBoost()
  }

  _noticeGarp ({ distance, garp }, delta) {
    if (this.reproduction.isAbleToReproduce(distance, garp)) {
      this.reproduction.mate()
      this.state = REPRODUCING
      this.world.addInhabitant(this, garp, {
        x: this.x,
        y: this.y,
        parentAID: this.id,
        parentBID: garp.id
      })
    } else {
      const attraction = this.calculateNaturalForce(garp, distance)
      this.move(attraction, delta)
      this.state = CHASING
    }
  }

  step (delta) {
    if (this.stepping) {
      return
    }
    this.stepping = true

    const garpsInVisionRange = this.seek()
    if (garpsInVisionRange.length > 0 && !this.reproduction.recentlyReproduced) {
      const garpsOfInterest = this._nearestGarps(garpsInVisionRange)
      garpsOfInterest.forEach(
        this._noticeGarp.bind(this)
      )
    } else {
      this._wander()
    }

    this.growOld(delta)
    this.applyMovement(delta)
    this.reproduction.step(delta)
    this.stepping = false
  }

  growOld (delta) {
    this.lifeRemaining -= delta * this.agingFactor()
    if (this.lifeRemaining < 0) {
      this.die()
    }
  }

  agingFactor () {
    var sum = 0
    var avg = this.base.length / 2

    for (var p in this.base) {
      sum += this.base[p]
    }

    return Math.abs(avg - sum) + 0.3
  }

  seek () {
    return this.world.inhabitantsNear(this)
  }

  calculateNaturalForce (otherGarp, distance) {
    var naturalBaseA = this.naturalBase()
    var naturalBaseB = otherGarp.naturalBase()

    var sum = 0
    var totalProps = naturalBaseA.length

    for (var i = 0; i < totalProps; i++) {
      var aVal = naturalBaseA[i] * this.nature
      var bVal = naturalBaseB[i] * otherGarp.nature

      sum += (aVal + bVal) * 3
    }

    var vect = forceVector(this, otherGarp, sum)

    return vect
  }

  naturalBase () {
    return this.base.map((baseItem, index) => {
      const isZeroIndex = index === 0
      const isEvenIndexAndPositiveNature = (this.nature === 1 && parseInt(index) % 2 === 0)
      const isOddIndexAndNegativeNature = (this.nature === -1 && parseInt(index) % 2 !== 0)

      if (isZeroIndex || isEvenIndexAndPositiveNature || isOddIndexAndNegativeNature) {
        return baseItem
      } else {
        return -baseItem
      }
    })
  }

  boostTo (force) {
    this.accel.x += force.x * this.boostFactor
    this.accel.y += force.y * this.boostFactor
  }

  move (attraction) {
    this.accel.x += attraction.x * 0.05
    this.accel.y += attraction.y * 0.05
  }

  limitAccelToMax () {
    this.accel.x = absoluteClamp(this.accel.x, this.maxAccel.x)
    this.accel.y = absoluteClamp(this.accel.y, this.maxAccel.y)
  }

  applyMovement (delta) {
    this.nextBoostCooldown -= delta
    this.limitAccelToMax()

    this.accel.x *= this.friction
    this.accel.y *= this.friction

    this.x += this.accel.x * delta
    this.y += this.accel.y * delta

    if (this.x > this.world.size.x) { this.x = 0 } else if (this.x < 0) { this.x = this.world.size.x }

    if (this.y > this.world.size.y) { this.y = 0 } else if (this.y < 0) { this.y = this.world.size.y }
  }

  die () {
    this.state = DEAD
    this.engine.unsubscribe(this.id)
    this.world.removeCorpse(this.id)
  }

  serialize () {
    return {
      x: this.x,
      y: this.y,
      base: this.base,
      state: this.state,
      id: this.id,
      parentAID: this.parentAID,
      parentBID: this.parentBID,
      lifeRemaining: this.lifeRemaining
    }
  }

  get sightRadius () {
    return 8
  }

  _nearestGarps (garpsInVisionRange) {
    const nearest = _.chain(garpsInVisionRange)
      .sortBy('distance')
      .slice(0, 2)
      .value()

    return nearest
  }

  _initializeID () {
    this.id = Math.random().toString(35).substring(2, 40)
  }

  _initializeNature () {
    this.nature = (Math.random() >= 0.5) ? 1 : -1
  }

  _initializeDefaultOptions (options) {
    this.options = options || {}
    this.reproduction = this.options.reproduction || new Reproduction()
    this.world = this.options.world
  }

  _initializeLifeAndDeath () {
    this.lifeRemaining = 100
  }

  _initializeMovement () {
    this.friction = 0.95
    this.boostFactor = 8
    this.accel = {
      x: 0,
      y: 0
    }
    this.maxAccel = {
      x: 10,
      y: 10
    }
    this.nextBoostTime = 2
  }

  _initializeParent (parent) {
    if (this.parentAID === undefined) {
      this.parentAID = parent ? parent.id : false
    } else {
      this.parentBID = parent ? parent.id : false
    }
  }

  _initializePositioning () {
    this.x = this.options.x || this.world.randomX
    this.y = this.options.y || this.world.randomY
  }

  _randomBoost (delta) {
    if (this.nextBoostCooldown > 0) return
    const rand = Math.random

    var randomForce = {
      x: (rand() * 5) - 2.5,
      y: (rand() * 5) - 2.5
    }
    this.nextBoostCooldown = (Math.random() * this.nextBoostTime) + this.nextBoostTime / 2
    this.boostTo(randomForce)
  }
}
