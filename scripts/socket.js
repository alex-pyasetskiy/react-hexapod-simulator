const WebSocket = require('ws');
const SerialPort = require("serialport");
const fs = require('fs');
const wss = new WebSocket.Server({ port: 4000 });


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

wss.on('connection', function connection(ws, req) {
    // controller.write('#1P1500#2P1500#3P1500#5P1500#6P1500#7P1500#9P1500#10P1500#11P1500#21P1500#22P1500#23P1500#25P1500#26P1500#27P1500#30P1500#31P1500#32P1500T100D500\r\n');

    ws.on('message', function incoming(message) {
        // console.log('received: %s', message);
        const buf = Buffer.from(`${message}\r\n`)
        controller.write(buf.toString('ascii'));
        fs.writeFile('socket.log', buf.toString('ascii'), {'flag':'a'}, function (err) {
            if (err) return console.error(err);
          });
    });

    ws.send('something');
});