import drawGarp from './garp/render'

class Camera {
  constructor (world, engine, options) {
    options = options || {}
    this.proportionRatio = options.proportionRatio || 20
    this.currentAngle = 0
    this.world = world
    this.engine = engine
    if (!this.world) return
    this.createCanvas()
    document.body.appendChild(this.canvas)
  }

  start () {
    this.engine.subscribe('camera', (delta, ups) => {
      this.step(delta)
    })
    return this
  }

  createCanvas () {
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.world.size.x * this.proportionRatio
    this.canvas.height = this.world.size.y * this.proportionRatio
    this.canvas.style.width = window.innerWidth + 'px'
    this.canvas.style.height = window.innerHeight + 'px'
    this.screen = this.canvas.getContext('2d')
  }

  step () {
    if (this.stepping) return
    this.stepping = true
    this.draw()
    this.stepping = false
  }

  draw () {
    // this.screen.clearRect(0, 0, this.world.size.x * this.proportionRatio, this.world.size.y * this.proportionRatio)
    this.screen.fillStyle = 'rgba(20, 20, 20, 0.6)'
    this.screen.fillRect(0, 0, this.world.size.x * this.proportionRatio, this.world.size.y * this.proportionRatio)

    const garps = this.world.inhabitants
    for (let g in garps) {
      // this.drawGarpLines(garps[g])
      drawGarp(this.screen, this.proportionRatio, garps[g])
      // this.drawGarpAura(garps[g])
    }
  }
}

Camera.raycast = function (angle, force) {
  var rad = angle * Math.PI / 180
  var vect = {
    x: Math.cos(rad) * force,
    y: Math.sin(rad) * force
  }
  return vect
}

export default Camera
