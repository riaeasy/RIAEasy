//>>built

define("dojox/data/OpmlStore", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/xhr", "dojo/data/util/simpleFetch", "dojo/data/util/filter", "dojo/_base/kernel"], function (declare, lang, xhr, simpleFetch, filterUtil, kernel) {
    var OpmlStore = declare("dojox.data.OpmlStore", null, {constructor:function (keywordParameters) {
        this._xmlData = null;
        this._arrayOfTopLevelItems = [];
        this._arrayOfAllItems = [];
        this._metadataNodes = null;
        this._loadFinished = false;
        this.url = keywordParameters.url;
        this._opmlData = keywordParameters.data;
        if (keywordParameters.label) {
            this.label = keywordParameters.label;
        }
        this._loadInProgress = false;
        this._queuedFetches = [];
        this._identityMap = {};
        this._identCount = 0;
        this._idProp = "_I";
        if (keywordParameters && "urlPreventCache" in keywordParameters) {
            this.urlPreventCache = keywordParameters.urlPreventCache ? true : false;
        }
    }, label:"text", url:"", urlPreventCache:false, _assertIsItem:function (item) {
        if (!this.isItem(item)) {
            throw new Error("dojo.data.OpmlStore: a function was passed an item argument that was not an item");
        }
    }, _assertIsAttribute:function (attribute) {
        if (!lang.isString(attribute)) {
            throw new Error("dojox.data.OpmlStore: a function was passed an attribute argument that was not an attribute object nor an attribute name string");
        }
    }, _removeChildNodesThatAreNotElementNodes:function (node, recursive) {
        var childNodes = node.childNodes;
        if (childNodes.length === 0) {
            return;
        }
        var nodesToRemove = [];
        var i, childNode;
        for (i = 0; i < childNodes.length; ++i) {
            childNode = childNodes[i];
            if (childNode.nodeType != 1) {
                nodesToRemove.push(childNode);
            }
        }
        for (i = 0; i < nodesToRemove.length; ++i) {
            childNode = nodesToRemove[i];
            node.removeChild(childNode);
        }
        if (recursive) {
            for (i = 0; i < childNodes.length; ++i) {
                childNode = childNodes[i];
                this._removeChildNodesThatAreNotElementNodes(childNode, recursive);
            }
        }
    }, _processRawXmlTree:function (rawXmlTree) {
        this._loadFinished = true;
        this._xmlData = rawXmlTree;
        var headNodes = rawXmlTree.getElementsByTagName("head");
        var headNode = headNodes[0];
        if (headNode) {
            this._removeChildNodesThatAreNotElementNodes(headNode);
            this._metadataNodes = headNode.childNodes;
        }
        var bodyNodes = rawXmlTree.getElementsByTagName("body");
        var bodyNode = bodyNodes[0];
        if (bodyNode) {
            this._removeChildNodesThatAreNotElementNodes(bodyNode, true);
            var bodyChildNodes = bodyNodes[0].childNodes;
            for (var i = 0; i < bodyChildNodes.length; ++i) {
                var node = bodyChildNodes[i];
                if (node.tagName == "outline") {
                    this._identityMap[this._identCount] = node;
                    this._identCount++;
                    this._arrayOfTopLevelItems.push(node);
                    this._arrayOfAllItems.push(node);
                    this._checkChildNodes(node);
                }
            }
        }
    }, _checkChildNodes:function (node) {
        if (node.firstChild) {
            for (var i = 0; i < node.childNodes.length; i++) {
                var child = node.childNodes[i];
                if (child.tagName == "outline") {
                    this._identityMap[this._identCount] = child;
                    this._identCount++;
                    this._arrayOfAllItems.push(child);
                    this._checkChildNodes(child);
                }
            }
        }
    }, _getItemsArray:function (queryOptions) {
        if (queryOptions && queryOptions.deep) {
            return this._arrayOfAllItems;
        }
        return this._arrayOfTopLevelItems;
    }, getValue:function (item, attribute, defaultValue) {
        this._assertIsItem(item);
        this._assertIsAttribute(attribute);
        if (attribute == "children") {
            return (item.firstChild || defaultValue);
        } else {
            var value = item.getAttribute(attribute);
            return (value !== undefined) ? value : defaultValue;
        }
    }, getValues:function (item, attribute) {
        this._assertIsItem(item);
        this._assertIsAttribute(attribute);
        var array = [];
        if (attribute == "children") {
            for (var i = 0; i < item.childNodes.length; ++i) {
                array.push(item.childNodes[i]);
            }
        } else {
            if (item.getAttribute(attribute) !== null) {
                array.push(item.getAttribute(attribute));
            }
        }
        return array;
    }, getAttributes:function (item) {
        this._assertIsItem(item);
        var attributes = [];
        var xmlNode = item;
        var xmlAttributes = xmlNode.attributes;
        for (var i = 0; i < xmlAttributes.length; ++i) {
            var xmlAttribute = xmlAttributes.item(i);
            attributes.push(xmlAttribute.nodeName);
        }
        if (xmlNode.childNodes.length > 0) {
            attributes.push("children");
        }
        return attributes;
    }, hasAttribute:function (item, attribute) {
        return (this.getValues(item, attribute).length > 0);
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
        return (something && something.nodeType == 1 && something.tagName == "outline" && something.ownerDocument === this._xmlData);
    }, isItemLoaded:function (something) {
        return this.isItem(something);
    }, loadItem:function (item) {
    }, getLabel:function (item) {
        if (this.isItem(item)) {
            return this.getValue(item, this.label);
        }
        return undefined;
    }, getLabelAttributes:function (item) {
        return [this.label];
    }, _fetchItems:function (keywordArgs, findCallback, errorCallback) {
        var self = this;
        var filter = function (requestArgs, arrayOfItems) {
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
                for (var i = 0; i < arrayOfItems.length; ++i) {
                    var match = true;
                    var candidateItem = arrayOfItems[i];
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
                if (arrayOfItems.length > 0) {
                    items = arrayOfItems.slice(0, arrayOfItems.length);
                }
            }
            findCallback(items, requestArgs);
        };
        if (this._loadFinished) {
            filter(keywordArgs, this._getItemsArray(keywordArgs.queryOptions));
        } else {
            if (this._loadInProgress) {
                this._queuedFetches.push({args:keywordArgs, filter:filter});
            } else {
                if (this.url !== "") {
                    this._loadInProgress = true;
                    var getArgs = {url:self.url, handleAs:"xml", preventCache:self.urlPreventCache};
                    var getHandler = xhr.get(getArgs);
                    getHandler.addCallback(function (data) {
                        self._processRawXmlTree(data);
                        filter(keywordArgs, self._getItemsArray(keywordArgs.queryOptions));
                        self._handleQueuedFetches();
                    });
                    getHandler.addErrback(function (error) {
                        throw error;
                    });
                } else {
                    if (this._opmlData) {
                        this._processRawXmlTree(this._opmlData);
                        this._opmlData = null;
                        filter(keywordArgs, this._getItemsArray(keywordArgs.queryOptions));
                    } else {
                        throw new Error("dojox.data.OpmlStore: No OPML source data was provided as either URL or XML data input.");
                    }
                }
            }
        }
    }, getFeatures:function () {
        var features = {"dojo.data.api.Read":true, "dojo.data.api.Identity":true};
        return features;
    }, getIdentity:function (item) {
        if (this.isItem(item)) {
            for (var i in this._identityMap) {
                if (this._identityMap[i] === item) {
                    return i;
                }
            }
        }
        return null;
    }, fetchItemByIdentity:function (keywordArgs) {
        if (!this._loadFinished) {
            var self = this;
            if (this.url !== "") {
                if (this._loadInProgress) {
                    this._queuedFetches.push({args:keywordArgs});
                } else {
                    this._loadInProgress = true;
                    var getArgs = {url:self.url, handleAs:"xml"};
                    var getHandler = xhr.get(getArgs);
                    getHandler.addCallback(function (data) {
                        var scope = keywordArgs.scope ? keywordArgs.scope : kernel.global;
                        try {
                            self._processRawXmlTree(data);
                            var item = self._identityMap[keywordArgs.identity];
                            if (!self.isItem(item)) {
                                item = null;
                            }
                            if (keywordArgs.onItem) {
                                keywordArgs.onItem.call(scope, item);
                            }
                            self._handleQueuedFetches();
                        }
                        catch (error) {
                            if (keywordArgs.onError) {
                                keywordArgs.onError.call(scope, error);
                            }
                        }
                    });
                    getHandler.addErrback(function (error) {
                        this._loadInProgress = false;
                        if (keywordArgs.onError) {
                            var scope = keywordArgs.scope ? keywordArgs.scope : kernel.global;
                            keywordArgs.onError.call(scope, error);
                        }
                    });
                }
            } else {
                if (this._opmlData) {
                    this._processRawXmlTree(this._opmlData);
                    this._opmlData = null;
                    var item = this._identityMap[keywordArgs.identity];
                    if (!self.isItem(item)) {
                        item = null;
                    }
                    if (keywordArgs.onItem) {
                        var scope = keywordArgs.scope ? keywordArgs.scope : kernel.global;
                        keywordArgs.onItem.call(scope, item);
                    }
                }
            }
        } else {
            var item = this._identityMap[keywordArgs.identity];
            if (!this.isItem(item)) {
                item = null;
            }
            if (keywordArgs.onItem) {
                var scope = keywordArgs.scope ? keywordArgs.scope : kernel.global;
                keywordArgs.onItem.call(scope, item);
            }
        }
    }, getIdentityAttributes:function (item) {
        return null;
    }, _handleQueuedFetches:function () {
        if (this._queuedFetches.length > 0) {
            for (var i = 0; i < this._queuedFetches.length; i++) {
                var fData = this._queuedFetches[i];
                var delayedQuery = fData.args;
                var delayedFilter = fData.filter;
                if (delayedFilter) {
                    delayedFilter(delayedQuery, this._getItemsArray(delayedQuery.queryOptions));
                } else {
                    this.fetchItemByIdentity(delayedQuery);
                }
            }
            this._queuedFetches = [];
        }
    }, close:function (request) {
    }});
    lang.extend(OpmlStore, simpleFetch);
    return OpmlStore;
});

