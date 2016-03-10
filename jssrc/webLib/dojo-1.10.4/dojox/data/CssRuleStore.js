//>>built

define("dojox/data/CssRuleStore", ["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/array", "dojo/_base/json", "dojo/_base/kernel", "dojo/_base/sniff", "dojo/data/util/sorter", "dojo/data/util/filter", "./css"], function (lang, declare, array, jsonUtil, kernel, has, sorter, filter, css) {
    return declare("dojox.data.CssRuleStore", null, {_storeRef:"_S", _labelAttribute:"selector", _cache:null, _browserMap:null, _cName:"dojox.data.CssRuleStore", constructor:function (keywordParameters) {
        if (keywordParameters) {
            lang.mixin(this, keywordParameters);
        }
        this._cache = {};
        this._allItems = null;
        this._waiting = [];
        this.gatherHandle = null;
        var self = this;
        function gatherRules() {
            try {
                self.context = css.determineContext(self.context);
                if (self.gatherHandle) {
                    clearInterval(self.gatherHandle);
                    self.gatherHandle = null;
                }
                while (self._waiting.length) {
                    var item = self._waiting.pop();
                    css.rules.forEach(item.forFunc, null, self.context);
                    item.finishFunc();
                }
            }
            catch (e) {
            }
        }
        this.gatherHandle = setInterval(gatherRules, 250);
    }, setContext:function (context) {
        if (context) {
            this.close();
            this.context = css.determineContext(context);
        }
    }, getFeatures:function () {
        return {"dojo.data.api.Read":true};
    }, isItem:function (item) {
        if (item && item[this._storeRef] == this) {
            return true;
        }
        return false;
    }, hasAttribute:function (item, attribute) {
        this._assertIsItem(item);
        this._assertIsAttribute(attribute);
        var attrs = this.getAttributes(item);
        if (array.indexOf(attrs, attribute) != -1) {
            return true;
        }
        return false;
    }, getAttributes:function (item) {
        this._assertIsItem(item);
        var attrs = ["selector", "classes", "rule", "style", "cssText", "styleSheet", "parentStyleSheet", "parentStyleSheetHref"];
        var style = item.rule.style;
        if (style) {
            var key;
            for (key in style) {
                attrs.push("style." + key);
            }
        }
        return attrs;
    }, getValue:function (item, attribute, defaultValue) {
        var values = this.getValues(item, attribute);
        var value = defaultValue;
        if (values && values.length > 0) {
            return values[0];
        }
        return defaultValue;
    }, getValues:function (item, attribute) {
        this._assertIsItem(item);
        this._assertIsAttribute(attribute);
        var value = null;
        if (attribute === "selector") {
            value = item.rule["selectorText"];
            if (value && lang.isString(value)) {
                value = value.split(",");
            }
        } else {
            if (attribute === "classes") {
                value = item.classes;
            } else {
                if (attribute === "rule") {
                    value = item.rule.rule;
                } else {
                    if (attribute === "style") {
                        value = item.rule.style;
                    } else {
                        if (attribute === "cssText") {
                            if (has("ie")) {
                                if (item.rule.style) {
                                    value = item.rule.style.cssText;
                                    if (value) {
                                        value = "{ " + value.toLowerCase() + " }";
                                    }
                                }
                            } else {
                                value = item.rule.cssText;
                                if (value) {
                                    value = value.substring(value.indexOf("{"), value.length);
                                }
                            }
                        } else {
                            if (attribute === "styleSheet") {
                                value = item.rule.styleSheet;
                            } else {
                                if (attribute === "parentStyleSheet") {
                                    value = item.rule.parentStyleSheet;
                                } else {
                                    if (attribute === "parentStyleSheetHref") {
                                        if (item.href) {
                                            value = item.href;
                                        }
                                    } else {
                                        if (attribute.indexOf("style.") === 0) {
                                            var attr = attribute.substring(attribute.indexOf("."), attribute.length);
                                            value = item.rule.style[attr];
                                        } else {
                                            value = [];
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (value !== undefined) {
            if (!lang.isArray(value)) {
                value = [value];
            }
        }
        return value;
    }, getLabel:function (item) {
        this._assertIsItem(item);
        return this.getValue(item, this._labelAttribute);
    }, getLabelAttributes:function (item) {
        return [this._labelAttribute];
    }, containsValue:function (item, attribute, value) {
        var regexp = undefined;
        if (typeof value === "string") {
            regexp = filter.patternToRegExp(value, false);
        }
        return this._containsValue(item, attribute, value, regexp);
    }, isItemLoaded:function (something) {
        return this.isItem(something);
    }, loadItem:function (keywordArgs) {
        this._assertIsItem(keywordArgs.item);
    }, fetch:function (request) {
        request = request || {};
        if (!request.store) {
            request.store = this;
        }
        var scope = request.scope || kernel.global;
        if (this._pending && this._pending.length > 0) {
            this._pending.push({request:request, fetch:true});
        } else {
            this._pending = [{request:request, fetch:true}];
            this._fetch(request);
        }
        return request;
    }, _fetch:function (request) {
        var scope = request.scope || kernel.global;
        if (this._allItems === null) {
            this._allItems = {};
            try {
                if (this.gatherHandle) {
                    this._waiting.push({"forFunc":lang.hitch(this, this._handleRule), "finishFunc":lang.hitch(this, this._handleReturn)});
                } else {
                    css.rules.forEach(lang.hitch(this, this._handleRule), null, this.context);
                    this._handleReturn();
                }
            }
            catch (e) {
                if (request.onError) {
                    request.onError.call(scope, e, request);
                }
            }
        } else {
            this._handleReturn();
        }
    }, _handleRule:function (rule, styleSheet, href) {
        var selector = rule["selectorText"];
        var s = selector.split(" ");
        var classes = [];
        for (var j = 0; j < s.length; j++) {
            var tmp = s[j];
            var first = tmp.indexOf(".");
            if (tmp && tmp.length > 0 && first !== -1) {
                var last = tmp.indexOf(",") || tmp.indexOf("[");
                tmp = tmp.substring(first, ((last !== -1 && last > first) ? last : tmp.length));
                classes.push(tmp);
            }
        }
        var item = {};
        item.rule = rule;
        item.styleSheet = styleSheet;
        item.href = href;
        item.classes = classes;
        item[this._storeRef] = this;
        if (!this._allItems[selector]) {
            this._allItems[selector] = [];
        }
        this._allItems[selector].push(item);
    }, _handleReturn:function () {
        var _inProgress = [];
        var items = [];
        var item = null;
        for (var i in this._allItems) {
            item = this._allItems[i];
            for (var j in item) {
                items.push(item[j]);
            }
        }
        var requestInfo;
        while (this._pending.length) {
            requestInfo = this._pending.pop();
            requestInfo.request._items = items;
            _inProgress.push(requestInfo);
        }
        while (_inProgress.length) {
            requestInfo = _inProgress.pop();
            this._handleFetchReturn(requestInfo.request);
        }
    }, _handleFetchReturn:function (request) {
        var scope = request.scope || kernel.global;
        var items = [];
        var cacheKey = "all";
        var i;
        if (request.query) {
            cacheKey = jsonUtil.toJson(request.query);
        }
        if (this._cache[cacheKey]) {
            items = this._cache[cacheKey];
        } else {
            if (request.query) {
                for (i in request._items) {
                    var item = request._items[i];
                    var ignoreCase = (request.queryOptions ? request.queryOptions.ignoreCase : false);
                    var regexpList = {};
                    var key;
                    var value;
                    for (key in request.query) {
                        value = request.query[key];
                        if (typeof value === "string") {
                            regexpList[key] = filter.patternToRegExp(value, ignoreCase);
                        }
                    }
                    var match = true;
                    for (key in request.query) {
                        value = request.query[key];
                        if (!this._containsValue(item, key, value, regexpList[key])) {
                            match = false;
                        }
                    }
                    if (match) {
                        items.push(item);
                    }
                }
                this._cache[cacheKey] = items;
            } else {
                for (i in request._items) {
                    items.push(request._items[i]);
                }
            }
        }
        var total = items.length;
        if (request.sort) {
            items.sort(sorter.createSortFunction(request.sort, this));
        }
        var start = 0;
        var count = items.length;
        if (request.start > 0 && request.start < items.length) {
            start = request.start;
        }
        if (request.count && request.count) {
            count = request.count;
        }
        var endIdx = start + count;
        if (endIdx > items.length) {
            endIdx = items.length;
        }
        items = items.slice(start, endIdx);
        if (request.onBegin) {
            request.onBegin.call(scope, total, request);
        }
        if (request.onItem) {
            if (lang.isArray(items)) {
                for (i = 0; i < items.length; i++) {
                    request.onItem.call(scope, items[i], request);
                }
                if (request.onComplete) {
                    request.onComplete.call(scope, null, request);
                }
            }
        } else {
            if (request.onComplete) {
                request.onComplete.call(scope, items, request);
            }
        }
        return request;
    }, close:function () {
        this._cache = {};
        this._allItems = null;
    }, _assertIsItem:function (item) {
        if (!this.isItem(item)) {
            throw new Error(this._cName + ": Invalid item argument.");
        }
    }, _assertIsAttribute:function (attribute) {
        if (typeof attribute !== "string") {
            throw new Error(this._cName + ": Invalid attribute argument.");
        }
    }, _containsValue:function (item, attribute, value, regexp) {
        return array.some(this.getValues(item, attribute), function (possibleValue) {
            if (possibleValue !== null && !lang.isObject(possibleValue) && regexp) {
                if (possibleValue.toString().match(regexp)) {
                    return true;
                }
            } else {
                if (value === possibleValue) {
                    return true;
                }
            }
            return false;
        });
    }});
});

