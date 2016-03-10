//>>built

define("dojox/lang/aspect/cflow", ["dijit", "dojo", "dojox"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.lang.aspect.cflow");
    (function () {
        var aop = dojox.lang.aspect;
        aop.cflow = function (instance, method) {
            if (arguments.length > 1 && !(method instanceof Array)) {
                method = [method];
            }
            var contextStack = aop.getContextStack();
            for (var i = contextStack.length - 1; i >= 0; --i) {
                var c = contextStack[i];
                if (instance && c.instance != instance) {
                    continue;
                }
                if (!method) {
                    return true;
                }
                var n = c.joinPoint.targetName;
                for (var j = method.length - 1; j >= 0; --j) {
                    var m = method[j];
                    if (m instanceof RegExp) {
                        if (m.test(n)) {
                            return true;
                        }
                    } else {
                        if (n == m) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };
    })();
});

