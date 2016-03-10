//>>built

define("dojo/data/ItemFileReadStore", ["../_base/kernel", "../_base/lang", "../_base/declare", "../_base/array", "../_base/xhr", "../Evented", "./util/filter", "./util/simpleFetch", "../date/stamp"], function (kernel, lang, declare, array, xhr, Evented, filterUtil, simpleFetch, dateStamp) {
    var ItemFileReadStore = declare("dojo.data.ItemFileReadStore", [Evented], {constructor:function (keywordParameters) {
        this._arrayOfAllItems = [];
        this._arrayOfTopLevelItems = [];
        this._loadFinished = false;
        this._jsonFileUrl = keywordParameters.url;
        this._ccUrl = keywordParameters.url;
        this.url = keywordParameters.url;
        this._jsonData = keywordParameters.data;
        this.data = null;
        this._datatypeMap = keywordParameters.typeMap || {};
        if (!this._datatypeMap["Date"]) {
            this._datatypeMap["Date"] = {type:Date, deserialize:function (value) {
                return dateStamp.fromISOString(value);
            }};
        }
        this._features = {"dojo.data.api.Read":true, "dojo.data.api.Identity":true};
        this._itemsByIdentity = null;
        this._storeRefPropName = "_S";
        this._itemNumPropName = "_0";
        this._rootItemPropName = "_RI";
        this._reverseRefMap = "_RRM";
        this._loadInProgress = false;
        this._queuedFetches = [];
        if (keywordParameters.urlPreventCache !== undefined) {
            this.urlPreventCache = keywordParameters.urlPreventCache ? true : false;
        }
        if (keywordParameters.hierarchical !== undefined) {
            this.hierarchical = keywordParameters.hierarchical ? true : false;
        }
        if (keywordParameters.clearOnClose) {
            this.clearOnClose = true;
        }
        if ("failOk" in keywordParameters) {
            this.failOk = keywordParameters.failOk ? true : false;
        }
    }, url:"", _ccUrl:"", data:null, typeMap:null, clearOnClose:false, urlPreventCache:false, failOk:false, hierarchical:true, _assertIsItem:function (item) {
        if (!this.isItem(item)) {
            throw new Error(this.declaredClass + ": Invalid item argument.");
        }
    }, _assertIsAttribute:function (attribute) {
        if (typeof attribute !== "string") {
            throw new Error(this.declaredClass + ": Invalid attribute argument.");
        }
    }, getValue:function (item, attribute, defaultValue) {
        var values = this.getValues(item, attribute);
        return (values.length > 0) ? values[0] : defaultValue;
    }, getValues:function (item, attribute) {
        this._assertIsItem(item);
        this._assertIsAttribute(attribute);
        return (item[attribute] || []).slice(0);
    }, getAttributes:function (item) {
        this._assertIsItem(item);
        var attributes = [];
        for (var key in item) {
            if ((key !== this._storeRefPropName) && (key !== this._itemNumPropName) && (key !== this._rootItemPropName) && (key !== this._reverseRefMap)) {
                attributes.push(key);
            }
        }
        return attributes;
    }, hasAttribute:function (item, attribute) {
        this._assertIsItem(item);
        this._assertIsAttribute(attribute);
        return (attribute in item);
    }, containsValue:function (item, attribute, value) {
        var regexp = undefined;
        if (typeof value === "string") {
            regexp = filterUtil.patternToRegExp(value, false);
        }
        return this._containsValue(item, attribute, value, regexp);
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
        });
    }, isItem:function (something) {
        if (something && something[this._storeRefPropName] === this) {
            if (this._arrayOfAllItems[something[this._itemNumPropName]] === something) {
                return true;
            }
        }
        return false;
    }, isItemLoaded:function (something) {
        return this.isItem(something);
    }, loadItem:function (keywordArgs) {
        this._assertIsItem(keywordArgs.item);
    }, getFeatures:function () {
        return this._features;
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
    }, filter:function (requestArgs, arrayOfItems, findCallback) {
        var items = [], i, key;
        if (requestArgs.query) {
            var value, ignoreCase = requestArgs.queryOptions ? requestArgs.queryOptions.ignoreCase : false;
            var regexpList = {};
            for (key in requestArgs.query) {
                value = requestArgs.query[key];
                if (typeof value === "string") {
                    regexpList[key] = filterUtil.patternToRegExp(value, ignoreCase);
                } else {
                    if (value instanceof RegExp) {
                        regexpList[key] = value;
                    }
                }
            }
            for (i = 0; i < arrayOfItems.length; ++i) {
                var match = true;
                var candidateItem = arrayOfItems[i];
                if (candidateItem === null) {
                    match = false;
                } else {
                    for (key in requestArgs.query) {
                        value = requestArgs.query[key];
                        if (!this._containsValue(candidateItem, key, value, regexpList[key])) {
                            match = false;
                        }
                    }
                }
                if (match) {
                    items.push(candidateItem);
                }
            }
            findCallback(items, requestArgs);
        } else {
            for (i = 0; i < arrayOfItems.length; ++i) {
                var item = arrayOfItems[i];
                if (item !== null) {
                    items.push(item);
                }
            }
            findCallback(items, requestArgs);
        }
    }, _fetchItems:function (keywordArgs, findCallback, errorCallback) {
        var self = this;
        if (this._loadFinished) {
            this.filter(keywordArgs, this._getItemsArray(keywordArgs.queryOptions), findCallback);
        } else {
            if (this._jsonFileUrl !== this._ccUrl) {
                kernel.deprecated(this.declaredClass + ": ", "To change the url, set the url property of the store," + " not _jsonFileUrl.  _jsonFileUrl support will be removed in 2.0");
                this._ccUrl = this._jsonFileUrl;
                this.url = this._jsonFileUrl;
            } else {
                if (this.url !== this._ccUrl) {
                    this._jsonFileUrl = this.url;
                    this._ccUrl = this.url;
                }
            }
            if (this.data != null) {
                this._jsonData = this.data;
                this.data = null;
            }
            if (this._jsonFileUrl) {
                if (this._loadInProgress) {
                    this._queuedFetches.push({args:keywordArgs, filter:lang.hitch(self, "filter"), findCallback:lang.hitch(self, findCallback)});
                } else {
                    this._loadInProgress = true;
                    var getArgs = {url:self._jsonFileUrl, handleAs:"json-comment-optional", preventCache:this.urlPreventCache, failOk:this.failOk};
                    var getHandler = xhr.get(getArgs);
                    getHandler.addCallback(function (data) {
                        try {
                            self._getItemsFromLoadedData(data);
                            self._loadFinished = true;
                            self._loadInProgress = false;
                            self.filter(keywordArgs, self._getItemsArray(keywordArgs.queryOptions), findCallback);
                            self._handleQueuedFetches();
                        }
                        catch (e) {
                            self._loadFinished = true;
                            self._loadInProgress = false;
                            errorCallback(e, keywordArgs);
                        }
                    });
                    getHandler.addErrback(function (error) {
                        self._loadInProgress = false;
                        errorCallback(error, keywordArgs);
                    });
                    var oldAbort = null;
                    if (keywordArgs.abort) {
                        oldAbort = keywordArgs.abort;
                    }
                    keywordArgs.abort = function () {
                        var df = getHandler;
                        if (df && df.fired === -1) {
                            df.cancel();
                            df = null;
                        }
                        if (oldAbort) {
                            oldAbort.call(keywordArgs);
                        }
                    };
                }
            } else {
                if (this._jsonData) {
                    try {
                        this._loadFinished = true;
                        this._getItemsFromLoadedData(this._jsonData);
                        this._jsonData = null;
                        self.filter(keywordArgs, this._getItemsArray(keywordArgs.queryOptions), findCallback);
                    }
                    catch (e) {
                        errorCallback(e, keywordArgs);
                    }
                } else {
                    errorCallback(new Error(this.declaredClass + ": No JSON source data was provided as either URL or a nested Javascript object."), keywordArgs);
                }
            }
        }
    }, _handleQueuedFetches:function () {
        if (this._queuedFetches.length > 0) {
            for (var i = 0; i < this._queuedFetches.length; i++) {
                var fData = this._queuedFetches[i], delayedQuery = fData.args, delayedFilter = fData.filter, delayedFindCallback = fData.findCallback;
                if (delayedFilter) {
                    delayedFilter(delayedQuery, this._getItemsArray(delayedQuery.queryOptions), delayedFindCallback);
                } else {
                    this.fetchItemByIdentity(delayedQuery);
                }
            }
            this._queuedFetches = [];
        }
    }, _getItemsArray:function (queryOptions) {
        if (queryOptions && queryOptions.deep) {
            return this._arrayOfAllItems;
        }
        return this._arrayOfTopLevelItems;
    }, close:function (request) {
        if (this.clearOnClose && this._loadFinished && !this._loadInProgress) {
            if (((this._jsonFileUrl == "" || this._jsonFileUrl == null) && (this.url == "" || this.url == null)) && this.data == null) {
                console.debug(this.declaredClass + ": WARNING!  Data reload " + " information has not been provided." + "  Please set 'url' or 'data' to the appropriate value before" + " the next fetch");
            }
            this._arrayOfAllItems = [];
            this._arrayOfTopLevelItems = [];
            this._loadFinished = false;
            this._itemsByIdentity = null;
            this._loadInProgress = false;
            this._queuedFetches = [];
        }
    }, _getItemsFromLoadedData:function (dataObject) {
        var addingArrays = false, self = this;
        function valueIsAnItem(aValue) {
            return (aValue !== null) && (typeof aValue === "object") && (!lang.isArray(aValue) || addingArrays) && (!lang.isFunction(aValue)) && (aValue.constructor == Object || lang.isArray(aValue)) && (typeof aValue._reference === "undefined") && (typeof aValue._type === "undefined") && (typeof aValue._value === "undefined") && self.hierarchical;
        }
        function addItemAndSubItemsToArrayOfAllItems(anItem) {
            self._arrayOfAllItems.push(anItem);
            for (var attribute in anItem) {
                var valueForAttribute = anItem[attribute];
                if (valueForAttribute) {
                    if (lang.isArray(valueForAttribute)) {
                        var valueArray = valueForAttribute;
                        for (var k = 0; k < valueArray.length; ++k) {
                            var singleValue = valueArray[k];
                            if (valueIsAnItem(singleValue)) {
                                addItemAndSubItemsToArrayOfAllItems(singleValue);
                            }
                        }
                    } else {
                        if (valueIsAnItem(valueForAttribute)) {
                            addItemAndSubItemsToArrayOfAllItems(valueForAttribute);
                        }
                    }
                }
            }
        }
        this._labelAttr = dataObject.label;
        var i, item;
        this._arrayOfAllItems = [];
        this._arrayOfTopLevelItems = dataObject.items;
        for (i = 0; i < this._arrayOfTopLevelItems.length; ++i) {
            item = this._arrayOfTopLevelItems[i];
            if (lang.isArray(item)) {
                addingArrays = true;
            }
            addItemAndSubItemsToArrayOfAllItems(item);
            item[this._rootItemPropName] = true;
        }
        var allAttributeNames = {}, key;
        for (i = 0; i < this._arrayOfAllItems.length; ++i) {
            item = this._arrayOfAllItems[i];
            for (key in item) {
                if (key !== this._rootItemPropName) {
                    var value = item[key];
                    if (value !== null) {
                        if (!lang.isArray(value)) {
                            item[key] = [value];
                        }
                    } else {
                        item[key] = [null];
                    }
                }
                allAttributeNames[key] = key;
            }
        }
        while (allAttributeNames[this._storeRefPropName]) {
            this._storeRefPropName += "_";
        }
        while (allAttributeNames[this._itemNumPropName]) {
            this._itemNumPropName += "_";
        }
        while (allAttributeNames[this._reverseRefMap]) {
            this._reverseRefMap += "_";
        }
        var arrayOfValues;
        var identifier = dataObject.identifier;
        if (identifier) {
            this._itemsByIdentity = {};
            this._features["dojo.data.api.Identity"] = identifier;
            for (i = 0; i < this._arrayOfAllItems.length; ++i) {
                item = this._arrayOfAllItems[i];
                arrayOfValues = item[identifier];
                var identity = arrayOfValues[0];
                if (!Object.hasOwnProperty.call(this._itemsByIdentity, identity)) {
                    this._itemsByIdentity[identity] = item;
                } else {
                    if (this._jsonFileUrl) {
                        throw new Error(this.declaredClass + ":  The json data as specified by: [" + this._jsonFileUrl + "] is malformed.  Items within the list have identifier: [" + identifier + "].  Value collided: [" + identity + "]");
                    } else {
                        if (this._jsonData) {
                            throw new Error(this.declaredClass + ":  The json data provided by the creation arguments is malformed.  Items within the list have identifier: [" + identifier + "].  Value collided: [" + identity + "]");
                        }
                    }
                }
            }
        } else {
            this._features["dojo.data.api.Identity"] = Number;
        }
        for (i = 0; i < this._arrayOfAllItems.length; ++i) {
            item = this._arrayOfAllItems[i];
            item[this._storeRefPropName] = this;
            item[this._itemNumPropName] = i;
        }
        for (i = 0; i < this._arrayOfAllItems.length; ++i) {
            item = this._arrayOfAllItems[i];
            for (key in item) {
                arrayOfValues = item[key];
                for (var j = 0; j < arrayOfValues.length; ++j) {
                    value = arrayOfValues[j];
                    if (value !== null && typeof value == "object") {
                        if (("_type" in value) && ("_value" in value)) {
                            var type = value._type;
                            var mappingObj = this._datatypeMap[type];
                            if (!mappingObj) {
                                throw new Error("dojo.data.ItemFileReadStore: in the typeMap constructor arg, no object class was specified for the datatype '" + type + "'");
                            } else {
                                if (lang.isFunction(mappingObj)) {
                                    arrayOfValues[j] = new mappingObj(value._value);
                                } else {
                                    if (lang.isFunction(mappingObj.deserialize)) {
                                        arrayOfValues[j] = mappingObj.deserialize(value._value);
                                    } else {
                                        throw new Error("dojo.data.ItemFileReadStore: Value provided in typeMap was neither a constructor, nor a an object with a deserialize function");
                                    }
                                }
                            }
                        }
                        if (value._reference) {
                            var referenceDescription = value._reference;
                            if (!lang.isObject(referenceDescription)) {
                                arrayOfValues[j] = this._getItemByIdentity(referenceDescription);
                            } else {
                                for (var k = 0; k < this._arrayOfAllItems.length; ++k) {
                                    var candidateItem = this._arrayOfAllItems[k], found = true;
                                    for (var refKey in referenceDescription) {
                                        if (candidateItem[refKey] != referenceDescription[refKey]) {
                                            found = false;
                                        }
                                    }
                                    if (found) {
                                        arrayOfValues[j] = candidateItem;
                                    }
                                }
                            }
                            if (this.referenceIntegrity) {
                                var refItem = arrayOfValues[j];
                                if (this.isItem(refItem)) {
                                    this._addReferenceToMap(refItem, item, key);
                                }
                            }
                        } else {
                            if (this.isItem(value)) {
                                if (this.referenceIntegrity) {
                                    this._addReferenceToMap(value, item, key);
                                }
                            }
                        }
                    }
                }
            }
        }
    }, _addReferenceToMap:function (refItem, parentItem, attribute) {
    }, getIdentity:function (item) {
        var identifier = this._features["dojo.data.api.Identity"];
        if (identifier === Number) {
            return item[this._itemNumPropName];
        } else {
            var arrayOfValues = item[identifier];
            if (arrayOfValues) {
                return arrayOfValues[0];
            }
        }
        return null;
    }, fetchItemByIdentity:function (keywordArgs) {
        var item, scope;
        if (!this._loadFinished) {
            var self = this;
            if (this._jsonFileUrl !== this._ccUrl) {
                kernel.deprecated(this.declaredClass + ": ", "To change the url, set the url property of the store," + " not _jsonFileUrl.  _jsonFileUrl support will be removed in 2.0");
                this._ccUrl = this._jsonFileUrl;
                this.url = this._jsonFileUrl;
            } else {
                if (this.url !== this._ccUrl) {
                    this._jsonFileUrl = this.url;
                    this._ccUrl = this.url;
                }
            }
            if (this.data != null && this._jsonData == null) {
                this._jsonData = this.data;
                this.data = null;
            }
            if (this._jsonFileUrl) {
                if (this._loadInProgress) {
                    this._queuedFetches.push({args:keywordArgs});
                } else {
                    this._loadInProgress = true;
                    var getArgs = {url:self._jsonFileUrl, handleAs:"json-comment-optional", preventCache:this.urlPreventCache, failOk:this.failOk};
                    var getHandler = xhr.get(getArgs);
                    getHandler.addCallback(function (data) {
                        var scope = keywordArgs.scope ? keywordArgs.scope : kernel.global;
                        try {
                            self._getItemsFromLoadedData(data);
                            self._loadFinished = true;
                            self._loadInProgress = false;
                            item = self._getItemByIdentity(keywordArgs.identity);
                            if (keywordArgs.onItem) {
                                keywordArgs.onItem.call(scope, item);
                            }
                            self._handleQueuedFetches();
                        }
                        catch (error) {
                            self._loadInProgress = false;
                            if (keywordArgs.onError) {
                                keywordArgs.onError.call(scope, error);
                            }
                        }
                    });
                    getHandler.addErrback(function (error) {
                        self._loadInProgress = false;
                        if (keywordArgs.onError) {
                            var scope = keywordArgs.scope ? keywordArgs.scope : kernel.global;
                            keywordArgs.onError.call(scope, error);
                        }
                    });
                }
            } else {
                if (this._jsonData) {
                    self._getItemsFromLoadedData(self._jsonData);
                    self._jsonData = null;
                    self._loadFinished = true;
                    item = self._getItemByIdentity(keywordArgs.identity);
                    if (keywordArgs.onItem) {
                        scope = keywordArgs.scope ? keywordArgs.scope : kernel.global;
                        keywordArgs.onItem.call(scope, item);
                    }
                }
            }
        } else {
            item = this._getItemByIdentity(keywordArgs.identity);
            if (keywordArgs.onItem) {
                scope = keywordArgs.scope ? keywordArgs.scope : kernel.global;
                keywordArgs.onItem.call(scope, item);
            }
        }
    }, _getItemByIdentity:function (identity) {
        var item = null;
        if (this._itemsByIdentity) {
            if (Object.hasOwnProperty.call(this._itemsByIdentity, identity)) {
                item = this._itemsByIdentity[identity];
            }
        } else {
            if (Object.hasOwnProperty.call(this._arrayOfAllItems, identity)) {
                item = this._arrayOfAllItems[identity];
            }
        }
        if (item === undefined) {
            item = null;
        }
        return item;
    }, getIdentityAttributes:function (item) {
        var identifier = this._features["dojo.data.api.Identity"];
        if (identifier === Number) {
            return null;
        } else {
            return [identifier];
        }
    }, _forceLoad:function () {
        var self = this;
        if (this._jsonFileUrl !== this._ccUrl) {
            kernel.deprecated(this.declaredClass + ": ", "To change the url, set the url property of the store," + " not _jsonFileUrl.  _jsonFileUrl support will be removed in 2.0");
            this._ccUrl = this._jsonFileUrl;
            this.url = this._jsonFileUrl;
        } else {
            if (this.url !== this._ccUrl) {
                this._jsonFileUrl = this.url;
                this._ccUrl = this.url;
            }
        }
        if (this.data != null) {
            this._jsonData = this.data;
            this.data = null;
        }
        if (this._jsonFileUrl) {
            var getArgs = {url:this._jsonFileUrl, handleAs:"json-comment-optional", preventCache:this.urlPreventCache, failOk:this.failOk, sync:true};
            var getHandler = xhr.get(getArgs);
            getHandler.addCallback(function (data) {
                try {
                    if (self._loadInProgress !== true && !self._loadFinished) {
                        self._getItemsFromLoadedData(data);
                        self._loadFinished = true;
                    } else {
                        if (self._loadInProgress) {
                            throw new Error(this.declaredClass + ":  Unable to perform a synchronous load, an async load is in progress.");
                        }
                    }
                }
                catch (e) {
                    console.log(e);
                    throw e;
                }
            });
            getHandler.addErrback(function (error) {
                throw error;
            });
        } else {
            if (this._jsonData) {
                self._getItemsFromLoadedData(self._jsonData);
                self._jsonData = null;
                self._loadFinished = true;
            }
        }
    }});
    lang.extend(ItemFileReadStore, simpleFetch);
    return ItemFileReadStore;
});

