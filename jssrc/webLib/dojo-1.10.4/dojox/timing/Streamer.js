//>>built

define("dojox/timing/Streamer", ["./_base"], function () {
    dojo.experimental("dojox.timing.Streamer");
    return dojox.timing.Streamer = function (input, output, interval, minimum, initialData) {
        var self = this;
        var queue = [];
        this.interval = interval || 1000;
        this.minimumSize = minimum || 10;
        this.inputFunction = input || function (q) {
        };
        this.outputFunction = output || function (point) {
        };
        var timer = new dojox.timing.Timer(this.interval);
        var tick = function () {
            self.onTick(self);
            if (queue.length < self.minimumSize) {
                self.inputFunction(queue);
            }
            var obj = queue.shift();
            while (typeof (obj) == "undefined" && queue.length > 0) {
                obj = queue.shift();
            }
            if (typeof (obj) == "undefined") {
                self.stop();
                return;
            }
            self.outputFunction(obj);
        };
        this.setInterval = function (ms) {
            this.interval = ms;
            timer.setInterval(ms);
        };
        this.onTick = function (obj) {
        };
        this.start = function () {
            if (typeof (this.inputFunction) == "function" && typeof (this.outputFunction) == "function") {
                timer.start();
                return;
            }
            throw new Error("You cannot start a Streamer without an input and an output function.");
        };
        this.onStart = function () {
        };
        this.stop = function () {
            timer.stop();
        };
        this.onStop = function () {
        };
        timer.onTick = this.tick;
        timer.onStart = this.onStart;
        timer.onStop = this.onStop;
        if (initialData) {
            queue.concat(initialData);
        }
    };
});

