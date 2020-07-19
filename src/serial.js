var SerialPort = require('serialport');

var port = new SerialPort("/dev/tty.usbmodem5CFA575831321", {
    baudRate: 115200
});

port.open(function (err) {
    if (err) {
      return console.log('Error opening port: ', err.message);
    }
});
  
port.on('open', function() {
    console.log('Open');
});

port.write('#1P1865#2P1100#3P1600#5P1500#6P1100#7P1600#9P1500#10P1100#11P1600#21P1300#22P1900#23P1400#25P1300#26P1900#27P1400#30P963#31P1900#32P1400T300\n\r');
