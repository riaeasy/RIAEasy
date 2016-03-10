//>>built

define("dojox/data/GoogleSearchStore", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/declare", "dojo/_base/query", "dojo/dom-construct", "dojo/io/script"], function (kernel, lang, declare, domQuery, domConstruct, scriptIO) {
    kernel.experimental("dojox.data.GoogleSearchStore");
    var SearchStore = declare("dojox.data.GoogleSearchStore", null, {constructor:function (args) {
        if (args) {
            if (args.label) {
                this.label = args.label;
            }
            if (args.key) {
                this._key = args.key;
            }
            if (args.lang) {
                this._lang = args.lang;
            }
            if ("urlPreventCache" in args) {
                this.urlPreventCache = args.urlPreventCache ? true : false;
            }
        }
        this._id = dojox.data.GoogleSearchStore.prototype._id++;
    }, _id:0, _requestCount:0, _googleUrl:"http://ajax.googleapis.com/ajax/services/search/", _storeRef:"_S", _attributes:["unescapedUrl", "url", "visibleUrl", "cacheUrl", "title", "titleNoFormatting", "content", "estimatedResultCount"], _aggregatedAttributes:{estimatedResultCount:"cursor.estimatedResultCount"}, label:"titleNoFormatting", _type:"web", urlPreventCache:true, _queryAttrs:{text:"q"}, _assertIsItem:function (item) {
        if (!this.isItem(item)) {
            throw new Error("dojox.data.GoogleSearchStore: a function was passed an item argument that was not an item");
        }
    }, _assertIsAttribute:function (attribute) {
        if (typeof attribute !== "string") {
            throw new Error("dojox.data.GoogleSearchStore: a function was passed an attribute argument that was not an attribute name string");
        }
    }, getFeatures:function () {
        return {"dojo.data.api.Read":true};
    }, getValue:function (item, attribute, defaultValue) {
        var values = this.getValues(item, attribute);
        if (values && values.length > 0) {
            return values[0];
        }
        return defaultValue;
    }, getAttributes:function (item) {
        return this._attributes;
    }, hasAttribute:function (item, attribute) {
        if (this.getValue(item, attribute)) {
            return true;
        }
        return false;
    }, isItemLoaded:function (item) {
        return this.isItem(item);
    }, loadItem:function (keywordArgs) {
    }, getLabel:function (item) {
        return this.getValue(item, this.label);
    }, getLabelAttributes:function (item) {
        return [this.label];
    }, containsValue:function (item, attribute, value) {
        var values = this.getValues(item, attribute);
        for (var i = 0; i < values.length; i++) {
            if (values[i] === value) {
                return true;
            }
        }
        return false;
    }, getValues:function (item, attribute) {
        this._assertIsItem(item);
        this._assertIsAttribute(attribute);
        var val = item[attribute];
        if (lang.isArray(val)) {
            return val;
        } else {
            if (val !== undefined) {
                return [val];
            } else {
                return [];
            }
        }
    }, isItem:function (item) {
        if (item && item[this._storeRef] === this) {
            return true;
        }
        return false;
    }, close:function (request) {
    }, _format:function (item, name) {
        return item;
    }, fetch:function (request) {
        request = request || {};
        var scope = request.scope || kernel.global;
        if (!request.query) {
            if (request.onError) {
                request.onError.call(scope, new Error(this.declaredClass + ": A query must be specified."));
                return;
            }
        }
        var query = {};
        for (var attr in this._queryAttrs) {
            query[attr] = request.query[attr];
        }
        request = {query:query, onComplete:request.onComplete, onError:request.onError, onItem:request.onItem, onBegin:request.onBegin, start:request.start, count:request.count};
        var pageSize = 8;
        var callbackFn = "GoogleSearchStoreCallback_" + this._id + "_" + (++this._requestCount);
        var content = this._createContent(query, callbackFn, request);
        var firstRequest;
        if (typeof (request.start) === "undefined" || request.start === null) {
            request.start = 0;
        }
        if (!request.count) {
            request.count = pageSize;
        }
        firstRequest = {start:request.start - request.start % pageSize};
        var _this = this;
        var searchUrl = this._googleUrl + this._type;
        var getArgs = {url:searchUrl, preventCache:this.urlPreventCache, content:content};
        var items = [];
        var successfulReq = 0;
        var finished = false;
        var lastOnItem = request.start - 1;
        var numRequests = 0;
        var scriptIds = [];
        function doRequest(req) {
            numRequests++;
            getArgs.content.context = getArgs.content.start = req.start;
            var deferred = scriptIO.get(getArgs);
            scriptIds.push(deferred.ioArgs.id);
            deferred.addErrback(function (error) {
                if (request.onError) {
                    request.onError.call(scope, error, request);
                }
            });
        }
        var myHandler = function (start, data) {
            if (scriptIds.length > 0) {
                domQuery("#" + scriptIds.splice(0, 1)).forEach(domConstruct.destroy);
            }
            if (finished) {
                return;
            }
            var results = _this._getItems(data);
            var cursor = data ? data["cursor"] : null;
            if (results) {
                for (var i = 0; i < results.length && i + start < request.count + request.start; i++) {
                    _this._processItem(results[i], data);
                    items[i + start] = results[i];
                }
                successfulReq++;
                if (successfulReq == 1) {
                    var pages = cursor ? cursor.pages : null;
                    var firstStart = pages ? Number(pages[pages.length - 1].start) : 0;
                    if (request.onBegin) {
                        var est = cursor ? cursor.estimatedResultCount : results.length;
                        var total = est ? Math.min(est, firstStart + results.length) : firstStart + results.length;
                        request.onBegin.call(scope, total, request);
                    }
                    var nextPage = (request.start - request.start % pageSize) + pageSize;
                    var page = 1;
                    while (pages) {
                        if (!pages[page] || Number(pages[page].start) >= request.start + request.count) {
                            break;
                        }
                        if (Number(pages[page].start) >= nextPage) {
                            doRequest({start:pages[page].start});
                        }
                        page++;
                    }
                }
                if (request.onItem && items[lastOnItem + 1]) {
                    do {
                        lastOnItem++;
                        request.onItem.call(scope, items[lastOnItem], request);
                    } while (items[lastOnItem + 1] && lastOnItem < request.start + request.count);
                }
                if (successfulReq == numRequests) {
                    finished = true;
                    kernel.global[callbackFn] = null;
                    if (request.onItem) {
                        request.onComplete.call(scope, null, request);
                    } else {
                        items = items.slice(request.start, request.start + request.count);
                        request.onComplete.call(scope, items, request);
                    }
                }
            }
        };
        var callbacks = [];
        var lastCallback = firstRequest.start - 1;
        kernel.global[callbackFn] = function (start, data, responseCode, errorMsg) {
            try {
                if (responseCode != 200) {
                    if (request.onError) {
                        request.onError.call(scope, new Error("Response from Google was: " + responseCode), request);
                    }
                    kernel.global[callbackFn] = function () {
                    };
                    return;
                }
                if (start == lastCallback + 1) {
                    myHandler(Number(start), data);
                    lastCallback += pageSize;
                    if (callbacks.length > 0) {
                        callbacks.sort(_this._getSort());
                        while (callbacks.length > 0 && callbacks[0].start == lastCallback + 1) {
                            myHandler(Number(callbacks[0].start), callbacks[0].data);
                            callbacks.splice(0, 1);
                            lastCallback += pageSize;
                        }
                    }
                } else {
                    callbacks.push({start:start, data:data});
                }
            }
            catch (e) {
                request.onError.call(scope, e, request);
            }
        };
        doRequest(firstRequest);
    }, _getSort:function () {
        return function (a, b) {
            if (a.start < b.start) {
                return -1;
            }
            if (b.start < a.start) {
                return 1;
            }
            return 0;
        };
    }, _processItem:function (item, data) {
        item[this._storeRef] = this;
        for (var attribute in this._aggregatedAttributes) {
            item[attribute] = lang.getObject(this._aggregatedAttributes[attribute], false, data);
        }
    }, _getItems:function (data) {
        return data["results"] || data;
    }, _createContent:function (query, callback, request) {
        var content = {v:"1.0", rsz:"large", callback:callback, key:this._key, hl:this._lang};
        for (var attr in this._queryAttrs) {
            content[this._queryAttrs[attr]] = query[attr];
        }
        return content;
    }});
    var WebSearchStore = declare("dojox.data.GoogleWebSearchStore", SearchStore, {});
    var BlogSearchStore = declare("dojox.data.GoogleBlogSearchStore", SearchStore, {_type:"blogs", _attributes:["blogUrl", "postUrl", "title", "titleNoFormatting", "content", "author", "publishedDate"], _aggregatedAttributes:{}});
    var LocalSearchStore = declare("dojox.data.GoogleLocalSearchStore", SearchStore, {_type:"local", _attributes:["title", "titleNoFormatting", "url", "lat", "lng", "streetAddress", "city", "region", "country", "phoneNumbers", "ddUrl", "ddUrlToHere", "ddUrlFromHere", "staticMapUrl", "viewport"], _aggregatedAttributes:{viewport:"viewport"}, _queryAttrs:{text:"q", centerLatLong:"sll", searchSpan:"sspn"}});
    var VideoSearchStore = declare("dojox.data.GoogleVideoSearchStore", SearchStore, {_type:"video", _attributes:["title", "titleNoFormatting", "content", "url", "published", "publisher", "duration", "tbWidth", "tbHeight", "tbUrl", "playUrl"], _aggregatedAttributes:{}});
    var NewsSearchStore = declare("dojox.data.GoogleNewsSearchStore", SearchStore, {_type:"news", _attributes:["title", "titleNoFormatting", "content", "url", "unescapedUrl", "publisher", "clusterUrl", "location", "publishedDate", "relatedStories"], _aggregatedAttributes:{}});
    var BookSearchStore = declare("dojox.data.GoogleBookSearchStore", SearchStore, {_type:"books", _attributes:["title", "titleNoFormatting", "authors", "url", "unescapedUrl", "bookId", "pageCount", "publishedYear"], _aggregatedAttributes:{}});
    var ImageSearchStore = declare("dojox.data.GoogleImageSearchStore", SearchStore, {_type:"images", _attributes:["title", "titleNoFormatting", "visibleUrl", "url", "unescapedUrl", "originalContextUrl", "width", "height", "tbWidth", "tbHeight", "tbUrl", "content", "contentNoFormatting"], _aggregatedAttributes:{}});
    return {Search:SearchStore, ImageSearch:ImageSearchStore, BookSearch:BookSearchStore, NewsSearch:NewsSearchStore, VideoSearch:VideoSearchStore, LocalSearch:LocalSearchStore, BlogSearch:BlogSearchStore, WebSearch:WebSearchStore};
});

