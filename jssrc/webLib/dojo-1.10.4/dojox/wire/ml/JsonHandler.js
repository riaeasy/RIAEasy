//>>built

define("dojox/wire/ml/JsonHandler", ["dijit", "dojo", "dojox", "dojo/require!dojox/wire/ml/RestHandler,dojox/wire/_base,dojox/wire/ml/util"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.wire.ml.JsonHandler");
    dojo.require("dojox.wire.ml.RestHandler");
    dojo.require("dojox.wire._base");
    dojo.require("dojox.wire.ml.util");
    dojo.declare("dojox.wire.ml.JsonHandler", dojox.wire.ml.RestHandler, {contentType:"text/json", handleAs:"json", headers:{"Accept":"*/json"}, _getContent:function (method, parameters) {
        var content = null;
        if (method == "POST" || method == "PUT") {
            var p = (parameters ? parameters[0] : undefined);
            if (p) {
                if (dojo.isString(p)) {
                    content = p;
                } else {
                    content = dojo.toJson(p);
                }
            }
        }
        return content;
    }});
});

