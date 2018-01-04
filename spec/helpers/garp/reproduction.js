export function buildReproduction (eagerReproducer = false) {
  return {
    step () {},

    isAbleToReproduce () {
      return eagerReproducer
    }
  }
}
