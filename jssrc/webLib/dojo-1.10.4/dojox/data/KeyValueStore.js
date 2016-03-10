//>>built

define("dojox/data/KeyValueStore", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/xhr", "dojo/_base/kernel", "dojo/data/util/simpleFetch", "dojo/data/util/filter"], function (declare, lang, xhr, kernel, simpleFetch, filterUtil) {
    var KeyValueStore = declare("dojox.data.KeyValueStore", null, {constructor:function (keywordParameters) {
        if (keywordParameters.url) {
            this.url = keywordParameters.url;
        }
        this._keyValueString = keywordParameters.data;
        this._keyValueVar = keywordParameters.dataVar;
        this._keyAttribute = "key";
        this._valueAttribute = "value";
        this._storeProp = "_keyValueStore";
        this._features = {"dojo.data.api.Read":true, "dojo.data.api.Identity":true};
        this._loadInProgress = false;
        this._queuedFetches = [];
        if (keywordParameters && "urlPreventCache" in keywordParameters) {
            this.urlPreventCache = keywordParameters.urlPreventCache ? true : false;
        }
    }, url:"", data:"", urlPreventCache:false, _assertIsItem:function (item) {
        if (!this.isItem(item)) {
            throw new Error("dojox.data.KeyValueStore: a function was passed an item argument that was not an item");
        }
    }, _assertIsAttribute:function (item, attribute) {
        if (!lang.isString(attribute)) {
            throw new Error("dojox.data.KeyValueStore: a function was passed an attribute argument that was not an attribute object nor an attribute name string");
        }
    }, getValue:function (item, attribute, defaultValue) {
        this._assertIsItem(item);
        this._assertIsAttribute(item, attribute);
        var value;
        if (attribute == this._keyAttribute) {
            value = item[this._keyAttribute];
        } else {
            value = item[this._valueAttribute];
        }
        if (value === undefined) {
            value = defaultValue;
        }
        return value;
    }, getValues:function (item, attribute) {
        var value = this.getValue(item, attribute);
        return (value ? [value] : []);
    }, getAttributes:function (item) {
        return [this._keyAttribute, this._valueAttribute, item[this._keyAttribute]];
    }, hasAttribute:function (item, attribute) {
        this._assertIsItem(item);
        this._assertIsAttribute(item, attribute);
        return (attribute == this._keyAttribute || attribute == this._valueAttribute || attribute == item[this._keyAttribute]);
    }, containsValue:function (item, attribute, value) {
        var regexp = undefined;
        if (typeof value === "string") {
            regexp = filterUtil.patternToRegExp(value, false);
        }
        return this._containsValue(item, attribute, value, regexp);
    }, _containsValue:function (item, attribute, value, regexp) {
        var values = this.getValues(item, attribute);
        for (var i = 0; i < values.length; ++i) {
            var possibleValue = values[i];
            if (typeof possibleValue === "string" && regexp) {
                return (possibleValue.match(regexp) !== null);
            } else {
                if (value === possibleValue) {
                    return true;
                }
            }
        }
        return false;
    }, isItem:function (something) {
        if (something && something[this._storeProp] === this) {
            return true;
        }
        return false;
    }, isItemLoaded:function (something) {
        return this.isItem(something);
    }, loadItem:function (keywordArgs) {
    }, getFeatures:function () {
        return this._features;
    }, close:function (request) {
    }, getLabel:function (item) {
        return item[this._keyAttribute];
    }, getLabelAttributes:function (item) {
        return [this._keyAttribute];
    }, _fetchItems:function (keywordArgs, findCallback, errorCallback) {
        var self = this;
        var filter = function (requestArgs, arrayOfAllItems) {
            var items = null;
            if (requestArgs.query) {
                items = [];
                var ignoreCase = requestArgs.queryOptions ? requestArgs.queryOptions.ignoreCase : false;
                var regexpList = {};
                for (var key in requestArgs.query) {
                    var value = requestArgs.query[key];
                    if (typeof value === "string") {
                        regexpList[key] = filterUtil.patternToRegExp(value, ignoreCase);
                    }
                }
                for (var i = 0; i < arrayOfAllItems.length; ++i) {
                    var match = true;
                    var candidateItem = arrayOfAllItems[i];
                    for (var key in requestArgs.query) {
                        var value = requestArgs.query[key];
                        if (!self._containsValue(candidateItem, key, value, regexpList[key])) {
                            match = false;
                        }
                    }
                    if (match) {
                        items.push(candidateItem);
                    }
                }
            } else {
                if (requestArgs.identity) {
                    items = [];
                    var item;
                    for (var key in arrayOfAllItems) {
                        item = arrayOfAllItems[key];
                        if (item[self._keyAttribute] == requestArgs.identity) {
                            items.push(item);
                            break;
                        }
                    }
                } else {
                    if (arrayOfAllItems.length > 0) {
                        items = arrayOfAllItems.slice(0, arrayOfAllItems.length);
                    }
                }
            }
            findCallback(items, requestArgs);
        };
        if (this._loadFinished) {
            filter(keywordArgs, this._arrayOfAllItems);
        } else {
            if (this.url !== "") {
                if (this._loadInProgress) {
                    this._queuedFetches.push({args:keywordArgs, filter:filter});
                } else {
                    this._loadInProgress = true;
                    var getArgs = {url:self.url, handleAs:"json-comment-filtered", preventCache:this.urlPreventCache};
                    var getHandler = xhr.get(getArgs);
                    getHandler.addCallback(function (data) {
                        self._processData(data);
                        filter(keywordArgs, self._arrayOfAllItems);
                        self._handleQueuedFetches();
                    });
                    getHandler.addErrback(function (error) {
                        self._loadInProgress = false;
                        throw error;
                    });
                }
            } else {
                if (this._keyValueString) {
                    this._processData(eval(this._keyValueString));
                    this._keyValueString = null;
                    filter(keywordArgs, this._arrayOfAllItems);
                } else {
                    if (this._keyValueVar) {
                        this._processData(this._keyValueVar);
                        this._keyValueVar = null;
                        filter(keywordArgs, this._arrayOfAllItems);
                    } else {
                        throw new Error("dojox.data.KeyValueStore: No source data was provided as either URL, String, or Javascript variable data input.");
                    }
                }
            }
        }
    }, _handleQueuedFetches:function () {
        if (this._queuedFetches.length > 0) {
            for (var i = 0; i < this._queuedFetches.length; i++) {
                var fData = this._queuedFetches[i];
                var delayedFilter = fData.filter;
                var delayedQuery = fData.args;
                if (delayedFilter) {
                    delayedFilter(delayedQuery, this._arrayOfAllItems);
                } else {
                    this.fetchItemByIdentity(fData.args);
                }
            }
            this._queuedFetches = [];
        }
    }, _processData:function (data) {
        this._arrayOfAllItems = [];
        for (var i = 0; i < data.length; i++) {
            this._arrayOfAllItems.push(this._createItem(data[i]));
        }
        this._loadFinished = true;
        this._loadInProgress = false;
    }, _createItem:function (something) {
        var item = {};
        item[this._storeProp] = this;
        for (var i in something) {
            item[this._keyAttribute] = i;
            item[this._valueAttribute] = something[i];
            break;
        }
        return item;
    }, getIdentity:function (item) {
        if (this.isItem(item)) {
            return item[this._keyAttribute];
        }
        return null;
    }, getIdentityAttributes:function (item) {
        return [this._keyAttribute];
    }, fetchItemByIdentity:function (keywordArgs) {
        keywordArgs.oldOnItem = keywordArgs.onItem;
        keywordArgs.onItem = null;
        keywordArgs.onComplete = this._finishFetchItemByIdentity;
        this.fetch(keywordArgs);
    }, _finishFetchItemByIdentity:function (items, request) {
        var scope = request.scope || kernel.global;
        if (items.length) {
            request.oldOnItem.call(scope, items[0]);
        } else {
            request.oldOnItem.call(scope, null);
        }
    }});
    lang.extend(KeyValueStore, simpleFetch);
    return KeyValueStore;
});

