//>>built

define("dojo/_base/Deferred", ["./kernel", "../Deferred", "../promise/Promise", "../errors/CancelError", "../has", "./lang", "../when"], function (dojo, NewDeferred, Promise, CancelError, has, lang, when) {
    var mutator = function () {
    };
    var freeze = Object.freeze || function () {
    };
    var Deferred = dojo.Deferred = function (canceller) {
        var result, finished, canceled, fired, isError, head, nextListener;
        var promise = (this.promise = new Promise());
        function complete(value) {
            if (finished) {
                throw new Error("This deferred has already been resolved");
            }
            result = value;
            finished = true;
            notify();
        }
        function notify() {
            var mutated;
            while (!mutated && nextListener) {
                var listener = nextListener;
                nextListener = nextListener.next;
                if ((mutated = (listener.progress == mutator))) {
                    finished = false;
                }
                var func = (isError ? listener.error : listener.resolved);
                if (has("config-useDeferredInstrumentation")) {
                    if (isError && NewDeferred.instrumentRejected) {
                        NewDeferred.instrumentRejected(result, !!func);
                    }
                }
                if (func) {
                    try {
                        var newResult = func(result);
                        if (newResult && typeof newResult.then === "function") {
                            newResult.then(lang.hitch(listener.deferred, "resolve"), lang.hitch(listener.deferred, "reject"), lang.hitch(listener.deferred, "progress"));
                            continue;
                        }
                        var unchanged = mutated && newResult === undefined;
                        if (mutated && !unchanged) {
                            isError = newResult instanceof Error;
                        }
                        listener.deferred[unchanged && isError ? "reject" : "resolve"](unchanged ? result : newResult);
                    }
                    catch (e) {
                        listener.deferred.reject(e);
                    }
                } else {
                    if (isError) {
                        listener.deferred.reject(result);
                    } else {
                        listener.deferred.resolve(result);
                    }
                }
            }
        }
        this.isResolved = promise.isResolved = function () {
            return fired == 0;
        };
        this.isRejected = promise.isRejected = function () {
            return fired == 1;
        };
        this.isFulfilled = promise.isFulfilled = function () {
            return fired >= 0;
        };
        this.isCanceled = promise.isCanceled = function () {
            return canceled;
        };
        this.resolve = this.callback = function (value) {
            this.fired = fired = 0;
            this.results = [value, null];
            complete(value);
        };
        this.reject = this.errback = function (error) {
            isError = true;
            this.fired = fired = 1;
            if (has("config-useDeferredInstrumentation")) {
                if (NewDeferred.instrumentRejected) {
                    NewDeferred.instrumentRejected(error, !!nextListener);
                }
            }
            complete(error);
            this.results = [null, error];
        };
        this.progress = function (update) {
            var listener = nextListener;
            while (listener) {
                var progress = listener.progress;
                progress && progress(update);
                listener = listener.next;
            }
        };
        this.addCallbacks = function (callback, errback) {
            this.then(callback, errback, mutator);
            return this;
        };
        promise.then = this.then = function (resolvedCallback, errorCallback, progressCallback) {
            var returnDeferred = progressCallback == mutator ? this : new Deferred(promise.cancel);
            var listener = {resolved:resolvedCallback, error:errorCallback, progress:progressCallback, deferred:returnDeferred};
            if (nextListener) {
                head = head.next = listener;
            } else {
                nextListener = head = listener;
            }
            if (finished) {
                notify();
            }
            return returnDeferred.promise;
        };
        var deferred = this;
        promise.cancel = this.cancel = function () {
            if (!finished) {
                var error = canceller && canceller(deferred);
                if (!finished) {
                    if (!(error instanceof Error)) {
                        error = new CancelError(error);
                    }
                    error.log = false;
                    deferred.reject(error);
                }
            }
            canceled = true;
        };
        freeze(promise);
    };
    lang.extend(Deferred, {addCallback:function (callback) {
        return this.addCallbacks(lang.hitch.apply(dojo, arguments));
    }, addErrback:function (errback) {
        return this.addCallbacks(null, lang.hitch.apply(dojo, arguments));
    }, addBoth:function (callback) {
        var enclosed = lang.hitch.apply(dojo, arguments);
        return this.addCallbacks(enclosed, enclosed);
    }, fired:-1});
    Deferred.when = dojo.when = when;
    return Deferred;
});

