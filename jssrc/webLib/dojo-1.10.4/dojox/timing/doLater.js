//>>built

define("dojox/timing/doLater", ["./_base"], function (dxt) {
    dojo.experimental("dojox.timing.doLater");
    dxt.doLater = function (conditional, context, interval) {
        if (conditional) {
            return false;
        }
        var callback = dxt.doLater.caller, args = dxt.doLater.caller.arguments;
        interval = interval || 100;
        context = context || dojo.global;
        setTimeout(function () {
            callback.apply(context, args);
        }, interval);
        return true;
    };
    return dxt.doLater;
});

