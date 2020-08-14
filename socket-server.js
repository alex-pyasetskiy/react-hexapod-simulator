const webSocketsServerPort = 4000;
const webSocketServer = require('websocket').server;
const http = require('http');

var HID = require('node-hid');
HID.setDriverType('lsusb');

var device = new HID.HID(1133, 49695);


// Spinning the http server and the websocket server.
const server = http.createServer();
server.listen(webSocketsServerPort);
const wsServer = new webSocketServer({
  httpServer: server
});

var clients = {};

const getUniqueID = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + s4() + '-' + s4();
};

const sendMessage = (json) => {
  Object.keys(clients).map((client) => {
    clients[client].sendUTF(json);
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

device.on("data", function (data) {
  var hex = data.toString('hex');
  var parsed_data = {
    hex: `${data.toString('hex')}`,
    fn: `${parseInt(hex[4], 16)}`,
    arrows: `${parseInt(hex[5], 16)}`,
    actions: `${parseInt(hex[6], 16)}`,
    home: `${parseInt(hex[7], 16)}`,
    lt: `${parseInt(hex.slice(8, 9), 16)}`,
    lb: `${parseInt(hex.slice(10, 11), 16)}`,
    axis_left_x: `${parseInt(hex.slice(12,16), 16)}`,
    axis_left_y: `${parseInt(hex.slice(16,20), 16)}`,
    axis_right_x: `${parseInt(hex.slice(20,24), 16)}`,
    axis_right_y: `${parseInt(hex.slice(24,28), 16)}`
  };

  console.log(parsed_data);
  sendMessage(JSON.stringify(parsed_data))
});