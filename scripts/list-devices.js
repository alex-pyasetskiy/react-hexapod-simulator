#!/usr/bin/env node

var HID = require('node-hid');

// Linux: choose driverType
// default is 'hidraw', can also be 'libusb'
if( process.argv[2] ) {
    var type = process.argv[2];
    console.log("driverType:",type);
    HID.setDriverType( type );
}

console.log('devices:', HID.devices());