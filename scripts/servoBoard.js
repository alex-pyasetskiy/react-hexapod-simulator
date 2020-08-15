const WebSocket = require('ws');
const SerialPort = require("serialport");
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const wss = new WebSocket.Server({ host: process.env.NODE_HOST, port: process.env.NODE_BOARD_SOCKET });


var controller;

SerialPort.list().then(
    ports => {
        let devices = ports.filter(function(item) {return item.manufacturer === 'RTrobot'})
        
        console.log(devices)
        let path = devices[0].path;
        controller = new SerialPort(path, {
            baudRate: 115200,
            dataBits: 8,
            stopBits: 1
        });

        controller.on('open',function() {
            console.log(`Serial Port ${path} is opened.`);
        });
        
        controller.on('data', function(data) {
            console.log('data received: ' + data);
        });
        
    },
    err => console.error(err)
  )

function log(msg) {
    fs.writeFile('socket.log', msg, {'flag':'a'}, function (err) {
        if (err) return console.error(err);
    });
    console.log(msg);
}

wss.on('connection', function connection(ws, req) {
    log(`Connected on port ${wss.port}`)
    ws.on('message', function incoming(message) {
        const buf = Buffer.from(`${message}\r\n`)
        controller.write(buf.toString('ascii'));
        log(`Receive CMD=${buf.toString('ascii')}`);
    });

    ws.send('something');
});