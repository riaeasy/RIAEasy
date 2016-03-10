//>>built

define("dojox/storage/Provider", ["dijit", "dojo", "dojox"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.storage.Provider");
    dojo.declare("dojox.storage.Provider", null, {constructor:function () {
    }, SUCCESS:"success", FAILED:"failed", PENDING:"pending", SIZE_NOT_AVAILABLE:"Size not available", SIZE_NO_LIMIT:"No size limit", DEFAULT_NAMESPACE:"default", onHideSettingsUI:null, initialize:function () {
        console.warn("dojox.storage.initialize not implemented");
    }, isAvailable:function () {
        console.warn("dojox.storage.isAvailable not implemented");
    }, put:function (key, value, resultsHandler, namespace) {
        console.warn("dojox.storage.put not implemented");
    }, get:function (key, namespace) {
        console.warn("dojox.storage.get not implemented");
    }, hasKey:function (key, namespace) {
        return !!this.get(key, namespace);
    }, getKeys:function (namespace) {
        console.warn("dojox.storage.getKeys not implemented");
    }, clear:function (namespace) {
        console.warn("dojox.storage.clear not implemented");
    }, remove:function (key, namespace) {
        console.warn("dojox.storage.remove not implemented");
    }, getNamespaces:function () {
        console.warn("dojox.storage.getNamespaces not implemented");
    }, isPermanent:function () {
        console.warn("dojox.storage.isPermanent not implemented");
    }, getMaximumSize:function () {
        console.warn("dojox.storage.getMaximumSize not implemented");
    }, putMultiple:function (keys, values, resultsHandler, namespace) {
        for (var i = 0; i < keys.length; i++) {
            dojox.storage.put(keys[i], values[i], resultsHandler, namespace);
        }
    }, getMultiple:function (keys, namespace) {
        var results = [];
        for (var i = 0; i < keys.length; i++) {
            results.push(dojox.storage.get(keys[i], namespace));
        }
        return results;
    }, removeMultiple:function (keys, namespace) {
        for (var i = 0; i < keys.length; i++) {
            dojox.storage.remove(keys[i], namespace);
        }
    }, isValidKeyArray:function (keys) {
        if (keys === null || keys === undefined || !dojo.isArray(keys)) {
            return false;
        }
        return !dojo.some(keys, function (key) {
            return !this.isValidKey(key);
        }, this);
    }, hasSettingsUI:function () {
        return false;
    }, showSettingsUI:function () {
        console.warn("dojox.storage.showSettingsUI not implemented");
    }, hideSettingsUI:function () {
        console.warn("dojox.storage.hideSettingsUI not implemented");
    }, isValidKey:function (keyName) {
        if (keyName === null || keyName === undefined) {
            return false;
        }
        return /^[0-9A-Za-z_]*$/.test(keyName);
    }, getResourceList:function () {
        return [];
    }});
});

