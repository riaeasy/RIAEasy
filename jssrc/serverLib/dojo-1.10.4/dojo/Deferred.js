//>>built

define("dojo/Deferred", ["./has", "./_base/lang", "./errors/CancelError", "./promise/Promise", "./promise/instrumentation"], function (has, lang, CancelError, Promise, instrumentation) {
    "use strict";
    var PROGRESS = 0, RESOLVED = 1, REJECTED = 2;
    var FULFILLED_ERROR_MESSAGE = "This deferred has already been fulfilled.";
    var freezeObject = Object.freeze || function () {
    };
    var signalWaiting = function (waiting, type, result, rejection, deferred) {
        if (1) {
            if (type === REJECTED && Deferred.instrumentRejected && waiting.length === 0) {
                Deferred.instrumentRejected(result, false, rejection, deferred);
            }
        }
        for (var i = 0; i < waiting.length; i++) {
            signalListener(waiting[i], type, result, rejection);
        }
    };
    var signalListener = function (listener, type, result, rejection) {
        var func = listener[type];
        var deferred = listener.deferred;
        if (func) {
            try {
                var newResult = func(result);
                if (type === PROGRESS) {
                    if (typeof newResult !== "undefined") {
                        signalDeferred(deferred, type, newResult);
                    }
                } else {
                    if (newResult && typeof newResult.then === "function") {
                        listener.cancel = newResult.cancel;
                        newResult.then(makeDeferredSignaler(deferred, RESOLVED), makeDeferredSignaler(deferred, REJECTED), makeDeferredSignaler(deferred, PROGRESS));
                        return;
                    }
                    signalDeferred(deferred, RESOLVED, newResult);
                }
            }
            catch (error) {
                signalDeferred(deferred, REJECTED, error);
            }
        } else {
            signalDeferred(deferred, type, result);
        }
        if (1) {
            if (type === REJECTED && Deferred.instrumentRejected) {
                Deferred.instrumentRejected(result, !!func, rejection, deferred.promise);
            }
        }
    };
    var makeDeferredSignaler = function (deferred, type) {
        return function (value) {
            signalDeferred(deferred, type, value);
        };
    };
    var signalDeferred = function (deferred, type, result) {
        if (!deferred.isCanceled()) {
            switch (type) {
              case PROGRESS:
                deferred.progress(result);
                break;
              case RESOLVED:
                deferred.resolve(result);
                break;
              case REJECTED:
                deferred.reject(result);
                break;
            }
        }
    };
    var Deferred = function (canceler) {
        var promise = this.promise = new Promise();
        var deferred = this;
        var fulfilled, result, rejection;
        var canceled = false;
        var waiting = [];
        if (1 && Error.captureStackTrace) {
            Error.captureStackTrace(deferred, Deferred);
            Error.captureStackTrace(promise, Deferred);
        }
        this.isResolved = promise.isResolved = function () {
            return fulfilled === RESOLVED;
        };
        this.isRejected = promise.isRejected = function () {
            return fulfilled === REJECTED;
        };
        this.isFulfilled = promise.isFulfilled = function () {
            return !!fulfilled;
        };
        this.isCanceled = promise.isCanceled = function () {
            return canceled;
        };
        this.progress = function (update, strict) {
            if (!fulfilled) {
                signalWaiting(waiting, PROGRESS, update, null, deferred);
                return promise;
            } else {
                if (strict === true) {
                    throw new Error(FULFILLED_ERROR_MESSAGE);
                } else {
                    return promise;
                }
            }
        };
        this.resolve = function (value, strict) {
            if (!fulfilled) {
                signalWaiting(waiting, fulfilled = RESOLVED, result = value, null, deferred);
                waiting = null;
                return promise;
            } else {
                if (strict === true) {
                    throw new Error(FULFILLED_ERROR_MESSAGE);
                } else {
                    return promise;
                }
            }
        };
        var reject = this.reject = function (error, strict) {
            if (!fulfilled) {
                if (1 && Error.captureStackTrace) {
                    Error.captureStackTrace(rejection = {}, reject);
                }
                signalWaiting(waiting, fulfilled = REJECTED, result = error, rejection, deferred);
                waiting = null;
                return promise;
            } else {
                if (strict === true) {
                    throw new Error(FULFILLED_ERROR_MESSAGE);
                } else {
                    return promise;
                }
            }
        };
        this.then = promise.then = function (callback, errback, progback) {
            var listener = [progback, callback, errback];
            listener.cancel = promise.cancel;
            listener.deferred = new Deferred(function (reason) {
                return listener.cancel && listener.cancel(reason);
            });
            if (fulfilled && !waiting) {
                signalListener(listener, fulfilled, result, rejection);
            } else {
                waiting.push(listener);
            }
            return listener.deferred.promise;
        };
        this.cancel = promise.cancel = function (reason, strict) {
            if (!fulfilled) {
                if (canceler) {
                    var returnedReason = canceler(reason);
                    reason = typeof returnedReason === "undefined" ? reason : returnedReason;
                }
                canceled = true;
                if (!fulfilled) {
                    if (typeof reason === "undefined") {
                        reason = new CancelError();
                    }
                    reject(reason);
                    return reason;
                } else {
                    if (fulfilled === REJECTED && result === reason) {
                        return reason;
                    }
                }
            } else {
                if (strict === true) {
                    throw new Error(FULFILLED_ERROR_MESSAGE);
                }
            }
        };
        freezeObject(promise);
    };
    Deferred.prototype.toString = function () {
        return "[object Deferred]";
    };
    if (instrumentation) {
        instrumentation(Deferred);
    }
    return Deferred;
});

