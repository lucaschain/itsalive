import Camera from '../camera'

function getGarpColors (garp) {
  let redRatio = 0
  let greenRatio = 0
  let blueRatio = 0

  garp.base.forEach((baseValue, index) => {
    if (index === 0) {
      redRatio += baseValue
      greenRatio += baseValue
      blueRatio += baseValue
    } else if (index < 5) {
      redRatio += baseValue
    } else if (index < 9) {
      greenRatio += baseValue
    } else {
      blueRatio += baseValue
    }
  })

  const r = (redRatio / 5) * 255
  const g = (greenRatio / 5) * 255
  const b = (blueRatio / 5) * 255
  return {
    r: Math.floor(r),
    g: Math.floor(g),
    b: Math.floor(b)
  }
}

function drawGarpAura (screen, proportionRatio, garp) {
  let style = ''
  switch (garp.state) {
    case 'idle':
      style = 'rgba(255,255,110, 0.15)'
      break
    case 'wandering':
      style = 'rgba(40,255,10, 0.15)'
      break
    case 'chasing':
      style = 'rgba(240,255,10, 0.15)'
      break
    case 'reproducing':
    case 'reproduced':
      style = 'rgba(70,105,120, 0.15)'
      break
    case 'dead':
      style = 'black'
      break
  }

  const lifeRatio = garp.lifeRemaining / 15
  const x = garp.x * proportionRatio
  const y = garp.y * proportionRatio
  const radius = lifeRatio * proportionRatio * 2

  const radgrad = screen.createRadialGradient(x, y, radius / 2, x, y, radius)
  radgrad.addColorStop(0, style)
  radgrad.addColorStop(0.99, 'rgba(0, 0, 0, 0)')

  screen.fillStyle = radgrad
  screen.beginPath()

  screen.arc(x, y, radius, 0, 2 * Math.PI, false)
  screen.closePath()
  screen.fill()
}

function drawGarpBody (screen, proportionRatio, garp) {
  const totalProps = garp.base.length
  const angleBetweenEachProp = 360 / totalProps

  screen.beginPath()

  garp.base.forEach((b, index) => {
    const pos = Camera.raycast(angleBetweenEachProp * index, b)

    const x = (pos.x + garp.x) * proportionRatio
    const y = (pos.y + garp.y) * proportionRatio

    if (index === 0) {
      screen.moveTo(x, y)
    } else {
      screen.lineTo(x, y)
    }
  })

  screen.closePath()
  const garpColors = getGarpColors(garp)
  screen.fillStyle = `rgb(${garpColors.r}, ${garpColors.g}, ${garpColors.b})`
  screen.fill()
  screen.strokeStyle = 'black'
  screen.stroke()
}

export default function drawGarp (screen, proportionRatio, garp) {
  drawGarpBody(screen, proportionRatio, garp)
}
