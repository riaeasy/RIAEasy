//>>built

define("dojox/lang/functional/multirec", ["dijit", "dojo", "dojox", "dojo/require!dojox/lang/functional/lambda,dojox/lang/functional/util"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.lang.functional.multirec");
    dojo.require("dojox.lang.functional.lambda");
    dojo.require("dojox.lang.functional.util");
    (function () {
        var df = dojox.lang.functional, inline = df.inlineLambda, _x = "_x", _y_r_y_o = ["_y.r", "_y.o"];
        df.multirec = function (cond, then, before, after) {
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
                as = inline(after, _y_r_y_o, add2dict);
            } else {
                a = df.lambda(after);
                as = "_a.call(this, _y.r, _y.o)";
                dict2["_a=_t.a"] = 1;
            }
            var locals1 = df.keys(dict1), locals2 = df.keys(dict2), f = new Function([], "var _y={a:arguments},_x,_r,_z,_i".concat(locals1.length ? "," + locals1.join(",") : "", locals2.length ? ",_t=arguments.callee," + locals2.join(",") : "", t ? (locals2.length ? ",_t=_t.t" : "_t=arguments.callee.t") : "", ";for(;;){for(;;){if(_y.o){_r=", as, ";break}_x=_y.a;if(", cs, "){_r=", ts, ";break}_y.o=_x;_x=", bs, ";_y.r=[];_z=_y;for(_i=_x.length-1;_i>=0;--_i){_y={p:_y,a:_x[_i],z:_z}}}if(!(_z=_y.z)){return _r}_z.r.push(_r);_y=_y.p}"));
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

