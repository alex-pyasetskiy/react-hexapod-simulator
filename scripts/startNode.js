const express = require('express');
const app = express();
const http = require('http').createServer(app);
const socketIo = require('socket.io')(http);
const SerialPort = require("serialport");
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.text());

var port = 4000;

var controller = new SerialPort("/dev/tty.usbmodem5CFA575831321", {
    baudRate: 115200,
    dataBits: 8,
    stopBits: 1
});

controller.on('open',function() {
    console.log('Serial Port is opened.');
});

controller.write('#1P1500#2P1500#3P1500#5P1500#6P1500#7P1500#9P1500#10P1500#11P1500#21P1500#22P1500#23P1500#25P1500#26P1500#27P1500#30P1500#31P1500#32P1500T100D500\r\n');
controller.on('data', function(data) {
    console.log('data received: ' + data);
});

app.post('/', function (req, res) {
    const body = JSON.parse(req.body);
    const buf = Buffer.from(`${body.cmd}\r\n`)
    console.log(buf.toString('ascii'));
    controller.write(buf.toString('ascii'));
    return res.send(body.cmd);

})

socketIo.on('connection', (socket) => {
    console.log('a user connected');
});

http.listen(port, function () {
  console.log('Example app listening on port http://localhost:' + port + '!');
});
