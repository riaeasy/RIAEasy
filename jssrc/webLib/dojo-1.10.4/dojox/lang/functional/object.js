//>>built

define("dojox/lang/functional/object", ["dojo/_base/kernel", "dojo/_base/lang", "./lambda"], function (kernel, lang, df) {
    var empty = {};
    lang.mixin(df, {keys:function (obj) {
        var t = [];
        for (var i in obj) {
            if (!(i in empty)) {
                t.push(i);
            }
        }
        return t;
    }, values:function (obj) {
        var t = [];
        for (var i in obj) {
            if (!(i in empty)) {
                t.push(obj[i]);
            }
        }
        return t;
    }, filterIn:function (obj, f, o) {
        o = o || kernel.global;
        f = df.lambda(f);
        var t = {}, v, i;
        for (i in obj) {
            if (!(i in empty)) {
                v = obj[i];
                if (f.call(o, v, i, obj)) {
                    t[i] = v;
                }
            }
        }
        return t;
    }, forIn:function (obj, f, o) {
        o = o || kernel.global;
        f = df.lambda(f);
        for (var i in obj) {
            if (!(i in empty)) {
                f.call(o, obj[i], i, obj);
            }
        }
        return o;
    }, mapIn:function (obj, f, o) {
        o = o || kernel.global;
        f = df.lambda(f);
        var t = {}, i;
        for (i in obj) {
            if (!(i in empty)) {
                t[i] = f.call(o, obj[i], i, obj);
            }
        }
        return t;
    }});
    return df;
});

