var GamePad = require( 'node-gamepad' );

var controller = undefined;

try {
    controller = new GamePad( 'logitech/gamepadf710', {
        productID: 49695,
        vendorID: 1133
    } );
} catch (error) {
    controller = new GamePad( 'ps4/dualshock4', {
        vendorID: 1356,
        productID: 2508
    } );
}

if (!!controller) {
    controller.connect();

    controller.on( 'up:press', function() {
        console.log( 'up' );
    } );
    
    controller.on( 'down:press', function() {
        console.log( 'down' );
    } );
};

