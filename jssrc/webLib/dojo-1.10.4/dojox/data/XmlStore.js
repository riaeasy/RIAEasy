//>>built

define("dojox/data/XmlStore", ["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/xhr", "dojo/data/util/simpleFetch", "dojo/_base/query", "dojo/_base/array", "dojo/_base/kernel", "dojo/data/util/filter", "dojox/xml/parser", "dojox/data/XmlItem"], function (lang, declare, xhr, simpleFetch, domQuery, array, kernel, filter, xmlParser, XmlItem) {
    var XmlStore = declare("dojox.data.XmlStore", null, {constructor:function (args) {
        if (args) {
            this.url = args.url;
            this.rootItem = (args.rootItem || args.rootitem || this.rootItem);
            this.keyAttribute = (args.keyAttribute || args.keyattribute || this.keyAttribute);
            this._attributeMap = (args.attributeMap || args.attributemap);
            this.label = args.label || this.label;
            this.sendQuery = (args.sendQuery || args.sendquery || this.sendQuery);
            if ("urlPreventCache" in args) {
                this.urlPreventCache = args.urlPreventCache ? true : false;
            }
        }
        this._newItems = [];
        this._deletedItems = [];
        this._modifiedItems = [];
    }, url:"", rootItem:"", keyAttribute:"", label:"", sendQuery:false, attributeMap:null, urlPreventCache:true, getValue:function (item, attribute, defaultValue) {
        var element = item.element;
        var i;
        var node;
        if (attribute === "tagName") {
            return element.nodeName;
        } else {
            if (attribute === "childNodes") {
                for (i = 0; i < element.childNodes.length; i++) {
                    node = element.childNodes[i];
                    if (node.nodeType === 1) {
                        return this._getItem(node);
                    }
                }
                return defaultValue;
            } else {
                if (attribute === "text()") {
                    for (i = 0; i < element.childNodes.length; i++) {
                        node = element.childNodes[i];
                        if (node.nodeType === 3 || node.nodeType === 4) {
                            return node.nodeValue;
                        }
                    }
                    return defaultValue;
                } else {
                    attribute = this._getAttribute(element.nodeName, attribute);
                    if (attribute.charAt(0) === "@") {
                        var name = attribute.substring(1);
                        var value = element.getAttribute(name);
                        return (value) ? value : defaultValue;
                    } else {
                        for (i = 0; i < element.childNodes.length; i++) {
                            node = element.childNodes[i];
                            if (node.nodeType === 1 && node.nodeName === attribute) {
                                return this._getItem(node);
                            }
                        }
                        return defaultValue;
                    }
                }
            }
        }
    }, getValues:function (item, attribute) {
        var element = item.element;
        var values = [];
        var i;
        var node;
        if (attribute === "tagName") {
            return [element.nodeName];
        } else {
            if (attribute === "childNodes") {
                for (i = 0; i < element.childNodes.length; i++) {
                    node = element.childNodes[i];
                    if (node.nodeType === 1) {
                        values.push(this._getItem(node));
                    }
                }
                return values;
            } else {
                if (attribute === "text()") {
                    var ec = element.childNodes;
                    for (i = 0; i < ec.length; i++) {
                        node = ec[i];
                        if (node.nodeType === 3 || node.nodeType === 4) {
                            values.push(node.nodeValue);
                        }
                    }
                    return values;
                } else {
                    attribute = this._getAttribute(element.nodeName, attribute);
                    if (attribute.charAt(0) === "@") {
                        var name = attribute.substring(1);
                        var value = element.getAttribute(name);
                        return (value !== undefined) ? [value] : [];
                    } else {
                        for (i = 0; i < element.childNodes.length; i++) {
                            node = element.childNodes[i];
                            if (node.nodeType === 1 && node.nodeName === attribute) {
                                values.push(this._getItem(node));
                            }
                        }
                        return values;
                    }
                }
            }
        }
    }, getAttributes:function (item) {
        var element = item.element;
        var attributes = [];
        var i;
        attributes.push("tagName");
        if (element.childNodes.length > 0) {
            var names = {};
            var childNodes = true;
            var text = false;
            for (i = 0; i < element.childNodes.length; i++) {
                var node = element.childNodes[i];
                if (node.nodeType === 1) {
                    var name = node.nodeName;
                    if (!names[name]) {
                        attributes.push(name);
                        names[name] = name;
                    }
                    childNodes = true;
                } else {
                    if (node.nodeType === 3) {
                        text = true;
                    }
                }
            }
            if (childNodes) {
                attributes.push("childNodes");
            }
            if (text) {
                attributes.push("text()");
            }
        }
        for (i = 0; i < element.attributes.length; i++) {
            attributes.push("@" + element.attributes[i].nodeName);
        }
        if (this._attributeMap) {
            for (var key in this._attributeMap) {
                i = key.indexOf(".");
                if (i > 0) {
                    var tagName = key.substring(0, i);
                    if (tagName === element.nodeName) {
                        attributes.push(key.substring(i + 1));
                    }
                } else {
                    attributes.push(key);
                }
            }
        }
        return attributes;
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
        var features = {"dojo.data.api.Read":true, "dojo.data.api.Write":true};
        if (!this.sendQuery || this.keyAttribute !== "") {
            features["dojo.data.api.Identity"] = true;
        }
        return features;
    }, getLabel:function (item) {
        if ((this.label !== "") && this.isItem(item)) {
            var label = this.getValue(item, this.label);
            if (label) {
                return label.toString();
            }
        }
        return undefined;
    }, getLabelAttributes:function (item) {
        if (this.label !== "") {
            return [this.label];
        }
        return null;
    }, _fetchItems:function (request, fetchHandler, errorHandler) {
        var url = this._getFetchUrl(request);
        if (!url) {
            errorHandler(new Error("No URL specified."), request);
            return;
        }
        var localRequest = (!this.sendQuery ? request : {});
        var self = this;
        var getArgs = {url:url, handleAs:"xml", preventCache:self.urlPreventCache};
        var getHandler = xhr.get(getArgs);
        getHandler.addCallback(function (data) {
            var items = self._getItems(data, localRequest);
            if (items && items.length > 0) {
                fetchHandler(items, request);
            } else {
                fetchHandler([], request);
            }
        });
        getHandler.addErrback(function (data) {
            errorHandler(data, request);
        });
    }, _getFetchUrl:function (request) {
        if (!this.sendQuery) {
            return this.url;
        }
        var query = request.query;
        if (!query) {
            return this.url;
        }
        if (lang.isString(query)) {
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
        var query = null;
        if (request) {
            query = request.query;
        }
        var items = [];
        var nodes = null;
        if (this.rootItem !== "") {
            nodes = domQuery(this.rootItem, document);
        } else {
            nodes = document.documentElement.childNodes;
        }
        var deep = request.queryOptions ? request.queryOptions.deep : false;
        if (deep) {
            nodes = this._flattenNodes(nodes);
        }
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (node.nodeType != 1) {
                continue;
            }
            var item = this._getItem(node);
            if (query) {
                var ignoreCase = request.queryOptions ? request.queryOptions.ignoreCase : false;
                var value;
                var match = false;
                var j;
                var emptyQuery = true;
                var regexpList = {};
                for (var key in query) {
                    value = query[key];
                    if (typeof value === "string") {
                        regexpList[key] = filter.patternToRegExp(value, ignoreCase);
                    } else {
                        if (value) {
                            regexpList[key] = value;
                        }
                    }
                }
                for (var attribute in query) {
                    emptyQuery = false;
                    var values = this.getValues(item, attribute);
                    for (j = 0; j < values.length; j++) {
                        value = values[j];
                        if (value) {
                            var queryValue = query[attribute];
                            if ((typeof value) === "string" && (regexpList[attribute])) {
                                if ((value.match(regexpList[attribute])) !== null) {
                                    match = true;
                                } else {
                                    match = false;
                                }
                            } else {
                                if ((typeof value) === "object") {
                                    if (value.toString && (regexpList[attribute])) {
                                        var stringValue = value.toString();
                                        if ((stringValue.match(regexpList[attribute])) !== null) {
                                            match = true;
                                        } else {
                                            match = false;
                                        }
                                    } else {
                                        if (queryValue === "*" || queryValue === value) {
                                            match = true;
                                        } else {
                                            match = false;
                                        }
                                    }
                                }
                            }
                        }
                        if (match) {
                            break;
                        }
                    }
                    if (!match) {
                        break;
                    }
                }
                if (emptyQuery || match) {
                    items.push(item);
                }
            } else {
                items.push(item);
            }
        }
        array.forEach(items, function (item) {
            if (item.element.parentNode) {
                item.element.parentNode.removeChild(item.element);
            }
        }, this);
        return items;
    }, _flattenNodes:function (nodes) {
        var flattened = [];
        if (nodes) {
            var i;
            for (i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                flattened.push(node);
                if (node.childNodes && node.childNodes.length > 0) {
                    flattened = flattened.concat(this._flattenNodes(node.childNodes));
                }
            }
        }
        return flattened;
    }, close:function (request) {
    }, newItem:function (keywordArgs, parentInfo) {
        keywordArgs = (keywordArgs || {});
        var tagName = keywordArgs.tagName;
        if (!tagName) {
            tagName = this.rootItem;
            if (tagName === "") {
                return null;
            }
        }
        var document = this._getDocument();
        var element = document.createElement(tagName);
        for (var attribute in keywordArgs) {
            var text;
            if (attribute === "tagName") {
                continue;
            } else {
                if (attribute === "text()") {
                    text = document.createTextNode(keywordArgs[attribute]);
                    element.appendChild(text);
                } else {
                    attribute = this._getAttribute(tagName, attribute);
                    if (attribute.charAt(0) === "@") {
                        var name = attribute.substring(1);
                        element.setAttribute(name, keywordArgs[attribute]);
                    } else {
                        var child = document.createElement(attribute);
                        text = document.createTextNode(keywordArgs[attribute]);
                        child.appendChild(text);
                        element.appendChild(child);
                    }
                }
            }
        }
        var item = this._getItem(element);
        this._newItems.push(item);
        var pInfo = null;
        if (parentInfo && parentInfo.parent && parentInfo.attribute) {
            pInfo = {item:parentInfo.parent, attribute:parentInfo.attribute, oldValue:undefined};
            var values = this.getValues(parentInfo.parent, parentInfo.attribute);
            if (values && values.length > 0) {
                var tempValues = values.slice(0, values.length);
                if (values.length === 1) {
                    pInfo.oldValue = values[0];
                } else {
                    pInfo.oldValue = values.slice(0, values.length);
                }
                tempValues.push(item);
                this.setValues(parentInfo.parent, parentInfo.attribute, tempValues);
                pInfo.newValue = this.getValues(parentInfo.parent, parentInfo.attribute);
            } else {
                this.setValue(parentInfo.parent, parentInfo.attribute, item);
                pInfo.newValue = item;
            }
        }
        return item;
    }, deleteItem:function (item) {
        var element = item.element;
        if (element.parentNode) {
            this._backupItem(item);
            element.parentNode.removeChild(element);
            return true;
        }
        this._forgetItem(item);
        this._deletedItems.push(item);
        return true;
    }, setValue:function (item, attribute, value) {
        if (attribute === "tagName") {
            return false;
        }
        this._backupItem(item);
        var element = item.element;
        var child;
        var text;
        if (attribute === "childNodes") {
            child = value.element;
            element.appendChild(child);
        } else {
            if (attribute === "text()") {
                while (element.firstChild) {
                    element.removeChild(element.firstChild);
                }
                text = this._getDocument(element).createTextNode(value);
                element.appendChild(text);
            } else {
                attribute = this._getAttribute(element.nodeName, attribute);
                if (attribute.charAt(0) === "@") {
                    var name = attribute.substring(1);
                    element.setAttribute(name, value);
                } else {
                    for (var i = 0; i < element.childNodes.length; i++) {
                        var node = element.childNodes[i];
                        if (node.nodeType === 1 && node.nodeName === attribute) {
                            child = node;
                            break;
                        }
                    }
                    var document = this._getDocument(element);
                    if (child) {
                        while (child.firstChild) {
                            child.removeChild(child.firstChild);
                        }
                    } else {
                        child = document.createElement(attribute);
                        element.appendChild(child);
                    }
                    text = document.createTextNode(value);
                    child.appendChild(text);
                }
            }
        }
        return true;
    }, setValues:function (item, attribute, values) {
        if (attribute === "tagName") {
            return false;
        }
        this._backupItem(item);
        var element = item.element;
        var i;
        var child;
        var text;
        if (attribute === "childNodes") {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
            for (i = 0; i < values.length; i++) {
                child = values[i].element;
                element.appendChild(child);
            }
        } else {
            if (attribute === "text()") {
                while (element.firstChild) {
                    element.removeChild(element.firstChild);
                }
                var value = "";
                for (i = 0; i < values.length; i++) {
                    value += values[i];
                }
                text = this._getDocument(element).createTextNode(value);
                element.appendChild(text);
            } else {
                attribute = this._getAttribute(element.nodeName, attribute);
                if (attribute.charAt(0) === "@") {
                    var name = attribute.substring(1);
                    element.setAttribute(name, values[0]);
                } else {
                    for (i = element.childNodes.length - 1; i >= 0; i--) {
                        var node = element.childNodes[i];
                        if (node.nodeType === 1 && node.nodeName === attribute) {
                            element.removeChild(node);
                        }
                    }
                    var document = this._getDocument(element);
                    for (i = 0; i < values.length; i++) {
                        child = document.createElement(attribute);
                        text = document.createTextNode(values[i]);
                        child.appendChild(text);
                        element.appendChild(child);
                    }
                }
            }
        }
        return true;
    }, unsetAttribute:function (item, attribute) {
        if (attribute === "tagName") {
            return false;
        }
        this._backupItem(item);
        var element = item.element;
        if (attribute === "childNodes" || attribute === "text()") {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        } else {
            attribute = this._getAttribute(element.nodeName, attribute);
            if (attribute.charAt(0) === "@") {
                var name = attribute.substring(1);
                element.removeAttribute(name);
            } else {
                for (var i = element.childNodes.length - 1; i >= 0; i--) {
                    var node = element.childNodes[i];
                    if (node.nodeType === 1 && node.nodeName === attribute) {
                        element.removeChild(node);
                    }
                }
            }
        }
        return true;
    }, save:function (keywordArgs) {
        if (!keywordArgs) {
            keywordArgs = {};
        }
        var i;
        for (i = 0; i < this._modifiedItems.length; i++) {
            this._saveItem(this._modifiedItems[i], keywordArgs, "PUT");
        }
        for (i = 0; i < this._newItems.length; i++) {
            var item = this._newItems[i];
            if (item.element.parentNode) {
                this._newItems.splice(i, 1);
                i--;
                continue;
            }
            this._saveItem(this._newItems[i], keywordArgs, "POST");
        }
        for (i = 0; i < this._deletedItems.length; i++) {
            this._saveItem(this._deletedItems[i], keywordArgs, "DELETE");
        }
    }, revert:function () {
        this._newItems = [];
        this._restoreItems(this._deletedItems);
        this._deletedItems = [];
        this._restoreItems(this._modifiedItems);
        this._modifiedItems = [];
        return true;
    }, isDirty:function (item) {
        if (item) {
            var element = this._getRootElement(item.element);
            return (this._getItemIndex(this._newItems, element) >= 0 || this._getItemIndex(this._deletedItems, element) >= 0 || this._getItemIndex(this._modifiedItems, element) >= 0);
        } else {
            return (this._newItems.length > 0 || this._deletedItems.length > 0 || this._modifiedItems.length > 0);
        }
    }, _saveItem:function (item, keywordArgs, method) {
        var url;
        var scope;
        if (method === "PUT") {
            url = this._getPutUrl(item);
        } else {
            if (method === "DELETE") {
                url = this._getDeleteUrl(item);
            } else {
                url = this._getPostUrl(item);
            }
        }
        if (!url) {
            if (keywordArgs.onError) {
                scope = keywordArgs.scope || kernel.global;
                keywordArgs.onError.call(scope, new Error("No URL for saving content: " + this._getPostContent(item)));
            }
            return;
        }
        var saveArgs = {url:url, method:(method || "POST"), contentType:"text/xml", handleAs:"xml"};
        var saveHandler;
        if (method === "PUT") {
            saveArgs.putData = this._getPutContent(item);
            saveHandler = xhr.put(saveArgs);
        } else {
            if (method === "DELETE") {
                saveHandler = xhr.del(saveArgs);
            } else {
                saveArgs.postData = this._getPostContent(item);
                saveHandler = xhr.post(saveArgs);
            }
        }
        scope = (keywordArgs.scope || kernel.global);
        var self = this;
        saveHandler.addCallback(function (data) {
            self._forgetItem(item);
            if (keywordArgs.onComplete) {
                keywordArgs.onComplete.call(scope);
            }
        });
        saveHandler.addErrback(function (error) {
            if (keywordArgs.onError) {
                keywordArgs.onError.call(scope, error);
            }
        });
    }, _getPostUrl:function (item) {
        return this.url;
    }, _getPutUrl:function (item) {
        return this.url;
    }, _getDeleteUrl:function (item) {
        var url = this.url;
        if (item && this.keyAttribute !== "") {
            var value = this.getValue(item, this.keyAttribute);
            if (value) {
                var key = this.keyAttribute.charAt(0) === "@" ? this.keyAttribute.substring(1) : this.keyAttribute;
                url += url.indexOf("?") < 0 ? "?" : "&";
                url += key + "=" + value;
            }
        }
        return url;
    }, _getPostContent:function (item) {
        return "<?xml version='1.0'?>" + xmlParser.innerXML(item.element);
    }, _getPutContent:function (item) {
        return "<?xml version='1.0'?>" + xmlParser.innerXML(item.element);
    }, _getAttribute:function (tagName, attribute) {
        if (this._attributeMap) {
            var key = tagName + "." + attribute;
            var value = this._attributeMap[key];
            if (value) {
                attribute = value;
            } else {
                value = this._attributeMap[attribute];
                if (value) {
                    attribute = value;
                }
            }
        }
        return attribute;
    }, _getItem:function (element) {
        try {
            var q = null;
            if (this.keyAttribute === "") {
                q = this._getXPath(element);
            }
            return new XmlItem(element, this, q);
        }
        catch (e) {
            console.log(e);
        }
        return null;
    }, _getItemIndex:function (items, element) {
        for (var i = 0; i < items.length; i++) {
            if (items[i].element === element) {
                return i;
            }
        }
        return -1;
    }, _backupItem:function (item) {
        var element = this._getRootElement(item.element);
        if (this._getItemIndex(this._newItems, element) >= 0 || this._getItemIndex(this._modifiedItems, element) >= 0) {
            return;
        }
        if (element != item.element) {
            item = this._getItem(element);
        }
        item._backup = element.cloneNode(true);
        this._modifiedItems.push(item);
    }, _restoreItems:function (items) {
        array.forEach(items, function (item) {
            if (item._backup) {
                item.element = item._backup;
                item._backup = null;
            }
        }, this);
    }, _forgetItem:function (item) {
        var element = item.element;
        var index = this._getItemIndex(this._newItems, element);
        if (index >= 0) {
            this._newItems.splice(index, 1);
        }
        index = this._getItemIndex(this._deletedItems, element);
        if (index >= 0) {
            this._deletedItems.splice(index, 1);
        }
        index = this._getItemIndex(this._modifiedItems, element);
        if (index >= 0) {
            this._modifiedItems.splice(index, 1);
        }
    }, _getDocument:function (element) {
        if (element) {
            return element.ownerDocument;
        } else {
            if (!this._document) {
                return xmlParser.parse();
            }
        }
        return null;
    }, _getRootElement:function (element) {
        while (element.parentNode) {
            element = element.parentNode;
        }
        return element;
    }, _getXPath:function (element) {
        var xpath = null;
        if (!this.sendQuery) {
            var node = element;
            xpath = "";
            while (node && node != element.ownerDocument) {
                var pos = 0;
                var sibling = node;
                var name = node.nodeName;
                while (sibling) {
                    sibling = sibling.previousSibling;
                    if (sibling && sibling.nodeName === name) {
                        pos++;
                    }
                }
                var temp = "/" + name + "[" + pos + "]";
                if (xpath) {
                    xpath = temp + xpath;
                } else {
                    xpath = temp;
                }
                node = node.parentNode;
            }
        }
        return xpath;
    }, getIdentity:function (item) {
        if (!this.isItem(item)) {
            throw new Error("dojox.data.XmlStore: Object supplied to getIdentity is not an item");
        } else {
            var id = null;
            if (this.sendQuery && this.keyAttribute !== "") {
                id = this.getValue(item, this.keyAttribute).toString();
            } else {
                if (!this.serverQuery) {
                    if (this.keyAttribute !== "") {
                        id = this.getValue(item, this.keyAttribute).toString();
                    } else {
                        id = item.q;
                    }
                }
            }
            return id;
        }
    }, getIdentityAttributes:function (item) {
        if (!this.isItem(item)) {
            throw new Error("dojox.data.XmlStore: Object supplied to getIdentity is not an item");
        } else {
            if (this.keyAttribute !== "") {
                return [this.keyAttribute];
            } else {
                return null;
            }
        }
    }, fetchItemByIdentity:function (keywordArgs) {
        var handleDocument = null;
        var scope = null;
        var self = this;
        var url = null;
        var getArgs = null;
        var getHandler = null;
        if (!self.sendQuery) {
            handleDocument = function (data) {
                if (data) {
                    if (self.keyAttribute !== "") {
                        var request = {};
                        request.query = {};
                        request.query[self.keyAttribute] = keywordArgs.identity;
                        request.queryOptions = {deep:true};
                        var items = self._getItems(data, request);
                        scope = keywordArgs.scope || kernel.global;
                        if (items.length === 1) {
                            if (keywordArgs.onItem) {
                                keywordArgs.onItem.call(scope, items[0]);
                            }
                        } else {
                            if (items.length === 0) {
                                if (keywordArgs.onItem) {
                                    keywordArgs.onItem.call(scope, null);
                                }
                            } else {
                                if (keywordArgs.onError) {
                                    keywordArgs.onError.call(scope, new Error("Items array size for identity lookup greater than 1, invalid keyAttribute."));
                                }
                            }
                        }
                    } else {
                        var qArgs = keywordArgs.identity.split("/");
                        var i;
                        var node = data;
                        for (i = 0; i < qArgs.length; i++) {
                            if (qArgs[i] && qArgs[i] !== "") {
                                var section = qArgs[i];
                                section = section.substring(0, section.length - 1);
                                var vals = section.split("[");
                                var tag = vals[0];
                                var index = parseInt(vals[1], 10);
                                var pos = 0;
                                if (node) {
                                    var cNodes = node.childNodes;
                                    if (cNodes) {
                                        var j;
                                        var foundNode = null;
                                        for (j = 0; j < cNodes.length; j++) {
                                            var pNode = cNodes[j];
                                            if (pNode.nodeName === tag) {
                                                if (pos < index) {
                                                    pos++;
                                                } else {
                                                    foundNode = pNode;
                                                    break;
                                                }
                                            }
                                        }
                                        if (foundNode) {
                                            node = foundNode;
                                        } else {
                                            node = null;
                                        }
                                    } else {
                                        node = null;
                                    }
                                } else {
                                    break;
                                }
                            }
                        }
                        var item = null;
                        if (node) {
                            item = self._getItem(node);
                            if (item.element.parentNode) {
                                item.element.parentNode.removeChild(item.element);
                            }
                        }
                        if (keywordArgs.onItem) {
                            scope = keywordArgs.scope || kernel.global;
                            keywordArgs.onItem.call(scope, item);
                        }
                    }
                }
            };
            url = this._getFetchUrl(null);
            getArgs = {url:url, handleAs:"xml", preventCache:self.urlPreventCache};
            getHandler = xhr.get(getArgs);
            getHandler.addCallback(handleDocument);
            if (keywordArgs.onError) {
                getHandler.addErrback(function (error) {
                    var s = keywordArgs.scope || kernel.global;
                    keywordArgs.onError.call(s, error);
                });
            }
        } else {
            if (self.keyAttribute !== "") {
                var request = {query:{}};
                request.query[self.keyAttribute] = keywordArgs.identity;
                url = this._getFetchUrl(request);
                handleDocument = function (data) {
                    var item = null;
                    if (data) {
                        var items = self._getItems(data, {});
                        if (items.length === 1) {
                            item = items[0];
                        } else {
                            if (keywordArgs.onError) {
                                var scope = keywordArgs.scope || kernel.global;
                                keywordArgs.onError.call(scope, new Error("More than one item was returned from the server for the denoted identity"));
                            }
                        }
                    }
                    if (keywordArgs.onItem) {
                        scope = keywordArgs.scope || kernel.global;
                        keywordArgs.onItem.call(scope, item);
                    }
                };
                getArgs = {url:url, handleAs:"xml", preventCache:self.urlPreventCache};
                getHandler = xhr.get(getArgs);
                getHandler.addCallback(handleDocument);
                if (keywordArgs.onError) {
                    getHandler.addErrback(function (error) {
                        var s = keywordArgs.scope || kernel.global;
                        keywordArgs.onError.call(s, error);
                    });
                }
            } else {
                if (keywordArgs.onError) {
                    var s = keywordArgs.scope || kernel.global;
                    keywordArgs.onError.call(s, new Error("XmlStore is not told that the server to provides identity support.  No keyAttribute specified."));
                }
            }
        }
    }});
    lang.extend(XmlStore, simpleFetch);
    return XmlStore;
});

