const WebSocket = require('ws');
const SerialPort = require("serialport");

const wss = new WebSocket.Server({ port: 4000 });

const controller = new SerialPort("/dev/tty.usbmodem5CFA575831321", {
    baudRate: 115200,
    dataBits: 8,
    stopBits: 1
});

controller.on('open',function() {
    console.log('Serial Port is opened.');
});

controller.on('data', function(data) {
    console.log('data received: ' + data);
});


wss.on('connection', function connection(ws, req) {
    // controller.write('#1P1500#2P1500#3P1500#5P1500#6P1500#7P1500#9P1500#10P1500#11P1500#21P1500#22P1500#23P1500#25P1500#26P1500#27P1500#30P1500#31P1500#32P1500T100D500\r\n');

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        const buf = Buffer.from(`${message}\r\n`)
        controller.write(buf.toString('ascii'));
    });

    ws.send('something');
});