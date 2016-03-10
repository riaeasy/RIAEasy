//>>built

define("dojox/io/xhrScriptPlugin", ["dojo/_base/kernel", "dojo/_base/window", "dojo/io/script", "dojox/io/xhrPlugins", "dojox/io/scriptFrame"], function (dojo, window, script, xhrPlugins, scriptFrame) {
    dojo.getObject("io.xhrScriptPlugin", true, dojox);
    dojox.io.xhrScriptPlugin = function (url, callbackParamName, httpAdapter) {
        xhrPlugins.register("script", function (method, args) {
            return args.sync !== true && (method == "GET" || httpAdapter) && (args.url.substring(0, url.length) == url);
        }, function (method, args, hasBody) {
            var send = function () {
                args.callbackParamName = callbackParamName;
                if (dojo.body()) {
                    args.frameDoc = "frame" + Math.random();
                }
                return script.get(args);
            };
            return (httpAdapter ? httpAdapter(send, true) : send)(method, args, hasBody);
        });
    };
    return dojox.io.xhrScriptPlugin;
});

