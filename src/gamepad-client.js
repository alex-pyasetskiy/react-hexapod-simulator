var Joystick = require("joystick-logitech-f710");
const http = require('http');

const WebSocket = require('ws')

const server = http.createServer({ port: 4000 });
const wss = new WebSocket.Server({ server });


function noop() {}
 
function heartbeat() {
  this.isAlive = true;
}
// const wss = new WebSocket.Server({port: 3030 })

const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
      if (ws.isAlive === false) return ws.terminate();
   
      ws.isAlive = false;
      ws.ping(noop);
    });
  }, 5000);

wss.on('connection', ws => {
    ws.isAlive = true;
    ws.on('pong', heartbeat);


    Joystick.create("/dev/input/js0", function (err, joystick) {
        if (err) {
          throw err;
        }

        joystick.setMaximumAxesPosition(100);


        // -------------- FUNCTIONAL BUTTONS ---------------------
        
        joystick.on("button:start:press", function () {
            console.log("start button has been pressed");
        });

        joystick.on("button:back:press", function () {
            console.log("back button has been pressed");
        });

        // ---------------- TRIGGERS ---------------------------

        joystick.on("button:lb:press", function () {
            console.log("lb button has been pressed");
        });

        joystick.on("button:rb:press", function () {
            console.log("rb button has been pressed");
        });

        joystick.on("button:rt:press", function () {
            console.log("rt button has been pressed");
        });

        joystick.on("button:lt:press", function () {
            console.log("lt button has been pressed");
        });


        // ------------- ACTION BUTTONS --------------------------
      
        joystick.on("button:a:press", function () {
          console.log("A");
          ws.send('A')
        });
      
        joystick.on("button:b:press", function () {
          console.log("B");
          ws.send('B')
        });

        joystick.on("button:x:press", function () {
            console.log("X");
            ws.send('X')
          });

        joystick.on("button:y:press", function () {
        console.log("Y");
        ws.send('Y')
        });

        joystick.on("button:b:press", function () {
        console.log("fire");
        ws.send('B')
        });


        // ------------------LEFT STIC--------------------------

        joystick.on("stick:2:vertical:up", function (position) {
            console.log("stick:2 current up position: " + position);
            ws.send(JSON.stringify({stick:2, axis: 'V', position: 'up', value: position}))
        });

        joystick.on("stick:2:vertical:down", function (position) {
            console.log("stick:2 current up position: " + position);
            ws.send(JSON.stringify({stick:2, axis: 'V', position: 'down', value: position}))
        });

        joystick.on("stick:2:vertical:zero", function (position) {
            console.log("stick:2 current up position: " + position);
            ws.send(JSON.stringify({stick:2, axis: 'V', position: 'zero', value: position}))
        });

        joystick.on("stick:2:horizontal:up", function (position) {
            console.log("stick:2 current up position: " + position);
            ws.send(JSON.stringify({stick:2, axis: 'H', position: 'up', value: position}))
        });

        joystick.on("stick:2:horizontal:down", function (position) {
            console.log("stick:2 current up position: " + position);
            ws.send(JSON.stringify({stick:2, axis: 'H', position: 'down', value: position}))
        });

        joystick.on("stick:2:horizontal:zero", function (position) {
            console.log("stick:3 current up position: " + position);
            ws.send(JSON.stringify({stick:2, axis: 'H', position: 'zero', value: position}))
        });


        //--------------------  RIGHT STIC  ----------------- 

        joystick.on("stick:3:vertical:up", function (position) {
            console.log("stick:3 current up position: " + position);
            ws.send(JSON.stringify({stick:3, axis: 'V', position: 'up', value: position}))
        });

        joystick.on("stick:3:vertical:down", function (position) {
            console.log("stick:3 current up position: " + position);
            ws.send(JSON.stringify({stick:3, axis: 'V', position: 'down', value: position}))
        });

        joystick.on("stick:3:vertical:zero", function (position) {
            console.log("stick:3 current up position: " + position);
            ws.send(JSON.stringify({stick:3, axis: 'V', position: 'zero', value: position}))
        });

        joystick.on("stick:3:horizontal:up", function (position) {
            console.log("stick:3 current up position: " + position);
            ws.send(JSON.stringify({stick:3, axis: 'H', position: 'up', value: position}))
        });

        joystick.on("stick:3:horizontal:down", function (position) {
            console.log("stick:3 current up position: " + position);
            ws.send(JSON.stringify({stick:3, axis: 'H', position: 'down', value: position}))
        });

        joystick.on("stick:3:horizontal:zero", function (position) {
            console.log("stick:3 current up position: " + position);
            ws.send(JSON.stringify({stick:3, axis: 'H', position: 'zero', value: position}))
        });
    });


    ws.on('message', message => {
        console.log(`Received message => ${message}`)
    })
    
});

wss.on('close', function close() {
    clearInterval(interval);
});


// Joystick.create("/dev/input/js0", function (err, joystick) {
//   if (err) {
//     throw err;
//   }

//   joystick.on("button:a:press", function () {
//     console.log("jump");
//   });

//   joystick.on("button:b:press", function () {
//     console.log("fire");
//   });
// });