//>>built

define("dojox/wire/ml/XmlHandler", ["dijit", "dojo", "dojox", "dojo/require!dojox/wire/ml/RestHandler,dojox/xml/parser,dojox/wire/_base,dojox/wire/ml/util"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.wire.ml.XmlHandler");
    dojo.require("dojox.wire.ml.RestHandler");
    dojo.require("dojox.xml.parser");
    dojo.require("dojox.wire._base");
    dojo.require("dojox.wire.ml.util");
    dojo.declare("dojox.wire.ml.XmlHandler", dojox.wire.ml.RestHandler, {contentType:"text/xml", handleAs:"xml", _getContent:function (method, parameters) {
        var content = null;
        if (method == "POST" || method == "PUT") {
            var p = parameters[0];
            if (p) {
                if (dojo.isString(p)) {
                    content = p;
                } else {
                    var element = p;
                    if (element instanceof dojox.wire.ml.XmlElement) {
                        element = element.element;
                    } else {
                        if (element.nodeType === 9) {
                            element = element.documentElement;
                        }
                    }
                    var declaration = "<?xml version=\"1.0\"?>";
                    content = declaration + dojox.xml.parser.innerXML(element);
                }
            }
        }
        return content;
    }, _getResult:function (data) {
        if (data) {
            data = new dojox.wire.ml.XmlElement(data);
        }
        return data;
    }});
});

