//>>built

define("dojox/app/utils/simpleModel", ["dojo/_base/lang", "dojo/Deferred", "dojo/when"], function (lang, Deferred, when) {
    return function (config, params, item) {
        var loadedModels = {};
        var loadSimpleModelDeferred = new Deferred();
        var fixupQuery = function (query) {
            var ops = {};
            for (var item in query) {
                if (item.charAt(0) !== "_") {
                    ops[item] = query[item];
                }
            }
            return (ops);
        };
        var options, dataStoreCtor;
        if (params.store) {
            if (!params.store.params) {
                throw new Error("Invalid store for model [" + item + "]");
            } else {
                if ((params.store.params.data || params.store.params.store)) {
                    options = {"store":params.store.store, "query":params.query ? fixupQuery(params.query) : params.store.query ? fixupQuery(params.store.query) : {}};
                } else {
                    if (params.store.params.url) {
                        try {
                            dataStoreCtor = require("dojo/store/DataStore");
                        }
                        catch (e) {
                            throw new Error("dojo/store/DataStore must be listed in the dependencies");
                        }
                        options = {"store":new dataStoreCtor({store:params.store.store}), "query":params.query ? fixupQuery(params.query) : params.store.query ? fixupQuery(params.store.query) : {}};
                    } else {
                        if (params.store.store) {
                            options = {"store":params.store.store, "query":params.query ? fixupQuery(params.query) : params.store.query ? fixupQuery(params.store.query) : {}};
                        }
                    }
                }
            }
        } else {
            if (params.datastore) {
                try {
                    dataStoreCtor = require("dojo/store/DataStore");
                }
                catch (e) {
                    throw new Error("When using datastore the dojo/store/DataStore module must be listed in the dependencies");
                }
                options = {"store":new dataStoreCtor({store:params.datastore.store}), "query":fixupQuery(params.query)};
            } else {
                if (params.data) {
                    if (params.data && lang.isString(params.data)) {
                        params.data = lang.getObject(params.data);
                    }
                    options = {"data":params.data, query:{}};
                } else {
                    console.warn("simpleModel: Missing parameters.");
                }
            }
        }
        var createSimplePromise;
        try {
            if (options.store) {
                createSimplePromise = options.store.query();
            } else {
                createSimplePromise = options.data;
            }
        }
        catch (ex) {
            loadSimpleModelDeferred.reject("load simple model error.");
            return loadSimpleModelDeferred.promise;
        }
        if (createSimplePromise.then) {
            when(createSimplePromise, lang.hitch(this, function (newModel) {
                loadedModels = newModel;
                loadSimpleModelDeferred.resolve(loadedModels);
                return loadedModels;
            }), function () {
                loadModelLoaderDeferred.reject("load model error.");
            });
        } else {
            loadedModels = createSimplePromise;
            loadSimpleModelDeferred.resolve(loadedModels);
            return loadedModels;
        }
        return loadSimpleModelDeferred;
    };
});

