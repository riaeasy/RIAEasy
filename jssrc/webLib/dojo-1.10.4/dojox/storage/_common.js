//>>built

define("dojox/storage/_common", ["dijit", "dojo", "dojox", "dojo/require!dojox/storage/Provider,dojox/storage/manager,dojox/storage/LocalStorageProvider,dojox/storage/GearsStorageProvider,dojox/storage/WhatWGStorageProvider,dojox/storage/FlashStorageProvider,dojox/storage/BehaviorStorageProvider,dojox/storage/CookieStorageProvider"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.storage._common");
    dojo.require("dojox.storage.Provider");
    dojo.require("dojox.storage.manager");
    dojo.require("dojox.storage.LocalStorageProvider");
    dojo.require("dojox.storage.GearsStorageProvider");
    dojo.require("dojox.storage.WhatWGStorageProvider");
    dojo.require("dojox.storage.FlashStorageProvider");
    dojo.require("dojox.storage.BehaviorStorageProvider");
    dojo.require("dojox.storage.CookieStorageProvider");
    dojox.storage.manager.initialize();
});

