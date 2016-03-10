//>>built

define("dojox/data/CdfStore", ["dojo", "dojox", "dojo/data/util/sorter"], function (dojo, dojox) {
    dojox.data.ASYNC_MODE = 0;
    dojox.data.SYNC_MODE = 1;
    return dojo.declare("dojox.data.CdfStore", null, {identity:"jsxid", url:"", xmlStr:"", data:null, label:"", mode:dojox.data.ASYNC_MODE, constructor:function (args) {
        if (args) {
            this.url = args.url;
            this.xmlStr = args.xmlStr || args.str;
            if (args.data) {
                this.xmlStr = this._makeXmlString(args.data);
            }
            this.identity = args.identity || this.identity;
            this.label = args.label || this.label;
            this.mode = args.mode !== undefined ? args.mode : this.mode;
        }
        this._modifiedItems = {};
        this.byId = this.fetchItemByIdentity;
    }, getValue:function (item, property, defaultValue) {
        return item.getAttribute(property) || defaultValue;
    }, getValues:function (item, property) {
        var v = this.getValue(item, property, []);
        return dojo.isArray(v) ? v : [v];
    }, getAttributes:function (item) {
        return item.getAttributeNames();
    }, hasAttribute:function (item, property) {
        return (this.getValue(item, property) !== undefined);
    }, hasProperty:function (item, property) {
        return this.hasAttribute(item, property);
    }, containsValue:function (item, property, value) {
        var values = this.getValues(item, property);
        for (var i = 0; i < values.length; i++) {
            if (values[i] === null) {
                continue;
            }
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
        if (something.getClass && something.getClass().equals(jsx3.xml.Entity.jsxclass)) {
            return true;
        }
        return false;
    }, isItemLoaded:function (something) {
        return this.isItem(something);
    }, loadItem:function (keywordArgs) {
    }, getFeatures:function () {
        return {"dojo.data.api.Read":true, "dojo.data.api.Write":true, "dojo.data.api.Identity":true};
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
    }, fetch:function (request) {
        request = request || {};
        if (!request.store) {
            request.store = this;
        }
        if (request.mode !== undefined) {
            this.mode = request.mode;
        }
        var self = this;
        var errorHandler = function (errorData) {
            if (request.onError) {
                var scope = request.scope || dojo.global;
                request.onError.call(scope, errorData, request);
            } else {
                console.error("cdfStore Error:", errorData);
            }
        };
        var fetchHandler = function (items, requestObject) {
            requestObject = requestObject || request;
            var oldAbortFunction = requestObject.abort || null;
            var aborted = false;
            var startIndex = requestObject.start ? requestObject.start : 0;
            var endIndex = (requestObject.count && (requestObject.count !== Infinity)) ? (startIndex + requestObject.count) : items.length;
            requestObject.abort = function () {
                aborted = true;
                if (oldAbortFunction) {
                    oldAbortFunction.call(requestObject);
                }
            };
            var scope = requestObject.scope || dojo.global;
            if (!requestObject.store) {
                requestObject.store = self;
            }
            if (requestObject.onBegin) {
                requestObject.onBegin.call(scope, items.length, requestObject);
            }
            if (requestObject.sort) {
                items.sort(dojo.data.util.sorter.createSortFunction(requestObject.sort, self));
            }
            if (requestObject.onItem) {
                for (var i = startIndex; (i < items.length) && (i < endIndex); ++i) {
                    var item = items[i];
                    if (!aborted) {
                        requestObject.onItem.call(scope, item, requestObject);
                    }
                }
            }
            if (requestObject.onComplete && !aborted) {
                if (!requestObject.onItem) {
                    items = items.slice(startIndex, endIndex);
                    if (requestObject.byId) {
                        items = items[0];
                    }
                }
                requestObject.onComplete.call(scope, items, requestObject);
            } else {
                items = items.slice(startIndex, endIndex);
                if (requestObject.byId) {
                    items = items[0];
                }
            }
            return items;
        };
        if (!this.url && !this.data && !this.xmlStr) {
            errorHandler(new Error("No URL or data specified."));
            return false;
        }
        var localRequest = request || "*";
        if (this.mode == dojox.data.SYNC_MODE) {
            var res = this._loadCDF();
            if (res instanceof Error) {
                if (request.onError) {
                    request.onError.call(request.scope || dojo.global, res, request);
                } else {
                    console.error("CdfStore Error:", res);
                }
                return res;
            }
            this.cdfDoc = res;
            var items = this._getItems(this.cdfDoc, localRequest);
            if (items && items.length > 0) {
                items = fetchHandler(items, request);
            } else {
                items = fetchHandler([], request);
            }
            return items;
        } else {
            var dfd = this._loadCDF();
            dfd.addCallbacks(dojo.hitch(this, function (cdfDoc) {
                var items = this._getItems(this.cdfDoc, localRequest);
                if (items && items.length > 0) {
                    fetchHandler(items, request);
                } else {
                    fetchHandler([], request);
                }
            }), dojo.hitch(this, function (err) {
                errorHandler(err, request);
            }));
            return dfd;
        }
    }, _loadCDF:function () {
        var dfd = new dojo.Deferred();
        if (this.cdfDoc) {
            if (this.mode == dojox.data.SYNC_MODE) {
                return this.cdfDoc;
            } else {
                setTimeout(dojo.hitch(this, function () {
                    dfd.callback(this.cdfDoc);
                }), 0);
                return dfd;
            }
        }
        this.cdfDoc = jsx3.xml.CDF.Document.newDocument();
        this.cdfDoc.subscribe("response", this, function (evt) {
            dfd.callback(this.cdfDoc);
        });
        this.cdfDoc.subscribe("error", this, function (err) {
            dfd.errback(err);
        });
        this.cdfDoc.setAsync(!this.mode);
        if (this.url) {
            this.cdfDoc.load(this.url);
        } else {
            if (this.xmlStr) {
                this.cdfDoc.loadXML(this.xmlStr);
                if (this.cdfDoc.getError().code) {
                    return new Error(this.cdfDoc.getError().description);
                }
            }
        }
        if (this.mode == dojox.data.SYNC_MODE) {
            return this.cdfDoc;
        } else {
            return dfd;
        }
    }, _getItems:function (cdfDoc, request) {
        var itr = cdfDoc.selectNodes(request.query, false, 1);
        var items = [];
        while (itr.hasNext()) {
            items.push(itr.next());
        }
        return items;
    }, close:function (request) {
    }, newItem:function (keywordArgs, parentInfo) {
        keywordArgs = (keywordArgs || {});
        if (keywordArgs.tagName) {
            if (keywordArgs.tagName != "record") {
                console.warn("Only record inserts are supported at this time");
            }
            delete keywordArgs.tagName;
        }
        keywordArgs.jsxid = keywordArgs.jsxid || this.cdfDoc.getKey();
        if (this.isItem(parentInfo)) {
            parentInfo = this.getIdentity(parentInfo);
        }
        var item = this.cdfDoc.insertRecord(keywordArgs, parentInfo);
        this._makeDirty(item);
        return item;
    }, deleteItem:function (item) {
        this.cdfDoc.deleteRecord(this.getIdentity(item));
        this._makeDirty(item);
        return true;
    }, setValue:function (item, property, value) {
        this._makeDirty(item);
        item.setAttribute(property, value);
        return true;
    }, setValues:function (item, property, values) {
        this._makeDirty(item);
        console.warn("cdfStore.setValues only partially implemented.");
        return item.setAttribute(property, values);
    }, unsetAttribute:function (item, property) {
        this._makeDirty(item);
        item.removeAttribute(property);
        return true;
    }, revert:function () {
        delete this.cdfDoc;
        this._modifiedItems = {};
        return true;
    }, isDirty:function (item) {
        if (item) {
            return !!this._modifiedItems[this.getIdentity(item)];
        } else {
            var _dirty = false;
            for (var nm in this._modifiedItems) {
                _dirty = true;
                break;
            }
            return _dirty;
        }
    }, _makeDirty:function (item) {
        var id = this.getIdentity(item);
        this._modifiedItems[id] = item;
    }, _makeXmlString:function (obj) {
        var parseObj = function (obj, name) {
            var xmlStr = "";
            var nm;
            if (dojo.isArray(obj)) {
                for (var i = 0; i < obj.length; i++) {
                    xmlStr += parseObj(obj[i], name);
                }
            } else {
                if (dojo.isObject(obj)) {
                    xmlStr += "<" + name + " ";
                    for (nm in obj) {
                        if (!dojo.isObject(obj[nm])) {
                            xmlStr += nm + "=\"" + obj[nm] + "\" ";
                        }
                    }
                    xmlStr += ">";
                    for (nm in obj) {
                        if (dojo.isObject(obj[nm])) {
                            xmlStr += parseObj(obj[nm], nm);
                        }
                    }
                    xmlStr += "</" + name + ">";
                }
            }
            return xmlStr;
        };
        return parseObj(obj, "data");
    }, getIdentity:function (item) {
        return this.getValue(item, this.identity);
    }, getIdentityAttributes:function (item) {
        return [this.identity];
    }, fetchItemByIdentity:function (args) {
        if (dojo.isString(args)) {
            var id = args;
            args = {query:"//record[@jsxid='" + id + "']", mode:dojox.data.SYNC_MODE};
        } else {
            if (args) {
                args.query = "//record[@jsxid='" + args.identity + "']";
            }
            if (!args.mode) {
                args.mode = this.mode;
            }
        }
        args.byId = true;
        return this.fetch(args);
    }, byId:function (args) {
    }});
});

