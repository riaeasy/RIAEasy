//>>built

define("dojox/data/ServiceStore", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array"], function (declare, lang, array) {
    return declare("dojox.data.ServiceStore", lang.getObject("dojox.data.ClientFilter", 0) || null, {service:null, constructor:function (options) {
        this.byId = this.fetchItemByIdentity;
        this._index = {};
        if (options) {
            lang.mixin(this, options);
        }
        this.idAttribute = (options && options.idAttribute) || (this.schema && this.schema._idAttr);
    }, schema:null, idAttribute:"id", labelAttribute:"label", syncMode:false, estimateCountFactor:1, getSchema:function () {
        return this.schema;
    }, loadLazyValues:true, getValue:function (item, property, defaultValue) {
        var value = item[property];
        return value || (property in item ? value : item._loadObject ? (dojox.rpc._sync = true) && arguments.callee.call(this, dojox.data.ServiceStore.prototype.loadItem({item:item}) || {}, property, defaultValue) : defaultValue);
    }, getValues:function (item, property) {
        var val = this.getValue(item, property);
        return val instanceof Array ? val : val === undefined ? [] : [val];
    }, getAttributes:function (item) {
        var res = [];
        for (var i in item) {
            if (item.hasOwnProperty(i) && !(i.charAt(0) == "_" && i.charAt(1) == "_")) {
                res.push(i);
            }
        }
        return res;
    }, hasAttribute:function (item, attribute) {
        return attribute in item;
    }, containsValue:function (item, attribute, value) {
        return array.indexOf(this.getValues(item, attribute), value) > -1;
    }, isItem:function (item) {
        return (typeof item == "object") && item && !(item instanceof Date);
    }, isItemLoaded:function (item) {
        return item && !item._loadObject;
    }, loadItem:function (args) {
        var item;
        if (args.item._loadObject) {
            args.item._loadObject(function (result) {
                item = result;
                delete item._loadObject;
                var func = result instanceof Error ? args.onError : args.onItem;
                if (func) {
                    func.call(args.scope, result);
                }
            });
        } else {
            if (args.onItem) {
                args.onItem.call(args.scope, args.item);
            }
        }
        return item;
    }, _currentId:0, _processResults:function (results, deferred) {
        if (results && typeof results == "object") {
            var id = results.__id;
            if (!id) {
                if (this.idAttribute) {
                    id = results[this.idAttribute];
                } else {
                    id = this._currentId++;
                }
                if (id !== undefined) {
                    var existingObj = this._index[id];
                    if (existingObj) {
                        for (var j in existingObj) {
                            delete existingObj[j];
                        }
                        results = lang.mixin(existingObj, results);
                    }
                    results.__id = id;
                    this._index[id] = results;
                }
            }
            for (var i in results) {
                results[i] = this._processResults(results[i], deferred).items;
            }
            var count = results.length;
        }
        return {totalCount:deferred.request.count == count ? (deferred.request.start || 0) + count * this.estimateCountFactor : count, items:results};
    }, close:function (request) {
        return request && request.abort && request.abort();
    }, fetch:function (args) {
        args = args || {};
        if ("syncMode" in args ? args.syncMode : this.syncMode) {
            dojox.rpc._sync = true;
        }
        var self = this;
        var scope = args.scope || self;
        var defResult = this.cachingFetch ? this.cachingFetch(args) : this._doQuery(args);
        defResult.request = args;
        defResult.addCallback(function (results) {
            if (args.clientFetch) {
                results = self.clientSideFetch({query:args.clientFetch, sort:args.sort, start:args.start, count:args.count}, results);
            }
            var resultSet = self._processResults(results, defResult);
            results = args.results = resultSet.items;
            if (args.onBegin) {
                args.onBegin.call(scope, resultSet.totalCount, args);
            }
            if (args.onItem) {
                for (var i = 0; i < results.length; i++) {
                    args.onItem.call(scope, results[i], args);
                }
            }
            if (args.onComplete) {
                args.onComplete.call(scope, args.onItem ? null : results, args);
            }
            return results;
        });
        defResult.addErrback(args.onError && function (err) {
            return args.onError.call(scope, err, args);
        });
        args.abort = function () {
            defResult.cancel();
        };
        args.store = this;
        return args;
    }, _doQuery:function (args) {
        var query = typeof args.queryStr == "string" ? args.queryStr : args.query;
        return this.service(query);
    }, getFeatures:function () {
        return {"dojo.data.api.Read":true, "dojo.data.api.Identity":true, "dojo.data.api.Schema":this.schema};
    }, getLabel:function (item) {
        return this.getValue(item, this.labelAttribute);
    }, getLabelAttributes:function (item) {
        return [this.labelAttribute];
    }, getIdentity:function (item) {
        return item.__id;
    }, getIdentityAttributes:function (item) {
        return [this.idAttribute];
    }, fetchItemByIdentity:function (args) {
        var item = this._index[(args._prefix || "") + args.identity];
        if (item) {
            if (item._loadObject) {
                args.item = item;
                return this.loadItem(args);
            } else {
                if (args.onItem) {
                    args.onItem.call(args.scope, item);
                }
            }
        } else {
            return this.fetch({query:args.identity, onComplete:args.onItem, onError:args.onError, scope:args.scope}).results;
        }
        return item;
    }});
});

