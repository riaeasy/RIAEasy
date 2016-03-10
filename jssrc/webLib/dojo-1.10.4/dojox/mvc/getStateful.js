//>>built

define("dojox/mvc/getStateful", ["dojo/_base/array", "dojo/_base/lang", "dojo/Stateful", "./StatefulArray"], function (array, lang, Stateful, StatefulArray) {
    var getStatefulOptions = {getType:function (v) {
        return lang.isArray(v) ? "array" : v != null && {}.toString.call(v) == "[object Object]" ? "object" : "value";
    }, getStatefulArray:function (a) {
        return new StatefulArray(array.map(a, function (item) {
            return getStateful(item, this);
        }, this));
    }, getStatefulObject:function (o) {
        var stateful = new Stateful();
        for (var s in o) {
            stateful[s] = getStateful(o[s], this);
        }
        return stateful;
    }, getStatefulValue:function (v) {
        return v;
    }};
    var getStateful = function (value, options) {
        return (options || getStateful)["getStateful" + (options || getStateful).getType(value).replace(/^[a-z]/, function (c) {
            return c.toUpperCase();
        })](value);
    };
    return lang.setObject("dojox.mvc.getStateful", lang.mixin(getStateful, getStatefulOptions));
});

