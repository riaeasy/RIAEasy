//>>built

define("dojox/wire/XmlWire", ["dijit", "dojo", "dojox", "dojo/require!dojox/xml/parser,dojox/wire/Wire"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.wire.XmlWire");
    dojo.require("dojox.xml.parser");
    dojo.require("dojox.wire.Wire");
    dojo.declare("dojox.wire.XmlWire", dojox.wire.Wire, {_wireClass:"dojox.wire.XmlWire", constructor:function (args) {
    }, _getValue:function (object) {
        if (!object || !this.path) {
            return object;
        }
        var node = object;
        var path = this.path;
        var i;
        if (path.charAt(0) == "/") {
            i = path.indexOf("/", 1);
            path = path.substring(i + 1);
        }
        var list = path.split("/");
        var last = list.length - 1;
        for (i = 0; i < last; i++) {
            node = this._getChildNode(node, list[i]);
            if (!node) {
                return undefined;
            }
        }
        var value = this._getNodeValue(node, list[last]);
        return value;
    }, _setValue:function (object, value) {
        if (!this.path) {
            return object;
        }
        var node = object;
        var doc = this._getDocument(node);
        var path = this.path;
        var i;
        if (path.charAt(0) == "/") {
            i = path.indexOf("/", 1);
            if (!node) {
                var name = path.substring(1, i);
                node = doc.createElement(name);
                object = node;
            }
            path = path.substring(i + 1);
        } else {
            if (!node) {
                return undefined;
            }
        }
        var list = path.split("/");
        var last = list.length - 1;
        for (i = 0; i < last; i++) {
            var child = this._getChildNode(node, list[i]);
            if (!child) {
                child = doc.createElement(list[i]);
                node.appendChild(child);
            }
            node = child;
        }
        this._setNodeValue(node, list[last], value);
        return object;
    }, _getNodeValue:function (node, exp) {
        var value = undefined;
        if (exp.charAt(0) == "@") {
            var attribute = exp.substring(1);
            value = node.getAttribute(attribute);
        } else {
            if (exp == "text()") {
                var text = node.firstChild;
                if (text) {
                    value = text.nodeValue;
                }
            } else {
                value = [];
                for (var i = 0; i < node.childNodes.length; i++) {
                    var child = node.childNodes[i];
                    if (child.nodeType === 1 && child.nodeName == exp) {
                        value.push(child);
                    }
                }
            }
        }
        return value;
    }, _setNodeValue:function (node, exp, value) {
        if (exp.charAt(0) == "@") {
            var attribute = exp.substring(1);
            if (value) {
                node.setAttribute(attribute, value);
            } else {
                node.removeAttribute(attribute);
            }
        } else {
            if (exp == "text()") {
                while (node.firstChild) {
                    node.removeChild(node.firstChild);
                }
                if (value) {
                    var text = this._getDocument(node).createTextNode(value);
                    node.appendChild(text);
                }
            }
        }
    }, _getChildNode:function (node, name) {
        var index = 1;
        var i1 = name.indexOf("[");
        if (i1 >= 0) {
            var i2 = name.indexOf("]");
            index = name.substring(i1 + 1, i2);
            name = name.substring(0, i1);
        }
        var count = 1;
        for (var i = 0; i < node.childNodes.length; i++) {
            var child = node.childNodes[i];
            if (child.nodeType === 1 && child.nodeName == name) {
                if (count == index) {
                    return child;
                }
                count++;
            }
        }
        return null;
    }, _getDocument:function (node) {
        if (node) {
            return (node.nodeType == 9 ? node : node.ownerDocument);
        } else {
            return dojox.xml.parser.parse();
        }
    }});
});

