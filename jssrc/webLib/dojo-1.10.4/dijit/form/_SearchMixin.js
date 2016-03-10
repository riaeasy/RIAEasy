//>>built

define("dijit/form/_SearchMixin", ["dojo/_base/declare", "dojo/keys", "dojo/_base/lang", "dojo/query", "dojo/string", "dojo/when", "../registry"], function (declare, keys, lang, query, string, when, registry) {
    return declare("dijit.form._SearchMixin", null, {pageSize:Infinity, store:null, fetchProperties:{}, query:{}, list:"", _setListAttr:function (list) {
        this._set("list", list);
    }, searchDelay:200, searchAttr:"name", queryExpr:"${0}*", ignoreCase:true, _patternToRegExp:function (pattern) {
        return new RegExp("^" + pattern.replace(/(\\.)|(\*)|(\?)|\W/g, function (str, literal, star, question) {
            return star ? ".*" : question ? "." : literal ? literal : "\\" + str;
        }) + "$", this.ignoreCase ? "mi" : "m");
    }, _abortQuery:function () {
        if (this.searchTimer) {
            this.searchTimer = this.searchTimer.remove();
        }
        if (this._queryDeferHandle) {
            this._queryDeferHandle = this._queryDeferHandle.remove();
        }
        if (this._fetchHandle) {
            if (this._fetchHandle.abort) {
                this._cancelingQuery = true;
                this._fetchHandle.abort();
                this._cancelingQuery = false;
            }
            if (this._fetchHandle.cancel) {
                this._cancelingQuery = true;
                this._fetchHandle.cancel();
                this._cancelingQuery = false;
            }
            this._fetchHandle = null;
        }
    }, _processInput:function (evt) {
        if (this.disabled || this.readOnly) {
            return;
        }
        var key = evt.charOrCode;
        if ("type" in evt && evt.type.substring(0, 3) == "key" && (evt.altKey || ((evt.ctrlKey || evt.metaKey) && (key != "x" && key != "v")) || key == keys.SHIFT)) {
            return;
        }
        var doSearch = false;
        this._prev_key_backspace = false;
        switch (key) {
          case keys.DELETE:
          case keys.BACKSPACE:
            this._prev_key_backspace = true;
            this._maskValidSubsetError = true;
            doSearch = true;
            break;
          default:
            doSearch = typeof key == "string" || key == 229;
        }
        if (doSearch) {
            if (!this.store) {
                this.onSearch();
            } else {
                this.searchTimer = this.defer("_startSearchFromInput", 1);
            }
        }
    }, onSearch:function () {
    }, _startSearchFromInput:function () {
        this._startSearch(this.focusNode.value);
    }, _startSearch:function (text) {
        this._abortQuery();
        var _this = this, query = lang.clone(this.query), options = {start:0, count:this.pageSize, queryOptions:{ignoreCase:this.ignoreCase, deep:true}}, qs = string.substitute(this.queryExpr, [text.replace(/([\\\*\?])/g, "\\$1")]), q, startQuery = function () {
            var resPromise = _this._fetchHandle = _this.store.query(query, options);
            if (_this.disabled || _this.readOnly || (q !== _this._lastQuery)) {
                return;
            }
            when(resPromise, function (res) {
                _this._fetchHandle = null;
                if (!_this.disabled && !_this.readOnly && (q === _this._lastQuery)) {
                    when(resPromise.total, function (total) {
                        res.total = total;
                        var pageSize = _this.pageSize;
                        if (isNaN(pageSize) || pageSize > res.total) {
                            pageSize = res.total;
                        }
                        res.nextPage = function (direction) {
                            options.direction = direction = direction !== false;
                            options.count = pageSize;
                            if (direction) {
                                options.start += res.length;
                                if (options.start >= res.total) {
                                    options.count = 0;
                                }
                            } else {
                                options.start -= pageSize;
                                if (options.start < 0) {
                                    options.count = Math.max(pageSize + options.start, 0);
                                    options.start = 0;
                                }
                            }
                            if (options.count <= 0) {
                                res.length = 0;
                                _this.onSearch(res, query, options);
                            } else {
                                startQuery();
                            }
                        };
                        _this.onSearch(res, query, options);
                    });
                }
            }, function (err) {
                _this._fetchHandle = null;
                if (!_this._cancelingQuery) {
                    console.error(_this.declaredClass + " " + err.toString());
                }
            });
        };
        lang.mixin(options, this.fetchProperties);
        if (this.store._oldAPI) {
            q = qs;
        } else {
            q = this._patternToRegExp(qs);
            q.toString = function () {
                return qs;
            };
        }
        this._lastQuery = query[this.searchAttr] = q;
        this._queryDeferHandle = this.defer(startQuery, this.searchDelay);
    }, constructor:function () {
        this.query = {};
        this.fetchProperties = {};
    }, postMixInProperties:function () {
        if (!this.store) {
            var list = this.list;
            if (list) {
                this.store = registry.byId(list);
            }
        }
        this.inherited(arguments);
    }});
});

