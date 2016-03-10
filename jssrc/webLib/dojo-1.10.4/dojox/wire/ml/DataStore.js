//>>built

define("dojox/wire/ml/DataStore", ["dijit", "dojo", "dojox", "dojo/require!dijit/_Widget,dojox/wire/_base"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.wire.ml.DataStore");
    dojo.require("dijit._Widget");
    dojo.require("dojox.wire._base");
    dojo.declare("dojox.wire.ml.DataStore", dijit._Widget, {storeClass:"", postCreate:function () {
        this.store = this._createStore();
    }, _createStore:function () {
        if (!this.storeClass) {
            return null;
        }
        var storeClass = dojox.wire._getClass(this.storeClass);
        if (!storeClass) {
            return null;
        }
        var args = {};
        var attributes = this.domNode.attributes;
        for (var i = 0; i < attributes.length; i++) {
            var a = attributes.item(i);
            if (a.specified && !this[a.nodeName]) {
                args[a.nodeName] = a.nodeValue;
            }
        }
        return new storeClass(args);
    }, getFeatures:function () {
        return this.store.getFeatures();
    }, fetch:function (request) {
        return this.store.fetch(request);
    }, save:function (args) {
        this.store.save(args);
    }, newItem:function (args) {
        return this.store.newItem(args);
    }, deleteItem:function (item) {
        return this.store.deleteItem(item);
    }, revert:function () {
        return this.store.revert();
    }});
});

