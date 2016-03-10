//>>built

define("dojox/form/manager/_Mixin", ["dojo/_base/window", "dojo/_base/lang", "dojo/_base/array", "dojo/on", "dojo/dom-attr", "dojo/dom-class", "dijit/_base/manager", "dijit/_Widget", "dijit/form/_FormWidget", "dijit/form/Button", "dijit/form/CheckBox", "dojo/_base/declare"], function (win, lang, array, on, domAttr, domClass, manager, Widget, FormWidget, Button, CheckBox, declare) {
    var fm = lang.getObject("dojox.form.manager", true), aa = fm.actionAdapter = function (action) {
        return function (name, elems, value) {
            if (lang.isArray(elems)) {
                array.forEach(elems, function (elem) {
                    action.call(this, name, elem, value);
                }, this);
            } else {
                action.apply(this, arguments);
            }
        };
    }, ia = fm.inspectorAdapter = function (inspector) {
        return function (name, elem, value) {
            return inspector.call(this, name, lang.isArray(elem) ? elem[0] : elem, value);
        };
    }, skipNames = {domNode:1, containerNode:1, srcNodeRef:1, bgIframe:1}, keys = fm._keys = function (o) {
        var list = [], key;
        for (key in o) {
            if (o.hasOwnProperty(key)) {
                list.push(key);
            }
        }
        return list;
    }, registerWidget = function (widget) {
        var name = widget.get("name");
        if (name && widget.isInstanceOf(FormWidget)) {
            if (name in this.formWidgets) {
                var a = this.formWidgets[name].widget;
                if (lang.isArray(a)) {
                    a.push(widget);
                } else {
                    this.formWidgets[name].widget = [a, widget];
                }
            } else {
                this.formWidgets[name] = {widget:widget, connections:[]};
            }
        } else {
            name = null;
        }
        return name;
    }, getObserversFromWidget = function (name) {
        var observers = {};
        aa(function (_, w) {
            var o = w.get("data-dojo-observer") || w.get("observer");
            if (o && typeof o == "string") {
                array.forEach(o.split(","), function (o) {
                    o = lang.trim(o);
                    if (o && lang.isFunction(this[o])) {
                        observers[o] = 1;
                    }
                }, this);
            }
        }).call(this, null, this.formWidgets[name].widget);
        return keys(observers);
    }, connectWidget = function (name, observers) {
        var t = this.formWidgets[name], w = t.widget, c = t.connections;
        if (c.length) {
            array.forEach(c, function (item) {
                item.remove();
            });
            c = t.connections = [];
        }
        if (lang.isArray(w)) {
            array.forEach(w, function (w) {
                array.forEach(observers, function (o) {
                    c.push(on(w, "change", lang.hitch(this, function (evt) {
                        if (this.watching && domAttr.get(w.focusNode, "checked")) {
                            this[o](w.get("value"), name, w, evt);
                        }
                    })));
                }, this);
            }, this);
        } else {
            var eventName = w.isInstanceOf(Button) ? "click" : "change";
            array.forEach(observers, function (o) {
                c.push(on(w, eventName, lang.hitch(this, function (evt) {
                    if (this.watching) {
                        this[o](w.get("value"), name, w, evt);
                    }
                })));
            }, this);
        }
    };
    var _Mixin = declare("dojox.form.manager._Mixin", null, {watching:true, startup:function () {
        if (this._started) {
            return;
        }
        this.formWidgets = {};
        this.formNodes = {};
        this.registerWidgetDescendants(this);
        this.inherited(arguments);
    }, destroy:function () {
        for (var name in this.formWidgets) {
            array.forEach(this.formWidgets[name].connections, function (item) {
                item.remove();
            });
        }
        this.formWidgets = {};
        this.inherited(arguments);
    }, registerWidget:function (widget) {
        if (typeof widget == "string") {
            widget = manager.byId(widget);
        } else {
            if (widget.tagName && widget.cloneNode) {
                widget = manager.byNode(widget);
            }
        }
        var name = registerWidget.call(this, widget);
        if (name) {
            connectWidget.call(this, name, getObserversFromWidget.call(this, name));
        }
        return this;
    }, unregisterWidget:function (name) {
        if (name in this.formWidgets) {
            array.forEach(this.formWidgets[name].connections, function (item) {
                item.remove();
            });
            delete this.formWidgets[name];
        }
        return this;
    }, registerWidgetDescendants:function (widget) {
        if (typeof widget == "string") {
            widget = manager.byId(widget);
        } else {
            if (widget.tagName && widget.cloneNode) {
                widget = manager.byNode(widget);
            }
        }
        var widgets = array.map(widget.getDescendants(), registerWidget, this);
        array.forEach(widgets, function (name) {
            if (name) {
                connectWidget.call(this, name, getObserversFromWidget.call(this, name));
            }
        }, this);
        return this.registerNodeDescendants ? this.registerNodeDescendants(widget.domNode) : this;
    }, unregisterWidgetDescendants:function (widget) {
        if (typeof widget == "string") {
            widget = manager.byId(widget);
        } else {
            if (widget.tagName && widget.cloneNode) {
                widget = manager.byNode(widget);
            }
        }
        array.forEach(array.map(widget.getDescendants(), function (w) {
            return w instanceof FormWidget && w.get("name") || null;
        }), function (name) {
            if (name) {
                this.unregisterWidget(name);
            }
        }, this);
        return this.unregisterNodeDescendants ? this.unregisterNodeDescendants(widget.domNode) : this;
    }, formWidgetValue:function (elem, value) {
        var isSetter = arguments.length == 2 && value !== undefined, result;
        if (typeof elem == "string") {
            elem = this.formWidgets[elem];
            if (elem) {
                elem = elem.widget;
            }
        }
        if (!elem) {
            return null;
        }
        if (lang.isArray(elem)) {
            if (isSetter) {
                array.forEach(elem, function (widget) {
                    widget.set("checked", false, !this.watching);
                }, this);
                array.forEach(elem, function (widget) {
                    widget.set("checked", widget.value === value, !this.watching);
                }, this);
                return this;
            }
            array.some(elem, function (widget) {
                if (domAttr.get(widget.focusNode, "checked")) {
                    result = widget;
                    return true;
                }
                return false;
            });
            return result ? result.get("value") : "";
        }
        if (elem.isInstanceOf && elem.isInstanceOf(CheckBox)) {
            if (isSetter) {
                elem.set("value", Boolean(value), !this.watching);
                return this;
            }
            return Boolean(elem.get("value"));
        }
        if (isSetter) {
            elem.set("value", value, !this.watching);
            return this;
        }
        return elem.get("value");
    }, formPointValue:function (elem, value) {
        if (elem && typeof elem == "string") {
            elem = this[elem];
        }
        if (!elem || !elem.tagName || !elem.cloneNode) {
            return null;
        }
        if (!domClass.contains(elem, "dojoFormValue")) {
            return null;
        }
        if (arguments.length == 2 && value !== undefined) {
            elem.innerHTML = value;
            return this;
        }
        return elem.innerHTML;
    }, inspectFormWidgets:function (inspector, state, defaultValue) {
        var name, result = {};
        if (state) {
            if (lang.isArray(state)) {
                array.forEach(state, function (name) {
                    if (name in this.formWidgets) {
                        result[name] = inspector.call(this, name, this.formWidgets[name].widget, defaultValue);
                    }
                }, this);
            } else {
                for (name in state) {
                    if (name in this.formWidgets) {
                        result[name] = inspector.call(this, name, this.formWidgets[name].widget, state[name]);
                    }
                }
            }
        } else {
            for (name in this.formWidgets) {
                result[name] = inspector.call(this, name, this.formWidgets[name].widget, defaultValue);
            }
        }
        return result;
    }, inspectAttachedPoints:function (inspector, state, defaultValue) {
        var name, elem, result = {};
        if (state) {
            if (lang.isArray(state)) {
                array.forEach(state, function (name) {
                    elem = this[name];
                    if (elem && elem.tagName && elem.cloneNode) {
                        result[name] = inspector.call(this, name, elem, defaultValue);
                    }
                }, this);
            } else {
                for (name in state) {
                    elem = this[name];
                    if (elem && elem.tagName && elem.cloneNode) {
                        result[name] = inspector.call(this, name, elem, state[name]);
                    }
                }
            }
        } else {
            for (name in this) {
                if (!(name in skipNames)) {
                    elem = this[name];
                    if (elem && elem.tagName && elem.cloneNode) {
                        result[name] = inspector.call(this, name, elem, defaultValue);
                    }
                }
            }
        }
        return result;
    }, inspect:function (inspector, state, defaultValue) {
        var result = this.inspectFormWidgets(function (name, widget, value) {
            if (lang.isArray(widget)) {
                return inspector.call(this, name, array.map(widget, function (w) {
                    return w.domNode;
                }), value);
            }
            return inspector.call(this, name, widget.domNode, value);
        }, state, defaultValue);
        if (this.inspectFormNodes) {
            lang.mixin(result, this.inspectFormNodes(inspector, state, defaultValue));
        }
        return lang.mixin(result, this.inspectAttachedPoints(inspector, state, defaultValue));
    }});
    lang.extend(Widget, {observer:""});
    return _Mixin;
});

