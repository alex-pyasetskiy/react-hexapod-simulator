"use strict";

const Controller = require("./controller")
    // , exports = module.exports = Controller;

module.exports.create = (device, cb) => {
    var joystick = new Controller();

    joystick.open(device, function (err) {
        if (err) {
            return cb(err);
        }

        joystick.read();
        cb(undefined, joystick);
    });
};
