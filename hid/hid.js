var HID = require('node-hid');
HID.setDriverType('lsusb');

var device = new HID.HID(1133,49695);

device.on("data", function(data) {
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
});