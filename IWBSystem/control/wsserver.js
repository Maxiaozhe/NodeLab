'use strict';
const wss = require("ws").Server;
const config = require("../config/config");
const WsClient = require("./wsClient");

/**
 * WebSocketサーバーを作成する
 * @param {Http.server} server socketのhttpServer
 * @param {wsPool} wsPool WebSocket Pool
 * @param {string} path socket urlのパス
 * @returns {WebSocket.Server}  WebSocketサーバー
 */
function create(server, wsPool, path) {
    let wsServer = new wss({
        server: server,
        path: path
    });
    connect(wsServer);

    /**
     * WebSocker Lisener 登録する
     * @param {WebSocket.Server} server: WebSocketサーバー
     */
    function connect(server) {

        server.on('connection', function (ws) {
            ws.on('message', onMessage);
            ws.on('open', onOpen);
            ws.on('close', onClose);
        });
    }

    function onOpen(message) {
        console.log("Socket Client Open=>" + message);
    }

    function onMessage(data) {
        console.log("Socket Client Open=>", data);
        let ws = this;
        try {
            let message = JSON.parse(data);
            registWs(message, ws);
            if (message && message.state) {
                switch (message.state) {
                    case 'open':
                        ws.send('pong');
                        break;
                    case 'ping':
                        ws.send('pong');
                        break;
                    default:
                        break;
                }
            }
        } catch (ex) {
            console.log(ex);
        }
    }

    function registWs(message, ws) {
        let orgWs = wsPool.find(x => x.id === message.id);
        if (!orgWs) {
            wsPool.push(new WsClient(message.id,message.type,ws));
            return;
        }
        if (orgWs.ws!==ws) {
            orgWs.ws = ws;
        }
    }

    function onClose(onClose) {
        try {
            // close
            let ws = this;
            ws = wsPool.find(x => x.ws === ws);
            if(ws){
                console.log(`websocket (id= ${ws.id}) closed!`)
                wsPool.pop(ws);
            }
        } catch (ex) {
            console.log(ex);
        }
    }
    return wsServer;
}


module.exports = {
    create: create
};