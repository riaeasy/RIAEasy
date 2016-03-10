//>>built

define("dojox/mvc/equals", ["dojo/_base/array", "dojo/_base/lang", "dojo/Stateful", "./StatefulArray"], function (array, lang, Stateful, StatefulArray) {
    var equalsOptions = {getType:function (v) {
        return lang.isArray(v) ? "array" : lang.isFunction((v || {}).getTime) ? "date" : v != null && ({}.toString.call(v) == "[object Object]" || lang.isFunction((v || {}).set) && lang.isFunction((v || {}).watch)) ? "object" : "value";
    }, equalsArray:function (dst, src) {
        for (var i = 0, l = Math.max(dst.length, src.length); i < l; i++) {
            if (!equals(dst[i], src[i])) {
                return false;
            }
        }
        return true;
    }, equalsDate:function (dst, src) {
        return dst.getTime() == src.getTime();
    }, equalsObject:function (dst, src) {
        var list = lang.mixin({}, dst, src);
        for (var s in list) {
            if (!(s in Stateful.prototype) && s != "_watchCallbacks" && !equals(dst[s], src[s])) {
                return false;
            }
        }
        return true;
    }, equalsValue:function (dst, src) {
        return dst === src;
    }};
    var equals = function (dst, src, options) {
        var opts = options || equals, types = [opts.getType(dst), opts.getType(src)];
        return types[0] != types[1] ? false : opts["equals" + types[0].replace(/^[a-z]/, function (c) {
            return c.toUpperCase();
        })](dst, src);
    };
    return lang.setObject("dojox.mvc.equals", lang.mixin(equals, equalsOptions));
});

