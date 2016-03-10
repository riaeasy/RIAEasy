//>>built

define("dojox/socket/Reconnect", ["dojox/socket", "dojo/aspect"], function (dxSocket, aspect) {
    dxSocket.Reconnect = function (socket, options) {
        var reconnectTime = options.reconnectTime || 10000;
        var checkForOpen, newSocket;
        options = options || {};
        aspect.after(socket, "onclose", function (event) {
            clearTimeout(checkForOpen);
            if (!event.wasClean) {
                socket.disconnected(function () {
                    dxSocket.replace(socket, newSocket = socket.reconnect());
                });
            }
        }, true);
        if (!socket.disconnected) {
            socket.disconnected = function (reconnect) {
                setTimeout(function () {
                    reconnect();
                    checkForOpen = setTimeout(function () {
                        if (newSocket.readyState < 2) {
                            reconnectTime = options.reconnectTime || 10000;
                        }
                    }, 10000);
                }, reconnectTime);
                reconnectTime *= options.backoffRate || 2;
            };
        }
        if (!socket.reconnect) {
            socket.reconnect = function () {
                return socket.args ? dxSocket.LongPoll(socket.args) : dxSocket.WebSocket({url:socket.URL || socket.url});
            };
        }
        return socket;
    };
    return dxSocket.Reconnect;
});

