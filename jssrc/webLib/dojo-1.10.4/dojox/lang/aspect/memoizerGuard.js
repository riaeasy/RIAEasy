//>>built

define("dojox/lang/aspect/memoizerGuard", ["dijit", "dojo", "dojox"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.lang.aspect.memoizerGuard");
    (function () {
        var aop = dojox.lang.aspect, reset = function (method) {
            var that = aop.getContext().instance, t;
            if (!(t = that.__memoizerCache)) {
                return;
            }
            if (arguments.length == 0) {
                delete that.__memoizerCache;
            } else {
                if (dojo.isArray(method)) {
                    dojo.forEach(method, function (m) {
                        delete t[m];
                    });
                } else {
                    delete t[method];
                }
            }
        };
        aop.memoizerGuard = function (method) {
            return {after:function () {
                reset(method);
            }};
        };
    })();
});

