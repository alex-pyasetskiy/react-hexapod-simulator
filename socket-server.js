const webSocketServer = require('websocket').server;
const http = require('http');
const HID = require('node-hid');
const dotenv = require('dotenv');

dotenv.config();

HID.setDriverType('lsusb');

const device_info = HID.devices().filter(function (i) {
  return i.productId === 49695 && i.vendorId === 1133;
})[0]

if (!device_info) {
  throw Error("Logitech Gamepad not Connected!")
}
console.log(device_info)

const device = new HID.HID(device_info.vendorId, device_info.productId);

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