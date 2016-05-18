//>>built

define("dojo/request/handlers", ["../json", "../_base/kernel", "../_base/array", "../has", "require"], function (JSON, kernel, array, has) {
    has.add("activex", typeof ActiveXObject !== "undefined");
    has.add("dom-parser", function (global) {
        return "DOMParser" in global;
    });
    var handleXML;
    if (has("activex")) {
        var dp = ["Msxml2.DOMDocument.6.0", "Msxml2.DOMDocument.4.0", "MSXML2.DOMDocument.3.0", "MSXML.DOMDocument"];
        var lastParser;
        handleXML = function (response) {
            var result = response.data;
            var text = response.text;
            if (result && has("dom-qsa2.1") && !result.querySelectorAll && has("dom-parser")) {
                result = new DOMParser().parseFromString(text, "application/xml");
            }
            function createDocument(p) {
                try {
                    var dom = new ActiveXObject(p);
                    dom.async = false;
                    dom.loadXML(text);
                    result = dom;
                    lastParser = p;
                }
                catch (e) {
                    return false;
                }
                return true;
            }
            if (!result || !result.documentElement) {
                if (!lastParser || !createDocument(lastParser)) {
                    array.some(dp, createDocument);
                }
            }
            return result;
        };
    }
    var handleNativeResponse = function (response) {
        if (!has("native-xhr2-blob") && response.options.handleAs === "blob" && typeof Blob !== "undefined") {
            return new Blob([response.xhr.response], {type:response.xhr.getResponseHeader("Content-Type")});
        }
        return response.xhr.response;
    };
    var handlers = {"javascript":function (response) {
        return kernel.eval(response.text || "");
    }, "json":function (response) {
        return JSON.parse(response.text || null);
    }, "xml":handleXML, "blob":handleNativeResponse, "arraybuffer":handleNativeResponse, "document":handleNativeResponse};
    function handle(response) {
        var handler = handlers[response.options.handleAs];
        response.data = handler ? handler(response) : (response.data || response.text);
        return response;
    }
    handle.register = function (name, handler) {
        handlers[name] = handler;
    };
    return handle;
});

