var watch = require("node-watch");
var io = require("socket.io").listen(5000);
var World = require("./src/world.js");
var fs = require("fs");

var args = process.argv.slice(2);

global.GarpWorld = new World();
global.GarpWorld.bigBang();

var emitting = false;


io.on("connection", function(socket) {
  console.log("client connected");
});

global.GarpWorld.onSerialize(function(state){
  if (emitting) return;
  emitting = true;
  io.emit("new state", state);
  emitting = false;
});
