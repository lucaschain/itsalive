var socket = io("localhost:5000");

socket.on('new state', function(state){
  window.state = state;
  if (!window.camera) {
    window.camera = new Camera().start();
  }
  window.camera.step();
});