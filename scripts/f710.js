var Joystick = require("joystick-logitech-f710");

joystick.setMaximumAxesPosition(100);

Joystick.create("/dev/input/js0", function (err, joystick) {
  if (err) {
    throw err;
  }

  joystick.on("button:a:press", function () {
    console.log("jump");
  });

  joystick.on("button:b:press", function () {
    console.log("fire");
  });
});