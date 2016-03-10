//>>built

define("dojox/timing/ThreadPool", ["./_base"], function () {
    dojo.experimental("dojox.timing.ThreadPool");
    var t = dojox.timing;
    t.threadStates = {UNSTARTED:"unstarted", STOPPED:"stopped", PENDING:"pending", RUNNING:"running", SUSPENDED:"suspended", WAITING:"waiting", COMPLETE:"complete", ERROR:"error"};
    t.threadPriorities = {LOWEST:1, BELOWNORMAL:2, NORMAL:3, ABOVENORMAL:4, HIGHEST:5};
    t.Thread = function (fn, priority) {
        var self = this;
        this.state = t.threadStates.UNSTARTED;
        this.priority = priority || t.threadPriorities.NORMAL;
        this.lastError = null;
        this.func = fn;
        this.invoke = function () {
            self.state = t.threadStates.RUNNING;
            try {
                fn(this);
                self.state = t.threadStates.COMPLETE;
            }
            catch (e) {
                self.lastError = e;
                self.state = t.threadStates.ERROR;
            }
        };
    };
    t.ThreadPool = new (function (mxthrs, intvl) {
        var self = this;
        var maxThreads = mxthrs;
        var availableThreads = maxThreads;
        var interval = intvl;
        var fireInterval = Math.floor((interval / 2) / maxThreads);
        var queue = [];
        var timers = new Array(maxThreads + 1);
        var timer = new dojox.timing.Timer();
        var invoke = function () {
            var tracker = timers[0] = {};
            for (var i = 0; i < timers.length; i++) {
                window.clearTimeout(timers[i]);
                var thread = queue.shift();
                if (typeof (thread) == "undefined") {
                    break;
                }
                tracker["thread-" + i] = thread;
                timers[i] = window.setTimeout(thread.invoke, (fireInterval * i));
            }
            availableThreads = maxThreads - (i - 1);
        };
        this.getMaxThreads = function () {
            return maxThreads;
        };
        this.getAvailableThreads = function () {
            return availableThreads;
        };
        this.getTickInterval = function () {
            return interval;
        };
        this.queueUserWorkItem = function (fn) {
            var item = fn;
            if (item instanceof Function) {
                item = new t.Thread(item);
            }
            var idx = queue.length;
            for (var i = 0; i < queue.length; i++) {
                if (queue[i].priority < item.priority) {
                    idx = i;
                    break;
                }
            }
            if (idx < queue.length) {
                queue.splice(idx, 0, item);
            } else {
                queue.push(item);
            }
            return true;
        };
        this.removeQueuedUserWorkItem = function (item) {
            if (item instanceof Function) {
                var idx = -1;
                for (var i = 0; i < queue.length; i++) {
                    if (queue[i].func == item) {
                        idx = i;
                        break;
                    }
                }
                if (idx > -1) {
                    queue.splice(idx, 1);
                    return true;
                }
                return false;
            }
            var idx = -1;
            for (var i = 0; i < queue.length; i++) {
                if (queue[i] == item) {
                    idx = i;
                    break;
                }
            }
            if (idx > -1) {
                queue.splice(idx, 1);
                return true;
            }
            return false;
        };
        this.start = function () {
            timer.start();
        };
        this.stop = function () {
            timer.stop();
        };
        this.abort = function () {
            this.stop();
            for (var i = 1; i < timers.length; i++) {
                if (timers[i]) {
                    window.clearTimeout(timers[i]);
                }
            }
            for (var thread in timers[0]) {
                this.queueUserWorkItem(thread);
            }
            timers[0] = {};
        };
        this.reset = function () {
            this.abort();
            queue = [];
        };
        this.sleep = function (nSleep) {
            timer.stop();
            window.setTimeout(timer.start, nSleep);
        };
        timer.onTick = self.invoke;
    })(16, 5000);
    return dojox.timing.ThreadPool;
});

