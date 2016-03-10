//>>built

define("dojox/storage/WhatWGStorageProvider", ["dijit", "dojo", "dojox", "dojo/require!dojox/storage/Provider,dojox/storage/manager"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.storage.WhatWGStorageProvider");
    dojo.require("dojox.storage.Provider");
    dojo.require("dojox.storage.manager");
    dojo.declare("dojox.storage.WhatWGStorageProvider", [dojox.storage.Provider], {initialized:false, _domain:null, _available:null, _statusHandler:null, _allNamespaces:null, _storageEventListener:null, initialize:function () {
        if (dojo.config["disableWhatWGStorage"] == true) {
            return;
        }
        this._domain = location.hostname;
        this.initialized = true;
        dojox.storage.manager.loaded();
    }, isAvailable:function () {
        try {
            var myStorage = globalStorage[location.hostname];
        }
        catch (e) {
            this._available = false;
            return this._available;
        }
        this._available = true;
        return this._available;
    }, put:function (key, value, resultsHandler, namespace) {
        if (this.isValidKey(key) == false) {
            throw new Error("Invalid key given: " + key);
        }
        namespace = namespace || this.DEFAULT_NAMESPACE;
        key = this.getFullKey(key, namespace);
        this._statusHandler = resultsHandler;
        if (dojo.isString(value)) {
            value = "string:" + value;
        } else {
            value = dojo.toJson(value);
        }
        var storageListener = dojo.hitch(this, function (evt) {
            window.removeEventListener("storage", storageListener, false);
            if (resultsHandler) {
                resultsHandler.call(null, this.SUCCESS, key, null, namespace);
            }
        });
        window.addEventListener("storage", storageListener, false);
        try {
            var myStorage = globalStorage[this._domain];
            myStorage.setItem(key, value);
        }
        catch (e) {
            this._statusHandler.call(null, this.FAILED, key, e.toString(), namespace);
        }
    }, get:function (key, namespace) {
        if (this.isValidKey(key) == false) {
            throw new Error("Invalid key given: " + key);
        }
        namespace = namespace || this.DEFAULT_NAMESPACE;
        key = this.getFullKey(key, namespace);
        var myStorage = globalStorage[this._domain];
        var results = myStorage.getItem(key);
        if (results == null || results == "") {
            return null;
        }
        results = results.value;
        if (dojo.isString(results) && (/^string:/.test(results))) {
            results = results.substring("string:".length);
        } else {
            results = dojo.fromJson(results);
        }
        return results;
    }, getNamespaces:function () {
        var results = [this.DEFAULT_NAMESPACE];
        var found = {};
        var myStorage = globalStorage[this._domain];
        var tester = /^__([^_]*)_/;
        for (var i = 0; i < myStorage.length; i++) {
            var currentKey = myStorage.key(i);
            if (tester.test(currentKey) == true) {
                var currentNS = currentKey.match(tester)[1];
                if (typeof found[currentNS] == "undefined") {
                    found[currentNS] = true;
                    results.push(currentNS);
                }
            }
        }
        return results;
    }, getKeys:function (namespace) {
        namespace = namespace || this.DEFAULT_NAMESPACE;
        if (this.isValidKey(namespace) == false) {
            throw new Error("Invalid namespace given: " + namespace);
        }
        var namespaceTester;
        if (namespace == this.DEFAULT_NAMESPACE) {
            namespaceTester = new RegExp("^([^_]{2}.*)$");
        } else {
            namespaceTester = new RegExp("^__" + namespace + "_(.*)$");
        }
        var myStorage = globalStorage[this._domain];
        var keysArray = [];
        for (var i = 0; i < myStorage.length; i++) {
            var currentKey = myStorage.key(i);
            if (namespaceTester.test(currentKey) == true) {
                currentKey = currentKey.match(namespaceTester)[1];
                keysArray.push(currentKey);
            }
        }
        return keysArray;
    }, clear:function (namespace) {
        namespace = namespace || this.DEFAULT_NAMESPACE;
        if (this.isValidKey(namespace) == false) {
            throw new Error("Invalid namespace given: " + namespace);
        }
        var namespaceTester;
        if (namespace == this.DEFAULT_NAMESPACE) {
            namespaceTester = new RegExp("^[^_]{2}");
        } else {
            namespaceTester = new RegExp("^__" + namespace + "_");
        }
        var myStorage = globalStorage[this._domain];
        var keys = [];
        for (var i = 0; i < myStorage.length; i++) {
            if (namespaceTester.test(myStorage.key(i)) == true) {
                keys[keys.length] = myStorage.key(i);
            }
        }
        dojo.forEach(keys, dojo.hitch(myStorage, "removeItem"));
    }, remove:function (key, namespace) {
        key = this.getFullKey(key, namespace);
        var myStorage = globalStorage[this._domain];
        myStorage.removeItem(key);
    }, isPermanent:function () {
        return true;
    }, getMaximumSize:function () {
        return this.SIZE_NO_LIMIT;
    }, hasSettingsUI:function () {
        return false;
    }, showSettingsUI:function () {
        throw new Error(this.declaredClass + " does not support a storage settings user-interface");
    }, hideSettingsUI:function () {
        throw new Error(this.declaredClass + " does not support a storage settings user-interface");
    }, getFullKey:function (key, namespace) {
        namespace = namespace || this.DEFAULT_NAMESPACE;
        if (this.isValidKey(namespace) == false) {
            throw new Error("Invalid namespace given: " + namespace);
        }
        if (namespace == this.DEFAULT_NAMESPACE) {
            return key;
        } else {
            return "__" + namespace + "_" + key;
        }
    }});
    dojox.storage.manager.register("dojox.storage.WhatWGStorageProvider", new dojox.storage.WhatWGStorageProvider());
});

