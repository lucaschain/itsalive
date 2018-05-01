export default class Reproduction {
  constructor () {
    this.reproductionDistance = 1
    this.reproductionRestTime = 10
    this._resetReproductionCooldown()
  }

  mate () {
    this._resetReproductionCooldown()
  }

  get recentlyReproduced () {
    return this.reproductionCooldown > 0
  }

  step (delta) {
    this.reproductionCooldown -= delta
  }

  isAbleToReproduce (distance, garp) {
    const isNearEnoughToReproduce = this._isNearEnoughToReproduce(distance)
    const noOneRecentlyReproduced = !this.recentlyReproduced && !garp.reproduction.recentlyReproduced

    return isNearEnoughToReproduce && noOneRecentlyReproduced
  }

  _isNearEnoughToReproduce (distance) {
    return distance <= this.reproductionDistance
  }

  _resetReproductionCooldown () {
    this.reproductionCooldown = this.reproductionRestTime
  }
}
