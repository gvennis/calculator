var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var app = express();

var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));
var calculations = [];
var sockets = [];

io.on('connection', function (socket) {
  sockets.push(socket);
  calculations.forEach(function(calc) {
    socket.emit("message", calc);
  });
  
  socket.on('disconnect', function () {
    sockets.splice(sockets.indexOf(socket), 1);
  });
  
  socket.on('message', function(msg) {
    calculations.push(msg);
    if (calculations.length > 10) {
      calculations = calculations.slice(-10, calculations.length);
    }
    sockets.forEach(function (socket) {
      socket.emit("message", msg);
    });
  });
  
  // debug function
  socket.on("callback", function(msg) {
      console.log("callback: " + msg);
  });
  
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Log server listening at", addr.address + ":" + addr.port);
});