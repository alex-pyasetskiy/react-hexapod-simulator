const WebSocket = require('ws');
const SerialPort = require("serialport");
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const wss = new WebSocket.Server({port: 4000});


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
            // console.log('data received: ' + data);
        });
        
    },
    err => console.error(err)
  );

wss.on('connection', function connection(ws, req) {
    var stream = fs.createWriteStream('socket1.log', {flags:'a'});
    stream.write("Connected!");
    ws.on('message', function incoming(message) {
        let parts = message.split(' ');
        let step = parseInt(parts[1]);
        let sequence = [];
        if (step > 1) {
            sequence.push(parts[2]);
        } else {
            stream.write(sequence.join("\r\n"));
            sequence = [];
        }
        const buf = Buffer.from(`${message}\r\n`)
        controller.write(buf.toString('ascii'));
        console.log(`${buf.toString('ascii')}`);
        // log(`${buf.toString('ascii')}`);
    });
    
    ws.on('close', function handleClose(){
        stream.end();
    });
});