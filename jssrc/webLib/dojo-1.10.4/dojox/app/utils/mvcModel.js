//>>built

define("dojox/app/utils/mvcModel", ["dojo/_base/lang", "dojo/Deferred", "dojo/when", "dojox/mvc/getStateful"], function (lang, Deferred, when, getStateful) {
    return function (config, params, item) {
        var loadedModels = {};
        var loadMvcModelDeferred = new Deferred();
        var fixupQuery = function (query) {
            var ops = {};
            for (var item in query) {
                if (item.charAt(0) !== "_") {
                    ops[item] = query[item];
                }
            }
            return (ops);
        };
        var options;
        if (params.store) {
            options = {"store":params.store.store, "query":params.query ? fixupQuery(params.query) : params.store.query ? fixupQuery(params.store.query) : {}};
        } else {
            if (params.datastore) {
                try {
                    var dataStoreCtor = require("dojo/store/DataStore");
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
                    console.warn("mvcModel: Missing parameters.");
                }
            }
        }
        var type = config[item].type ? config[item].type : "dojox/mvc/EditStoreRefListController";
        try {
            var modelCtor = require(type);
        }
        catch (e) {
            throw new Error(type + " must be listed in the dependencies");
        }
        var newModel = new modelCtor(options);
        var createMvcPromise;
        try {
            if (newModel.queryStore) {
                createMvcPromise = newModel.queryStore(options.query);
            } else {
                var modelProp = newModel._refSourceModelProp || newModel._refModelProp || "model";
                newModel.set(modelProp, getStateful(options.data));
                createMvcPromise = newModel;
            }
        }
        catch (ex) {
            loadMvcModelDeferred.reject("load mvc model error.");
            return loadMvcModelDeferred.promise;
        }
        when(createMvcPromise, lang.hitch(this, function () {
            loadedModels = newModel;
            loadMvcModelDeferred.resolve(loadedModels);
            return loadedModels;
        }), function () {
            loadMvcModelDeferred.reject("load model error.");
        });
        return loadMvcModelDeferred;
    };
});

