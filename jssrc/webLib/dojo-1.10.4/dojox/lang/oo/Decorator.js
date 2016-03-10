//>>built

define("dojox/lang/oo/Decorator", ["dijit", "dojo", "dojox"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.lang.oo.Decorator");
    (function () {
        var oo = dojox.lang.oo, D = oo.Decorator = function (value, decorator) {
            this.value = value;
            this.decorator = typeof decorator == "object" ? function () {
                return decorator.exec.apply(decorator, arguments);
            } : decorator;
        };
        oo.makeDecorator = function (decorator) {
            return function (value) {
                return new D(value, decorator);
            };
        };
    })();
});

