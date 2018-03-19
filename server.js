var net = require('net');
var params = require('./config/server-config')

var control;
var ctrl = net.createServer(socket => {
    control = socket;
    control.write(JSON.stringify({
        status: 0,
        amount: params.target
    }) + ',');
}).listen(params.c.port, params.c.host);

var linklist = new Array();

var toServer = net.createServer(socket => {
    linklist.push(socket);
}).listen(params.t.port, params.t.host);

var fromServer = net.createServer(socket => {
    var toSocket = linklist.shift();
    if (linklist.length < params.min)
        control.write(JSON.stringify({
            status: 0,
            amount: params.target - linklist.length
        }) + ',');
    if (!toSocket) return socket.end('');
    socket.on('data', data => {
        if (toSocket.writable) toSocket.write(data);
    });
    socket.on('end', () => {
        toSocket._events.data = () => { };
        linklist.push(toSocket);
    });
    socket.on('error', () => {
        toSocket._events.data = () => { };
        linklist.push(toSocket);
    });
    toSocket.on('data', data => {
        if (socket.writable) socket.write(data);
    });
}).listen(params.f.port, params.f.host);