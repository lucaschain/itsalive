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

  isAbleToReproduce (distance) {
    const isNearEnoughToReproduce = this.isNearEnoughToReproduce(distance)
    const recentlyReproduced = this.recentlyReproduced

    return isNearEnoughToReproduce && !recentlyReproduced
  }

  _isNearEnoughToReproduce (distance) {
    distance <= this.reproductionDistance
  }

  _resetReproductionCooldown () {
    this.reproductionCooldown = this.reproductionRestTime
  }
}
