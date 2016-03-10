//>>built

define("dijit/_WidgetBase", ["require", "dojo/_base/array", "dojo/aspect", "dojo/_base/config", "dojo/_base/connect", "dojo/_base/declare", "dojo/dom", "dojo/dom-attr", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-geometry", "dojo/dom-style", "dojo/has", "dojo/_base/kernel", "dojo/_base/lang", "dojo/on", "dojo/ready", "dojo/Stateful", "dojo/topic", "dojo/_base/window", "./Destroyable", "require", "./registry"], function (require, array, aspect, config, connect, declare, dom, domAttr, domClass, domConstruct, domGeometry, domStyle, has, kernel, lang, on, ready, Stateful, topic, win, Destroyable, _BidiMixin, registry) {
    has.add("dijit-legacy-requires", !kernel.isAsync);
    0 && has.add("dojo-bidi", false);
    if (has("dijit-legacy-requires")) {
        ready(0, function () {
            var requires = ["dijit/_base/manager"];
            require(requires);
        });
    }
    var tagAttrs = {};
    function getAttrs(obj) {
        var ret = {};
        for (var attr in obj) {
            ret[attr.toLowerCase()] = true;
        }
        return ret;
    }
    function nonEmptyAttrToDom(attr) {
        return function (val) {
            domAttr[val ? "set" : "remove"](this.domNode, attr, val);
            this._set(attr, val);
        };
    }
    function isEqual(a, b) {
        return a === b || (a !== a && b !== b);
    }
    var _WidgetBase = declare("dijit._WidgetBase", [Stateful, Destroyable], {id:"", _setIdAttr:"domNode", lang:"", _setLangAttr:nonEmptyAttrToDom("lang"), dir:"", _setDirAttr:nonEmptyAttrToDom("dir"), "class":"", _setClassAttr:{node:"domNode", type:"class"}, _setTypeAttr:null, style:"", title:"", tooltip:"", baseClass:"", srcNodeRef:null, domNode:null, containerNode:null, ownerDocument:null, _setOwnerDocumentAttr:function (val) {
        this._set("ownerDocument", val);
    }, attributeMap:{}, _blankGif:config.blankGif || require.toUrl("dojo/resources/blank.gif"), _introspect:function () {
        var ctor = this.constructor;
        if (!ctor._setterAttrs) {
            var proto = ctor.prototype, attrs = ctor._setterAttrs = [], onMap = (ctor._onMap = {});
            for (var name in proto.attributeMap) {
                attrs.push(name);
            }
            for (name in proto) {
                if (/^on/.test(name)) {
                    onMap[name.substring(2).toLowerCase()] = name;
                }
                if (/^_set[A-Z](.*)Attr$/.test(name)) {
                    name = name.charAt(4).toLowerCase() + name.substr(5, name.length - 9);
                    if (!proto.attributeMap || !(name in proto.attributeMap)) {
                        attrs.push(name);
                    }
                }
            }
        }
    }, postscript:function (params, srcNodeRef) {
        this.create(params, srcNodeRef);
    }, create:function (params, srcNodeRef) {
        this._introspect();
        this.srcNodeRef = dom.byId(srcNodeRef);
        this._connects = [];
        this._supportingWidgets = [];
        if (this.srcNodeRef && (typeof this.srcNodeRef.id == "string")) {
            this.id = this.srcNodeRef.id;
        }
        if (params) {
            this.params = params;
            lang.mixin(this, params);
        }
        this.postMixInProperties();
        if (!this.id) {
            this.id = registry.getUniqueId(this.declaredClass.replace(/\./g, "_"));
            if (this.params) {
                delete this.params.id;
            }
        }
        this.ownerDocument = this.ownerDocument || (this.srcNodeRef ? this.srcNodeRef.ownerDocument : document);
        this.ownerDocumentBody = win.body(this.ownerDocument);
        registry.add(this);
        this.buildRendering();
        var deleteSrcNodeRef;
        if (this.domNode) {
            this._applyAttributes();
            var source = this.srcNodeRef;
            if (source && source.parentNode && this.domNode !== source) {
                source.parentNode.replaceChild(this.domNode, source);
                deleteSrcNodeRef = true;
            }
            this.domNode.setAttribute("widgetId", this.id);
        }
        this.postCreate();
        if (deleteSrcNodeRef) {
            delete this.srcNodeRef;
        }
        this._created = true;
    }, _applyAttributes:function () {
        var params = {};
        for (var key in this.params || {}) {
            params[key] = this._get(key);
        }
        array.forEach(this.constructor._setterAttrs, function (key) {
            if (!(key in params)) {
                var val = this._get(key);
                if (val) {
                    this.set(key, val);
                }
            }
        }, this);
        for (key in params) {
            this.set(key, params[key]);
        }
    }, postMixInProperties:function () {
    }, buildRendering:function () {
        if (!this.domNode) {
            this.domNode = this.srcNodeRef || this.ownerDocument.createElement("div");
        }
        if (this.baseClass) {
            var classes = this.baseClass.split(" ");
            if (!this.isLeftToRight()) {
                classes = classes.concat(array.map(classes, function (name) {
                    return name + "Rtl";
                }));
            }
            domClass.add(this.domNode, classes);
        }
    }, postCreate:function () {
    }, startup:function () {
        if (this._started) {
            return;
        }
        this._started = true;
        array.forEach(this.getChildren(), function (obj) {
            if (!obj._started && !obj._destroyed && lang.isFunction(obj.startup)) {
                obj.startup();
                obj._started = true;
            }
        });
    }, destroyRecursive:function (preserveDom) {
        this._beingDestroyed = true;
        this.destroyDescendants(preserveDom);
        this.destroy(preserveDom);
    }, destroy:function (preserveDom) {
        this._beingDestroyed = true;
        this.uninitialize();
        function destroy(w) {
            if (w.destroyRecursive) {
                w.destroyRecursive(preserveDom);
            } else {
                if (w.destroy) {
                    w.destroy(preserveDom);
                }
            }
        }
        array.forEach(this._connects, lang.hitch(this, "disconnect"));
        array.forEach(this._supportingWidgets, destroy);
        if (this.domNode) {
            array.forEach(registry.findWidgets(this.domNode, this.containerNode), destroy);
        }
        this.destroyRendering(preserveDom);
        registry.remove(this.id);
        this._destroyed = true;
    }, destroyRendering:function (preserveDom) {
        if (this.bgIframe) {
            this.bgIframe.destroy(preserveDom);
            delete this.bgIframe;
        }
        if (this.domNode) {
            if (preserveDom) {
                domAttr.remove(this.domNode, "widgetId");
            } else {
                domConstruct.destroy(this.domNode);
            }
            delete this.domNode;
        }
        if (this.srcNodeRef) {
            if (!preserveDom) {
                domConstruct.destroy(this.srcNodeRef);
            }
            delete this.srcNodeRef;
        }
    }, destroyDescendants:function (preserveDom) {
        array.forEach(this.getChildren(), function (widget) {
            if (widget.destroyRecursive) {
                widget.destroyRecursive(preserveDom);
            }
        });
    }, uninitialize:function () {
        return false;
    }, _setStyleAttr:function (value) {
        var mapNode = this.domNode;
        if (lang.isObject(value)) {
            domStyle.set(mapNode, value);
        } else {
            if (mapNode.style.cssText) {
                mapNode.style.cssText += "; " + value;
            } else {
                mapNode.style.cssText = value;
            }
        }
        this._set("style", value);
    }, _attrToDom:function (attr, value, commands) {
        commands = arguments.length >= 3 ? commands : this.attributeMap[attr];
        array.forEach(lang.isArray(commands) ? commands : [commands], function (command) {
            var mapNode = this[command.node || command || "domNode"];
            var type = command.type || "attribute";
            switch (type) {
              case "attribute":
                if (lang.isFunction(value)) {
                    value = lang.hitch(this, value);
                }
                var attrName = command.attribute ? command.attribute : (/^on[A-Z][a-zA-Z]*$/.test(attr) ? attr.toLowerCase() : attr);
                if (mapNode.tagName) {
                    domAttr.set(mapNode, attrName, value);
                } else {
                    mapNode.set(attrName, value);
                }
                break;
              case "innerText":
                mapNode.innerHTML = "";
                mapNode.appendChild(this.ownerDocument.createTextNode(value));
                break;
              case "innerHTML":
                mapNode.innerHTML = value;
                break;
              case "class":
                domClass.replace(mapNode, value, this[attr]);
                break;
            }
        }, this);
    }, get:function (name) {
        var names = this._getAttrNames(name);
        return this[names.g] ? this[names.g]() : this._get(name);
    }, set:function (name, value) {
        if (typeof name === "object") {
            for (var x in name) {
                this.set(x, name[x]);
            }
            return this;
        }
        var names = this._getAttrNames(name), setter = this[names.s];
        if (lang.isFunction(setter)) {
            var result = setter.apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            var defaultNode = this.focusNode && !lang.isFunction(this.focusNode) ? "focusNode" : "domNode", tag = this[defaultNode] && this[defaultNode].tagName, attrsForTag = tag && (tagAttrs[tag] || (tagAttrs[tag] = getAttrs(this[defaultNode]))), map = name in this.attributeMap ? this.attributeMap[name] : names.s in this ? this[names.s] : ((attrsForTag && names.l in attrsForTag && typeof value != "function") || /^aria-|^data-|^role$/.test(name)) ? defaultNode : null;
            if (map != null) {
                this._attrToDom(name, value, map);
            }
            this._set(name, value);
        }
        return result || this;
    }, _attrPairNames:{}, _getAttrNames:function (name) {
        var apn = this._attrPairNames;
        if (apn[name]) {
            return apn[name];
        }
        var uc = name.replace(/^[a-z]|-[a-zA-Z]/g, function (c) {
            return c.charAt(c.length - 1).toUpperCase();
        });
        return (apn[name] = {n:name + "Node", s:"_set" + uc + "Attr", g:"_get" + uc + "Attr", l:uc.toLowerCase()});
    }, _set:function (name, value) {
        var oldValue = this[name];
        this[name] = value;
        if (this._created && !isEqual(oldValue, value)) {
            if (this._watchCallbacks) {
                this._watchCallbacks(name, oldValue, value);
            }
            this.emit("attrmodified-" + name, {detail:{prevValue:oldValue, newValue:value}});
        }
    }, _get:function (name) {
        return this[name];
    }, emit:function (type, eventObj, callbackArgs) {
        eventObj = eventObj || {};
        if (eventObj.bubbles === undefined) {
            eventObj.bubbles = true;
        }
        if (eventObj.cancelable === undefined) {
            eventObj.cancelable = true;
        }
        if (!eventObj.detail) {
            eventObj.detail = {};
        }
        eventObj.detail.widget = this;
        var ret, callback = this["on" + type];
        if (callback) {
            ret = callback.apply(this, callbackArgs ? callbackArgs : [eventObj]);
        }
        if (this._started && !this._beingDestroyed) {
            on.emit(this.domNode, type.toLowerCase(), eventObj);
        }
        return ret;
    }, on:function (type, func) {
        var widgetMethod = this._onMap(type);
        if (widgetMethod) {
            return aspect.after(this, widgetMethod, func, true);
        }
        return this.own(on(this.domNode, type, func))[0];
    }, _onMap:function (type) {
        var ctor = this.constructor, map = ctor._onMap;
        if (!map) {
            map = (ctor._onMap = {});
            for (var attr in ctor.prototype) {
                if (/^on/.test(attr)) {
                    map[attr.replace(/^on/, "").toLowerCase()] = attr;
                }
            }
        }
        return map[typeof type == "string" && type.toLowerCase()];
    }, toString:function () {
        return "[Widget " + this.declaredClass + ", " + (this.id || "NO ID") + "]";
    }, getChildren:function () {
        return this.containerNode ? registry.findWidgets(this.containerNode) : [];
    }, getParent:function () {
        return registry.getEnclosingWidget(this.domNode.parentNode);
    }, connect:function (obj, event, method) {
        return this.own(connect.connect(obj, event, this, method))[0];
    }, disconnect:function (handle) {
        handle.remove();
    }, subscribe:function (t, method) {
        return this.own(topic.subscribe(t, lang.hitch(this, method)))[0];
    }, unsubscribe:function (handle) {
        handle.remove();
    }, isLeftToRight:function () {
        return this.dir ? (this.dir.toLowerCase() == "ltr") : domGeometry.isBodyLtr(this.ownerDocument);
    }, isFocusable:function () {
        return this.focus && (domStyle.get(this.domNode, "display") != "none");
    }, placeAt:function (reference, position) {
        var refWidget = !reference.tagName && registry.byId(reference);
        if (refWidget && refWidget.addChild && (!position || typeof position === "number")) {
            refWidget.addChild(this, position);
        } else {
            var ref = refWidget && ("domNode" in refWidget) ? (refWidget.containerNode && !/after|before|replace/.test(position || "") ? refWidget.containerNode : refWidget.domNode) : dom.byId(reference, this.ownerDocument);
            domConstruct.place(this.domNode, ref, position);
            if (!this._started && (this.getParent() || {})._started) {
                this.startup();
            }
        }
        return this;
    }, defer:function (fcn, delay) {
        var timer = setTimeout(lang.hitch(this, function () {
            if (!timer) {
                return;
            }
            timer = null;
            if (!this._destroyed) {
                lang.hitch(this, fcn)();
            }
        }), delay || 0);
        return {remove:function () {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            return null;
        }};
    }});
    if (0) {
        _WidgetBase.extend(_BidiMixin);
    }
    return _WidgetBase;
});

