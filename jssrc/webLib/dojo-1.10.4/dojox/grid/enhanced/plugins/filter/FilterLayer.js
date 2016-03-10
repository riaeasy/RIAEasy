//>>built

define("dojox/grid/enhanced/plugins/filter/FilterLayer", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/kernel", "dojo/_base/json", "../_StoreLayer"], function (declare, lang, kernel, json, layers) {
    var cmdSetFilter = "filter", cmdClearFilter = "clear", hitchIfCan = function (scope, func) {
        return func ? lang.hitch(scope || kernel.global, func) : function () {
        };
    }, shallowClone = function (obj) {
        var res = {};
        if (obj && lang.isObject(obj)) {
            for (var name in obj) {
                res[name] = obj[name];
            }
        }
        return res;
    };
    var _FilterLayerMixin = declare("dojox.grid.enhanced.plugins.filter._FilterLayerMixin", null, {tags:["sizeChange"], name:function () {
        return "filter";
    }, onFilterDefined:function (filter) {
    }, onFiltered:function (filteredSize, totalSize) {
    }});
    var ServerSideFilterLayer = declare("dojox.grid.enhanced.plugins.filter.ServerSideFilterLayer", [layers._ServerSideLayer, _FilterLayerMixin], {constructor:function (args) {
        this._onUserCommandLoad = args.setupFilterQuery || this._onUserCommandLoad;
        this.filterDef(null);
    }, filterDef:function (filter) {
        if (filter) {
            this._filter = filter;
            var obj = filter.toObject();
            this.command(cmdSetFilter, this._isStateful ? json.toJson(obj) : obj);
            this.command(cmdClearFilter, null);
            this.useCommands(true);
            this.onFilterDefined(filter);
        } else {
            if (filter === null) {
                this._filter = null;
                this.command(cmdSetFilter, null);
                this.command(cmdClearFilter, true);
                this.useCommands(true);
                this.onFilterDefined(null);
            }
        }
        return this._filter;
    }, onCommandLoad:function (responce, userRequest) {
        this.inherited(arguments);
        var oldOnBegin = userRequest.onBegin;
        if (this._isStateful) {
            var filteredSize;
            if (responce) {
                this.command(cmdSetFilter, null);
                this.command(cmdClearFilter, null);
                this.useCommands(false);
                var sizes = responce.split(",");
                if (sizes.length >= 2) {
                    filteredSize = this._filteredSize = parseInt(sizes[0], 10);
                    this.onFiltered(filteredSize, parseInt(sizes[1], 10));
                } else {
                    return;
                }
            } else {
                filteredSize = this._filteredSize;
            }
            if (this.enabled()) {
                userRequest.onBegin = function (size, req) {
                    hitchIfCan(userRequest.scope, oldOnBegin)(filteredSize, req);
                };
            }
        } else {
            var _this = this;
            userRequest.onBegin = function (size, req) {
                if (!_this._filter) {
                    _this._storeSize = size;
                }
                _this.onFiltered(size, _this._storeSize || size);
                req.onBegin = oldOnBegin;
                hitchIfCan(userRequest.scope, oldOnBegin)(size, req);
            };
        }
    }});
    var ClientSideFilterLayer = declare("dojox.grid.enhanced.plugins.filter.ClientSideFilterLayer", [layers._StoreLayer, _FilterLayerMixin], {_storeSize:-1, _fetchAll:true, constructor:function (args) {
        this.filterDef(null);
        args = lang.isObject(args) ? args : {};
        this.fetchAllOnFirstFilter(args.fetchAll);
        this._getter = lang.isFunction(args.getter) ? args.getter : this._defaultGetter;
    }, _defaultGetter:function (datarow, colName, rowIndex, store) {
        return store.getValue(datarow, colName);
    }, filterDef:function (filter) {
        if (filter !== undefined) {
            this._filter = filter;
            this.invalidate();
            this.onFilterDefined(filter);
        }
        return this._filter;
    }, setGetter:function (getter) {
        if (lang.isFunction(getter)) {
            this._getter = getter;
        }
    }, fetchAllOnFirstFilter:function (toFetchAll) {
        if (toFetchAll !== undefined) {
            this._fetchAll = !!toFetchAll;
        }
        return this._fetchAll;
    }, invalidate:function () {
        this._items = [];
        this._nextUnfetchedIdx = 0;
        this._result = [];
        this._indexMap = [];
        this._resultStartIdx = 0;
    }, _fetch:function (userRequest, filterRequest) {
        if (!this._filter) {
            var old_onbegin = userRequest.onBegin, _this = this;
            userRequest.onBegin = function (size, r) {
                hitchIfCan(userRequest.scope, old_onbegin)(size, r);
                _this.onFiltered(size, size);
            };
            this.originFetch(userRequest);
            return userRequest;
        }
        try {
            var start = filterRequest ? filterRequest._nextResultItemIdx : userRequest.start;
            start = start || 0;
            if (!filterRequest) {
                this._result = [];
                this._resultStartIdx = start;
                var sortStr;
                if (lang.isArray(userRequest.sort) && userRequest.sort.length > 0 && (sortStr = json.toJson(userRequest.sort)) != this._lastSortInfo) {
                    this.invalidate();
                    this._lastSortInfo = sortStr;
                }
            }
            var end = typeof userRequest.count == "number" ? start + userRequest.count - this._result.length : this._items.length;
            if (this._result.length) {
                this._result = this._result.concat(this._items.slice(start, end));
            } else {
                this._result = this._items.slice(userRequest.start, typeof userRequest.count == "number" ? userRequest.start + userRequest.count : this._items.length);
            }
            if (this._result.length >= userRequest.count || this._hasReachedStoreEnd()) {
                this._completeQuery(userRequest);
            } else {
                if (!filterRequest) {
                    filterRequest = shallowClone(userRequest);
                    filterRequest.onBegin = lang.hitch(this, this._onFetchBegin);
                    filterRequest.onComplete = lang.hitch(this, function (items, req) {
                        this._nextUnfetchedIdx += items.length;
                        this._doFilter(items, req.start, userRequest);
                        this._fetch(userRequest, req);
                    });
                }
                filterRequest.start = this._nextUnfetchedIdx;
                if (this._fetchAll) {
                    delete filterRequest.count;
                }
                filterRequest._nextResultItemIdx = end < this._items.length ? end : this._items.length;
                this.originFetch(filterRequest);
            }
        }
        catch (e) {
            if (userRequest.onError) {
                hitchIfCan(userRequest.scope, userRequest.onError)(e, userRequest);
            } else {
                throw e;
            }
        }
        return userRequest;
    }, _hasReachedStoreEnd:function () {
        return this._storeSize >= 0 && this._nextUnfetchedIdx >= this._storeSize;
    }, _applyFilter:function (datarow, rowIndex) {
        var g = this._getter, s = this._store;
        try {
            return !!(this._filter.applyRow(datarow, function (item, arg) {
                return g(item, arg, rowIndex, s);
            }).getValue());
        }
        catch (e) {
            console.warn("FilterLayer._applyFilter() error: ", e);
            return false;
        }
    }, _doFilter:function (items, startIdx, userRequest) {
        for (var i = 0, cnt = 0; i < items.length; ++i) {
            if (this._applyFilter(items[i], startIdx + i)) {
                hitchIfCan(userRequest.scope, userRequest.onItem)(items[i], userRequest);
                cnt += this._addCachedItems(items[i], this._items.length);
                this._indexMap.push(startIdx + i);
            }
        }
    }, _onFetchBegin:function (size, req) {
        this._storeSize = size;
    }, _completeQuery:function (userRequest) {
        var size = this._items.length;
        if (this._nextUnfetchedIdx < this._storeSize) {
            size++;
        }
        hitchIfCan(userRequest.scope, userRequest.onBegin)(size, userRequest);
        this.onFiltered(this._items.length, this._storeSize);
        hitchIfCan(userRequest.scope, userRequest.onComplete)(this._result, userRequest);
    }, _addCachedItems:function (items, filterStartIdx) {
        if (!lang.isArray(items)) {
            items = [items];
        }
        for (var k = 0; k < items.length; ++k) {
            this._items[filterStartIdx + k] = items[k];
        }
        return items.length;
    }, onRowMappingChange:function (mapping) {
        if (this._filter) {
            var m = lang.clone(mapping), alreadyUpdated = {};
            for (var r in m) {
                r = parseInt(r, 10);
                mapping[this._indexMap[r]] = this._indexMap[m[r]];
                if (!alreadyUpdated[this._indexMap[r]]) {
                    alreadyUpdated[this._indexMap[r]] = true;
                }
                if (!alreadyUpdated[r]) {
                    alreadyUpdated[r] = true;
                    delete mapping[r];
                }
            }
        }
    }});
    return lang.mixin({ServerSideFilterLayer:ServerSideFilterLayer, ClientSideFilterLayer:ClientSideFilterLayer}, layers);
});

