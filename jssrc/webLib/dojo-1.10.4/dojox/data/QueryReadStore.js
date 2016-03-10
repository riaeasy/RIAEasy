//>>built

define("dojox/data/QueryReadStore", ["dojo", "dojox", "dojo/data/util/sorter", "dojo/string"], function (dojo, dojox) {
    return dojo.declare("dojox.data.QueryReadStore", null, {url:"", requestMethod:"get", _className:"dojox.data.QueryReadStore", _items:[], _lastServerQuery:null, _numRows:-1, lastRequestHash:null, doClientPaging:false, doClientSorting:false, _itemsByIdentity:null, _identifier:null, _features:{"dojo.data.api.Read":true, "dojo.data.api.Identity":true}, _labelAttr:"label", constructor:function (params) {
        dojo.mixin(this, params);
    }, getValue:function (item, attribute, defaultValue) {
        this._assertIsItem(item);
        if (!dojo.isString(attribute)) {
            throw new Error(this._className + ".getValue(): Invalid attribute, string expected!");
        }
        if (!this.hasAttribute(item, attribute)) {
            if (defaultValue) {
                return defaultValue;
            }
        }
        return item.i[attribute];
    }, getValues:function (item, attribute) {
        this._assertIsItem(item);
        var ret = [];
        if (this.hasAttribute(item, attribute)) {
            ret.push(item.i[attribute]);
        }
        return ret;
    }, getAttributes:function (item) {
        this._assertIsItem(item);
        var ret = [];
        for (var i in item.i) {
            ret.push(i);
        }
        return ret;
    }, hasAttribute:function (item, attribute) {
        return this.isItem(item) && typeof item.i[attribute] != "undefined";
    }, containsValue:function (item, attribute, value) {
        var values = this.getValues(item, attribute);
        var len = values.length;
        for (var i = 0; i < len; i++) {
            if (values[i] == value) {
                return true;
            }
        }
        return false;
    }, isItem:function (something) {
        if (something) {
            return typeof something.r != "undefined" && something.r == this;
        }
        return false;
    }, isItemLoaded:function (something) {
        return this.isItem(something);
    }, loadItem:function (args) {
        if (this.isItemLoaded(args.item)) {
            return;
        }
    }, fetch:function (request) {
        request = request || {};
        if (!request.store) {
            request.store = this;
        }
        var self = this;
        var _errorHandler = function (errorData, requestObject) {
            if (requestObject.onError) {
                var scope = requestObject.scope || dojo.global;
                requestObject.onError.call(scope, errorData, requestObject);
            }
        };
        var _fetchHandler = function (items, requestObject, numRows) {
            var oldAbortFunction = requestObject.abort || null;
            var aborted = false;
            var startIndex = requestObject.start ? requestObject.start : 0;
            if (self.doClientPaging == false) {
                startIndex = 0;
            }
            var endIndex = requestObject.count ? (startIndex + requestObject.count) : items.length;
            requestObject.abort = function () {
                aborted = true;
                if (oldAbortFunction) {
                    oldAbortFunction.call(requestObject);
                }
            };
            var scope = requestObject.scope || dojo.global;
            if (!requestObject.store) {
                requestObject.store = self;
            }
            if (requestObject.onBegin) {
                requestObject.onBegin.call(scope, numRows, requestObject);
            }
            if (requestObject.sort && self.doClientSorting) {
                items.sort(dojo.data.util.sorter.createSortFunction(requestObject.sort, self));
            }
            if (requestObject.onItem) {
                for (var i = startIndex; (i < items.length) && (i < endIndex); ++i) {
                    var item = items[i];
                    if (!aborted) {
                        requestObject.onItem.call(scope, item, requestObject);
                    }
                }
            }
            if (requestObject.onComplete && !aborted) {
                var subset = null;
                if (!requestObject.onItem) {
                    subset = items.slice(startIndex, endIndex);
                }
                requestObject.onComplete.call(scope, subset, requestObject);
            }
        };
        this._fetchItems(request, _fetchHandler, _errorHandler);
        return request;
    }, getFeatures:function () {
        return this._features;
    }, close:function (request) {
    }, getLabel:function (item) {
        if (this._labelAttr && this.isItem(item)) {
            return this.getValue(item, this._labelAttr);
        }
        return undefined;
    }, getLabelAttributes:function (item) {
        if (this._labelAttr) {
            return [this._labelAttr];
        }
        return null;
    }, _xhrFetchHandler:function (data, request, fetchHandler, errorHandler) {
        data = this._filterResponse(data);
        if (data.label) {
            this._labelAttr = data.label;
        }
        var numRows = data.numRows || -1;
        this._items = [];
        dojo.forEach(data.items, function (e) {
            this._items.push({i:e, r:this});
        }, this);
        var identifier = data.identifier;
        this._itemsByIdentity = {};
        if (identifier) {
            this._identifier = identifier;
            var i;
            for (i = 0; i < this._items.length; ++i) {
                var item = this._items[i].i;
                var identity = item[identifier];
                if (!this._itemsByIdentity[identity]) {
                    this._itemsByIdentity[identity] = item;
                } else {
                    throw new Error(this._className + ":  The json data as specified by: [" + this.url + "] is malformed.  Items within the list have identifier: [" + identifier + "].  Value collided: [" + identity + "]");
                }
            }
        } else {
            this._identifier = Number;
            for (i = 0; i < this._items.length; ++i) {
                this._items[i].n = i;
            }
        }
        numRows = this._numRows = (numRows === -1) ? this._items.length : numRows;
        fetchHandler(this._items, request, numRows);
        this._numRows = numRows;
    }, _fetchItems:function (request, fetchHandler, errorHandler) {
        var serverQuery = request.serverQuery || request.query || {};
        if (!this.doClientPaging) {
            serverQuery.start = request.start || 0;
            if (request.count) {
                serverQuery.count = request.count;
            }
        }
        if (!this.doClientSorting && request.sort) {
            var sortInfo = [];
            dojo.forEach(request.sort, function (sort) {
                if (sort && sort.attribute) {
                    sortInfo.push((sort.descending ? "-" : "") + sort.attribute);
                }
            });
            serverQuery.sort = sortInfo.join(",");
        }
        if (this.doClientPaging && this._lastServerQuery !== null && dojo.toJson(serverQuery) == dojo.toJson(this._lastServerQuery)) {
            this._numRows = (this._numRows === -1) ? this._items.length : this._numRows;
            fetchHandler(this._items, request, this._numRows);
        } else {
            var xhrFunc = this.requestMethod.toLowerCase() == "post" ? dojo.xhrPost : dojo.xhrGet;
            var xhrHandler = xhrFunc({url:this.url, handleAs:"json-comment-optional", content:serverQuery, failOk:true});
            request.abort = function () {
                xhrHandler.cancel();
            };
            xhrHandler.addCallback(dojo.hitch(this, function (data) {
                this._xhrFetchHandler(data, request, fetchHandler, errorHandler);
            }));
            xhrHandler.addErrback(function (error) {
                errorHandler(error, request);
            });
            this.lastRequestHash = new Date().getTime() + "-" + String(Math.random()).substring(2);
            this._lastServerQuery = dojo.mixin({}, serverQuery);
        }
    }, _filterResponse:function (data) {
        return data;
    }, _assertIsItem:function (item) {
        if (!this.isItem(item)) {
            throw new Error(this._className + ": Invalid item argument.");
        }
    }, _assertIsAttribute:function (attribute) {
        if (typeof attribute !== "string") {
            throw new Error(this._className + ": Invalid attribute argument ('" + attribute + "').");
        }
    }, fetchItemByIdentity:function (keywordArgs) {
        if (this._itemsByIdentity) {
            var item = this._itemsByIdentity[keywordArgs.identity];
            if (!(item === undefined)) {
                if (keywordArgs.onItem) {
                    var scope = keywordArgs.scope ? keywordArgs.scope : dojo.global;
                    keywordArgs.onItem.call(scope, {i:item, r:this});
                }
                return;
            }
        }
        var _errorHandler = function (errorData, requestObject) {
            var scope = keywordArgs.scope ? keywordArgs.scope : dojo.global;
            if (keywordArgs.onError) {
                keywordArgs.onError.call(scope, errorData);
            }
        };
        var _fetchHandler = function (items, requestObject) {
            var scope = keywordArgs.scope ? keywordArgs.scope : dojo.global;
            try {
                var item = null;
                if (items && items.length == 1) {
                    item = items[0];
                }
                if (keywordArgs.onItem) {
                    keywordArgs.onItem.call(scope, item);
                }
            }
            catch (error) {
                if (keywordArgs.onError) {
                    keywordArgs.onError.call(scope, error);
                }
            }
        };
        var request = {serverQuery:{id:keywordArgs.identity}};
        this._fetchItems(request, _fetchHandler, _errorHandler);
    }, getIdentity:function (item) {
        var identifier = null;
        if (this._identifier === Number) {
            identifier = item.n;
        } else {
            identifier = item.i[this._identifier];
        }
        return identifier;
    }, getIdentityAttributes:function (item) {
        return [this._identifier];
    }});
});

