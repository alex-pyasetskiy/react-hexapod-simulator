var GamePad = require( 'node-gamepad' );
var controller = new GamePad( 'logitech/gamepadf710', {
	vendorID: 1133,
	productID: 49689//49695
} );
controller.connect();

controller.on( 'up:press', function() {
    console.log( 'up' );
} );
controller.on( 'down:press', function() {
    console.log( 'down' );
} );