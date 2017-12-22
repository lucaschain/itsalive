import { forceVector, absoluteClamp } from '../utils/physics'
import Reproduction from './reproduction'

export default class Garp {
  constructor (parentA, parentB, engine, options) {
    this.state = 'idle'
    this.base = []
    this.stepping = false
    this.reproduction = new Reproduction()

    this.nextBoostCooldown = 0
    this._initializeParent(parentA)
    this._initializeParent(parentB)
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
    if (this.reproduction.recentlyReproduced) {
      this.reproduction.mate()
      this.state = 'reproduced'
    } else {
      this.state = 'wandering'
    }
    this._randomBoost()
  }

  _noticeGarp ({ distance, garp }, delta) {
    if (this.reproduction.isAbleToReproduce(distance)) {
      this.reproduction.mate()
      this.world.addInhabitant(this, el, {
        x: this.x,
        y: this.y,
        parentAID: this.id,
        parentBID: el.id
      })
      this.state = 'reproducing'
    } else {
      const attraction = this.calculateNaturalForce(garp, distance)
      this.move(attraction, delta)
      this.state = 'chasing'
    }
  }

  step (delta) {
    if (this.stepping) {
      return
    }
    this.stepping = true

    const garpsInVisionRange = this.seek()
    if (garpsInVisionRange.length > 0) {
      garpsInVisionRange.forEach(
        this._noticeGarp
      )
    } else {
      this._wander()
    }

    this.growOld(delta)
    this.applyMovement(delta)
    this.reproduction.step()
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

  calculateNaturalForce (el, distance) {
    var naturalBaseA = this.naturalBase()
    var naturalBaseB = el.naturalBase()

    var sum = 0
    var totalProps = naturalBaseA.length

    for (var i = 0; i < totalProps; i++) {
      var aVal = naturalBaseA[i] * this.nature
      var bVal = naturalBaseB[i] * el.nature

      sum += (aVal + bVal)
    }

    var vect = forceVector(this, el, sum)

    return vect
  }

  naturalBase () {
    var naturalBase = []
    for (var bi in this.base) {
      if (bi === 0) {
        naturalBase.push(this.base[bi])
      } else if (this.nature === 1 && parseInt(bi) % 2 === 0) {
        naturalBase.push(this.base[bi])
      } else if (this.nature === -1 && parseInt(bi) % 2 !== 0) {
        naturalBase.push(this.base[bi])
      }
    }
    return naturalBase
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
    this.state = 'dead'
    this.engine.unsubscribe(this.id)
    this.world.removeCorpse(this.id)
  }

  _initializeID () {
    this.id = Math.random().toString(35).substring(2, 40)
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
    return 7
  }

  _initializeNature () {
    this.nature = (Math.random() >= 0.5) ? 1 : -1
  }

  _initializeDefaultOptions (options) {
    this.options = options || {}
    this.world = this.options.world
  }

  _initializeLifeAndDeath () {
    this.lifeRemaining = 100
  }

  _initializeMovement () {
    this.friction = 0.95
    this.boostFactor = 2
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

  _initializeParent(parent) {
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
