//>>built

define("dojox/dtl/Context", ["dojo/_base/lang", "./_base"], function (lang, dd) {
    return dd.Context = lang.extend(function (dict) {
        this._this = {};
        dd._Context.call(this, dict);
    }, dd._Context.prototype, {getKeys:function () {
        var keys = [];
        for (var key in this) {
            if (this.hasOwnProperty(key) && key != "_this") {
                keys.push(key);
            }
        }
        return keys;
    }, extend:function (obj) {
        return lang.delegate(this, obj);
    }, filter:function (filter) {
        var context = new dd.Context();
        var keys = [];
        var i, arg;
        if (filter instanceof dd.Context) {
            keys = filter.getKeys();
        } else {
            if (typeof filter == "object") {
                for (var key in filter) {
                    keys.push(key);
                }
            } else {
                for (i = 0; arg = arguments[i]; i++) {
                    if (typeof arg == "string") {
                        keys.push(arg);
                    }
                }
            }
        }
        for (i = 0, key; key = keys[i]; i++) {
            context[key] = this[key];
        }
        return context;
    }, setThis:function (scope) {
        this._this = scope;
    }, getThis:function () {
        return this._this;
    }, hasKey:function (key) {
        if (this._getter) {
            var got = this._getter(key);
            if (typeof got != "undefined") {
                return true;
            }
        }
        if (typeof this[key] != "undefined") {
            return true;
        }
        return false;
    }});
});

