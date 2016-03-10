//>>built

define("dojox/io/xhrWindowNamePlugin", ["dojo/_base/kernel", "dojo/_base/json", "dojo/_base/xhr", "dojox/io/xhrPlugins", "dojox/io/windowName", "dojox/io/httpParse", "dojox/secure/capability"], function (dojo, json, xhr, xhrPlugins, windowName, httpParse, capability) {
    dojo.getObject("io.xhrWindowNamePlugin", true, dojox);
    dojox.io.xhrWindowNamePlugin = function (url, httpAdapter, trusted) {
        xhrPlugins.register("windowName", function (method, args) {
            return args.sync !== true && (method == "GET" || method == "POST" || httpAdapter) && (args.url.substring(0, url.length) == url);
        }, function (method, args, hasBody) {
            var send = windowName.send;
            var load = args.load;
            args.load = undefined;
            var dfd = (httpAdapter ? httpAdapter(send, true) : send)(method, args, hasBody);
            dfd.addCallback(function (result) {
                var ioArgs = dfd.ioArgs;
                ioArgs.xhr = {getResponseHeader:function (name) {
                    return dojo.queryToObject(ioArgs.hash.match(/[^#]*$/)[0])[name];
                }};
                if (ioArgs.handleAs == "json") {
                    if (!trusted) {
                        capability.validate(result, ["Date"], {});
                    }
                    return dojo.fromJson(result);
                }
                return dojo._contentHandlers[ioArgs.handleAs || "text"]({responseText:result});
            });
            args.load = load;
            if (load) {
                dfd.addCallback(load);
            }
            return dfd;
        });
    };
    return dojox.io.xhrWindowNamePlugin;
});

