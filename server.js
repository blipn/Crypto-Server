/**
 * Load Conf file
 */
const fs = require("fs");
const path = require("path");
var contents = fs.readFileSync(path.join(__dirname,"env.json"));
var envSettings = JSON.parse(contents);
console.log(envSettings.env+" env loaded");

/**
 * Other Modules
 */
if(envSettings.env == "prod" && typeof(envSettings.key) !== 'undefined' && typeof(envSettings.cert) !== 'undefined' ){ // Si on est en production on active https
    let options = {
        key: fs.readFileSync(path.join(__dirname,envSettings.key)),
        cert: fs.readFileSync(path.join(__dirname,envSettings.cert))
    };
    var server = require('https').createServer(options, app);

}else{ // Sinon on est en env de prod ou de test
    var server = require('http').createServer(app);
}

var io = require('socket.io')(server);

/**
 * Start Socket.io
 */
server.listen(envSettings.port);
console.log("listenning on "+envSettings.port);

/**
 * Chat
 */

//Array with connected clients
var clients = {};

// add an item
map[key1] = value1;
// or remove it
delete map[key1];
// or determine whether a key exists
key1 in map;

io.on('connection', function(socket){

    /**
     * Connection
     */
    socket.on('publickey', function(data){
        console.log("someone connected");
        clients[data.key] = socket;
        socket.publicKey = data.key;
        io.emit('alert', {
            message : "Connected"
        });
    });

    /**
     * Message received
     */
    socket.on('message', function(data){
        console.log("message sent");
        io.emit('message', {
            message : data.message,
            pseudo : socket.name
        });
    });

    /**
     * On Disconnection
     */
    socket.on('disconnect', function(){
        console.log("someone disconnected");
        delete clients[socket.publicKey]
    });


});
