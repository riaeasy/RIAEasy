//>>built

define("dojox/mvc/StoreRefController", ["dojo/_base/declare", "dojo/_base/lang", "dojo/when", "./getStateful", "./ModelRefController"], function (declare, lang, when, getStateful, ModelRefController) {
    return declare("dojox.mvc.StoreRefController", ModelRefController, {store:null, getStatefulOptions:null, _refSourceModelProp:"model", queryStore:function (query, options) {
        if (!(this.store || {}).query) {
            return;
        }
        if (this._queryObserveHandle) {
            this._queryObserveHandle.cancel();
        }
        var _self = this, queryResult = this.store.query(query, options), result = when(queryResult, function (results) {
            if (_self._beingDestroyed) {
                return;
            }
            results = getStateful(results, _self.getStatefulOptions);
            _self.set(_self._refSourceModelProp, results);
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
        if (!(this.store || {}).get) {
            return;
        }
        if (this._queryObserveHandle) {
            this._queryObserveHandle.cancel();
        }
        var _self = this;
        result = when(this.store.get(id, options), function (result) {
            if (_self._beingDestroyed) {
                return;
            }
            result = getStateful(result, _self.getStatefulOptions);
            _self.set(_self._refSourceModelProp, result);
            return result;
        });
        return result;
    }, putStore:function (object, options) {
        if (!(this.store || {}).put) {
            return;
        }
        return this.store.put(object, options);
    }, addStore:function (object, options) {
        if (!(this.store || {}).add) {
            return;
        }
        return this.store.add(object, options);
    }, removeStore:function (id, options) {
        if (!(this.store || {}).remove) {
            return;
        }
        return this.store.remove(id, options);
    }});
});

