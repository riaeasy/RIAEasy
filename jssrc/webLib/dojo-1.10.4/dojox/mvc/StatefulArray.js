//>>built

define("dojox/mvc/StatefulArray", ["dojo/_base/lang", "dojo/Stateful"], function (lang, Stateful) {
    function update(a) {
        if (a._watchElementCallbacks) {
            a._watchElementCallbacks();
        }
        return a;
    }
    var StatefulArray = function (a) {
        var array = lang._toArray(a || []);
        var ctor = StatefulArray;
        array.constructor = ctor;
        return lang.mixin(array, {pop:function () {
            return this.splice(this.get("length") - 1, 1)[0];
        }, push:function () {
            this.splice.apply(this, [this.get("length"), 0].concat(lang._toArray(arguments)));
            return this.get("length");
        }, reverse:function () {
            return update([].reverse.apply(this, lang._toArray(arguments)));
        }, shift:function () {
            return this.splice(0, 1)[0];
        }, sort:function () {
            return update([].sort.apply(this, lang._toArray(arguments)));
        }, splice:function (idx, n) {
            var l = this.get("length");
            idx += idx < 0 ? l : 0;
            var p = Math.min(idx, l), removals = this.slice(idx, idx + n), adds = lang._toArray(arguments).slice(2);
            [].splice.apply(this, [idx, n].concat(new Array(adds.length)));
            for (var i = 0; i < adds.length; i++) {
                this[p + i] = adds[i];
            }
            if (this._watchElementCallbacks) {
                this._watchElementCallbacks(idx, removals, adds);
            }
            if (this._watchCallbacks) {
                this._watchCallbacks("length", l, l - removals.length + adds.length);
            }
            return removals;
        }, unshift:function () {
            this.splice.apply(this, [0, 0].concat(lang._toArray(arguments)));
            return this.get("length");
        }, concat:function (a) {
            return new StatefulArray([].concat.apply(this, arguments));
        }, join:function (sep) {
            var list = [];
            for (var l = this.get("length"), i = 0; i < l; i++) {
                list.push(this.get(i));
            }
            return list.join(sep);
        }, slice:function (start, end) {
            var l = this.get("length");
            start += start < 0 ? l : 0;
            end = (end === void 0 ? l : end) + (end < 0 ? l : 0);
            var slice = [];
            for (var i = start || 0; i < Math.min(end, this.get("length")); i++) {
                slice.push(this.get(i));
            }
            return new StatefulArray(slice);
        }, watchElements:function (callback) {
            var callbacks = this._watchElementCallbacks, _self = this;
            if (!callbacks) {
                callbacks = this._watchElementCallbacks = function (idx, removals, adds) {
                    for (var list = [].concat(callbacks.list), i = 0; i < list.length; i++) {
                        list[i].call(_self, idx, removals, adds);
                    }
                };
                callbacks.list = [];
            }
            callbacks.list.push(callback);
            var h = {};
            h.unwatch = h.remove = function () {
                for (var list = callbacks.list, i = 0; i < list.length; i++) {
                    if (list[i] == callback) {
                        list.splice(i, 1);
                        break;
                    }
                }
            };
            return h;
        }}, Stateful.prototype, {set:function (name, value) {
            if (name == "length") {
                var old = this.get("length");
                if (old < value) {
                    this.splice.apply(this, [old, 0].concat(new Array(value - old)));
                } else {
                    if (value < old) {
                        this.splice.apply(this, [value, old - value]);
                    }
                }
                return this;
            } else {
                var oldLength = this.length;
                Stateful.prototype.set.call(this, name, value);
                if (oldLength != this.length) {
                    Stateful.prototype.set.call(this, "length", this.length);
                }
                return this;
            }
        }, isInstanceOf:function (cls) {
            return Stateful.prototype.isInstanceOf.apply(this, arguments) || cls == StatefulArray;
        }});
    };
    StatefulArray._meta = {bases:[Stateful]};
    return lang.setObject("dojox.mvc.StatefulArray", StatefulArray);
});

