//>>built

define("dojox/lang/functional/fold", ["dojo/_base/lang", "dojo/_base/array", "dojo/_base/kernel", "./lambda"], function (lang, arr, kernel, df) {
    var empty = {};
    lang.mixin(df, {foldl:function (a, f, z, o) {
        if (typeof a == "string") {
            a = a.split("");
        }
        o = o || kernel.global;
        f = df.lambda(f);
        var i, n;
        if (lang.isArray(a)) {
            for (i = 0, n = a.length; i < n; z = f.call(o, z, a[i], i, a), ++i) {
            }
        } else {
            if (typeof a.hasNext == "function" && typeof a.next == "function") {
                for (i = 0; a.hasNext(); z = f.call(o, z, a.next(), i++, a)) {
                }
            } else {
                for (i in a) {
                    if (!(i in empty)) {
                        z = f.call(o, z, a[i], i, a);
                    }
                }
            }
        }
        return z;
    }, foldl1:function (a, f, o) {
        if (typeof a == "string") {
            a = a.split("");
        }
        o = o || kernel.global;
        f = df.lambda(f);
        var z, i, n;
        if (lang.isArray(a)) {
            z = a[0];
            for (i = 1, n = a.length; i < n; z = f.call(o, z, a[i], i, a), ++i) {
            }
        } else {
            if (typeof a.hasNext == "function" && typeof a.next == "function") {
                if (a.hasNext()) {
                    z = a.next();
                    for (i = 1; a.hasNext(); z = f.call(o, z, a.next(), i++, a)) {
                    }
                }
            } else {
                var first = true;
                for (i in a) {
                    if (!(i in empty)) {
                        if (first) {
                            z = a[i];
                            first = false;
                        } else {
                            z = f.call(o, z, a[i], i, a);
                        }
                    }
                }
            }
        }
        return z;
    }, foldr:function (a, f, z, o) {
        if (typeof a == "string") {
            a = a.split("");
        }
        o = o || kernel.global;
        f = df.lambda(f);
        for (var i = a.length; i > 0; --i, z = f.call(o, z, a[i], i, a)) {
        }
        return z;
    }, foldr1:function (a, f, o) {
        if (typeof a == "string") {
            a = a.split("");
        }
        o = o || kernel.global;
        f = df.lambda(f);
        var n = a.length, z = a[n - 1], i = n - 1;
        for (; i > 0; --i, z = f.call(o, z, a[i], i, a)) {
        }
        return z;
    }, reduce:function (a, f, z) {
        return arguments.length < 3 ? df.foldl1(a, f) : df.foldl(a, f, z);
    }, reduceRight:function (a, f, z) {
        return arguments.length < 3 ? df.foldr1(a, f) : df.foldr(a, f, z);
    }, unfold:function (pr, f, g, z, o) {
        o = o || kernel.global;
        f = df.lambda(f);
        g = df.lambda(g);
        pr = df.lambda(pr);
        var t = [];
        for (; !pr.call(o, z); t.push(f.call(o, z)), z = g.call(o, z)) {
        }
        return t;
    }});
});

