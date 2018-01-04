import World from './world'
import Camera from './camera'
import Engine from './engine'

const engine = new Engine()


const camera = new Camera(world, engine)
camera.start()
