//>>built

define("dijit/form/_FormMixin", ["dojo/_base/array", "dojo/_base/declare", "dojo/_base/kernel", "dojo/_base/lang", "dojo/on", "dojo/window"], function (array, declare, kernel, lang, on, winUtils) {
    return declare("dijit.form._FormMixin", null, {state:"", _getDescendantFormWidgets:function (children) {
        var res = [];
        array.forEach(children || this.getChildren(), function (child) {
            if ("value" in child) {
                res.push(child);
            } else {
                res = res.concat(this._getDescendantFormWidgets(child.getChildren()));
            }
        }, this);
        return res;
    }, reset:function () {
        array.forEach(this._getDescendantFormWidgets(), function (widget) {
            if (widget.reset) {
                widget.reset();
            }
        });
    }, validate:function () {
        var didFocus = false;
        return array.every(array.map(this._getDescendantFormWidgets(), function (widget) {
            widget._hasBeenBlurred = true;
            var valid = widget.disabled || !widget.validate || widget.validate();
            if (!valid && !didFocus) {
                winUtils.scrollIntoView(widget.containerNode || widget.domNode);
                widget.focus();
                didFocus = true;
            }
            return valid;
        }), function (item) {
            return item;
        });
    }, setValues:function (val) {
        kernel.deprecated(this.declaredClass + "::setValues() is deprecated. Use set('value', val) instead.", "", "2.0");
        return this.set("value", val);
    }, _setValueAttr:function (obj) {
        var map = {};
        array.forEach(this._getDescendantFormWidgets(), function (widget) {
            if (!widget.name) {
                return;
            }
            var entry = map[widget.name] || (map[widget.name] = []);
            entry.push(widget);
        });
        for (var name in map) {
            if (!map.hasOwnProperty(name)) {
                continue;
            }
            var widgets = map[name], values = lang.getObject(name, false, obj);
            if (values === undefined) {
                continue;
            }
            values = [].concat(values);
            if (typeof widgets[0].checked == "boolean") {
                array.forEach(widgets, function (w) {
                    w.set("value", array.indexOf(values, w._get("value")) != -1);
                });
            } else {
                if (widgets[0].multiple) {
                    widgets[0].set("value", values);
                } else {
                    array.forEach(widgets, function (w, i) {
                        w.set("value", values[i]);
                    });
                }
            }
        }
    }, getValues:function () {
        kernel.deprecated(this.declaredClass + "::getValues() is deprecated. Use get('value') instead.", "", "2.0");
        return this.get("value");
    }, _getValueAttr:function () {
        var obj = {};
        array.forEach(this._getDescendantFormWidgets(), function (widget) {
            var name = widget.name;
            if (!name || widget.disabled) {
                return;
            }
            var value = widget.get("value");
            if (typeof widget.checked == "boolean") {
                if (/Radio/.test(widget.declaredClass)) {
                    if (value !== false) {
                        lang.setObject(name, value, obj);
                    } else {
                        value = lang.getObject(name, false, obj);
                        if (value === undefined) {
                            lang.setObject(name, null, obj);
                        }
                    }
                } else {
                    var ary = lang.getObject(name, false, obj);
                    if (!ary) {
                        ary = [];
                        lang.setObject(name, ary, obj);
                    }
                    if (value !== false) {
                        ary.push(value);
                    }
                }
            } else {
                var prev = lang.getObject(name, false, obj);
                if (typeof prev != "undefined") {
                    if (lang.isArray(prev)) {
                        prev.push(value);
                    } else {
                        lang.setObject(name, [prev, value], obj);
                    }
                } else {
                    lang.setObject(name, value, obj);
                }
            }
        });
        return obj;
    }, isValid:function () {
        return this.state == "";
    }, onValidStateChange:function () {
    }, _getState:function () {
        var states = array.map(this._descendants, function (w) {
            return w.get("state") || "";
        });
        return array.indexOf(states, "Error") >= 0 ? "Error" : array.indexOf(states, "Incomplete") >= 0 ? "Incomplete" : "";
    }, disconnectChildren:function () {
    }, connectChildren:function (inStartup) {
        this._descendants = this._getDescendantFormWidgets();
        array.forEach(this._descendants, function (child) {
            if (!child._started) {
                child.startup();
            }
        });
        if (!inStartup) {
            this._onChildChange();
        }
    }, _onChildChange:function (attr) {
        if (!attr || attr == "state" || attr == "disabled") {
            this._set("state", this._getState());
        }
        if (!attr || attr == "value" || attr == "disabled" || attr == "checked") {
            if (this._onChangeDelayTimer) {
                this._onChangeDelayTimer.remove();
            }
            this._onChangeDelayTimer = this.defer(function () {
                delete this._onChangeDelayTimer;
                this._set("value", this.get("value"));
            }, 10);
        }
    }, startup:function () {
        this.inherited(arguments);
        this._descendants = this._getDescendantFormWidgets();
        this.value = this.get("value");
        this.state = this._getState();
        var self = this;
        this.own(on(this.containerNode, "attrmodified-state, attrmodified-disabled, attrmodified-value, attrmodified-checked", function (evt) {
            if (evt.target == self.domNode) {
                return;
            }
            self._onChildChange(evt.type.replace("attrmodified-", ""));
        }));
        this.watch("state", function (attr, oldVal, newVal) {
            this.onValidStateChange(newVal == "");
        });
    }, destroy:function () {
        this.inherited(arguments);
    }});
});

