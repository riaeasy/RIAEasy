//>>built

define("dojox/lang/oo/aop", ["dijit", "dojo", "dojox", "dojo/require!dojox/lang/oo/Decorator,dojox/lang/oo/general"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.lang.oo.aop");
    dojo.require("dojox.lang.oo.Decorator");
    dojo.require("dojox.lang.oo.general");
    (function () {
        var oo = dojox.lang.oo, md = oo.makeDecorator, oog = oo.general, ooa = oo.aop, isF = dojo.isFunction;
        ooa.before = oog.before;
        ooa.around = oog.wrap;
        ooa.afterReturning = md(function (name, newValue, oldValue) {
            return isF(oldValue) ? function () {
                var ret = oldValue.apply(this, arguments);
                newValue.call(this, ret);
                return ret;
            } : function () {
                newValue.call(this);
            };
        });
        ooa.afterThrowing = md(function (name, newValue, oldValue) {
            return isF(oldValue) ? function () {
                var ret;
                try {
                    ret = oldValue.apply(this, arguments);
                }
                catch (e) {
                    newValue.call(this, e);
                    throw e;
                }
                return ret;
            } : oldValue;
        });
        ooa.after = md(function (name, newValue, oldValue) {
            return isF(oldValue) ? function () {
                var ret;
                try {
                    ret = oldValue.apply(this, arguments);
                }
                finally {
                    newValue.call(this);
                }
                return ret;
            } : function () {
                newValue.call(this);
            };
        });
    })();
});

