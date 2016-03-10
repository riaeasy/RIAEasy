//>>built

define("dojox/lang/aspect/profiler", ["dijit", "dojo", "dojox"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.lang.aspect.profiler");
    (function () {
        var aop = dojox.lang.aspect, uniqueNumber = 0;
        var Profiler = function (title) {
            this.args = title ? [title] : [];
            this.inCall = 0;
        };
        dojo.extend(Profiler, {before:function () {
            if (!(this.inCall++)) {
                console.profile.apply(console, this.args);
            }
        }, after:function () {
            if (!--this.inCall) {
                console.profileEnd();
            }
        }});
        aop.profiler = function (title) {
            return new Profiler(title);
        };
    })();
});

