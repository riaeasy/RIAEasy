//>>built

define("dijit/_AttachMixin", ["require", "dojo/_base/array", "dojo/_base/connect", "dojo/_base/declare", "dojo/_base/lang", "dojo/mouse", "dojo/on", "dojo/touch", "./_WidgetBase"], function (require, array, connect, declare, lang, mouse, on, touch, _WidgetBase) {
    var synthEvents = lang.delegate(touch, {"mouseenter":mouse.enter, "mouseleave":mouse.leave, "keypress":connect._keypress});
    var a11yclick;
    var _AttachMixin = declare("dijit._AttachMixin", null, {constructor:function () {
        this._attachPoints = [];
        this._attachEvents = [];
    }, buildRendering:function () {
        this.inherited(arguments);
        this._attachTemplateNodes(this.domNode);
        this._beforeFillContent();
    }, _beforeFillContent:function () {
    }, _attachTemplateNodes:function (rootNode) {
        var node = rootNode;
        while (true) {
            if (node.nodeType == 1 && (this._processTemplateNode(node, function (n, p) {
                return n.getAttribute(p);
            }, this._attach) || this.searchContainerNode) && node.firstChild) {
                node = node.firstChild;
            } else {
                if (node == rootNode) {
                    return;
                }
                while (!node.nextSibling) {
                    node = node.parentNode;
                    if (node == rootNode) {
                        return;
                    }
                }
                node = node.nextSibling;
            }
        }
    }, _processTemplateNode:function (baseNode, getAttrFunc, attachFunc) {
        var ret = true;
        var _attachScope = this.attachScope || this, attachPoint = getAttrFunc(baseNode, "dojoAttachPoint") || getAttrFunc(baseNode, "data-dojo-attach-point");
        if (attachPoint) {
            var point, points = attachPoint.split(/\s*,\s*/);
            while ((point = points.shift())) {
                if (lang.isArray(_attachScope[point])) {
                    _attachScope[point].push(baseNode);
                } else {
                    _attachScope[point] = baseNode;
                }
                ret = (point != "containerNode");
                this._attachPoints.push(point);
            }
        }
        var attachEvent = getAttrFunc(baseNode, "dojoAttachEvent") || getAttrFunc(baseNode, "data-dojo-attach-event");
        if (attachEvent) {
            var event, events = attachEvent.split(/\s*,\s*/);
            var trim = lang.trim;
            while ((event = events.shift())) {
                if (event) {
                    var thisFunc = null;
                    if (event.indexOf(":") != -1) {
                        var funcNameArr = event.split(":");
                        event = trim(funcNameArr[0]);
                        thisFunc = trim(funcNameArr[1]);
                    } else {
                        event = trim(event);
                    }
                    if (!thisFunc) {
                        thisFunc = event;
                    }
                    this._attachEvents.push(attachFunc(baseNode, event, lang.hitch(_attachScope, thisFunc)));
                }
            }
        }
        return ret;
    }, _attach:function (node, type, func) {
        type = type.replace(/^on/, "").toLowerCase();
        if (type == "dijitclick") {
            type = a11yclick || (a11yclick = require("./a11yclick"));
        } else {
            type = synthEvents[type] || type;
        }
        return on(node, type, func);
    }, _detachTemplateNodes:function () {
        var _attachScope = this.attachScope || this;
        array.forEach(this._attachPoints, function (point) {
            delete _attachScope[point];
        });
        this._attachPoints = [];
        array.forEach(this._attachEvents, function (handle) {
            handle.remove();
        });
        this._attachEvents = [];
    }, destroyRendering:function () {
        this._detachTemplateNodes();
        this.inherited(arguments);
    }});
    lang.extend(_WidgetBase, {dojoAttachEvent:"", dojoAttachPoint:""});
    return _AttachMixin;
});

