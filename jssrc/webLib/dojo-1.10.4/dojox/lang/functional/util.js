//>>built

define("dojox/lang/functional/util", ["dijit", "dojo", "dojox", "dojo/require!dojox/lang/functional/lambda"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.lang.functional.util");
    dojo.require("dojox.lang.functional.lambda");
    (function () {
        var df = dojox.lang.functional;
        dojo.mixin(df, {inlineLambda:function (lambda, init, add2dict) {
            var s = df.rawLambda(lambda);
            if (add2dict) {
                df.forEach(s.args, add2dict);
            }
            var ap = typeof init == "string", n = ap ? s.args.length : Math.min(s.args.length, init.length), a = new Array(4 * n + 4), i, j = 1;
            for (i = 0; i < n; ++i) {
                a[j++] = s.args[i];
                a[j++] = "=";
                a[j++] = ap ? init + "[" + i + "]" : init[i];
                a[j++] = ",";
            }
            a[0] = "(";
            a[j++] = "(";
            a[j++] = s.body;
            a[j] = "))";
            return a.join("");
        }});
    })();
});

