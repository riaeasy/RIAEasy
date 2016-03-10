//>>built

define("dojox/data/AtomReadStore", ["dojo", "dojox", "dojo/data/util/filter", "dojo/data/util/simpleFetch", "dojo/date/stamp"], function (dojo, dojox) {
    dojo.experimental("dojox.data.AtomReadStore");
    var AtomReadStore = dojo.declare("dojox.data.AtomReadStore", null, {constructor:function (args) {
        if (args) {
            this.url = args.url;
            this.rewriteUrl = args.rewriteUrl;
            this.label = args.label || this.label;
            this.sendQuery = (args.sendQuery || args.sendquery || this.sendQuery);
            this.unescapeHTML = args.unescapeHTML;
            if ("urlPreventCache" in args) {
                this.urlPreventCache = args.urlPreventCache ? true : false;
            }
        }
        if (!this.url) {
            throw new Error("AtomReadStore: a URL must be specified when creating the data store");
        }
    }, url:"", label:"title", sendQuery:false, unescapeHTML:false, urlPreventCache:false, getValue:function (item, attribute, defaultValue) {
        this._assertIsItem(item);
        this._assertIsAttribute(attribute);
        this._initItem(item);
        attribute = attribute.toLowerCase();
        if (!item._attribs[attribute] && !item._parsed) {
            this._parseItem(item);
            item._parsed = true;
        }
        var retVal = item._attribs[attribute];
        if (!retVal && attribute == "summary") {
            var content = this.getValue(item, "content");
            var regexp = new RegExp("/(<([^>]+)>)/g", "i");
            var text = content.text.replace(regexp, "");
            retVal = {text:text.substring(0, Math.min(400, text.length)), type:"text"};
            item._attribs[attribute] = retVal;
        }
        if (retVal && this.unescapeHTML) {
            if ((attribute == "content" || attribute == "summary" || attribute == "subtitle") && !item["_" + attribute + "Escaped"]) {
                retVal.text = this._unescapeHTML(retVal.text);
                item["_" + attribute + "Escaped"] = true;
            }
        }
        return retVal ? dojo.isArray(retVal) ? retVal[0] : retVal : defaultValue;
    }, getValues:function (item, attribute) {
        this._assertIsItem(item);
        this._assertIsAttribute(attribute);
        this._initItem(item);
        attribute = attribute.toLowerCase();
        if (!item._attribs[attribute]) {
            this._parseItem(item);
        }
        var retVal = item._attribs[attribute];
        return retVal ? ((retVal.length !== undefined && typeof (retVal) !== "string") ? retVal : [retVal]) : undefined;
    }, getAttributes:function (item) {
        this._assertIsItem(item);
        if (!item._attribs) {
            this._initItem(item);
            this._parseItem(item);
        }
        var attrNames = [];
        for (var x in item._attribs) {
            attrNames.push(x);
        }
        return attrNames;
    }, hasAttribute:function (item, attribute) {
        return (this.getValue(item, attribute) !== undefined);
    }, containsValue:function (item, attribute, value) {
        var values = this.getValues(item, attribute);
        for (var i = 0; i < values.length; i++) {
            if ((typeof value === "string")) {
                if (values[i].toString && values[i].toString() === value) {
                    return true;
                }
            } else {
                if (values[i] === value) {
                    return true;
                }
            }
        }
        return false;
    }, isItem:function (something) {
        if (something && something.element && something.store && something.store === this) {
            return true;
        }
        return false;
    }, isItemLoaded:function (something) {
        return this.isItem(something);
    }, loadItem:function (keywordArgs) {
    }, getFeatures:function () {
        var features = {"dojo.data.api.Read":true};
        return features;
    }, getLabel:function (item) {
        if ((this.label !== "") && this.isItem(item)) {
            var label = this.getValue(item, this.label);
            if (label && label.text) {
                return label.text;
            } else {
                if (label) {
                    return label.toString();
                } else {
                    return undefined;
                }
            }
        }
        return undefined;
    }, getLabelAttributes:function (item) {
        if (this.label !== "") {
            return [this.label];
        }
        return null;
    }, getFeedValue:function (attribute, defaultValue) {
        var values = this.getFeedValues(attribute, defaultValue);
        if (dojo.isArray(values)) {
            return values[0];
        }
        return values;
    }, getFeedValues:function (attribute, defaultValue) {
        if (!this.doc) {
            return defaultValue;
        }
        if (!this._feedMetaData) {
            this._feedMetaData = {element:this.doc.getElementsByTagName("feed")[0], store:this, _attribs:{}};
            this._parseItem(this._feedMetaData);
        }
        return this._feedMetaData._attribs[attribute] || defaultValue;
    }, _initItem:function (item) {
        if (!item._attribs) {
            item._attribs = {};
        }
    }, _fetchItems:function (request, fetchHandler, errorHandler) {
        var url = this._getFetchUrl(request);
        if (!url) {
            errorHandler(new Error("No URL specified."));
            return;
        }
        var localRequest = (!this.sendQuery ? request : null);
        var _this = this;
        var docHandler = function (data) {
            _this.doc = data;
            var items = _this._getItems(data, localRequest);
            var query = request.query;
            if (query) {
                if (query.id) {
                    items = dojo.filter(items, function (item) {
                        return (_this.getValue(item, "id") == query.id);
                    });
                } else {
                    if (query.category) {
                        items = dojo.filter(items, function (entry) {
                            var cats = _this.getValues(entry, "category");
                            if (!cats) {
                                return false;
                            }
                            return dojo.some(cats, "return item.term=='" + query.category + "'");
                        });
                    }
                }
            }
            if (items && items.length > 0) {
                fetchHandler(items, request);
            } else {
                fetchHandler([], request);
            }
        };
        if (this.doc) {
            docHandler(this.doc);
        } else {
            var getArgs = {url:url, handleAs:"xml", preventCache:this.urlPreventCache};
            var getHandler = dojo.xhrGet(getArgs);
            getHandler.addCallback(docHandler);
            getHandler.addErrback(function (data) {
                errorHandler(data, request);
            });
        }
    }, _getFetchUrl:function (request) {
        if (!this.sendQuery) {
            return this.url;
        }
        var query = request.query;
        if (!query) {
            return this.url;
        }
        if (dojo.isString(query)) {
            return this.url + query;
        }
        var queryString = "";
        for (var name in query) {
            var value = query[name];
            if (value) {
                if (queryString) {
                    queryString += "&";
                }
                queryString += (name + "=" + value);
            }
        }
        if (!queryString) {
            return this.url;
        }
        var fullUrl = this.url;
        if (fullUrl.indexOf("?") < 0) {
            fullUrl += "?";
        } else {
            fullUrl += "&";
        }
        return fullUrl + queryString;
    }, _getItems:function (document, request) {
        if (this._items) {
            return this._items;
        }
        var items = [];
        var nodes = [];
        if (document.childNodes.length < 1) {
            this._items = items;
            console.log("dojox.data.AtomReadStore: Received an invalid Atom document. Check the content type header");
            return items;
        }
        var feedNodes = dojo.filter(document.childNodes, "return item.tagName && item.tagName.toLowerCase() == 'feed'");
        var query = request.query;
        if (!feedNodes || feedNodes.length != 1) {
            console.log("dojox.data.AtomReadStore: Received an invalid Atom document, number of feed tags = " + (feedNodes ? feedNodes.length : 0));
            return items;
        }
        nodes = dojo.filter(feedNodes[0].childNodes, "return item.tagName && item.tagName.toLowerCase() == 'entry'");
        if (request.onBegin) {
            request.onBegin(nodes.length, this.sendQuery ? request : {});
        }
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (node.nodeType != 1) {
                continue;
            }
            items.push(this._getItem(node));
        }
        this._items = items;
        return items;
    }, close:function (request) {
    }, _getItem:function (element) {
        return {element:element, store:this};
    }, _parseItem:function (item) {
        var attribs = item._attribs;
        var _this = this;
        var text, type;
        function getNodeText(node) {
            var txt = node.textContent || node.innerHTML || node.innerXML;
            if (!txt && node.childNodes[0]) {
                var child = node.childNodes[0];
                if (child && (child.nodeType == 3 || child.nodeType == 4)) {
                    txt = node.childNodes[0].nodeValue;
                }
            }
            return txt;
        }
        function parseTextAndType(node) {
            return {text:getNodeText(node), type:node.getAttribute("type")};
        }
        dojo.forEach(item.element.childNodes, function (node) {
            var tagName = node.tagName ? node.tagName.toLowerCase() : "";
            switch (tagName) {
              case "title":
                attribs[tagName] = {text:getNodeText(node), type:node.getAttribute("type")};
                break;
              case "subtitle":
              case "summary":
              case "content":
                attribs[tagName] = parseTextAndType(node);
                break;
              case "author":
                var nameNode, uriNode;
                dojo.forEach(node.childNodes, function (child) {
                    if (!child.tagName) {
                        return;
                    }
                    switch (child.tagName.toLowerCase()) {
                      case "name":
                        nameNode = child;
                        break;
                      case "uri":
                        uriNode = child;
                        break;
                    }
                });
                var author = {};
                if (nameNode && nameNode.length == 1) {
                    author.name = getNodeText(nameNode[0]);
                }
                if (uriNode && uriNode.length == 1) {
                    author.uri = getNodeText(uriNode[0]);
                }
                attribs[tagName] = author;
                break;
              case "id":
                attribs[tagName] = getNodeText(node);
                break;
              case "updated":
                attribs[tagName] = dojo.date.stamp.fromISOString(getNodeText(node));
                break;
              case "published":
                attribs[tagName] = dojo.date.stamp.fromISOString(getNodeText(node));
                break;
              case "category":
                if (!attribs[tagName]) {
                    attribs[tagName] = [];
                }
                attribs[tagName].push({scheme:node.getAttribute("scheme"), term:node.getAttribute("term")});
                break;
              case "link":
                if (!attribs[tagName]) {
                    attribs[tagName] = [];
                }
                var link = {rel:node.getAttribute("rel"), href:node.getAttribute("href"), type:node.getAttribute("type")};
                attribs[tagName].push(link);
                if (link.rel == "alternate") {
                    attribs["alternate"] = link;
                }
                break;
              default:
                break;
            }
        });
    }, _unescapeHTML:function (text) {
        text = text.replace(/&#8217;/m, "'").replace(/&#8243;/m, "\"").replace(/&#60;/m, ">").replace(/&#62;/m, "<").replace(/&#38;/m, "&");
        return text;
    }, _assertIsItem:function (item) {
        if (!this.isItem(item)) {
            throw new Error("dojox.data.AtomReadStore: Invalid item argument.");
        }
    }, _assertIsAttribute:function (attribute) {
        if (typeof attribute !== "string") {
            throw new Error("dojox.data.AtomReadStore: Invalid attribute argument.");
        }
    }});
    dojo.extend(AtomReadStore, dojo.data.util.simpleFetch);
    return AtomReadStore;
});

