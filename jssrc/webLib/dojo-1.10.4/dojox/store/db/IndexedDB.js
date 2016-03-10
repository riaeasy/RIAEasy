//>>built

define("dojox/store/db/IndexedDB", ["dojo/_base/declare", "dojo/_base/lang", "dojo/Deferred", "dojo/when", "dojo/promise/all", "dojo/store/util/SimpleQueryEngine", "dojo/store/util/QueryResults"], function (declare, lang, Deferred, when, all, SimpleQueryEngine, QueryResults) {
    function makePromise(request) {
        var deferred = new Deferred();
        request.onsuccess = function (event) {
            deferred.resolve(event.target.result);
        };
        request.onerror = function () {
            request.error.message = request.webkitErrorMessage;
            deferred.reject(request.error);
        };
        return deferred.promise;
    }
    var cursorQueue = [];
    var maxConcurrent = 1;
    var cursorsRunning = 0;
    var wildcardRe = /(.*)\*$/;
    function queueCursor(cursor, priority, retry) {
        if (cursorsRunning || cursorQueue.length) {
            if (cursor) {
                cursorQueue.push({cursor:cursor, priority:priority, retry:retry});
                cursorQueue.sort(function (a, b) {
                    return a.priority > b.priority ? 1 : -1;
                });
            }
            if (cursorsRunning >= maxConcurrent) {
                return;
            }
            var cursorObject = cursorQueue.pop();
            cursor = cursorObject && cursorObject.cursor;
        }
        if (cursor) {
            try {
                cursor["continue"]();
                cursorsRunning++;
            }
            catch (e) {
                if ((e.name === "TransactionInactiveError" || e.name === 0) && cursorObject) {
                    cursorObject.retry();
                } else {
                    throw e;
                }
            }
        }
    }
    function yes() {
        return true;
    }
    function queryFromFilter(source) {
        var promisedResults, started, callbacks = [];
        function forEach(callback, thisObj) {
            if (started) {
                callback && promisedResults.then(function (results) {
                    results.forEach(callback, thisObj);
                });
            } else {
                callback && callbacks.push(callback);
                if (!promisedResults) {
                    promisedResults = source.filter(function (value) {
                        started = true;
                        for (var i = 0, l = callbacks.length; i < l; i++) {
                            callbacks[i].call(thisObj, value);
                        }
                        return true;
                    });
                }
            }
            return promisedResults;
        }
        return {total:source.total, filter:function (callback, thisObj) {
            var done;
            return forEach(function (value) {
                if (!done) {
                    done = !callback.call(thisObj, value);
                }
            });
        }, forEach:forEach, map:function (callback, thisObj) {
            var mapped = [];
            return forEach(function (value) {
                mapped.push(callback.call(thisObj, value));
            }).then(function () {
                return mapped;
            });
        }, then:function (callback, errback) {
            return forEach().then(callback, errback);
        }};
    }
    var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
    return declare(null, {constructor:function (options) {
        declare.safeMixin(this, options);
        var store = this;
        var dbConfig = this.dbConfig;
        this.indices = dbConfig.stores[this.storeName];
        this.cachedCount = {};
        for (var index in store.indices) {
            var value = store.indices[index];
            if (typeof value === "number") {
                store.indices[index] = {preference:value};
            }
        }
        this.db = this.db || dbConfig.db;
        if (!this.db) {
            var openRequest = dbConfig.openRequest;
            if (!openRequest) {
                openRequest = dbConfig.openRequest = window.indexedDB.open(dbConfig.name || "dojo-db", parseInt(dbConfig.version, 10));
                openRequest.onupgradeneeded = function () {
                    var db = store.db = openRequest.result;
                    for (var storeName in dbConfig.stores) {
                        var storeConfig = dbConfig.stores[storeName];
                        if (!db.objectStoreNames.contains(storeName)) {
                            var idProperty = storeConfig.idProperty || "id";
                            var idbStore = db.createObjectStore(storeName, {keyPath:idProperty, autoIncrement:storeConfig[idProperty] && storeConfig[idProperty].autoIncrement || false});
                        } else {
                            idbStore = openRequest.transaction.objectStore(storeName);
                        }
                        for (var index in storeConfig) {
                            if (!idbStore.indexNames.contains(index) && index !== "autoIncrement" && storeConfig[index].indexed !== false) {
                                idbStore.createIndex(index, index, storeConfig[index]);
                            }
                        }
                    }
                };
                dbConfig.available = makePromise(openRequest);
            }
            this.available = dbConfig.available.then(function (db) {
                return store.db = db;
            });
        }
    }, idProperty:"id", storeName:"", indices:{}, queryEngine:SimpleQueryEngine, transaction:function () {
        var store = this;
        this._currentTransaction = null;
        return {abort:function () {
            store._currentTransaction.abort();
        }, commit:function () {
            store._currentTransaction = null;
        }};
    }, _getTransaction:function () {
        if (!this._currentTransaction) {
            this._currentTransaction = this.db.transaction([this.storeName], "readwrite");
            var store = this;
            this._currentTransaction.oncomplete = function () {
                store._currentTransaction = null;
            };
            this._currentTransaction.onerror = function (error) {
                console.error(error);
            };
        }
        return this._currentTransaction;
    }, _callOnStore:function (method, args, index, returnRequest) {
        var store = this;
        return when(this.available, function callOnStore() {
            var currentTransaction = store._currentTransaction;
            if (currentTransaction) {
                var allowRetry = true;
            } else {
                currentTransaction = store._getTransaction();
            }
            var request, idbStore;
            if (allowRetry) {
                try {
                    idbStore = currentTransaction.objectStore(store.storeName);
                    if (index) {
                        idbStore = idbStore.index(index);
                    }
                    request = idbStore[method].apply(idbStore, args);
                }
                catch (e) {
                    if (e.name === "TransactionInactiveError" || e.name === "InvalidStateError") {
                        store._currentTransaction = null;
                        return callOnStore();
                    } else {
                        throw e;
                    }
                }
            } else {
                idbStore = currentTransaction.objectStore(store.storeName);
                if (index) {
                    idbStore = idbStore.index(index);
                }
                request = idbStore[method].apply(idbStore, args);
            }
            return returnRequest ? request : makePromise(request);
        });
    }, get:function (id) {
        return this._callOnStore("get", [id]);
    }, getIdentity:function (object) {
        return object[this.idProperty];
    }, put:function (object, options) {
        options = options || {};
        this.cachedCount = {};
        return this._callOnStore(options.overwrite === false ? "add" : "put", [object]);
    }, add:function (object, options) {
        options = options || {};
        options.overwrite = false;
        return this.put(object, options);
    }, remove:function (id) {
        this.cachedCount = {};
        return this._callOnStore("delete", [id]);
    }, query:function (query, options) {
        options = options || {};
        var start = options.start || 0;
        var count = options.count || Infinity;
        var sortOption = options.sort;
        var store = this;
        if (query.forEach) {
            var sortOptions = {sort:sortOption};
            var sorter = this.queryEngine({}, sortOptions);
            var totals = [];
            var collectedCount = 0;
            var inCount = 0;
            return queryFromFilter({total:{then:function () {
                return all(totals).then(function (totals) {
                    return totals.reduce(function (a, b) {
                        return a + b;
                    }) * collectedCount / (inCount || 1);
                }).then.apply(this, arguments);
            }}, filter:function (callback, thisObj) {
                var index = 0;
                var queues = [];
                var done;
                var collected = {};
                var results = [];
                return all(query.map(function (part, i) {
                    var queue = queues[i] = [];
                    function addToQueue(object) {
                        queue.push(object);
                        var nextInQueues = [];
                        var toMerge = [];
                        while (queues.every(function (queue) {
                            if (queue.length > 0) {
                                var next = queue[0];
                                if (next) {
                                    toMerge.push(next);
                                }
                                return nextInQueues.push(next);
                            }
                        })) {
                            if (index >= start + count || toMerge.length === 0) {
                                done = true;
                                return;
                            }
                            var nextSelected = sorter(toMerge)[0];
                            queues[nextInQueues.indexOf(nextSelected)].shift();
                            if (index++ >= start) {
                                results.push(nextSelected);
                                if (!callback.call(thisObj, nextSelected)) {
                                    done = true;
                                    return;
                                }
                            }
                            nextInQueues = [];
                            toMerge = [];
                        }
                        return true;
                    }
                    var queryResults = store.query(part, sortOptions);
                    totals[i] = queryResults.total;
                    return queryResults.filter(function (object) {
                        if (done) {
                            return;
                        }
                        var id = store.getIdentity(object);
                        inCount++;
                        if (id in collected) {
                            return true;
                        }
                        collectedCount++;
                        collected[id] = true;
                        return addToQueue(object);
                    }).then(function (results) {
                        addToQueue(null);
                        return results;
                    });
                })).then(function () {
                    return results;
                });
            }});
        }
        var keyRange;
        var alreadySearchedProperty;
        var queryId = JSON.stringify(query) + "-" + JSON.stringify(options.sort);
        var advance;
        var bestIndex, bestIndexQuality = 0;
        var indexTries = 0;
        var filterValue;
        function tryIndex(indexName, quality, factor) {
            indexTries++;
            var indexDefinition = store.indices[indexName];
            if (indexDefinition && indexDefinition.indexed !== false) {
                quality = quality || indexDefinition.preference * (factor || 1) || 0.001;
                if (quality > bestIndexQuality) {
                    bestIndexQuality = quality;
                    bestIndex = indexName;
                    return true;
                }
            }
            indexTries++;
        }
        for (var i in query) {
            filterValue = query[i];
            var range = false;
            var wildcard, newFilterValue = null;
            if (typeof filterValue === "boolean") {
                continue;
            }
            if (filterValue) {
                if (filterValue.from || filterValue.to) {
                    range = true;
                    (function (from, to) {
                        newFilterValue = {test:function (value) {
                            return !from || from <= value && (!to || to >= value);
                        }, keyRange:from ? to ? IDBKeyRange.bound(from, to, filterValue.excludeFrom, filterValue.excludeTo) : IDBKeyRange.lowerBound(from, filterValue.excludeFrom) : IDBKeyRange.upperBound(to, filterValue.excludeTo)};
                    })(filterValue.from, filterValue.to);
                } else {
                    if (typeof filterValue === "object" && filterValue.contains) {
                        (function (contains) {
                            var keyRange, first = contains[0];
                            var wildcard = first && first.match && first.match(wildcardRe);
                            if (wildcard) {
                                first = wildcard[1];
                                keyRange = IDBKeyRange.bound(first, first + "~");
                            } else {
                                keyRange = IDBKeyRange.only(first);
                            }
                            newFilterValue = {test:function (value) {
                                return contains.every(function (item) {
                                    var wildcard = item && item.match && item.match(wildcardRe);
                                    if (wildcard) {
                                        item = wildcard[1];
                                        return value && value.some(function (part) {
                                            return part.slice(0, item.length) === item;
                                        });
                                    }
                                    return value && value.indexOf(item) > -1;
                                });
                            }, keyRange:keyRange};
                        })(filterValue.contains);
                    } else {
                        if ((wildcard = filterValue.match && filterValue.match(wildcardRe))) {
                            var matchStart = wildcard[1];
                            newFilterValue = new RegExp("^" + matchStart);
                            newFilterValue.keyRange = IDBKeyRange.bound(matchStart, matchStart + "~");
                        }
                    }
                }
            }
            if (newFilterValue) {
                query[i] = newFilterValue;
            }
            tryIndex(i, null, range ? 0.1 : 1);
        }
        var descending;
        if (sortOption) {
            var mainSort = sortOption[0];
            if (mainSort.attribute === bestIndex || tryIndex(mainSort.attribute, 1)) {
                descending = mainSort.descending;
            } else {
                var postSorting = true;
                start = 0;
                count = Infinity;
            }
        }
        var cursorRequestArgs;
        if (bestIndex) {
            if (bestIndex in query) {
                filterValue = query[bestIndex];
                if (filterValue && (filterValue.keyRange)) {
                    keyRange = filterValue.keyRange;
                } else {
                    keyRange = IDBKeyRange.only(filterValue);
                }
                alreadySearchedProperty = bestIndex;
            } else {
                keyRange = null;
            }
            cursorRequestArgs = [keyRange, descending ? "prev" : "next"];
        } else {
            cursorRequestArgs = [];
        }
        var cachedPosition = store.cachedPosition;
        if (cachedPosition && cachedPosition.queryId === queryId && cachedPosition.offset < start && indexTries > 1) {
            advance = cachedPosition.preFilterOffset + 1;
            store.cachedPosition = cachedPosition = lang.mixin({}, cachedPosition);
        } else {
            cachedPosition = store.cachedPosition = {offset:-1, preFilterOffset:-1, queryId:queryId};
            if (indexTries < 2) {
                cachedPosition.offset = cachedPosition.preFilterOffset = (advance = start) - 1;
            }
        }
        var filter = this.queryEngine(query);
        var filteredResults = {total:{then:function (callback) {
            var cachedCount = store.cachedCount[queryId];
            if (cachedCount) {
                return callback(adjustTotal(cachedCount));
            } else {
                var countPromise = (keyRange ? store._callOnStore("count", [keyRange], bestIndex) : store._callOnStore("count"));
                return (this.then = countPromise.then(adjustTotal)).then.apply(this, arguments);
            }
            function adjustTotal(total) {
                store.cachedCount[queryId] = total;
                return Math.round((cachedPosition.offset + 1.01) / (cachedPosition.preFilterOffset + 1.01) * total);
            }
        }}, filter:function (callback, thisObj) {
            var deferred = new Deferred();
            var all = [];
            function openCursor() {
                when(store._callOnStore("openCursor", cursorRequestArgs, bestIndex, true), function (cursorRequest) {
                    cursorsRunning++;
                    cursorRequest.onsuccess = function (event) {
                        cursorsRunning--;
                        var cursor = event.target.result;
                        if (cursor) {
                            if (advance) {
                                cursor.advance(advance);
                                cursorsRunning++;
                                advance = false;
                                return;
                            }
                            cachedPosition.preFilterOffset++;
                            try {
                                var item = cursor.value;
                                if (options.join) {
                                    item = options.join(item);
                                }
                                return when(item, function (item) {
                                    if (filter.matches(item)) {
                                        cachedPosition.offset++;
                                        if (cachedPosition.offset >= start) {
                                            all.push(item);
                                            if (!callback.call(thisObj, item) || cachedPosition.offset >= start + count - 1) {
                                                cursorRequest.lastCursor = cursor;
                                                deferred.resolve(all);
                                                queueCursor();
                                                return;
                                            }
                                        }
                                    }
                                    return queueCursor(cursor, options.priority, function () {
                                        advance = cachedPosition.preFilterOffset;
                                        openCursor();
                                    });
                                });
                            }
                            catch (e) {
                                deferred.reject(e);
                            }
                        } else {
                            deferred.resolve(all);
                        }
                        queueCursor();
                    };
                    cursorRequest.onerror = function (error) {
                        cursorsRunning--;
                        deferred.reject(error);
                        queueCursor();
                    };
                });
            }
            openCursor();
            return deferred.promise;
        }};
        if (postSorting) {
            var sorter = this.queryEngine({}, options);
            var sortedResults = lang.delegate(filteredResults.filter(yes).then(function (results) {
                return sorter(results);
            }));
            sortedResults.total = filteredResults.total;
            return new QueryResults(sortedResults);
        }
        return options.rawResults ? filteredResults : queryFromFilter(filteredResults);
    }});
});

