//>>built

define("dojox/data/HtmlStore", ["dojo/_base/declare", "dojo/_base/array", "dojo/_base/lang", "dojo/dom", "dojo/_base/xhr", "dojo/_base/kernel", "dojo/data/util/simpleFetch", "dojo/data/util/filter", "dojox/xml/parser"], function (declare, array, lang, dom, xhr, kernel, simpleFetch, filter, xmlParser) {
    var HtmlStore = declare("dojox.data.HtmlStore", null, {constructor:function (args) {
        if (args && "urlPreventCache" in args) {
            this.urlPreventCache = args.urlPreventCache ? true : false;
        }
        if (args && "trimWhitespace" in args) {
            this.trimWhitespace = args.trimWhitespace ? true : false;
        }
        if (args.url) {
            if (!args.dataId) {
                throw new Error("dojo.data.HtmlStore: Cannot instantiate using url without an id!");
            }
            this.url = args.url;
            this.dataId = args.dataId;
        } else {
            if (args.dataId) {
                this.dataId = args.dataId;
            }
        }
        if (args && "fetchOnCreate" in args) {
            this.fetchOnCreate = args.fetchOnCreate ? true : false;
        }
        if (this.fetchOnCreate && this.dataId) {
            this.fetch();
        }
    }, url:"", dataId:"", trimWhitespace:false, urlPreventCache:false, fetchOnCreate:false, _indexItems:function () {
        this._getHeadings();
        if (this._rootNode.rows) {
            if (this._rootNode.tBodies && this._rootNode.tBodies.length > 0) {
                this._rootNode = this._rootNode.tBodies[0];
            }
            var i;
            for (i = 0; i < this._rootNode.rows.length; i++) {
                this._rootNode.rows[i]._ident = i + 1;
            }
        } else {
            var c = 1;
            for (i = 0; i < this._rootNode.childNodes.length; i++) {
                if (this._rootNode.childNodes[i].nodeType === 1) {
                    this._rootNode.childNodes[i]._ident = c;
                    c++;
                }
            }
        }
    }, _getHeadings:function () {
        this._headings = [];
        if (this._rootNode.tHead) {
            array.forEach(this._rootNode.tHead.rows[0].cells, lang.hitch(this, function (th) {
                var text = xmlParser.textContent(th);
                this._headings.push(this.trimWhitespace ? lang.trim(text) : text);
            }));
        } else {
            this._headings = ["name"];
        }
    }, _getAllItems:function () {
        var items = [];
        var i;
        if (this._rootNode.rows) {
            for (i = 0; i < this._rootNode.rows.length; i++) {
                items.push(this._rootNode.rows[i]);
            }
        } else {
            for (i = 0; i < this._rootNode.childNodes.length; i++) {
                if (this._rootNode.childNodes[i].nodeType === 1) {
                    items.push(this._rootNode.childNodes[i]);
                }
            }
        }
        return items;
    }, _assertIsItem:function (item) {
        if (!this.isItem(item)) {
            throw new Error("dojo.data.HtmlStore: a function was passed an item argument that was not an item");
        }
    }, _assertIsAttribute:function (attribute) {
        if (typeof attribute !== "string") {
            throw new Error("dojo.data.HtmlStore: a function was passed an attribute argument that was not an attribute name string");
        }
        return array.indexOf(this._headings, attribute);
    }, getValue:function (item, attribute, defaultValue) {
        var values = this.getValues(item, attribute);
        return (values.length > 0) ? values[0] : defaultValue;
    }, getValues:function (item, attribute) {
        this._assertIsItem(item);
        var index = this._assertIsAttribute(attribute);
        if (index > -1) {
            var text;
            if (item.cells) {
                text = xmlParser.textContent(item.cells[index]);
            } else {
                text = xmlParser.textContent(item);
            }
            return [this.trimWhitespace ? lang.trim(text) : text];
        }
        return [];
    }, getAttributes:function (item) {
        this._assertIsItem(item);
        var attributes = [];
        for (var i = 0; i < this._headings.length; i++) {
            if (this.hasAttribute(item, this._headings[i])) {
                attributes.push(this._headings[i]);
            }
        }
        return attributes;
    }, hasAttribute:function (item, attribute) {
        return this.getValues(item, attribute).length > 0;
    }, containsValue:function (item, attribute, value) {
        var regexp = undefined;
        if (typeof value === "string") {
            regexp = filter.patternToRegExp(value, false);
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
        return something && dom.isDescendant(something, this._rootNode);
    }, isItemLoaded:function (something) {
        return this.isItem(something);
    }, loadItem:function (keywordArgs) {
        this._assertIsItem(keywordArgs.item);
    }, _fetchItems:function (request, fetchHandler, errorHandler) {
        if (this._rootNode) {
            this._finishFetchItems(request, fetchHandler, errorHandler);
        } else {
            if (!this.url) {
                this._rootNode = dom.byId(this.dataId);
                this._indexItems();
                this._finishFetchItems(request, fetchHandler, errorHandler);
            } else {
                var getArgs = {url:this.url, handleAs:"text", preventCache:this.urlPreventCache};
                var self = this;
                var getHandler = xhr.get(getArgs);
                getHandler.addCallback(function (data) {
                    var findNode = function (node, id) {
                        if (node.id == id) {
                            return node;
                        }
                        if (node.childNodes) {
                            for (var i = 0; i < node.childNodes.length; i++) {
                                var returnNode = findNode(node.childNodes[i], id);
                                if (returnNode) {
                                    return returnNode;
                                }
                            }
                        }
                        return null;
                    };
                    var d = document.createElement("div");
                    d.innerHTML = data;
                    self._rootNode = findNode(d, self.dataId);
                    self._indexItems();
                    self._finishFetchItems(request, fetchHandler, errorHandler);
                });
                getHandler.addErrback(function (error) {
                    errorHandler(error, request);
                });
            }
        }
    }, _finishFetchItems:function (request, fetchHandler, errorHandler) {
        var items = [];
        var arrayOfAllItems = this._getAllItems();
        if (request.query) {
            var ignoreCase = request.queryOptions ? request.queryOptions.ignoreCase : false;
            items = [];
            var regexpList = {};
            var key;
            var value;
            for (key in request.query) {
                value = request.query[key] + "";
                if (typeof value === "string") {
                    regexpList[key] = filter.patternToRegExp(value, ignoreCase);
                }
            }
            for (var i = 0; i < arrayOfAllItems.length; ++i) {
                var match = true;
                var candidateItem = arrayOfAllItems[i];
                for (key in request.query) {
                    value = request.query[key] + "";
                    if (!this._containsValue(candidateItem, key, value, regexpList[key])) {
                        match = false;
                    }
                }
                if (match) {
                    items.push(candidateItem);
                }
            }
            fetchHandler(items, request);
        } else {
            if (arrayOfAllItems.length > 0) {
                items = arrayOfAllItems.slice(0, arrayOfAllItems.length);
            }
            fetchHandler(items, request);
        }
    }, getFeatures:function () {
        return {"dojo.data.api.Read":true, "dojo.data.api.Identity":true};
    }, close:function (request) {
    }, getLabel:function (item) {
        if (this.isItem(item)) {
            if (item.cells) {
                return "Item #" + this.getIdentity(item);
            } else {
                return this.getValue(item, "name");
            }
        }
        return undefined;
    }, getLabelAttributes:function (item) {
        if (item.cells) {
            return null;
        } else {
            return ["name"];
        }
    }, getIdentity:function (item) {
        this._assertIsItem(item);
        if (this.hasAttribute(item, "name")) {
            return this.getValue(item, "name");
        } else {
            return item._ident;
        }
    }, getIdentityAttributes:function (item) {
        return null;
    }, fetchItemByIdentity:function (keywordArgs) {
        var identity = keywordArgs.identity;
        var self = this;
        var item = null;
        var scope = null;
        if (!this._rootNode) {
            if (!this.url) {
                this._rootNode = dom.byId(this.dataId);
                this._indexItems();
                if (self._rootNode.rows) {
                    item = this._rootNode.rows[identity + 1];
                } else {
                    for (var i = 0; i < self._rootNode.childNodes.length; i++) {
                        if (self._rootNode.childNodes[i].nodeType === 1 && identity === xmlParser.textContent(self._rootNode.childNodes[i])) {
                            item = self._rootNode.childNodes[i];
                        }
                    }
                }
                if (keywordArgs.onItem) {
                    scope = keywordArgs.scope ? keywordArgs.scope : kernel.global;
                    keywordArgs.onItem.call(scope, item);
                }
            } else {
                var getArgs = {url:this.url, handleAs:"text"};
                var getHandler = xhr.get(getArgs);
                getHandler.addCallback(function (data) {
                    var findNode = function (node, id) {
                        if (node.id == id) {
                            return node;
                        }
                        if (node.childNodes) {
                            for (var i = 0; i < node.childNodes.length; i++) {
                                var returnNode = findNode(node.childNodes[i], id);
                                if (returnNode) {
                                    return returnNode;
                                }
                            }
                        }
                        return null;
                    };
                    var d = document.createElement("div");
                    d.innerHTML = data;
                    self._rootNode = findNode(d, self.dataId);
                    self._indexItems();
                    if (self._rootNode.rows && identity <= self._rootNode.rows.length) {
                        item = self._rootNode.rows[identity - 1];
                    } else {
                        for (var i = 0; i < self._rootNode.childNodes.length; i++) {
                            if (self._rootNode.childNodes[i].nodeType === 1 && identity === xmlParser.textContent(self._rootNode.childNodes[i])) {
                                item = self._rootNode.childNodes[i];
                                break;
                            }
                        }
                    }
                    if (keywordArgs.onItem) {
                        scope = keywordArgs.scope ? keywordArgs.scope : kernel.global;
                        keywordArgs.onItem.call(scope, item);
                    }
                });
                getHandler.addErrback(function (error) {
                    if (keywordArgs.onError) {
                        scope = keywordArgs.scope ? keywordArgs.scope : kernel.global;
                        keywordArgs.onError.call(scope, error);
                    }
                });
            }
        } else {
            if (this._rootNode.rows[identity + 1]) {
                item = this._rootNode.rows[identity + 1];
                if (keywordArgs.onItem) {
                    scope = keywordArgs.scope ? keywordArgs.scope : kernel.global;
                    keywordArgs.onItem.call(scope, item);
                }
            }
        }
    }});
    lang.extend(HtmlStore, simpleFetch);
    return HtmlStore;
});

