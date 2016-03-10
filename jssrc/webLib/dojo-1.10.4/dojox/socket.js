//>>built

define("dojox/socket", ["dojo/_base/array", "dojo/_base/lang", "dojo/_base/xhr", "dojo/aspect", "dojo/on", "dojo/Evented", "dojo/_base/url"], function (array, lang, xhr, aspect, on, Evented, dBaseUrl) {
    var WebSocket = window.WebSocket;
    var Socket = function (argsOrUrl) {
        if (typeof argsOrUrl == "string") {
            argsOrUrl = {url:argsOrUrl};
        }
        return WebSocket ? Socket.WebSocket(argsOrUrl, true) : Socket.LongPoll(argsOrUrl);
    };
    Socket.WebSocket = function (args, fallback) {
        var baseURI = document.baseURI || window.location.href;
        var ws = new WebSocket(new dBaseUrl(baseURI.replace(/^http/i, "ws"), args.url));
        ws.on = function (type, listener) {
            ws.addEventListener(type, listener, true);
        };
        var opened;
        aspect.after(ws, "onopen", function (event) {
            opened = true;
        }, true);
        aspect.after(ws, "onclose", function (event) {
            if (opened) {
                return;
            }
            if (fallback) {
                Socket.replace(ws, Socket.LongPoll(args), true);
            }
        }, true);
        return ws;
    };
    Socket.replace = function (socket, newSocket, listenForOpen) {
        socket.send = lang.hitch(newSocket, "send");
        socket.close = lang.hitch(newSocket, "close");
        var proxyEvent = function (type) {
            (newSocket.addEventListener || newSocket.on).call(newSocket, type, function (event) {
                on.emit(socket, event.type, event);
            }, true);
        };
        if (listenForOpen) {
            proxyEvent("open");
        }
        array.forEach(["message", "close", "error"], proxyEvent);
    };
    Socket.LongPoll = function (args) {
        var cancelled = false, first = true, timeoutId, connections = [];
        var fire, connect;
        var socket = {send:function (data) {
            var sendArgs = lang.delegate(args);
            sendArgs.rawBody = data;
            clearTimeout(timeoutId);
            var deferred = first ? (first = false) || socket.firstRequest(sendArgs) : socket.transport(sendArgs);
            connections.push(deferred);
            deferred.then(function (response) {
                socket.readyState = 1;
                connections.splice(array.indexOf(connections, deferred), 1);
                if (!connections.length) {
                    timeoutId = setTimeout(connect, args.interval);
                }
                if (response) {
                    fire("message", {data:response}, deferred);
                }
            }, function (error) {
                connections.splice(array.indexOf(connections, deferred), 1);
                if (!cancelled) {
                    fire("error", {error:error}, deferred);
                    if (!connections.length) {
                        socket.readyState = 3;
                        fire("close", {wasClean:false}, deferred);
                    }
                }
            });
            return deferred;
        }, close:function () {
            socket.readyState = 2;
            cancelled = true;
            var i;
            for (i = 0; i < connections.length; i++) {
                connections[i].cancel();
            }
            socket.readyState = 3;
            fire("close", {wasClean:true});
        }, transport:args.transport || xhr.post, args:args, url:args.url, readyState:0, CONNECTING:0, OPEN:1, CLOSING:2, CLOSED:3, on:Evented.prototype.on, firstRequest:function (args) {
            var headers = (args.headers || (args.headers = {}));
            headers.Pragma = "start-long-poll";
            try {
                return this.transport(args);
            }
            finally {
                delete headers.Pragma;
            }
        }};
        fire = function (type, object, deferred) {
            if (socket["on" + type]) {
                object.ioArgs = deferred && deferred.ioArgs;
                object.type = type;
                on.emit(socket, type, object);
            }
        };
        connect = function () {
            if (socket.readyState == 0) {
                fire("open", {});
            }
            if (!connections.length) {
                socket.send();
            }
        };
        socket.connect = socket.on;
        setTimeout(connect);
        return socket;
    };
    return Socket;
});

