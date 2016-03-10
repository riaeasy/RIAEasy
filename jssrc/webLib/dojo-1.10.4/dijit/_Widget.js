//>>built

define("dijit/_Widget", ["dojo/aspect", "dojo/_base/config", "dojo/_base/connect", "dojo/_base/declare", "dojo/has", "dojo/_base/kernel", "dojo/_base/lang", "dojo/query", "dojo/ready", "./registry", "./_WidgetBase", "./_OnDijitClickMixin", "./_FocusMixin", "dojo/uacss", "./hccss"], function (aspect, config, connect, declare, has, kernel, lang, query, ready, registry, _WidgetBase, _OnDijitClickMixin, _FocusMixin) {
    function connectToDomNode() {
    }
    function aroundAdvice(originalConnect) {
        return function (obj, event, scope, method) {
            if (obj && typeof event == "string" && obj[event] == connectToDomNode) {
                return obj.on(event.substring(2).toLowerCase(), lang.hitch(scope, method));
            }
            return originalConnect.apply(connect, arguments);
        };
    }
    aspect.around(connect, "connect", aroundAdvice);
    if (kernel.connect) {
        aspect.around(kernel, "connect", aroundAdvice);
    }
    var _Widget = declare("dijit._Widget", [_WidgetBase, _OnDijitClickMixin, _FocusMixin], {onClick:connectToDomNode, onDblClick:connectToDomNode, onKeyDown:connectToDomNode, onKeyPress:connectToDomNode, onKeyUp:connectToDomNode, onMouseDown:connectToDomNode, onMouseMove:connectToDomNode, onMouseOut:connectToDomNode, onMouseOver:connectToDomNode, onMouseLeave:connectToDomNode, onMouseEnter:connectToDomNode, onMouseUp:connectToDomNode, constructor:function (params) {
        this._toConnect = {};
        for (var name in params) {
            if (this[name] === connectToDomNode) {
                this._toConnect[name.replace(/^on/, "").toLowerCase()] = params[name];
                delete params[name];
            }
        }
    }, postCreate:function () {
        this.inherited(arguments);
        for (var name in this._toConnect) {
            this.on(name, this._toConnect[name]);
        }
        delete this._toConnect;
    }, on:function (type, func) {
        if (this[this._onMap(type)] === connectToDomNode) {
            return connect.connect(this.domNode, type.toLowerCase(), this, func);
        }
        return this.inherited(arguments);
    }, _setFocusedAttr:function (val) {
        this._focused = val;
        this._set("focused", val);
    }, setAttribute:function (attr, value) {
        kernel.deprecated(this.declaredClass + "::setAttribute(attr, value) is deprecated. Use set() instead.", "", "2.0");
        this.set(attr, value);
    }, attr:function (name, value) {
        var args = arguments.length;
        if (args >= 2 || typeof name === "object") {
            return this.set.apply(this, arguments);
        } else {
            return this.get(name);
        }
    }, getDescendants:function () {
        kernel.deprecated(this.declaredClass + "::getDescendants() is deprecated. Use getChildren() instead.", "", "2.0");
        return this.containerNode ? query("[widgetId]", this.containerNode).map(registry.byNode) : [];
    }, _onShow:function () {
        this.onShow();
    }, onShow:function () {
    }, onHide:function () {
    }, onClose:function () {
        return true;
    }});
    if (has("dijit-legacy-requires")) {
        ready(0, function () {
            var requires = ["dijit/_base"];
            require(requires);
        });
    }
    return _Widget;
});

