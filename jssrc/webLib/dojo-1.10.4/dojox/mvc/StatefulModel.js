//>>built

define("dojox/mvc/StatefulModel", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/declare", "dojo/Stateful", "./getStateful", "./getPlainValue", "./StatefulArray"], function (kernel, lang, array, declare, Stateful, getStateful, getPlainValue, StatefulArray) {
    kernel.deprecated("dojox/mvc/StatefulModel", "Use dojox/mvc/getStateful, dojox/mvc/getPlainValue, dojox/mvc/StatefulArray or one of the dojox/mvc/*RefControllers instead");
    var StatefulModel = declare("dojox.mvc.StatefulModel", [Stateful], {data:null, store:null, valid:true, value:"", reset:function () {
        if (lang.isObject(this.data) && !(this.data instanceof Date) && !(this.data instanceof RegExp)) {
            for (var x in this) {
                if (this[x] && lang.isFunction(this[x].reset)) {
                    this[x].reset();
                }
            }
        } else {
            this.set("value", this.data);
        }
    }, commit:function (store) {
        this._commit();
        var ds = store || this.store;
        if (ds) {
            this._saveToStore(ds);
        }
    }, toPlainObject:function () {
        return getPlainValue(this, StatefulModel.getPlainValueOptions);
    }, splice:function (idx, n) {
        var a = (new StatefulArray([])).splice.apply(this, lang._toArray(arguments));
        for (var i = 0; i < a.length; i++) {
            (this._removals = this._removals || []).push(a[i].toPlainObject());
        }
        return a;
    }, add:function (name, stateful) {
        if (typeof this.get("length") === "number" && /^[0-9]+$/.test(name.toString())) {
            if (this.get("length") < (name - 0)) {
                throw new Error("Out of bounds insert attempted, must be contiguous.");
            }
            this.splice(name - 0, 0, stateful);
        } else {
            this.set(name, stateful);
        }
    }, remove:function (name) {
        if (typeof this.get("length") === "number" && /^[0-9]+$/.test(name.toString())) {
            if (!this.get(name)) {
                throw new Error("Out of bounds delete attempted - no such index: " + n);
            } else {
                this.splice(name - 0, 1);
            }
        } else {
            var elem = this.get(name);
            if (!elem) {
                throw new Error("Illegal delete attempted - no such property: " + name);
            } else {
                this._removals = this._removals || [];
                this._removals.push(elem.toPlainObject());
                this.set(name, undefined);
                delete this[name];
            }
        }
    }, valueOf:function () {
        return this.toPlainObject();
    }, toString:function () {
        return this.value === "" && this.data ? this.data.toString() : this.value.toString();
    }, constructor:function (args) {
        var data = (args && "data" in args) ? args.data : this.data;
        this._createModel(data);
    }, _createModel:function (data) {
        if (data != null) {
            data = getStateful(data, StatefulModel.getStatefulOptions);
            if (lang.isArray(data)) {
                this.length = 0;
                [].splice.apply(this, data);
            } else {
                if (lang.isObject(data)) {
                    for (var s in data) {
                        if (data.hasOwnProperty(s)) {
                            this[s] = data[s];
                        }
                    }
                } else {
                    this.set("value", data);
                }
            }
        }
    }, _commit:function () {
        for (var x in this) {
            if (this[x] && lang.isFunction(this[x]._commit)) {
                this[x]._commit();
            }
        }
        this.data = this.toPlainObject();
    }, _saveToStore:function (store) {
        if (this._removals) {
            array.forEach(this._removals, function (d) {
                store.remove(store.getIdentity(d));
            }, this);
            delete this._removals;
        }
        var dataToCommit = this.toPlainObject();
        if (lang.isArray(dataToCommit)) {
            array.forEach(dataToCommit, function (d) {
                store.put(d);
            }, this);
        } else {
            store.put(dataToCommit);
        }
    }});
    lang.mixin(StatefulModel, {getStatefulOptions:{getType:function (v) {
        return lang.isArray(v) ? "array" : v != null && {}.toString.call(v) == "[object Object]" ? "object" : "value";
    }, getStatefulArray:function (a) {
        var _self = this, statefularray = lang.mixin(new StatefulArray(array.map(a, function (item) {
            return getStateful(item, _self);
        })));
        for (var s in StatefulModel.prototype) {
            if (s != "set") {
                statefularray[s] = StatefulModel.prototype[s];
            }
        }
        statefularray.data = a;
        return statefularray;
    }, getStatefulObject:function (o) {
        var object = new StatefulModel();
        object.data = o;
        for (var s in o) {
            object.set(s, getStateful(o[s], this));
        }
        return object;
    }, getStatefulValue:function (v) {
        var value = new StatefulModel();
        value.data = v;
        value.set("value", v);
        return value;
    }}, getPlainValueOptions:{getType:function (v) {
        if (lang.isArray(v)) {
            return "array";
        }
        if (lang.isObject(v)) {
            for (var s in v) {
                if (v.hasOwnProperty(s) && s != "value" && (v[s] || {}).get && (v[s] || {}).watch) {
                    return "object";
                }
            }
        }
        return "value";
    }, getPlainArray:function (a) {
        return array.map(a, function (item) {
            return getPlainValue(item, this);
        }, this);
    }, getPlainObject:function (o) {
        var plain = {};
        for (var s in o) {
            if (s == "_watchCallbacks" || (s in StatefulModel.prototype)) {
                continue;
            }
            plain[s] = getPlainValue(o[s], this);
        }
        return plain;
    }, getPlainValue:function (v) {
        return (v || {}).set && (v || {}).watch ? getPlainValue(v.value, this) : v;
    }}});
    return StatefulModel;
});

