//>>built

define("dojo/_base/array", ["./kernel", "../has", "./lang"], function (dojo, has, lang) {
    var cache = {}, u;
    function buildFn(fn) {
        return cache[fn] = new Function("item", "index", "array", fn);
    }
    function everyOrSome(some) {
        var every = !some;
        return function (a, fn, o) {
            var i = 0, l = a && a.length || 0, result;
            if (l && typeof a == "string") {
                a = a.split("");
            }
            if (typeof fn == "string") {
                fn = cache[fn] || buildFn(fn);
            }
            if (o) {
                for (; i < l; ++i) {
                    result = !fn.call(o, a[i], i, a);
                    if (some ^ result) {
                        return !result;
                    }
                }
            } else {
                for (; i < l; ++i) {
                    result = !fn(a[i], i, a);
                    if (some ^ result) {
                        return !result;
                    }
                }
            }
            return every;
        };
    }
    function index(up) {
        var delta = 1, lOver = 0, uOver = 0;
        if (!up) {
            delta = lOver = uOver = -1;
        }
        return function (a, x, from, last) {
            if (last && delta > 0) {
                return array.lastIndexOf(a, x, from);
            }
            var l = a && a.length || 0, end = up ? l + uOver : lOver, i;
            if (from === u) {
                i = up ? lOver : l + uOver;
            } else {
                if (from < 0) {
                    i = l + from;
                    if (i < 0) {
                        i = lOver;
                    }
                } else {
                    i = from >= l ? l + uOver : from;
                }
            }
            if (l && typeof a == "string") {
                a = a.split("");
            }
            for (; i != end; i += delta) {
                if (a[i] == x) {
                    return i;
                }
            }
            return -1;
        };
    }
    var array = {every:everyOrSome(false), some:everyOrSome(true), indexOf:index(true), lastIndexOf:index(false), forEach:function (arr, callback, thisObject) {
        var i = 0, l = arr && arr.length || 0;
        if (l && typeof arr == "string") {
            arr = arr.split("");
        }
        if (typeof callback == "string") {
            callback = cache[callback] || buildFn(callback);
        }
        if (thisObject) {
            for (; i < l; ++i) {
                callback.call(thisObject, arr[i], i, arr);
            }
        } else {
            for (; i < l; ++i) {
                callback(arr[i], i, arr);
            }
        }
    }, map:function (arr, callback, thisObject, Ctr) {
        var i = 0, l = arr && arr.length || 0, out = new (Ctr || Array)(l);
        if (l && typeof arr == "string") {
            arr = arr.split("");
        }
        if (typeof callback == "string") {
            callback = cache[callback] || buildFn(callback);
        }
        if (thisObject) {
            for (; i < l; ++i) {
                out[i] = callback.call(thisObject, arr[i], i, arr);
            }
        } else {
            for (; i < l; ++i) {
                out[i] = callback(arr[i], i, arr);
            }
        }
        return out;
    }, filter:function (arr, callback, thisObject) {
        var i = 0, l = arr && arr.length || 0, out = [], value;
        if (l && typeof arr == "string") {
            arr = arr.split("");
        }
        if (typeof callback == "string") {
            callback = cache[callback] || buildFn(callback);
        }
        if (thisObject) {
            for (; i < l; ++i) {
                value = arr[i];
                if (callback.call(thisObject, value, i, arr)) {
                    out.push(value);
                }
            }
        } else {
            for (; i < l; ++i) {
                value = arr[i];
                if (callback(value, i, arr)) {
                    out.push(value);
                }
            }
        }
        return out;
    }, clearCache:function () {
        cache = {};
    }};
    1 && lang.mixin(dojo, array);
    return array;
});

