//>>built

define("dojox/lang/aspect/counter", ["dijit", "dojo", "dojox"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.lang.aspect.counter");
    (function () {
        var aop = dojox.lang.aspect;
        var Counter = function () {
            this.reset();
        };
        dojo.extend(Counter, {before:function () {
            ++this.calls;
        }, afterThrowing:function () {
            ++this.errors;
        }, reset:function () {
            this.calls = this.errors = 0;
        }});
        aop.counter = function () {
            return new Counter;
        };
    })();
});

