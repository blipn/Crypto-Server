"use strict";

/**
 * Load Conf file
 */
const fs = require("fs");
const path = require("path");
const contents = fs.readFileSync(path.join(__dirname,"env.json"));
const envSettings = JSON.parse(contents);
console.log(envSettings.env+" env loaded");

/**
 * Server conf
 */
if(envSettings.env === "prod" && typeof(envSettings.key) !== 'undefined' && typeof(envSettings.cert) !== 'undefined' ){ // In production we activate SSL
    let options = {
        key: fs.readFileSync(path.join(__dirname,envSettings.key)),
        cert: fs.readFileSync(path.join(__dirname,envSettings.cert))
    };
    var server = require('https').createServer(options);
}else{ // Else int dev mode
    var server = require('http').createServer();
}

const io = require('socket.io')(server);

/**
 * Start Socket.io
 */
server.listen(envSettings.port);
console.log("listenning on "+envSettings.port);

/**
 * Other
 * SHA-512
 * RSA-2048
 */
const sha512 = require('sha512');
const nodeRSA = require('node-rsa');
const keyRSA = new nodeRSA({b: 2048});

/**
 * Chat
 */

//Array with connected clients
const clients = {};

// // add an item
// map[key1] = value1;
// // or remove it
// delete map[key1];
// // or determine whether a key exists
// key1 in map;

/**
 * Data in sockets :
 * socket.randToken : token
 * socket.publicKey : RSA public Key under SHA-512
 */

io.on('connection', function(socket){


    /**
     * Connection
     */
    socket.on('connectStep1', function(){
        console.log("someone is trying to connect");
        // Sending client a random string (token)
        socket.randToken = sha512(Date.now()+":"+Math.random()).toString('hex');
        socket.emit('token', {
            token : socket.randToken
        });
    });
    socket.on('connectStep2', function(data){

        /**
         * data :
         * data.signedToken
         * data.publicKey
         */

        if(typeof(data.signedToken) !== 'undefined' && typeof(data.publicKey) !== 'undefined'){
            keyRSA.importKey(data.publicKey, "public");
            if(keyRSA.verify(socket.randToken, data.signedToken)){

                socket.publicKey = sha512(data.publicKey);
                clients[socket.publicKey] = socket;

                console.log("someone is connected");
                io.emit('alert', {
                    message : "Connected"
                });
            }else{
                console.log("Token error at client connection");
            }



        }
    });

    /**
     * Message received
     */
    socket.on('message', function(data){
        // if(typeof(data.) !== 'undefined' && typeof(data.) !== 'undefined') {

            console.log("message sent");

            //Check the signed token

            if (data.key in clients) {

            }
            io.emit('message', {
                message: data.message,
                pseudo: socket.name
            });

        // }
    });

    /**
     * On Disconnection
     */
    socket.on('disconnect', function(){
        console.log("someone disconnected");
        delete clients[socket.publicKey]
    });


});
