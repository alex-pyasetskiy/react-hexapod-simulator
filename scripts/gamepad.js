const webSocketServer = require('websocket').server;
const http = require('http');
const dotenv = require('dotenv');
const Joystick = require("joystick-logitech-f710");

dotenv.config();

const server = http.createServer();

server.listen(process.env.NODE_CONTROLLER_SOCKET, process.env.NODE_HOST, () => {
  console.log(`Server running at http://${process.env.NODE_HOST}:${process.env.NODE_CONTROLLER_SOCKET}/`);
});

const wsServer = new webSocketServer({
  httpServer: server
});

var clients = {};

const getUniqueID = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `${s4() + s4()}-${s4()}`;
};

const sendMessage = (json) => {
  Object.keys(clients).map((client) => {
    clients[client].sendUTF(json);
    return true
  });
}

wsServer.on('request', function (request) {
  var userID = getUniqueID();
  console.log(`${new Date()} Recieved a new connection from origin ${request.origin}.`);

  const connection = request.accept(null, request.origin);
  clients[userID] = connection;
  
  console.log(`connected: ${userID} in ${Object.getOwnPropertyNames(clients)}`)

  connection.on('close', function (connection) {
    console.log((new Date()) + " Peer " + userID + " disconnected.");
    delete clients[userID];
    console.log(`disconected: ${userID} in ${Object.getOwnPropertyNames(clients)}`)
  });
});

Joystick.create("/dev/input/js0", function (err, joystick) {
  if (err) {
    throw err;
  }

  joystick.setMaximumAxesPosition(100);
  console.log(`F710 Gamepad Connected! ${JSON.stringify(joystick)}`)

  joystick.on("button:a:press", function () {
    console.log("jump");
  });

  joystick.on("button:b:press", function () {
    console.log("fire");
  });
});

