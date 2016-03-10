//>>built

define("dojox/timing/_base", ["dojo/_base/kernel", "dojo/_base/lang"], function (dojo) {
    dojo.experimental("dojox.timing");
    dojo.getObject("timing", true, dojox);
    dojox.timing.Timer = function (interval) {
        this.timer = null;
        this.isRunning = false;
        this.interval = interval;
        this.onStart = null;
        this.onStop = null;
    };
    dojo.extend(dojox.timing.Timer, {onTick:function () {
    }, setInterval:function (interval) {
        if (this.isRunning) {
            window.clearInterval(this.timer);
        }
        this.interval = interval;
        if (this.isRunning) {
            this.timer = window.setInterval(dojo.hitch(this, "onTick"), this.interval);
        }
    }, start:function () {
        if (typeof this.onStart == "function") {
            this.onStart();
        }
        this.isRunning = true;
        this.timer = window.setInterval(dojo.hitch(this, "onTick"), this.interval);
    }, stop:function () {
        if (typeof this.onStop == "function") {
            this.onStop();
        }
        this.isRunning = false;
        window.clearInterval(this.timer);
    }});
    return dojox.timing;
});

