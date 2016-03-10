//>>built

define("dojox/lang/utils", ["..", "dojo/_base/lang"], function (dojox, lang) {
    var du = lang.getObject("lang.utils", true, dojox);
    var empty = {}, opts = Object.prototype.toString;
    var clone = function (o) {
        if (o) {
            switch (opts.call(o)) {
              case "[object Array]":
                return o.slice(0);
              case "[object Object]":
                return lang.delegate(o);
            }
        }
        return o;
    };
    lang.mixin(du, {coerceType:function (target, source) {
        switch (typeof target) {
          case "number":
            return Number(eval("(" + source + ")"));
          case "string":
            return String(source);
          case "boolean":
            return Boolean(eval("(" + source + ")"));
        }
        return eval("(" + source + ")");
    }, updateWithObject:function (target, source, conv) {
        if (!source) {
            return target;
        }
        for (var x in target) {
            if (x in source && !(x in empty)) {
                var t = target[x];
                if (t && typeof t == "object") {
                    du.updateWithObject(t, source[x], conv);
                } else {
                    target[x] = conv ? du.coerceType(t, source[x]) : clone(source[x]);
                }
            }
        }
        return target;
    }, updateWithPattern:function (target, source, pattern, conv) {
        if (!source || !pattern) {
            return target;
        }
        for (var x in pattern) {
            if (x in source && !(x in empty)) {
                target[x] = conv ? du.coerceType(pattern[x], source[x]) : clone(source[x]);
            }
        }
        return target;
    }, merge:function (object, mixin) {
        if (mixin) {
            var otype = opts.call(object), mtype = opts.call(mixin), t, i, l, m;
            switch (mtype) {
              case "[object Array]":
                if (mtype == otype) {
                    t = new Array(Math.max(object.length, mixin.length));
                    for (i = 0, l = t.length; i < l; ++i) {
                        t[i] = du.merge(object[i], mixin[i]);
                    }
                    return t;
                }
                return mixin.slice(0);
              case "[object Object]":
                if (mtype == otype && object) {
                    t = lang.delegate(object);
                    for (i in mixin) {
                        if (i in object) {
                            l = object[i];
                            m = mixin[i];
                            if (m !== l) {
                                t[i] = du.merge(l, m);
                            }
                        } else {
                            t[i] = lang.clone(mixin[i]);
                        }
                    }
                    return t;
                }
                return lang.clone(mixin);
            }
        }
        return mixin;
    }});
    return du;
});

