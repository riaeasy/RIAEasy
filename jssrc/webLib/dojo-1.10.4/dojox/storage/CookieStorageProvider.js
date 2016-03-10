//>>built

define("dojox/storage/CookieStorageProvider", ["dijit", "dojo", "dojox", "dojo/require!dojox/storage/Provider,dojox/storage/manager,dojo/cookie"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.storage.CookieStorageProvider");
    dojo.require("dojox.storage.Provider");
    dojo.require("dojox.storage.manager");
    dojo.require("dojo.cookie");
    dojo.declare("dojox.storage.CookieStorageProvider", [dojox.storage.Provider], {store:null, cookieName:"dojoxStorageCookie", storageLife:730, initialize:function () {
        this.store = dojo.fromJson(dojo.cookie(this.cookieName)) || {};
        this.initialized = true;
        dojox.storage.manager.loaded();
    }, isAvailable:function () {
        return dojo.cookie.isSupported();
    }, put:function (key, value, resultsHandler, namespace) {
        this._assertIsValidKey(key);
        namespace = namespace || this.DEFAULT_NAMESPACE;
        this._assertIsValidNamespace(namespace);
        fullKey = this.getFullKey(key, namespace);
        this.store[fullKey] = dojo.toJson(value);
        this._save();
        var success = dojo.toJson(this.store) === dojo.cookie(this.cookieName);
        if (!success) {
            this.remove(key, namespace);
        }
        if (resultsHandler) {
            resultsHandler(success ? this.SUCCESS : this.FAILED, key, null, namespace);
        }
    }, get:function (key, namespace) {
        this._assertIsValidKey(key);
        namespace = namespace || this.DEFAULT_NAMESPACE;
        this._assertIsValidNamespace(namespace);
        key = this.getFullKey(key, namespace);
        return this.store[key] ? dojo.fromJson(this.store[key]) : null;
    }, getKeys:function (namespace) {
        namespace = namespace || this.DEFAULT_NAMESPACE;
        this._assertIsValidNamespace(namespace);
        namespace = "__" + namespace + "_";
        var keys = [];
        for (var currentKey in this.store) {
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
        for (var currentKey in this.store) {
            if (this._beginsWith(currentKey, namespace)) {
                delete (this.store[currentKey]);
            }
        }
        this._save();
    }, remove:function (key, namespace) {
        namespace = namespace || this.DEFAULT_NAMESPACE;
        this._assertIsValidNamespace(namespace);
        this._assertIsValidKey(key);
        key = this.getFullKey(key, namespace);
        delete this.store[key];
        this._save();
    }, getNamespaces:function () {
        var results = [this.DEFAULT_NAMESPACE];
        var found = {};
        found[this.DEFAULT_NAMESPACE] = true;
        var tester = /^__([^_]*)_/;
        for (var currentKey in this.store) {
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
        return 4;
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
    }, _save:function () {
        dojo.cookie(this.cookieName, dojo.toJson(this.store), {expires:this.storageLife});
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
    dojox.storage.manager.register("dojox.storage.CookieStorageProvider", new dojox.storage.CookieStorageProvider());
});

