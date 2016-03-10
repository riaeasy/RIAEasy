//>>built

define("dojox/lang/functional/tailrec", ["dijit", "dojo", "dojox", "dojo/require!dojox/lang/functional/lambda,dojox/lang/functional/util"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.lang.functional.tailrec");
    dojo.require("dojox.lang.functional.lambda");
    dojo.require("dojox.lang.functional.util");
    (function () {
        var df = dojox.lang.functional, inline = df.inlineLambda, _x = "_x";
        df.tailrec = function (cond, then, before) {
            var c, t, b, cs, ts, bs, dict1 = {}, dict2 = {}, add2dict = function (x) {
                dict1[x] = 1;
            };
            if (typeof cond == "string") {
                cs = inline(cond, _x, add2dict);
            } else {
                c = df.lambda(cond);
                cs = "_c.apply(this, _x)";
                dict2["_c=_t.c"] = 1;
            }
            if (typeof then == "string") {
                ts = inline(then, _x, add2dict);
            } else {
                t = df.lambda(then);
                ts = "_t.t.apply(this, _x)";
            }
            if (typeof before == "string") {
                bs = inline(before, _x, add2dict);
            } else {
                b = df.lambda(before);
                bs = "_b.apply(this, _x)";
                dict2["_b=_t.b"] = 1;
            }
            var locals1 = df.keys(dict1), locals2 = df.keys(dict2), f = new Function([], "var _x=arguments,_t=_x.callee,_c=_t.c,_b=_t.b".concat(locals1.length ? "," + locals1.join(",") : "", locals2.length ? ",_t=_x.callee," + locals2.join(",") : t ? ",_t=_x.callee" : "", ";for(;!", cs, ";_x=", bs, ");return ", ts));
            if (c) {
                f.c = c;
            }
            if (t) {
                f.t = t;
            }
            if (b) {
                f.b = b;
            }
            return f;
        };
    })();
});

