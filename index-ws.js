const express = require('express');
const server = require('http').createServer();
const app = express();

app.get('/', function(req, res) {
    res.sendFile('index.html', {root: __dirname});
});

server.on('request', app);
server.listen(3000, function(){
    console.log('server started on port 3000');
});

/** Begin websockets */
const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({server: server});

process.on('SIGINT', () => {
    console.log('sigint');
    
    wss.clients.forEach(function each(client) {
        client.close();
    });
    server.closeAllConnections();
    server.close(() => {
        shutdownDB();
    });
});

wss.on('connection', function connection(ws){
    const numClients = wss.clients.size;
    console.log('Clients connected' + numClients);

    wss.broadcast(`Current visitors: ${numClients}`);

    if (ws.readyState === ws.OPEN) {
        ws.send('Welcome to my server');
    }

    db.run(`INSERT INTO visitors (count, time)
        VALUES (${numClients}, datetime('now'))
    `);

    ws.on('close', function() {
        console.log('A client has disconnected');
    });
});

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        client.send(data);
    });
}

/** End websockets */
/** Begin database */
const sqlite = require('sqlite3');
const db = new sqlite.Database(':memory:');

db.serialize(() => {
    db.run(`
        CREATE TABLE visitors (
            count INTEGER,
            time TEXT
        )
    `);
});

function getCounts() {
    db.each("SELECT * FROM visitors", (err, row) => {
        console.log(row);
    });
}

function shutdownDB() {
    console.log("Shutting down db");

    getCounts();
    db.close();
}