//>>built

define("dojox/data/FileStore", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/kernel", "dojo/_base/json", "dojo/_base/xhr"], function (declare, lang, kernel, jsonUtil, xhr) {
    return declare("dojox.data.FileStore", null, {constructor:function (args) {
        if (args && args.label) {
            this.label = args.label;
        }
        if (args && args.url) {
            this.url = args.url;
        }
        if (args && args.options) {
            if (lang.isArray(args.options)) {
                this.options = args.options;
            } else {
                if (lang.isString(args.options)) {
                    this.options = args.options.split(",");
                }
            }
        }
        if (args && args.pathAsQueryParam) {
            this.pathAsQueryParam = true;
        }
        if (args && "urlPreventCache" in args) {
            this.urlPreventCache = args.urlPreventCache ? true : false;
        }
    }, url:"", _storeRef:"_S", label:"name", _identifier:"path", _attributes:["children", "directory", "name", "path", "modified", "size", "parentDir"], pathSeparator:"/", options:[], failOk:false, urlPreventCache:true, _assertIsItem:function (item) {
        if (!this.isItem(item)) {
            throw new Error("dojox.data.FileStore: a function was passed an item argument that was not an item");
        }
    }, _assertIsAttribute:function (attribute) {
        if (typeof attribute !== "string") {
            throw new Error("dojox.data.FileStore: a function was passed an attribute argument that was not an attribute name string");
        }
    }, pathAsQueryParam:false, getFeatures:function () {
        return {"dojo.data.api.Read":true, "dojo.data.api.Identity":true};
    }, getValue:function (item, attribute, defaultValue) {
        var values = this.getValues(item, attribute);
        if (values && values.length > 0) {
            return values[0];
        }
        return defaultValue;
    }, getAttributes:function (item) {
        return this._attributes;
    }, hasAttribute:function (item, attribute) {
        this._assertIsItem(item);
        this._assertIsAttribute(attribute);
        return (attribute in item);
    }, getIdentity:function (item) {
        return this.getValue(item, this._identifier);
    }, getIdentityAttributes:function (item) {
        return [this._identifier];
    }, isItemLoaded:function (item) {
        var loaded = this.isItem(item);
        if (loaded && typeof item._loaded == "boolean" && !item._loaded) {
            loaded = false;
        }
        return loaded;
    }, loadItem:function (keywordArgs) {
        var item = keywordArgs.item;
        var self = this;
        var scope = keywordArgs.scope || kernel.global;
        var content = {};
        if (this.options.length > 0) {
            content.options = jsonUtil.toJson(this.options);
        }
        if (this.pathAsQueryParam) {
            content.path = item.parentPath + this.pathSeparator + item.name;
        }
        var xhrData = {url:this.pathAsQueryParam ? this.url : this.url + "/" + item.parentPath + "/" + item.name, handleAs:"json-comment-optional", content:content, preventCache:this.urlPreventCache, failOk:this.failOk};
        var deferred = xhr.get(xhrData);
        deferred.addErrback(function (error) {
            if (keywordArgs.onError) {
                keywordArgs.onError.call(scope, error);
            }
        });
        deferred.addCallback(function (data) {
            delete item.parentPath;
            delete item._loaded;
            lang.mixin(item, data);
            self._processItem(item);
            if (keywordArgs.onItem) {
                keywordArgs.onItem.call(scope, item);
            }
        });
    }, getLabel:function (item) {
        return this.getValue(item, this.label);
    }, getLabelAttributes:function (item) {
        return [this.label];
    }, containsValue:function (item, attribute, value) {
        var values = this.getValues(item, attribute);
        for (var i = 0; i < values.length; i++) {
            if (values[i] == value) {
                return true;
            }
        }
        return false;
    }, getValues:function (item, attribute) {
        this._assertIsItem(item);
        this._assertIsAttribute(attribute);
        var value = item[attribute];
        if (typeof value !== "undefined" && !lang.isArray(value)) {
            value = [value];
        } else {
            if (typeof value === "undefined") {
                value = [];
            }
        }
        return value;
    }, isItem:function (item) {
        if (item && item[this._storeRef] === this) {
            return true;
        }
        return false;
    }, close:function (request) {
    }, fetch:function (request) {
        request = request || {};
        if (!request.store) {
            request.store = this;
        }
        var self = this;
        var scope = request.scope || kernel.global;
        var reqParams = {};
        if (request.query) {
            reqParams.query = jsonUtil.toJson(request.query);
        }
        if (request.sort) {
            reqParams.sort = jsonUtil.toJson(request.sort);
        }
        if (request.queryOptions) {
            reqParams.queryOptions = jsonUtil.toJson(request.queryOptions);
        }
        if (typeof request.start == "number") {
            reqParams.start = "" + request.start;
        }
        if (typeof request.count == "number") {
            reqParams.count = "" + request.count;
        }
        if (this.options.length > 0) {
            reqParams.options = jsonUtil.toJson(this.options);
        }
        var getArgs = {url:this.url, preventCache:this.urlPreventCache, failOk:this.failOk, handleAs:"json-comment-optional", content:reqParams};
        var deferred = xhr.get(getArgs);
        deferred.addCallback(function (data) {
            self._processResult(data, request);
        });
        deferred.addErrback(function (error) {
            if (request.onError) {
                request.onError.call(scope, error, request);
            }
        });
    }, fetchItemByIdentity:function (keywordArgs) {
        var path = keywordArgs.identity;
        var self = this;
        var scope = keywordArgs.scope || kernel.global;
        var content = {};
        if (this.options.length > 0) {
            content.options = jsonUtil.toJson(this.options);
        }
        if (this.pathAsQueryParam) {
            content.path = path;
        }
        var xhrData = {url:this.pathAsQueryParam ? this.url : this.url + "/" + path, handleAs:"json-comment-optional", content:content, preventCache:this.urlPreventCache, failOk:this.failOk};
        var deferred = xhr.get(xhrData);
        deferred.addErrback(function (error) {
            if (keywordArgs.onError) {
                keywordArgs.onError.call(scope, error);
            }
        });
        deferred.addCallback(function (data) {
            var item = self._processItem(data);
            if (keywordArgs.onItem) {
                keywordArgs.onItem.call(scope, item);
            }
        });
    }, _processResult:function (data, request) {
        var scope = request.scope || kernel.global;
        try {
            if (data.pathSeparator) {
                this.pathSeparator = data.pathSeparator;
            }
            if (request.onBegin) {
                request.onBegin.call(scope, data.total, request);
            }
            var items = this._processItemArray(data.items);
            if (request.onItem) {
                var i;
                for (i = 0; i < items.length; i++) {
                    request.onItem.call(scope, items[i], request);
                }
                items = null;
            }
            if (request.onComplete) {
                request.onComplete.call(scope, items, request);
            }
        }
        catch (e) {
            if (request.onError) {
                request.onError.call(scope, e, request);
            } else {
                console.log(e);
            }
        }
    }, _processItemArray:function (itemArray) {
        var i;
        for (i = 0; i < itemArray.length; i++) {
            this._processItem(itemArray[i]);
        }
        return itemArray;
    }, _processItem:function (item) {
        if (!item) {
            return null;
        }
        item[this._storeRef] = this;
        if (item.children && item.directory) {
            if (lang.isArray(item.children)) {
                var children = item.children;
                var i;
                for (i = 0; i < children.length; i++) {
                    var name = children[i];
                    if (lang.isObject(name)) {
                        children[i] = this._processItem(name);
                    } else {
                        children[i] = {name:name, _loaded:false, parentPath:item.path};
                        children[i][this._storeRef] = this;
                    }
                }
            } else {
                delete item.children;
            }
        }
        return item;
    }});
});

