//>>built

define("dojox/lang/oo/general", ["dijit", "dojo", "dojox", "dojo/require!dojox/lang/oo/Decorator"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.lang.oo.general");
    dojo.require("dojox.lang.oo.Decorator");
    (function () {
        var oo = dojox.lang.oo, md = oo.makeDecorator, oog = oo.general, isF = dojo.isFunction;
        oog.augment = md(function (name, newValue, oldValue) {
            return typeof oldValue == "undefined" ? newValue : oldValue;
        });
        oog.override = md(function (name, newValue, oldValue) {
            return typeof oldValue != "undefined" ? newValue : oldValue;
        });
        oog.shuffle = md(function (name, newValue, oldValue) {
            return isF(oldValue) ? function () {
                return oldValue.apply(this, newValue.apply(this, arguments));
            } : oldValue;
        });
        oog.wrap = md(function (name, newValue, oldValue) {
            return function () {
                return newValue.call(this, oldValue, arguments);
            };
        });
        oog.tap = md(function (name, newValue, oldValue) {
            return function () {
                newValue.apply(this, arguments);
                return this;
            };
        });
        oog.before = md(function (name, newValue, oldValue) {
            return isF(oldValue) ? function () {
                newValue.apply(this, arguments);
                return oldValue.apply(this, arguments);
            } : newValue;
        });
        oog.after = md(function (name, newValue, oldValue) {
            return isF(oldValue) ? function () {
                oldValue.apply(this, arguments);
                return newValue.apply(this, arguments);
            } : newValue;
        });
    })();
});

