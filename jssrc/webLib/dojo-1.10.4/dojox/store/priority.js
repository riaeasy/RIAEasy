//>>built

define("dojox/store/priority", ["dojo/_base/lang", "dojo/Deferred", "dojo/when"], function (lang, Deferred, when) {
    var queue = [];
    var running = 0;
    function processQueue() {
        for (var priority = queue.length - 1; priority >= running; priority--) {
            var queueForPriorityLevel = queue[priority];
            var action = queueForPriorityLevel && queueForPriorityLevel[queueForPriorityLevel.length - 1];
            if (action) {
                queueForPriorityLevel.pop();
                running++;
                try {
                    action.executor(function () {
                        running--;
                        processQueue();
                    });
                }
                catch (e) {
                    action.def.reject(e);
                    processQueue();
                }
            }
        }
    }
    function deferredResults() {
        var deferred = new Deferred();
        return {promise:{total:{then:function (callback, errback) {
            return deferred.then(function (wrapper) {
                return wrapper.results.total;
            }).then(callback, errback);
        }}, forEach:function (callback, thisObj) {
            return deferred.then(function (wrapper) {
                return wrapper.results.forEach(callback, thisObj);
            });
        }, map:function (callback, thisObj) {
            return deferred.then(function (wrapper) {
                return wrapper.results.map(callback, thisObj);
            });
        }, filter:function (callback, thisObj) {
            return deferred.then(function (wrapper) {
                return wrapper.results.filter(callback, thisObj);
            });
        }, then:function (callback, errback) {
            return deferred.then(function (wrapper) {
                return when(wrapper.results, callback, errback);
            });
        }}, resolve:deferred.resolve, reject:deferred.reject};
    }
    return function (store, config) {
        config = config || {};
        var priorityStore = lang.delegate(store);
        ["add", "put", "query", "remove", "get"].forEach(function (method) {
            var original = store[method];
            if (original) {
                priorityStore[method] = function (first, options) {
                    options = options || {};
                    var def, executor;
                    if (options.immediate) {
                        return original.call(store, first, options);
                    }
                    options.immediate = true;
                    if (method === "query") {
                        executor = function (callback) {
                            var queryResults = original.call(store, first, options);
                            def.resolve({results:queryResults});
                            when(queryResults, callback, callback);
                        };
                        def = deferredResults();
                    } else {
                        executor = function (callback) {
                            when(original.call(store, first, options), function (value) {
                                def.resolve(value);
                                callback();
                            }, function (error) {
                                def.reject(error);
                                callback();
                            });
                        };
                        def = new Deferred();
                    }
                    var priority = options.priority > -1 ? options.priority : config.priority > -1 ? config.priority : 4;
                    (queue[priority] || (queue[priority] = [])).push({executor:executor, def:def});
                    processQueue();
                    return def.promise;
                };
            }
        });
        return priorityStore;
    };
});

