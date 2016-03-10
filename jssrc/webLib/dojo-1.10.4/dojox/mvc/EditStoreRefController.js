//>>built

define("dojox/mvc/EditStoreRefController", ["dojo/_base/declare", "dojo/_base/lang", "dojo/when", "./getPlainValue", "./EditModelRefController", "./StoreRefController"], function (declare, lang, when, getPlainValue, EditModelRefController, StoreRefController) {
    return declare("dojox.mvc.EditStoreRefController", [StoreRefController, EditModelRefController], {getPlainValueOptions:null, _removals:[], _resultsWatchHandle:null, _refSourceModelProp:"sourceModel", queryStore:function (query, options) {
        if (!(this.store || {}).query) {
            return;
        }
        if (this._resultsWatchHandle) {
            this._resultsWatchHandle.unwatch();
        }
        this._removals = [];
        var _self = this, queryResult = this.inherited(arguments), result = when(queryResult, function (results) {
            if (_self._beingDestroyed) {
                return;
            }
            if (lang.isArray(results)) {
                _self._resultsWatchHandle = results.watchElements(function (idx, removals, adds) {
                    [].push.apply(_self._removals, removals);
                });
            }
            return results;
        });
        if (result.then) {
            result = lang.delegate(result);
        }
        for (var s in queryResult) {
            if (isNaN(s) && queryResult.hasOwnProperty(s) && lang.isFunction(queryResult[s])) {
                result[s] = queryResult[s];
            }
        }
        return result;
    }, getStore:function (id, options) {
        if (this._resultsWatchHandle) {
            this._resultsWatchHandle.unwatch();
        }
        return this.inherited(arguments);
    }, commit:function () {
        if (this._removals) {
            for (var i = 0; i < this._removals.length; i++) {
                this.store.remove(this.store.getIdentity(this._removals[i]));
            }
            this._removals = [];
        }
        var data = getPlainValue(this.get(this._refEditModelProp), this.getPlainValueOptions);
        if (lang.isArray(data)) {
            for (var i = 0; i < data.length; i++) {
                this.store.put(data[i]);
            }
        } else {
            this.store.put(data);
        }
        this.inherited(arguments);
    }, reset:function () {
        this.inherited(arguments);
        this._removals = [];
    }, destroy:function () {
        if (this._resultsWatchHandle) {
            this._resultsWatchHandle.unwatch();
        }
        this.inherited(arguments);
    }});
});

