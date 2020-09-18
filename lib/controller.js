"use strict";

const fs = require("fs");
const EventEmitter = require("events").EventEmitter;
const util = require("util");

class Controller extends EventEmitter {
    constructor(props) {
        super(props)
        this.fileDescriptor = null;
        this.maximumAxesPosition = 256;

    }
    open(device, cb) {
        var self = this;
        fs.open(device, "r", function (err, fd) {
            if (err) {
                return cb(new Error(util.format(
                    "Failed opening device '%s' (%s)",
                    device, err.message
                )));
            }
            console.log(fd);
            self.fileDescriptor = device;
            cb();
        });
    }
    read() {
        if (this.fileDescriptor) {

            let readStream = fs.createReadStream(this.fileDescriptor);


            readStream.on('data', data => {
                const timestamp = data.slice(0, 4),
                    type = data[8],
                    event = data[10]

                var value;
                if (data[11] === 0x01) {
                    value = parseInt(data[12], 'hex')
                } else {
                    value = BigInt(`0x${data.slice(12, 14).toString('hex')}`)
                }

                console.log(`[${timestamp}] type=${type}, event=${event}, value=${value}`)
                this.handle(type, event, value)
            });
        }
    }
    close() {
        this.removeAllListeners();
        fs.closeSync(this.fileDescriptor);
        this.fileDescriptor = null;
    }
    handle(type, event, value) {
        // var hex = bytes.toString("hex"),
        // var byte5 = hex.slice(8, 10),
        //     byte6 = hex.slice(10, 12),
        //     byte7 = hex.slice(12, 14),
        //     byte8 = hex.slice(14, 16);

        if (type === 1) {
            this.handleButtons(event, value);
        }
        else if (type === 3) {
            this.handleSticks(type, event, value);
        }
    }
    getButton(buttonId) {
        var buttons = {
            51: "x", 
            48: "a", 
            49: "b", 
            52: "y", 
            54: "lb",
            55: "rb",
            58: "back", 
            59: "start",
            61: "ls",
            62: "rs"
        };
        return buttons[buttonId];
    }

    handleButtons(buttonId, state) {
        var button = this.getButton(buttonId);
        if (state === 1) {
            this.emit(`button:${button}:press`);
            console.log(`button:${button}:press`)
        }
        else if (state === 0) {
            this.emit(`button:${button}:release`);
            console.log(`button:${button}:release`)

        }
    }

    // getStickByByte(stickId) {
    //     if (stickId === "00" || stickId === "01") {
    //         return 2;
    //     }
    //     else if (stickId === "02" || stickId === "03") {
    //         return 3;
    //     }
    //     else if (stickId === "04" || stickId === "05") {
    //         return 1;
    //     }
    //     return null;
    // }

    handleDpad(event, value) {
        if (event === 17 && value > 65000) {
            this.emit("dpad:" + stick + ":up:pressed", this.scalePosition(value));
        } else if (event === 16 && value === 256) {
            this.emit("dpad:" + stick + ":right:pressed", this.scalePosition(value));
        } else if (event === 16 && value > 6500) {
            this.emit("dpad:" + stick + ":left:pressed", this.scalePosition(value));
        } else if (event === 17 && value === 250) {
            this.emit("dpad:" + stick + ":down:pressed", this.scalePosition(value));
        } else if (value === 0) {
            this.emit("dpad:" + stick + ":default", this.scalePosition(value));
        }
    }

    handleSticks(event, type, value) {
        // var stick = this.getStickByByte(byte8);
        if (event === 16 || event === 17) {
            this.handleDpad(event, value)
        }
        if (byte8 === "00" || byte8 === "02" || byte8 === "04") {
            this.handleHorizontalStickMovement(stick, position);
        }
        else if (byte8 === "01" || byte8 === "03" || byte8 === "05") {
            this.handleVerticalStickMovement(stick, position);
        }
    }
    handleHorizontalStickMovement(stick, position) {
        if (position > 0 && position <= 32767) {
            this.emit("stick:" + stick + ":horizontal:right", this.scalePosition(position));
        }
        else if (position >= 32768 && position <= 65535) {
            this.emit("stick:" + stick + ":horizontal:left", this.scalePosition(65536 - position));
        }
        else if (position === 0) {
            this.emit("stick:" + stick + ":horizontal:zero", 0);
        }
    }
    handleVerticalStickMovement(stick, position) {
        if (position > 0 && position <= 32767) {
            this.emit("stick:" + stick + ":vertical:down", this.scalePosition(position));
        }
        else if (position >= 32768 && position <= 65535) {
            this.emit("stick:" + stick + ":vertical:up", this.scalePosition(65536 - position));
        }
        else if (position === 0) {
            this.emit("stick:" + stick + ":vertical:zero", 0);
        }
    }
    setMaximumAxesPosition(maximum) {
        var parsedMaximum = parseInt(maximum, 10);

        if (isNaN(parsedMaximum)) {
            throw new Error(util.format(
                "Given maximum axes position '%s' is no valid integer value. " +
                "It must be a value between 1 and 65535.", maximum
            ));
        }

        maximum = parsedMaximum;

        if (maximum < 1) {
            throw new Error(util.format(
                "Cannot change maximum axes position to %d. The value must be " +
                "greater than 1.", maximum
            ));
        }

        if (maximum > 65535) {
            throw new Error(util.format(
                "Cannot change maximum axes position to %d. The possible maximum " +
                "position is limited to 65535 by the joystick.", maximum
            ));
        }

        this.maximumAxesPosition = maximum;
    }
    scalePosition(position) {
        return Math.ceil(this.maximumAxesPosition * (position / 32768));
    }
}

util.inherits(Controller, EventEmitter);
module.exports = Controller;