//>>built

define("dojox/lang/functional/curry", ["dijit", "dojo", "dojox", "dojo/require!dojox/lang/functional/lambda"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.lang.functional.curry");
    dojo.require("dojox.lang.functional.lambda");
    (function () {
        var df = dojox.lang.functional, ap = Array.prototype;
        var currying = function (info) {
            return function () {
                var args = info.args.concat(ap.slice.call(arguments, 0));
                if (arguments.length + info.args.length < info.arity) {
                    return currying({func:info.func, arity:info.arity, args:args});
                }
                return info.func.apply(this, args);
            };
        };
        dojo.mixin(df, {curry:function (f, arity) {
            f = df.lambda(f);
            arity = typeof arity == "number" ? arity : f.length;
            return currying({func:f, arity:arity, args:[]});
        }, arg:{}, partial:function (f) {
            var a = arguments, l = a.length, args = new Array(l - 1), p = [], i = 1, t;
            f = df.lambda(f);
            for (; i < l; ++i) {
                t = a[i];
                args[i - 1] = t;
                if (t === df.arg) {
                    p.push(i - 1);
                }
            }
            return function () {
                var t = ap.slice.call(args, 0), i = 0, l = p.length;
                for (; i < l; ++i) {
                    t[p[i]] = arguments[i];
                }
                return f.apply(this, t);
            };
        }, mixer:function (f, mix) {
            f = df.lambda(f);
            return function () {
                var t = new Array(mix.length), i = 0, l = mix.length;
                for (; i < l; ++i) {
                    t[i] = arguments[mix[i]];
                }
                return f.apply(this, t);
            };
        }, flip:function (f) {
            f = df.lambda(f);
            return function () {
                var a = arguments, l = a.length - 1, t = new Array(l + 1), i = 0;
                for (; i <= l; ++i) {
                    t[l - i] = a[i];
                }
                return f.apply(this, t);
            };
        }});
    })();
});

