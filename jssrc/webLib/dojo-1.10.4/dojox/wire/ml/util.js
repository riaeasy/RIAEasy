//>>built

define("dojox/wire/ml/util", ["dijit", "dojo", "dojox", "dojo/require!dojox/xml/parser,dojox/wire/Wire"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.wire.ml.util");
    dojo.require("dojox.xml.parser");
    dojo.require("dojox.wire.Wire");
    dojox.wire.ml._getValue = function (source, args) {
        if (!source) {
            return undefined;
        }
        var property = undefined;
        if (args && source.length >= 9 && source.substring(0, 9) == "arguments") {
            property = source.substring(9);
            return new dojox.wire.Wire({property:property}).getValue(args);
        }
        var i = source.indexOf(".");
        if (i >= 0) {
            property = source.substring(i + 1);
            source = source.substring(0, i);
        }
        var object = (dijit.byId(source) || dojo.byId(source) || dojo.getObject(source));
        if (!object) {
            return undefined;
        }
        if (!property) {
            return object;
        } else {
            return new dojox.wire.Wire({object:object, property:property}).getValue();
        }
    };
    dojox.wire.ml._setValue = function (target, value) {
        if (!target) {
            return;
        }
        var i = target.indexOf(".");
        if (i < 0) {
            return;
        }
        var object = this._getValue(target.substring(0, i));
        if (!object) {
            return;
        }
        var property = target.substring(i + 1);
        var wire = new dojox.wire.Wire({object:object, property:property}).setValue(value);
    };
    dojo.declare("dojox.wire.ml.XmlElement", null, {constructor:function (element) {
        if (dojo.isString(element)) {
            element = this._getDocument().createElement(element);
        }
        this.element = element;
    }, getPropertyValue:function (property) {
        var value = undefined;
        if (!this.element) {
            return value;
        }
        if (!property) {
            return value;
        }
        if (property.charAt(0) == "@") {
            var attribute = property.substring(1);
            value = this.element.getAttribute(attribute);
        } else {
            if (property == "text()") {
                var text = this.element.firstChild;
                if (text) {
                    value = text.nodeValue;
                }
            } else {
                var elements = [];
                for (var i = 0; i < this.element.childNodes.length; i++) {
                    var child = this.element.childNodes[i];
                    if (child.nodeType === 1 && child.nodeName == property) {
                        elements.push(new dojox.wire.ml.XmlElement(child));
                    }
                }
                if (elements.length > 0) {
                    if (elements.length === 1) {
                        value = elements[0];
                    } else {
                        value = elements;
                    }
                }
            }
        }
        return value;
    }, setPropertyValue:function (property, value) {
        var i;
        var text;
        if (!this.element) {
            return;
        }
        if (!property) {
            return;
        }
        if (property.charAt(0) == "@") {
            var attribute = property.substring(1);
            if (value) {
                this.element.setAttribute(attribute, value);
            } else {
                this.element.removeAttribute(attribute);
            }
        } else {
            if (property == "text()") {
                while (this.element.firstChild) {
                    this.element.removeChild(this.element.firstChild);
                }
                if (value) {
                    text = this._getDocument().createTextNode(value);
                    this.element.appendChild(text);
                }
            } else {
                var nextChild = null;
                var child;
                for (i = this.element.childNodes.length - 1; i >= 0; i--) {
                    child = this.element.childNodes[i];
                    if (child.nodeType === 1 && child.nodeName == property) {
                        if (!nextChild) {
                            nextChild = child.nextSibling;
                        }
                        this.element.removeChild(child);
                    }
                }
                if (value) {
                    if (dojo.isArray(value)) {
                        for (i in value) {
                            var e = value[i];
                            if (e.element) {
                                this.element.insertBefore(e.element, nextChild);
                            }
                        }
                    } else {
                        if (value instanceof dojox.wire.ml.XmlElement) {
                            if (value.element) {
                                this.element.insertBefore(value.element, nextChild);
                            }
                        } else {
                            child = this._getDocument().createElement(property);
                            text = this._getDocument().createTextNode(value);
                            child.appendChild(text);
                            this.element.insertBefore(child, nextChild);
                        }
                    }
                }
            }
        }
    }, toString:function () {
        var s = "";
        if (this.element) {
            var text = this.element.firstChild;
            if (text) {
                s = text.nodeValue;
            }
        }
        return s;
    }, toObject:function () {
        if (!this.element) {
            return null;
        }
        var text = "";
        var obj = {};
        var elements = 0;
        var i;
        for (i = 0; i < this.element.childNodes.length; i++) {
            var child = this.element.childNodes[i];
            if (child.nodeType === 1) {
                elements++;
                var o = new dojox.wire.ml.XmlElement(child).toObject();
                var name = child.nodeName;
                var p = obj[name];
                if (!p) {
                    obj[name] = o;
                } else {
                    if (dojo.isArray(p)) {
                        p.push(o);
                    } else {
                        obj[name] = [p, o];
                    }
                }
            } else {
                if (child.nodeType === 3 || child.nodeType === 4) {
                    text += child.nodeValue;
                }
            }
        }
        var attributes = 0;
        if (this.element.nodeType === 1) {
            attributes = this.element.attributes.length;
            for (i = 0; i < attributes; i++) {
                var attr = this.element.attributes[i];
                obj["@" + attr.nodeName] = attr.nodeValue;
            }
        }
        if (elements === 0) {
            if (attributes === 0) {
                return text;
            }
            obj["text()"] = text;
        }
        return obj;
    }, _getDocument:function () {
        if (this.element) {
            return (this.element.nodeType == 9 ? this.element : this.element.ownerDocument);
        } else {
            return dojox.xml.parser.parse();
        }
    }});
});

