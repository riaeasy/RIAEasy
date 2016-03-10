//>>built

define("dojox/mobile/_DataMixin", ["dojo/_base/kernel", "dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/Deferred"], function (kernel, array, declare, lang, Deferred) {
    kernel.deprecated("dojox/mobile/_DataMixin", "Use dojox/mobile/_StoreMixin instead", "2.0");
    return declare("dojox.mobile._DataMixin", null, {store:null, query:null, queryOptions:null, setStore:function (store, query, queryOptions) {
        if (store === this.store) {
            return null;
        }
        this.store = store;
        this._setQuery(query, queryOptions);
        if (store && store.getFeatures()["dojo.data.api.Notification"]) {
            array.forEach(this._conn || [], this.disconnect, this);
            this._conn = [this.connect(store, "onSet", "onSet"), this.connect(store, "onNew", "onNew"), this.connect(store, "onDelete", "onDelete"), this.connect(store, "close", "onStoreClose")];
        }
        return this.refresh();
    }, setQuery:function (query, queryOptions) {
        this._setQuery(query, queryOptions);
        return this.refresh();
    }, _setQuery:function (query, queryOptions) {
        this.query = query;
        this.queryOptions = queryOptions || this.queryOptions;
    }, refresh:function () {
        if (!this.store) {
            return null;
        }
        var d = new Deferred();
        var onComplete = lang.hitch(this, function (items, request) {
            this.onComplete(items, request);
            d.resolve();
        });
        var onError = lang.hitch(this, function (errorData, request) {
            this.onError(errorData, request);
            d.resolve();
        });
        var q = this.query;
        this.store.fetch({query:q, queryOptions:this.queryOptions, onComplete:onComplete, onError:onError, start:q && q.start, count:q && q.count});
        return d;
    }});
});

