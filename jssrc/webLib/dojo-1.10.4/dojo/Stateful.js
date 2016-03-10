//>>built

define("dojo/Stateful", ["./_base/declare", "./_base/lang", "./_base/array", "./when"], function (declare, lang, array, when) {
    return declare("dojo.Stateful", null, {_attrPairNames:{}, _getAttrNames:function (name) {
        var apn = this._attrPairNames;
        if (apn[name]) {
            return apn[name];
        }
        return (apn[name] = {s:"_" + name + "Setter", g:"_" + name + "Getter"});
    }, postscript:function (params) {
        if (params) {
            this.set(params);
        }
    }, _get:function (name, names) {
        return typeof this[names.g] === "function" ? this[names.g]() : this[name];
    }, get:function (name) {
        return this._get(name, this._getAttrNames(name));
    }, set:function (name, value) {
        if (typeof name === "object") {
            for (var x in name) {
                if (name.hasOwnProperty(x) && x != "_watchCallbacks") {
                    this.set(x, name[x]);
                }
            }
            return this;
        }
        var names = this._getAttrNames(name), oldValue = this._get(name, names), setter = this[names.s], result;
        if (typeof setter === "function") {
            result = setter.apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            this[name] = value;
        }
        if (this._watchCallbacks) {
            var self = this;
            when(result, function () {
                self._watchCallbacks(name, oldValue, value);
            });
        }
        return this;
    }, _changeAttrValue:function (name, value) {
        var oldValue = this.get(name);
        this[name] = value;
        if (this._watchCallbacks) {
            this._watchCallbacks(name, oldValue, value);
        }
        return this;
    }, watch:function (name, callback) {
        var callbacks = this._watchCallbacks;
        if (!callbacks) {
            var self = this;
            callbacks = this._watchCallbacks = function (name, oldValue, value, ignoreCatchall) {
                var notify = function (propertyCallbacks) {
                    if (propertyCallbacks) {
                        propertyCallbacks = propertyCallbacks.slice();
                        for (var i = 0, l = propertyCallbacks.length; i < l; i++) {
                            propertyCallbacks[i].call(self, name, oldValue, value);
                        }
                    }
                };
                notify(callbacks["_" + name]);
                if (!ignoreCatchall) {
                    notify(callbacks["*"]);
                }
            };
        }
        if (!callback && typeof name === "function") {
            callback = name;
            name = "*";
        } else {
            name = "_" + name;
        }
        var propertyCallbacks = callbacks[name];
        if (typeof propertyCallbacks !== "object") {
            propertyCallbacks = callbacks[name] = [];
        }
        propertyCallbacks.push(callback);
        var handle = {};
        handle.unwatch = handle.remove = function () {
            var index = array.indexOf(propertyCallbacks, callback);
            if (index > -1) {
                propertyCallbacks.splice(index, 1);
            }
        };
        return handle;
    }});
});

