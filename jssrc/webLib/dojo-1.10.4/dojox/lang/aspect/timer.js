//>>built

define("dojox/lang/aspect/timer", ["dijit", "dojo", "dojox"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.lang.aspect.timer");
    (function () {
        var aop = dojox.lang.aspect, uniqueNumber = 0;
        var Timer = function (name) {
            this.name = name || ("DojoAopTimer #" + ++uniqueNumber);
            this.inCall = 0;
        };
        dojo.extend(Timer, {before:function () {
            if (!(this.inCall++)) {
                console.time(this.name);
            }
        }, after:function () {
            if (!--this.inCall) {
                console.timeEnd(this.name);
            }
        }});
        aop.timer = function (name) {
            return new Timer(name);
        };
    })();
});

