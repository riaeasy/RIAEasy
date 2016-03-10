//>>built

define("dojox/data/SnapLogicStore", ["dojo", "dojox", "dojo/io/script", "dojo/data/util/sorter"], function (dojo, dojox) {
    return dojo.declare("dojox.data.SnapLogicStore", null, {Parts:{DATA:"data", COUNT:"count"}, url:"", constructor:function (args) {
        if (args.url) {
            this.url = args.url;
        }
        this._parameters = args.parameters;
    }, _assertIsItem:function (item) {
        if (!this.isItem(item)) {
            throw new Error("dojox.data.SnapLogicStore: a function was passed an item argument that was not an item");
        }
    }, _assertIsAttribute:function (attribute) {
        if (typeof attribute !== "string") {
            throw new Error("dojox.data.SnapLogicStore: a function was passed an attribute argument that was not an attribute name string");
        }
    }, getFeatures:function () {
        return {"dojo.data.api.Read":true};
    }, getValue:function (item, attribute, defaultValue) {
        this._assertIsItem(item);
        this._assertIsAttribute(attribute);
        var i = dojo.indexOf(item.attributes, attribute);
        if (i !== -1) {
            return item.values[i];
        }
        return defaultValue;
    }, getAttributes:function (item) {
        this._assertIsItem(item);
        return item.attributes;
    }, hasAttribute:function (item, attribute) {
        this._assertIsItem(item);
        this._assertIsAttribute(attribute);
        for (var i = 0; i < item.attributes.length; ++i) {
            if (attribute == item.attributes[i]) {
                return true;
            }
        }
        return false;
    }, isItemLoaded:function (item) {
        return this.isItem(item);
    }, loadItem:function (keywordArgs) {
    }, getLabel:function (item) {
        return undefined;
    }, getLabelAttributes:function (item) {
        return null;
    }, containsValue:function (item, attribute, value) {
        return this.getValue(item, attribute) === value;
    }, getValues:function (item, attribute) {
        this._assertIsItem(item);
        this._assertIsAttribute(attribute);
        var i = dojo.indexOf(item.attributes, attribute);
        if (i !== -1) {
            return [item.values[i]];
        }
        return [];
    }, isItem:function (item) {
        if (item && item._store === this) {
            return true;
        }
        return false;
    }, close:function (request) {
    }, _fetchHandler:function (request) {
        var scope = request.scope || dojo.global;
        if (request.onBegin) {
            request.onBegin.call(scope, request._countResponse[0], request);
        }
        if (request.onItem || request.onComplete) {
            var response = request._dataResponse;
            if (!response.length) {
                request.onError.call(scope, new Error("dojox.data.SnapLogicStore: invalid response of length 0"), request);
                return;
            } else {
                if (request.query != "record count") {
                    var field_names = response.shift();
                    var items = [];
                    for (var i = 0; i < response.length; ++i) {
                        if (request._aborted) {
                            break;
                        }
                        items.push({attributes:field_names, values:response[i], _store:this});
                    }
                    if (request.sort && !request._aborted) {
                        items.sort(dojo.data.util.sorter.createSortFunction(request.sort, self));
                    }
                } else {
                    items = [({attributes:["count"], values:response, _store:this})];
                }
            }
            if (request.onItem) {
                for (var i = 0; i < items.length; ++i) {
                    if (request._aborted) {
                        break;
                    }
                    request.onItem.call(scope, items[i], request);
                }
                items = null;
            }
            if (request.onComplete && !request._aborted) {
                request.onComplete.call(scope, items, request);
            }
        }
    }, _partHandler:function (request, part, response) {
        if (response instanceof Error) {
            if (part == this.Parts.DATA) {
                request._dataHandle = null;
            } else {
                request._countHandle = null;
            }
            request._aborted = true;
            if (request.onError) {
                request.onError.call(request.scope, response, request);
            }
        } else {
            if (request._aborted) {
                return;
            }
            if (part == this.Parts.DATA) {
                request._dataResponse = response;
            } else {
                request._countResponse = response;
            }
            if ((!request._dataHandle || request._dataResponse !== null) && (!request._countHandle || request._countResponse !== null)) {
                this._fetchHandler(request);
            }
        }
    }, fetch:function (request) {
        request._countResponse = null;
        request._dataResponse = null;
        request._aborted = false;
        request.abort = function () {
            if (!request._aborted) {
                request._aborted = true;
                if (request._dataHandle && request._dataHandle.cancel) {
                    request._dataHandle.cancel();
                }
                if (request._countHandle && request._countHandle.cancel) {
                    request._countHandle.cancel();
                }
            }
        };
        if (request.onItem || request.onComplete) {
            var content = this._parameters || {};
            if (request.start) {
                if (request.start < 0) {
                    throw new Error("dojox.data.SnapLogicStore: request start value must be 0 or greater");
                }
                content["sn.start"] = request.start + 1;
            }
            if (request.count) {
                if (request.count < 0) {
                    throw new Error("dojox.data.SnapLogicStore: request count value 0 or greater");
                }
                content["sn.limit"] = request.count;
            }
            content["sn.content_type"] = "application/javascript";
            var store = this;
            var handler = function (response, ioArgs) {
                if (response instanceof Error) {
                    store._fetchHandler(response, request);
                }
            };
            var getArgs = {url:this.url, content:content, timeout:60000, callbackParamName:"sn.stream_header", handle:dojo.hitch(this, "_partHandler", request, this.Parts.DATA)};
            request._dataHandle = dojo.io.script.get(getArgs);
        }
        if (request.onBegin) {
            var content = {};
            content["sn.count"] = "records";
            content["sn.content_type"] = "application/javascript";
            var getArgs = {url:this.url, content:content, timeout:60000, callbackParamName:"sn.stream_header", handle:dojo.hitch(this, "_partHandler", request, this.Parts.COUNT)};
            request._countHandle = dojo.io.script.get(getArgs);
        }
        return request;
    }});
});

