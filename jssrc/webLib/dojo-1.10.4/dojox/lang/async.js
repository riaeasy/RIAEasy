//>>built

define("dojox/lang/async", ["dijit", "dojo", "dojox"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.lang.async");
    (function () {
        var d = dojo, Deferred = d.Deferred, each = d.forEach, some = d.some, async = dojox.lang.async, aps = Array.prototype.slice, opts = Object.prototype.toString;
        async.seq = function (x) {
            var fs = opts.call(x) == "[object Array]" ? x : arguments;
            return function (init) {
                var x = new Deferred();
                each(fs, function (f) {
                    x.addCallback(f);
                });
                x.callback(init);
                return x;
            };
        };
        async.par = function (x) {
            var fs = opts.call(x) == "[object Array]" ? x : arguments;
            return function (init) {
                var results = new Array(fs.length), cancel = function () {
                    each(results, function (v) {
                        if (v instanceof Deferred && v.fired < 0) {
                            v.cancel();
                        }
                    });
                }, x = new Deferred(cancel), ready = fs.length;
                each(fs, function (f, i) {
                    var x;
                    try {
                        x = f(init);
                    }
                    catch (e) {
                        x = e;
                    }
                    results[i] = x;
                });
                var failed = some(results, function (v) {
                    if (v instanceof Error) {
                        cancel();
                        x.errback(v);
                        return true;
                    }
                    return false;
                });
                if (!failed) {
                    each(results, function (v, i) {
                        if (v instanceof Deferred) {
                            v.addCallbacks(function (v) {
                                results[i] = v;
                                if (!--ready) {
                                    x.callback(results);
                                }
                            }, function (v) {
                                cancel();
                                x.errback(v);
                            });
                        } else {
                            --ready;
                        }
                    });
                }
                if (!ready) {
                    x.callback(results);
                }
                return x;
            };
        };
        async.any = function (x) {
            var fs = opts.call(x) == "[object Array]" ? x : arguments;
            return function (init) {
                var results = new Array(fs.length), noResult = true;
                cancel = function (index) {
                    each(results, function (v, i) {
                        if (i != index && v instanceof Deferred && v.fired < 0) {
                            v.cancel();
                        }
                    });
                }, x = new Deferred(cancel);
                each(fs, function (f, i) {
                    var x;
                    try {
                        x = f(init);
                    }
                    catch (e) {
                        x = e;
                    }
                    results[i] = x;
                });
                var done = some(results, function (v, i) {
                    if (!(v instanceof Deferred)) {
                        cancel(i);
                        x.callback(v);
                        return true;
                    }
                    return false;
                });
                if (!done) {
                    each(results, function (v, i) {
                        v.addBoth(function (v) {
                            if (noResult) {
                                noResult = false;
                                cancel(i);
                                x.callback(v);
                            }
                        });
                    });
                }
                return x;
            };
        };
        async.select = function (cond, x) {
            var fs = opts.call(x) == "[object Array]" ? x : aps.call(arguments, 1);
            return function (init) {
                return new Deferred().addCallback(cond).addCallback(function (v) {
                    if (typeof v == "number" && v >= 0 && v < fs.length) {
                        return fs[v](init);
                    } else {
                        return new Error("async.select: out of range");
                    }
                }).callback(init);
            };
        };
        async.ifThen = function (cond, ifTrue, ifFalse) {
            return function (init) {
                return new Deferred().addCallback(cond).addCallback(function (v) {
                    return (v ? ifTrue : ifFalse)(init);
                }).callback(init);
            };
        };
        async.loop = function (cond, body) {
            return function (init) {
                var x, y = new Deferred(function () {
                    x.cancel();
                });
                function ifErr(v) {
                    y.errback(v);
                }
                function loop(v) {
                    if (v) {
                        x.addCallback(body).addCallback(setUp);
                    } else {
                        y.callback(v);
                    }
                    return v;
                }
                function setUp(init) {
                    x = new Deferred().addCallback(cond).addCallback(loop).addErrback(ifErr);
                    x.callback(init);
                }
                setUp(init);
                return y;
            };
        };
    })();
});

