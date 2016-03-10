//>>built

define("dojox/lang/functional/binrec", ["dijit", "dojo", "dojox", "dojo/require!dojox/lang/functional/lambda,dojox/lang/functional/util"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.lang.functional.binrec");
    dojo.require("dojox.lang.functional.lambda");
    dojo.require("dojox.lang.functional.util");
    (function () {
        var df = dojox.lang.functional, inline = df.inlineLambda, _x = "_x", _z_r_r_z_a = ["_z.r", "_r", "_z.a"];
        df.binrec = function (cond, then, before, after) {
            var c, t, b, a, cs, ts, bs, as, dict1 = {}, dict2 = {}, add2dict = function (x) {
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
                ts = "_t.apply(this, _x)";
            }
            if (typeof before == "string") {
                bs = inline(before, _x, add2dict);
            } else {
                b = df.lambda(before);
                bs = "_b.apply(this, _x)";
                dict2["_b=_t.b"] = 1;
            }
            if (typeof after == "string") {
                as = inline(after, _z_r_r_z_a, add2dict);
            } else {
                a = df.lambda(after);
                as = "_a.call(this, _z.r, _r, _z.a)";
                dict2["_a=_t.a"] = 1;
            }
            var locals1 = df.keys(dict1), locals2 = df.keys(dict2), f = new Function([], "var _x=arguments,_y,_z,_r".concat(locals1.length ? "," + locals1.join(",") : "", locals2.length ? ",_t=_x.callee," + locals2.join(",") : "", t ? (locals2.length ? ",_t=_t.t" : "_t=_x.callee.t") : "", ";while(!", cs, "){_r=", bs, ";_y={p:_y,a:_r[1]};_z={p:_z,a:_x};_x=_r[0]}for(;;){do{_r=", ts, ";if(!_z)return _r;while(\"r\" in _z){_r=", as, ";if(!(_z=_z.p))return _r}_z.r=_r;_x=_y.a;_y=_y.p}while(", cs, ");do{_r=", bs, ";_y={p:_y,a:_r[1]};_z={p:_z,a:_x};_x=_r[0]}while(!", cs, ")}"));
            if (c) {
                f.c = c;
            }
            if (t) {
                f.t = t;
            }
            if (b) {
                f.b = b;
            }
            if (a) {
                f.a = a;
            }
            return f;
        };
    })();
});

