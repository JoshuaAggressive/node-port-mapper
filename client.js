var net = require('net');

var control = new net.Socket();

var linklist = new Array();

control.connect(25560);

var find = port => element => element.localPort === port;

control.on('data', datas => {
    datas = JSON.parse('[' + (datas + '').substr(0,datas.length - 1) + ']');
    for (var data of datas) {
        switch (data.status) {
            case 0:
                for (var i = linklist.length; i < 10; i++) {
                    var link = new net.Socket();
                    link.connect(25561);
                    linklist.push(link);
                }
                break;
            case 1:
                var to = new net.Socket();
                var from = linklist.find(find(data.port));
                to.cache = new Array();
                from.cache = new Array();
                to.connect(25565, () => {
                    console.log(from.remotePort + '->' + from.localPort);
                    console.log(to.localPort + '->' + to.remotePort + ' connected');
                    control.write(JSON.stringify({
                        status: 1,
                        port: data.port
                    })+ ',');
                });
                to.on('data', dt => {
                    if (from.writable) {
                        while (from.cache.length) from.write(from.cache.shift());
                        console.log(to.remotePort + '->' + to.localPort + '->' + from.localPort + '->' + from.remotePort);
                        console.log(dt + '\n\n');
                        from.write(dt);
                    }
                    else from.cache.push(dt);
                });
                from.on('data', dt => {
                    if (to.writable) {
                        while (to.cache.length) to.write(to.shift());
                        console.log(from.remotePort + '->' + from.localPort + '->' + to.localPort + '->' + to.remotePort);
                        console.log(dt + '\n\n');
                        to.write(dt);
                    }
                    else to.cache.push(dt);
                });
                break;
        }
    }
});

