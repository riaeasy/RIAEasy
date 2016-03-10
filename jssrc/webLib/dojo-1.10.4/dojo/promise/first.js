//>>built

define("dojo/promise/first", ["../_base/array", "../Deferred", "../when"], function (array, Deferred, when) {
    "use strict";
    var forEach = array.forEach;
    return function first(objectOrArray) {
        var array;
        if (objectOrArray instanceof Array) {
            array = objectOrArray;
        } else {
            if (objectOrArray && typeof objectOrArray === "object") {
                array = [];
                for (var key in objectOrArray) {
                    if (Object.hasOwnProperty.call(objectOrArray, key)) {
                        array.push(objectOrArray[key]);
                    }
                }
            }
        }
        if (!array || !array.length) {
            return new Deferred().resolve();
        }
        var deferred = new Deferred();
        forEach(array, function (valueOrPromise) {
            when(valueOrPromise, deferred.resolve, deferred.reject);
        });
        return deferred.promise;
    };
});

