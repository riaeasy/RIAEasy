//>>built

define("dojox/store/transaction", ["dojo/store/Memory", "dojo/store/Cache", "dojo/when", "dojo/aspect", "dojo/_base/lang"], function (Memory, Cache, when, aspect, lang) {
    var defaultTransactionLogStore;
    var stores = {};
    var nextStoreId = 1;
    return function (options) {
        options = options || {};
        var masterStore = options.masterStore;
        var cachingStore = options.cachingStore;
        var storeId = masterStore.id || masterStore.storeName || masterStore.name || (masterStore.id = nextStoreId++);
        if (storeId) {
            stores[storeId] = masterStore;
        }
        var transactionLogStore = options.transactionLogStore || defaultTransactionLogStore || (defaultTransactionLogStore = new Memory());
        var autoCommit = true;
        function addToLog(method) {
            return function execute(target, options) {
                var transactionStore = this;
                if (autoCommit) {
                    var result = masterStore[method](target, options);
                    when(result, null, function (e) {
                        if (transactionStore.errorHandler(e)) {
                            autoCommit = false;
                            options.error = e;
                            execute.call(transactionStore, target, options);
                            autoCommit = true;
                        }
                    });
                    return result;
                } else {
                    var previousId = method === "remove" ? target : transactionStore.getIdentity(target);
                    if (previousId !== undefined) {
                        var previous = cachingStore.get(previousId);
                    }
                    return when(previous, function (previous) {
                        return when(transactionLogStore.add({objectId:previousId, method:method, target:target, previous:previous, options:options, storeId:storeId}), function () {
                            return target;
                        });
                    });
                }
            };
        }
        aspect.before(masterStore, "notify", function (object, existingId) {
            if (object) {
                cachingStore.put(object);
            } else {
                cachingStore.remove(existingId);
            }
        });
        return new Cache(lang.delegate(masterStore, {put:addToLog("put"), add:addToLog("add"), remove:addToLog("remove"), errorHandler:function (error) {
            console.error(error);
            return true;
        }, commit:function () {
            autoCommit = true;
            var transactionStore = this;
            return transactionLogStore.query({}).map(function (action) {
                var method = action.method;
                var store = stores[action.storeId];
                var target = action.target;
                var result;
                try {
                    result = store[method](target, action.options);
                }
                catch (e) {
                    result = transactionStore.errorHandler(e);
                    if (result === true) {
                        return e;
                    } else {
                        if (result === false) {
                            if (method === "add") {
                                cachingStore.remove(action.objectId);
                            } else {
                                cachingStore.put(target);
                            }
                            store.notify && store.notify(method === "add" ? null : action.previous, method === "remove" ? undefined : action.objectId);
                        }
                    }
                    result = e;
                }
                transactionLogStore.remove(action.id);
                return result;
            });
        }, transaction:function () {
            autoCommit = false;
            var transactionStore = this;
            return {commit:function () {
                return transactionStore.commit();
            }};
        }}), cachingStore, options);
    };
});

