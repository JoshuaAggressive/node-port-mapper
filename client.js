var net = require('net');

var params = {
    c: {
        host: null,
        port: 25560
    },
    f: {
        host: null,
        port: 25561
    },
    t: {
        host: null,
        port: 25565
    }
}

var connList = new Array();

var control = net.createConnection(params.c.port, params.c.host);

control.on('data', datas => {
    datas = JSON.parse('[' + (datas + '').substr(0, datas.length - 1) + ']');
    for (var data of datas) {
        switch (data.status) {
            case 0:
                for (var i = 0; i < data.amount; i++) createConnection();
                break;
        }
    }
});

var createConnection = () => {
    var from = net.createConnection(params.f.port, params.f.host);
    var to = net.createConnection(params.t.port, params.t.host);
    from.on('data', data => to.write(data));
    from.on('end', () => to.connect(params.f.port, params.f.host));
    from.on('error', () => to.connect(params.f.port, params.f.host));
    to.on('data', data => from.write(data));
    to.on('end', () => to.connect(params.t.port, params.t.host));
    to.on('error', () => to.connect(params.t.port, params.t.host));
    connList.push({
        from: from,
        to: to
    });
};