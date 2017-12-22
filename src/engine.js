import _ from 'lodash'

export default class Engine {
  constructor (options) {
    options = options || {}
    this.intervalTime = options.intervalTime || 10
    this.maxUps = options.maxUps || 60
    this.upsLimitRate = options.upsLimitRate || 1.05
    this.subscribers = []
    this.start()
  };

  start () {
    this.lastUpdate = new Date()
    var self = this

    this.interval = setInterval(function () {
      self.update()
    }, this.intervalTime)

    return this
  };

  unsubscribe (id) {
    _.remove(this.subscribers, (subscriber) => {
      return subscriber.id === id
    })
  };

  subscribe (id, cb) {
    this.subscribers.push({
      id: id,
      cb: cb
    })
  };

  stop () {
    clearInterval(this.interval)
  };

  update () {
    var now = new Date()
    var msPassed = now - this.lastUpdate
    var delta = msPassed / 1000
    var ups = 1 / delta
    if (ups > (this.maxUps * this.upsLimitRate)) return
    this.lastUpdate = now
    this.subscribers.forEach((subscriber) => {
      subscriber.cb(delta, ups)
    })
  };
}
