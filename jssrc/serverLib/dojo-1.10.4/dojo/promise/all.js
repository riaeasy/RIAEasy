//>>built

define("dojo/promise/all", ["../_base/array", "../Deferred", "../when"], function (array, Deferred, when) {
    "use strict";
    var some = array.some;
    return function all(objectOrArray) {
        var object, array;
        if (objectOrArray instanceof Array) {
            array = objectOrArray;
        } else {
            if (objectOrArray && typeof objectOrArray === "object") {
                object = objectOrArray;
            }
        }
        var results;
        var keyLookup = [];
        if (object) {
            array = [];
            for (var key in object) {
                if (Object.hasOwnProperty.call(object, key)) {
                    keyLookup.push(key);
                    array.push(object[key]);
                }
            }
            results = {};
        } else {
            if (array) {
                results = [];
            }
        }
        if (!array || !array.length) {
            return new Deferred().resolve(results);
        }
        var deferred = new Deferred();
        deferred.promise.always(function () {
            results = keyLookup = null;
        });
        var waiting = array.length;
        some(array, function (valueOrPromise, index) {
            if (!object) {
                keyLookup.push(index);
            }
            when(valueOrPromise, function (value) {
                if (!deferred.isFulfilled()) {
                    results[keyLookup[index]] = value;
                    if (--waiting === 0) {
                        deferred.resolve(results);
                    }
                }
            }, deferred.reject);
            return deferred.isFulfilled();
        });
        return deferred.promise;
    };
});

