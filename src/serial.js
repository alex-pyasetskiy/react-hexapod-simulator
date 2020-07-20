const express = require('express');
const app = express();
var SerialPort = require("serialport");
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.text());

var port = 4000;


var controller = new SerialPort("/dev/cu.usbmodem5CFA575831321", {  
    baudRate: 115200,
    dataBits: 8,
    stopBits: 1
});

controller.on('open',function() {
    console.log('Serial Port is opened.');
});

controller.write('#1P1321#2P1100#3P1600#5P1500#6P1100#7P1600#9P1500#10P1100#11P1600#21P1300#22P1900#23P1400#25P1500#26P1900#27P1400#30P1300#31P1900#32P1400T300\r\n');
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


app.listen(port, function () {
  console.log('Example app listening on port http://localhost:' + port + '!');
});
