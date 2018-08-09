'usr strict';
/**
 * 
 * @param {string} id 
 * @param {string} type 
 * @param {*} ws 
 */
function WsClient(id, type, ws) {
    this.id = id;
    this.type = type;
    this.ws = ws;
}
WsClient.prototype.send = function (data) {
    if (this.ws && this.ws.readyState === 1) {
        this.ws.send(data);
    }else{
        console.log("WebSocket Client 閉めるか存在しないため、データ送信できませんでした。->",data);
    }
};
module.exports = WsClient;