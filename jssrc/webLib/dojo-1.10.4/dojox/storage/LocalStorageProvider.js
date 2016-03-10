//>>built

define("dojox/storage/LocalStorageProvider", ["dijit", "dojo", "dojox", "dojo/require!dojox/storage/Provider,dojox/storage/manager"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.storage.LocalStorageProvider");
    dojo.require("dojox.storage.Provider");
    dojo.require("dojox.storage.manager");
    dojo.declare("dojox.storage.LocalStorageProvider", [dojox.storage.Provider], {store:null, initialize:function () {
        this.store = localStorage;
        this.initialized = true;
        dojox.storage.manager.loaded();
    }, isAvailable:function () {
        return typeof localStorage != "undefined";
    }, put:function (key, value, resultsHandler, namespace) {
        this._assertIsValidKey(key);
        namespace = namespace || this.DEFAULT_NAMESPACE;
        this._assertIsValidNamespace(namespace);
        var fullKey = this.getFullKey(key, namespace);
        value = dojo.toJson(value);
        try {
            this.store.setItem(fullKey, value);
            if (resultsHandler) {
                resultsHandler(this.SUCCESS, key, null, namespace);
            }
        }
        catch (e) {
            if (resultsHandler) {
                resultsHandler(this.FAILED, key, e.toString(), namespace);
            }
        }
    }, get:function (key, namespace) {
        this._assertIsValidKey(key);
        namespace = namespace || this.DEFAULT_NAMESPACE;
        this._assertIsValidNamespace(namespace);
        key = this.getFullKey(key, namespace);
        return dojo.fromJson(this.store.getItem(key));
    }, getKeys:function (namespace) {
        namespace = namespace || this.DEFAULT_NAMESPACE;
        this._assertIsValidNamespace(namespace);
        namespace = "__" + namespace + "_";
        var keys = [];
        for (var i = 0; i < this.store.length; i++) {
            var currentKey = this.store.key(i);
            if (this._beginsWith(currentKey, namespace)) {
                currentKey = currentKey.substring(namespace.length);
                keys.push(currentKey);
            }
        }
        return keys;
    }, clear:function (namespace) {
        namespace = namespace || this.DEFAULT_NAMESPACE;
        this._assertIsValidNamespace(namespace);
        namespace = "__" + namespace + "_";
        var keys = [];
        for (var i = 0; i < this.store.length; i++) {
            if (this._beginsWith(this.store.key(i), namespace)) {
                keys.push(this.store.key(i));
            }
        }
        dojo.forEach(keys, dojo.hitch(this.store, "removeItem"));
    }, remove:function (key, namespace) {
        namespace = namespace || this.DEFAULT_NAMESPACE;
        this._assertIsValidNamespace(namespace);
        this.store.removeItem(this.getFullKey(key, namespace));
    }, getNamespaces:function () {
        var results = [this.DEFAULT_NAMESPACE];
        var found = {};
        found[this.DEFAULT_NAMESPACE] = true;
        var tester = /^__([^_]*)_/;
        for (var i = 0; i < this.store.length; i++) {
            var currentKey = this.store.key(i);
            if (tester.test(currentKey) == true) {
                var currentNS = currentKey.match(tester)[1];
                if (typeof found[currentNS] == "undefined") {
                    found[currentNS] = true;
                    results.push(currentNS);
                }
            }
        }
        return results;
    }, isPermanent:function () {
        return true;
    }, getMaximumSize:function () {
        return dojox.storage.SIZE_NO_LIMIT;
    }, hasSettingsUI:function () {
        return false;
    }, isValidKey:function (keyName) {
        if (keyName === null || keyName === undefined) {
            return false;
        }
        return /^[0-9A-Za-z_-]*$/.test(keyName);
    }, isValidNamespace:function (keyName) {
        if (keyName === null || keyName === undefined) {
            return false;
        }
        return /^[0-9A-Za-z-]*$/.test(keyName);
    }, getFullKey:function (key, namespace) {
        return "__" + namespace + "_" + key;
    }, _beginsWith:function (haystack, needle) {
        if (needle.length > haystack.length) {
            return false;
        }
        return haystack.substring(0, needle.length) === needle;
    }, _assertIsValidNamespace:function (namespace) {
        if (this.isValidNamespace(namespace) === false) {
            throw new Error("Invalid namespace given: " + namespace);
        }
    }, _assertIsValidKey:function (key) {
        if (this.isValidKey(key) === false) {
            throw new Error("Invalid key given: " + key);
        }
    }});
    dojox.storage.manager.register("dojox.storage.LocalStorageProvider", new dojox.storage.LocalStorageProvider());
});

