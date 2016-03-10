//>>built

define("dojox/storage/GearsStorageProvider", ["dijit", "dojo", "dojox", "dojo/require!dojo/gears,dojox/storage/Provider,dojox/storage/manager,dojox/sql"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.storage.GearsStorageProvider");
    dojo.require("dojo.gears");
    dojo.require("dojox.storage.Provider");
    dojo.require("dojox.storage.manager");
    dojo.require("dojox.sql");
    if (dojo.gears.available) {
        (function () {
            dojo.declare("dojox.storage.GearsStorageProvider", dojox.storage.Provider, {constructor:function () {
            }, TABLE_NAME:"__DOJO_STORAGE", initialized:false, _available:null, _storageReady:false, initialize:function () {
                if (dojo.config["disableGearsStorage"] == true) {
                    return;
                }
                this.TABLE_NAME = "__DOJO_STORAGE";
                this.initialized = true;
                dojox.storage.manager.loaded();
            }, isAvailable:function () {
                return this._available = dojo.gears.available;
            }, put:function (key, value, resultsHandler, namespace) {
                this._initStorage();
                if (!this.isValidKey(key)) {
                    throw new Error("Invalid key given: " + key);
                }
                namespace = namespace || this.DEFAULT_NAMESPACE;
                if (!this.isValidKey(namespace)) {
                    throw new Error("Invalid namespace given: " + key);
                }
                if (dojo.isString(value)) {
                    value = "string:" + value;
                } else {
                    value = dojo.toJson(value);
                }
                try {
                    dojox.sql("DELETE FROM " + this.TABLE_NAME + " WHERE namespace = ? AND key = ?", namespace, key);
                    dojox.sql("INSERT INTO " + this.TABLE_NAME + " VALUES (?, ?, ?)", namespace, key, value);
                }
                catch (e) {
                    console.debug("dojox.storage.GearsStorageProvider.put:", e);
                    resultsHandler(this.FAILED, key, e.toString(), namespace);
                    return;
                }
                if (resultsHandler) {
                    resultsHandler(dojox.storage.SUCCESS, key, null, namespace);
                }
            }, get:function (key, namespace) {
                this._initStorage();
                if (!this.isValidKey(key)) {
                    throw new Error("Invalid key given: " + key);
                }
                namespace = namespace || this.DEFAULT_NAMESPACE;
                if (!this.isValidKey(namespace)) {
                    throw new Error("Invalid namespace given: " + key);
                }
                var results = dojox.sql("SELECT * FROM " + this.TABLE_NAME + " WHERE namespace = ? AND " + " key = ?", namespace, key);
                if (!results.length) {
                    return null;
                } else {
                    results = results[0].value;
                }
                if (dojo.isString(results) && (/^string:/.test(results))) {
                    results = results.substring("string:".length);
                } else {
                    results = dojo.fromJson(results);
                }
                return results;
            }, getNamespaces:function () {
                this._initStorage();
                var results = [dojox.storage.DEFAULT_NAMESPACE];
                var rs = dojox.sql("SELECT namespace FROM " + this.TABLE_NAME + " DESC GROUP BY namespace");
                for (var i = 0; i < rs.length; i++) {
                    if (rs[i].namespace != dojox.storage.DEFAULT_NAMESPACE) {
                        results.push(rs[i].namespace);
                    }
                }
                return results;
            }, getKeys:function (namespace) {
                this._initStorage();
                namespace = namespace || this.DEFAULT_NAMESPACE;
                if (!this.isValidKey(namespace)) {
                    throw new Error("Invalid namespace given: " + namespace);
                }
                var rs = dojox.sql("SELECT key FROM " + this.TABLE_NAME + " WHERE namespace = ?", namespace);
                var results = [];
                for (var i = 0; i < rs.length; i++) {
                    results.push(rs[i].key);
                }
                return results;
            }, clear:function (namespace) {
                this._initStorage();
                namespace = namespace || this.DEFAULT_NAMESPACE;
                if (!this.isValidKey(namespace)) {
                    throw new Error("Invalid namespace given: " + namespace);
                }
                dojox.sql("DELETE FROM " + this.TABLE_NAME + " WHERE namespace = ?", namespace);
            }, remove:function (key, namespace) {
                this._initStorage();
                if (!this.isValidKey(key)) {
                    throw new Error("Invalid key given: " + key);
                }
                namespace = namespace || this.DEFAULT_NAMESPACE;
                if (!this.isValidKey(namespace)) {
                    throw new Error("Invalid namespace given: " + key);
                }
                dojox.sql("DELETE FROM " + this.TABLE_NAME + " WHERE namespace = ? AND" + " key = ?", namespace, key);
            }, putMultiple:function (keys, values, resultsHandler, namespace) {
                this._initStorage();
                if (!this.isValidKeyArray(keys) || !values instanceof Array || keys.length != values.length) {
                    throw new Error("Invalid arguments: keys = [" + keys + "], values = [" + values + "]");
                }
                if (namespace == null || typeof namespace == "undefined") {
                    namespace = dojox.storage.DEFAULT_NAMESPACE;
                }
                if (!this.isValidKey(namespace)) {
                    throw new Error("Invalid namespace given: " + namespace);
                }
                this._statusHandler = resultsHandler;
                try {
                    dojox.sql.open();
                    dojox.sql.db.execute("BEGIN TRANSACTION");
                    var _stmt = "REPLACE INTO " + this.TABLE_NAME + " VALUES (?, ?, ?)";
                    for (var i = 0; i < keys.length; i++) {
                        var value = values[i];
                        if (dojo.isString(value)) {
                            value = "string:" + value;
                        } else {
                            value = dojo.toJson(value);
                        }
                        dojox.sql.db.execute(_stmt, [namespace, keys[i], value]);
                    }
                    dojox.sql.db.execute("COMMIT TRANSACTION");
                    dojox.sql.close();
                }
                catch (e) {
                    console.debug("dojox.storage.GearsStorageProvider.putMultiple:", e);
                    if (resultsHandler) {
                        resultsHandler(this.FAILED, keys, e.toString(), namespace);
                    }
                    return;
                }
                if (resultsHandler) {
                    resultsHandler(dojox.storage.SUCCESS, keys, null, namespace);
                }
            }, getMultiple:function (keys, namespace) {
                this._initStorage();
                if (!this.isValidKeyArray(keys)) {
                    throw new ("Invalid key array given: " + keys);
                }
                if (namespace == null || typeof namespace == "undefined") {
                    namespace = dojox.storage.DEFAULT_NAMESPACE;
                }
                if (!this.isValidKey(namespace)) {
                    throw new Error("Invalid namespace given: " + namespace);
                }
                var _stmt = "SELECT * FROM " + this.TABLE_NAME + " WHERE namespace = ? AND " + " key = ?";
                var results = [];
                for (var i = 0; i < keys.length; i++) {
                    var result = dojox.sql(_stmt, namespace, keys[i]);
                    if (!result.length) {
                        results[i] = null;
                    } else {
                        result = result[0].value;
                        if (dojo.isString(result) && (/^string:/.test(result))) {
                            results[i] = result.substring("string:".length);
                        } else {
                            results[i] = dojo.fromJson(result);
                        }
                    }
                }
                return results;
            }, removeMultiple:function (keys, namespace) {
                this._initStorage();
                if (!this.isValidKeyArray(keys)) {
                    throw new Error("Invalid arguments: keys = [" + keys + "]");
                }
                if (namespace == null || typeof namespace == "undefined") {
                    namespace = dojox.storage.DEFAULT_NAMESPACE;
                }
                if (!this.isValidKey(namespace)) {
                    throw new Error("Invalid namespace given: " + namespace);
                }
                dojox.sql.open();
                dojox.sql.db.execute("BEGIN TRANSACTION");
                var _stmt = "DELETE FROM " + this.TABLE_NAME + " WHERE namespace = ? AND key = ?";
                for (var i = 0; i < keys.length; i++) {
                    dojox.sql.db.execute(_stmt, [namespace, keys[i]]);
                }
                dojox.sql.db.execute("COMMIT TRANSACTION");
                dojox.sql.close();
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
            }, _initStorage:function () {
                if (this._storageReady) {
                    return;
                }
                if (!google.gears.factory.hasPermission) {
                    var siteName = null;
                    var icon = null;
                    var msg = "This site would like to use Google Gears to enable " + "enhanced functionality.";
                    var allowed = google.gears.factory.getPermission(siteName, icon, msg);
                    if (!allowed) {
                        throw new Error("You must give permission to use Gears in order to " + "store data");
                    }
                }
                try {
                    dojox.sql("CREATE TABLE IF NOT EXISTS " + this.TABLE_NAME + "( " + " namespace TEXT, " + " key TEXT, " + " value TEXT " + ")");
                    dojox.sql("CREATE UNIQUE INDEX IF NOT EXISTS namespace_key_index" + " ON " + this.TABLE_NAME + " (namespace, key)");
                }
                catch (e) {
                    console.debug("dojox.storage.GearsStorageProvider._createTables:", e);
                    throw new Error("Unable to create storage tables for Gears in " + "Dojo Storage");
                }
                this._storageReady = true;
            }});
            dojox.storage.manager.register("dojox.storage.GearsStorageProvider", new dojox.storage.GearsStorageProvider());
        })();
    }
});

