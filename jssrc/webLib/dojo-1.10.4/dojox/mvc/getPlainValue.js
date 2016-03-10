//>>built

define("dojox/mvc/getPlainValue", ["dojo/_base/array", "dojo/_base/lang", "dojo/Stateful"], function (array, lang, Stateful) {
    var getPlainValueOptions = {getType:function (v) {
        return lang.isArray(v) ? "array" : v != null && {}.toString.call(v) == "[object Object]" ? "object" : "value";
    }, getPlainArray:function (a) {
        return array.map(a, function (item) {
            return getPlainValue(item, this);
        }, this);
    }, getPlainObject:function (o) {
        var plain = {};
        for (var s in o) {
            if (!(s in Stateful.prototype) && s != "_watchCallbacks") {
                plain[s] = getPlainValue(o[s], this);
            }
        }
        return plain;
    }, getPlainValue:function (v) {
        return v;
    }};
    var getPlainValue = function (value, options) {
        return (options || getPlainValue)["getPlain" + (options || getPlainValue).getType(value).replace(/^[a-z]/, function (c) {
            return c.toUpperCase();
        })](value);
    };
    return lang.setObject("dojox.mvc.getPlainValue", lang.mixin(getPlainValue, getPlainValueOptions));
});

