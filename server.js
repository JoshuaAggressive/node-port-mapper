var net = require('net');

var ctrl = new net.Server();
var control;
ctrl.listen(25560);

var linklist = new Array();
var connlist = new Array();

var find = port => element => element.to.remotePort === port;

ctrl.on('connection', socket => {
    socket.write(JSON.stringify({
        status: 0
    })+ ',')
    socket.on('data', datas => {
        datas = JSON.parse('[' + (datas + '').substr(0,datas.length - 1) + ']');
        for(var data of datas) {
            switch (data.status) {
                case 0:
                    break;
                case 1:
                    var conn = connlist.find(find(data.port));
                    conn.connected = true;
                    if (conn.connected && conn.to.writable) {
                        while (conn.cache.length) conn.to.write(conn.cache.shift());
                    }
                    console.log(conn.remotePort + '->' + conn.localPort);
                    console.log(conn.to.localPort + '->' + conn.to.remotePort + ' connected');
                    break;
            }
        }
    })
    control = socket;
});

var to = (new net.Server()).listen(25561);

to.on('connection', socket => {
    linklist.push(socket);
});

var from = (new net.Server()).listen(25562);

from.on('connection', socket => {
    socket.connected = false;
    socket.cache = new Array();
    socket.to = linklist.shift();
    control.write(JSON.stringify({
        status: 1,
        port: socket.to.remotePort
    }) + ',')
    socket.on('data', data => {
        if (socket.connected && socket.to.writable) {
            while (socket.cache.length) socket.to.write(socket.cache.shift());
            console.log(socket.remotePort + '->' + socket.localPort + '->' + socket.to.localPort + '->' + socket.to.remotePort);
            console.log(data + '\n\n');
            socket.to.write(data);
        }
        else  socket.cache.push(data);
    });
    socket.on('end', () => {
        socket.to._events.data = () => {};
        linklist.push(socket.to);
    });
    socket.to.cache = new Array();
    socket.to.on('data', data => {
        if (socket.writable) {
            while (socket.to.cache.length) socket.write(socket.to.cache.shift());
            console.log(socket.to.remotePort + '->' + socket.to.localPort + '->' + socket.localPort + '->' + socket.remotePort);
            console.log(data + '\n\n');
            socket.write(data);
        }
        else  socket.to.cache.push(data);
    });
    
    connlist.push(socket);
})

var stt;

stt = () => {
    console.log(linklist.length);
    setTimeout(stt, 2000)
}

stt();