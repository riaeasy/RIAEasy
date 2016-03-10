//>>built

define("dojo/store/Observable", ["../_base/kernel", "../_base/lang", "../when", "../_base/array"], function (kernel, lang, when, array) {
    var Observable = function (store) {
        var undef, queryUpdaters = [], revision = 0;
        store = lang.delegate(store);
        store.notify = function (object, existingId) {
            revision++;
            var updaters = queryUpdaters.slice();
            for (var i = 0, l = updaters.length; i < l; i++) {
                updaters[i](object, existingId);
            }
        };
        var originalQuery = store.query;
        store.query = function (query, options) {
            options = options || {};
            var results = originalQuery.apply(this, arguments);
            if (results && results.forEach) {
                var nonPagedOptions = lang.mixin({}, options);
                delete nonPagedOptions.start;
                delete nonPagedOptions.count;
                var queryExecutor = store.queryEngine && store.queryEngine(query, nonPagedOptions);
                var queryRevision = revision;
                var listeners = [], queryUpdater;
                results.observe = function (listener, includeObjectUpdates) {
                    if (listeners.push(listener) == 1) {
                        queryUpdaters.push(queryUpdater = function (changed, existingId) {
                            when(results, function (resultsArray) {
                                var atEnd = resultsArray.length != options.count;
                                var i, l, listener;
                                if (++queryRevision != revision) {
                                    throw new Error("Query is out of date, you must observe() the query prior to any data modifications");
                                }
                                var removedObject, removedFrom = -1, insertedInto = -1;
                                if (existingId !== undef) {
                                    for (i = 0, l = resultsArray.length; i < l; i++) {
                                        var object = resultsArray[i];
                                        if (store.getIdentity(object) == existingId) {
                                            removedObject = object;
                                            removedFrom = i;
                                            if (queryExecutor || !changed) {
                                                resultsArray.splice(i, 1);
                                            }
                                            break;
                                        }
                                    }
                                }
                                if (queryExecutor) {
                                    if (changed && (queryExecutor.matches ? queryExecutor.matches(changed) : queryExecutor([changed]).length)) {
                                        var firstInsertedInto = removedFrom > -1 ? removedFrom : resultsArray.length;
                                        resultsArray.splice(firstInsertedInto, 0, changed);
                                        insertedInto = array.indexOf(queryExecutor(resultsArray), changed);
                                        resultsArray.splice(firstInsertedInto, 1);
                                        if ((options.start && insertedInto == 0) || (!atEnd && insertedInto == resultsArray.length)) {
                                            insertedInto = -1;
                                        } else {
                                            resultsArray.splice(insertedInto, 0, changed);
                                        }
                                    }
                                } else {
                                    if (changed) {
                                        if (existingId !== undef) {
                                            insertedInto = removedFrom;
                                        } else {
                                            if (!options.start) {
                                                insertedInto = store.defaultIndex || 0;
                                                resultsArray.splice(insertedInto, 0, changed);
                                            }
                                        }
                                    }
                                }
                                if ((removedFrom > -1 || insertedInto > -1) && (includeObjectUpdates || !queryExecutor || (removedFrom != insertedInto))) {
                                    var copyListeners = listeners.slice();
                                    for (i = 0; listener = copyListeners[i]; i++) {
                                        listener(changed || removedObject, removedFrom, insertedInto);
                                    }
                                }
                            });
                        });
                    }
                    var handle = {};
                    handle.remove = handle.cancel = function () {
                        var index = array.indexOf(listeners, listener);
                        if (index > -1) {
                            listeners.splice(index, 1);
                            if (!listeners.length) {
                                queryUpdaters.splice(array.indexOf(queryUpdaters, queryUpdater), 1);
                            }
                        }
                    };
                    return handle;
                };
            }
            return results;
        };
        var inMethod;
        function whenFinished(method, action) {
            var original = store[method];
            if (original) {
                store[method] = function (value) {
                    var originalId;
                    if (method === "put") {
                        originalId = store.getIdentity(value);
                    }
                    if (inMethod) {
                        return original.apply(this, arguments);
                    }
                    inMethod = true;
                    try {
                        var results = original.apply(this, arguments);
                        when(results, function (results) {
                            action((typeof results == "object" && results) || value, originalId);
                        });
                        return results;
                    }
                    finally {
                        inMethod = false;
                    }
                };
            }
        }
        whenFinished("put", function (object, originalId) {
            store.notify(object, originalId);
        });
        whenFinished("add", function (object) {
            store.notify(object);
        });
        whenFinished("remove", function (id) {
            store.notify(undefined, id);
        });
        return store;
    };
    lang.setObject("dojo.store.Observable", Observable);
    return Observable;
});

