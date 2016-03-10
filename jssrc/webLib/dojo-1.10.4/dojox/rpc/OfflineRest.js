//>>built

define("dojox/rpc/OfflineRest", ["dojo", "dojox", "dojox/data/ClientFilter", "dojox/rpc/Rest", "dojox/storage"], function (dojo, dojox) {
    var Rest = dojox.rpc.Rest;
    var namespace = "dojox_rpc_OfflineRest";
    var loaded;
    var index = Rest._index;
    dojox.storage.manager.addOnLoad(function () {
        loaded = dojox.storage.manager.available;
        for (var i in index) {
            saveObject(index[i], i);
        }
    });
    var dontSave;
    function getStorageKey(key) {
        return key.replace(/[^0-9A-Za-z_]/g, "_");
    }
    function saveObject(object, id) {
        if (loaded && !dontSave && (id || (object && object.__id))) {
            dojox.storage.put(getStorageKey(id || object.__id), typeof object == "object" ? dojox.json.ref.toJson(object) : object, function () {
            }, namespace);
        }
    }
    function isNetworkError(error) {
        return error instanceof Error && (error.status == 503 || error.status > 12000 || !error.status);
    }
    function sendChanges() {
        if (loaded) {
            var dirty = dojox.storage.get("dirty", namespace);
            if (dirty) {
                for (var dirtyId in dirty) {
                    commitDirty(dirtyId, dirty);
                }
            }
        }
    }
    var OfflineRest;
    function sync() {
        OfflineRest.sendChanges();
        OfflineRest.downloadChanges();
    }
    var syncId = setInterval(sync, 15000);
    dojo.connect(document, "ononline", sync);
    OfflineRest = dojox.rpc.OfflineRest = {turnOffAutoSync:function () {
        clearInterval(syncId);
    }, sync:sync, sendChanges:sendChanges, downloadChanges:function () {
    }, addStore:function (store, baseQuery) {
        OfflineRest.stores.push(store);
        store.fetch({queryOptions:{cache:true}, query:baseQuery, onComplete:function (results, args) {
            store._localBaseResults = results;
            store._localBaseFetch = args;
        }});
    }};
    OfflineRest.stores = [];
    var defaultGet = Rest._get;
    Rest._get = function (service, id) {
        try {
            sendChanges();
            if (window.navigator && navigator.onLine === false) {
                throw new Error();
            }
            var dfd = defaultGet(service, id);
        }
        catch (e) {
            dfd = new dojo.Deferred();
            dfd.errback(e);
        }
        var sync = dojox.rpc._sync;
        dfd.addCallback(function (result) {
            saveObject(result, service._getRequest(id).url);
            return result;
        });
        dfd.addErrback(function (error) {
            if (loaded) {
                if (isNetworkError(error)) {
                    var loadedObjects = {};
                    var byId = function (id, backup) {
                        if (loadedObjects[id]) {
                            return backup;
                        }
                        var result = dojo.fromJson(dojox.storage.get(getStorageKey(id), namespace)) || backup;
                        loadedObjects[id] = result;
                        for (var i in result) {
                            var val = result[i];
                            id = val && val.$ref;
                            if (id) {
                                if (id.substring && id.substring(0, 4) == "cid:") {
                                    id = id.substring(4);
                                }
                                result[i] = byId(id, val);
                            }
                        }
                        if (result instanceof Array) {
                            for (i = 0; i < result.length; i++) {
                                if (result[i] === undefined) {
                                    result.splice(i--, 1);
                                }
                            }
                        }
                        return result;
                    };
                    dontSave = true;
                    var result = byId(service._getRequest(id).url);
                    if (!result) {
                        return error;
                    }
                    dontSave = false;
                    return result;
                } else {
                    return error;
                }
            } else {
                if (sync) {
                    return new Error("Storage manager not loaded, can not continue");
                }
                dfd = new dojo.Deferred();
                dfd.addCallback(arguments.callee);
                dojox.storage.manager.addOnLoad(function () {
                    dfd.callback();
                });
                return dfd;
            }
        });
        return dfd;
    };
    function changeOccurred(method, absoluteId, contentId, serializedContent, service) {
        if (method == "delete") {
            dojox.storage.remove(getStorageKey(absoluteId), namespace);
        } else {
            dojox.storage.put(getStorageKey(contentId), serializedContent, function () {
            }, namespace);
        }
        var store = service && service._store;
        if (store) {
            store.updateResultSet(store._localBaseResults, store._localBaseFetch);
            dojox.storage.put(getStorageKey(service._getRequest(store._localBaseFetch.query).url), dojox.json.ref.toJson(store._localBaseResults), function () {
            }, namespace);
        }
    }
    dojo.addOnLoad(function () {
        dojo.connect(dojox.data, "restListener", function (message) {
            var channel = message.channel;
            var method = message.event.toLowerCase();
            var service = dojox.rpc.JsonRest && dojox.rpc.JsonRest.getServiceAndId(channel).service;
            changeOccurred(method, channel, method == "post" ? channel + message.result.id : channel, dojo.toJson(message.result), service);
        });
    });
    var defaultChange = Rest._change;
    Rest._change = function (method, service, id, serializedContent) {
        if (!loaded) {
            return defaultChange.apply(this, arguments);
        }
        var absoluteId = service._getRequest(id).url;
        changeOccurred(method, absoluteId, dojox.rpc.JsonRest._contentId, serializedContent, service);
        var dirty = dojox.storage.get("dirty", namespace) || {};
        if (method == "put" || method == "delete") {
            var dirtyId = absoluteId;
        } else {
            dirtyId = 0;
            for (var i in dirty) {
                if (!isNaN(parseInt(i))) {
                    dirtyId = i;
                }
            }
            dirtyId++;
        }
        dirty[dirtyId] = {method:method, id:absoluteId, content:serializedContent};
        return commitDirty(dirtyId, dirty);
    };
    function commitDirty(dirtyId, dirty) {
        var dirtyItem = dirty[dirtyId];
        var serviceAndId = dojox.rpc.JsonRest.getServiceAndId(dirtyItem.id);
        var deferred = defaultChange(dirtyItem.method, serviceAndId.service, serviceAndId.id, dirtyItem.content);
        dirty[dirtyId] = dirtyItem;
        dojox.storage.put("dirty", dirty, function () {
        }, namespace);
        deferred.addBoth(function (result) {
            if (isNetworkError(result)) {
                return null;
            }
            var dirty = dojox.storage.get("dirty", namespace) || {};
            delete dirty[dirtyId];
            dojox.storage.put("dirty", dirty, function () {
            }, namespace);
            return result;
        });
        return deferred;
    }
    dojo.connect(index, "onLoad", saveObject);
    dojo.connect(index, "onUpdate", saveObject);
    return OfflineRest;
});

