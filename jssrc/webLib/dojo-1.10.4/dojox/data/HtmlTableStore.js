//>>built

define("dojox/data/HtmlTableStore", ["dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/lang", "dojo/dom", "dojo/_base/array", "dojo/_base/xhr", "dojo/_base/sniff", "dojo/data/util/simpleFetch", "dojo/data/util/filter", "dojox/xml/parser"], function (kernel, declare, lang, dom, array, xhr, has, simpleFetch, filter, xmlParser) {
    var HtmlTableStore = declare("dojox.data.HtmlTableStore", null, {constructor:function (args) {
        kernel.deprecated("dojox.data.HtmlTableStore", "Please use dojox.data.HtmlStore");
        if (args.url) {
            if (!args.tableId) {
                throw new Error("dojo.data.HtmlTableStore: Cannot instantiate using url without an id!");
            }
            this.url = args.url;
            this.tableId = args.tableId;
        } else {
            if (args.tableId) {
                this._rootNode = dom.byId(args.tableId);
                this.tableId = this._rootNode.id;
            } else {
                this._rootNode = dom.byId(this.tableId);
            }
            this._getHeadings();
            for (var i = 0; i < this._rootNode.rows.length; i++) {
                this._rootNode.rows[i].store = this;
            }
        }
    }, url:"", tableId:"", _getHeadings:function () {
        this._headings = [];
        array.forEach(this._rootNode.tHead.rows[0].cells, lang.hitch(this, function (th) {
            this._headings.push(xmlParser.textContent(th));
        }));
    }, _getAllItems:function () {
        var items = [];
        for (var i = 1; i < this._rootNode.rows.length; i++) {
            items.push(this._rootNode.rows[i]);
        }
        return items;
    }, _assertIsItem:function (item) {
        if (!this.isItem(item)) {
            throw new Error("dojo.data.HtmlTableStore: a function was passed an item argument that was not an item");
        }
    }, _assertIsAttribute:function (attribute) {
        if (typeof attribute !== "string") {
            throw new Error("dojo.data.HtmlTableStore: a function was passed an attribute argument that was not an attribute name string");
        }
        return array.indexOf(this._headings, attribute);
    }, getValue:function (item, attribute, defaultValue) {
        var values = this.getValues(item, attribute);
        return (values.length > 0) ? values[0] : defaultValue;
    }, getValues:function (item, attribute) {
        this._assertIsItem(item);
        var index = this._assertIsAttribute(attribute);
        if (index > -1) {
            return [xmlParser.textContent(item.cells[index])];
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
        if (something && something.store && something.store === this) {
            return true;
        }
        return false;
    }, isItemLoaded:function (something) {
        return this.isItem(something);
    }, loadItem:function (keywordArgs) {
        this._assertIsItem(keywordArgs.item);
    }, _fetchItems:function (request, fetchHandler, errorHandler) {
        if (this._rootNode) {
            this._finishFetchItems(request, fetchHandler, errorHandler);
        } else {
            if (!this.url) {
                this._rootNode = dom.byId(this.tableId);
                this._getHeadings();
                for (var i = 0; i < this._rootNode.rows.length; i++) {
                    this._rootNode.rows[i].store = this;
                }
            } else {
                var getArgs = {url:this.url, handleAs:"text"};
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
                    self._rootNode = findNode(d, self.tableId);
                    self._getHeadings.call(self);
                    for (var i = 0; i < self._rootNode.rows.length; i++) {
                        self._rootNode.rows[i].store = self;
                    }
                    self._finishFetchItems(request, fetchHandler, errorHandler);
                });
                getHandler.addErrback(function (error) {
                    errorHandler(error, request);
                });
            }
        }
    }, _finishFetchItems:function (request, fetchHandler, errorHandler) {
        var items = null;
        var arrayOfAllItems = this._getAllItems();
        if (request.query) {
            var ignoreCase = request.queryOptions ? request.queryOptions.ignoreCase : false;
            items = [];
            var regexpList = {};
            var value;
            var key;
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
            return "Table Row #" + this.getIdentity(item);
        }
        return undefined;
    }, getLabelAttributes:function (item) {
        return null;
    }, getIdentity:function (item) {
        this._assertIsItem(item);
        if (!has("opera")) {
            return item.sectionRowIndex;
        } else {
            return (array.indexOf(this._rootNode.rows, item) - 1);
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
                this._rootNode = dom.byId(this.tableId);
                this._getHeadings();
                for (var i = 0; i < this._rootNode.rows.length; i++) {
                    this._rootNode.rows[i].store = this;
                }
                item = this._rootNode.rows[identity + 1];
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
                    self._rootNode = findNode(d, self.tableId);
                    self._getHeadings.call(self);
                    for (var i = 0; i < self._rootNode.rows.length; i++) {
                        self._rootNode.rows[i].store = self;
                    }
                    item = self._rootNode.rows[identity + 1];
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
    lang.extend(HtmlTableStore, simpleFetch);
    return HtmlTableStore;
});

