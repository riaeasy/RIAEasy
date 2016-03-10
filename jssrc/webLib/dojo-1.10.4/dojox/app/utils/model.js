//>>built

define("dojox/app/utils/model", ["dojo/_base/lang", "dojo/Deferred", "dojo/promise/all", "dojo/when"], function (lang, Deferred, all, when) {
    return function (config, parent, app) {
        var loadedModels = {};
        if (parent.loadedModels) {
            lang.mixin(loadedModels, parent.loadedModels);
        }
        if (config) {
            var allDeferred = [];
            for (var item in config) {
                if (item.charAt(0) !== "_") {
                    allDeferred.push(setupModel(config, item, app, loadedModels));
                }
            }
            return (allDeferred.length == 0) ? loadedModels : all(allDeferred);
        } else {
            return loadedModels;
        }
    };
    function setupModel(config, item, app, loadedModels) {
        var params = config[item].params ? config[item].params : {};
        var modelLoader = config[item].modelLoader ? config[item].modelLoader : "dojox/app/utils/simpleModel";
        try {
            var modelCtor = require(modelLoader);
        }
        catch (e) {
            throw new Error(modelLoader + " must be listed in the dependencies");
        }
        var loadModelDeferred = new Deferred();
        var createModelPromise;
        try {
            createModelPromise = modelCtor(config, params, item);
        }
        catch (e) {
            throw new Error("Error creating " + modelLoader + " for model named [" + item + "]: " + e.message);
        }
        when(createModelPromise, lang.hitch(this, function (newModel) {
            loadedModels[item] = newModel;
            app.log("in app/model, for item=[", item, "] loadedModels =", loadedModels);
            loadModelDeferred.resolve(loadedModels);
            return loadedModels;
        }), function (e) {
            throw new Error("Error loading model named [" + item + "]: " + e.message);
        });
        return loadModelDeferred;
    }
});

