export function buildEngine () {
  const subs = []
  return {
    forceStep() {
      subs.forEach(cb => cb(1))
    },

    subscribe(_, cb) {
      subs.push(cb)
    }
  }
}
