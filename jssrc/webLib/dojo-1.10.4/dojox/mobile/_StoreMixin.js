//>>built

define("dojox/mobile/_StoreMixin", ["dojo/_base/Deferred", "dojo/_base/declare"], function (Deferred, declare) {
    return declare("dojox.mobile._StoreMixin", null, {store:null, query:null, queryOptions:null, labelProperty:"label", childrenProperty:"children", setStore:function (store, query, queryOptions) {
        if (store === this.store) {
            return null;
        }
        if (store) {
            store.getValue = function (item, property) {
                return item[property];
            };
        }
        this.store = store;
        this._setQuery(query, queryOptions);
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
        var _this = this;
        var promise = this.store.query(this.query, this.queryOptions);
        Deferred.when(promise, function (results) {
            if (results.items) {
                results = results.items;
            }
            if (promise.observe) {
                if (_this._observe_h) {
                    _this._observe_h.remove();
                }
                _this._observe_h = promise.observe(function (object, previousIndex, newIndex) {
                    if (previousIndex != -1) {
                        if (newIndex != previousIndex) {
                            _this.onDelete(object, previousIndex);
                            if (newIndex != -1) {
                                if (_this.onAdd) {
                                    _this.onAdd(object, newIndex);
                                } else {
                                    _this.onUpdate(object, newIndex);
                                }
                            }
                        } else {
                            if (_this.onAdd) {
                                _this.onUpdate(object, newIndex);
                            }
                        }
                    } else {
                        if (newIndex != -1) {
                            if (_this.onAdd) {
                                _this.onAdd(object, newIndex);
                            } else {
                                _this.onUpdate(object, newIndex);
                            }
                        }
                    }
                }, true);
            }
            _this.onComplete(results);
        }, function (error) {
            _this.onError(error);
        });
        return promise;
    }, destroy:function () {
        if (this._observe_h) {
            this._observe_h = this._observe_h.remove();
        }
        this.inherited(arguments);
    }});
});

