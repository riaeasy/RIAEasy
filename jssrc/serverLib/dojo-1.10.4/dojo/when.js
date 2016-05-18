//>>built

define("dojo/when", ["./Deferred", "./promise/Promise"], function (Deferred, Promise) {
    "use strict";
    return function when(valueOrPromise, callback, errback, progback) {
        var receivedPromise = valueOrPromise && typeof valueOrPromise.then === "function";
        var nativePromise = receivedPromise && valueOrPromise instanceof Promise;
        if (!receivedPromise) {
            if (arguments.length > 1) {
                return callback ? callback(valueOrPromise) : valueOrPromise;
            } else {
                return new Deferred().resolve(valueOrPromise);
            }
        } else {
            if (!nativePromise) {
                var deferred = new Deferred(valueOrPromise.cancel);
                valueOrPromise.then(deferred.resolve, deferred.reject, deferred.progress);
                valueOrPromise = deferred.promise;
            }
        }
        if (callback || errback || progback) {
            return valueOrPromise.then(callback, errback, progback);
        }
        return valueOrPromise;
    };
});

