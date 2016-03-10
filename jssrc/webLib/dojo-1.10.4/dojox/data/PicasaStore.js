//>>built

define("dojox/data/PicasaStore", ["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/connect", "dojo/io/script", "dojo/data/util/simpleFetch", "dojo/date/stamp"], function (lang, declare, connect, scriptIO, simpleFetch, dateStamp) {
    var PicasaStore = declare("dojox.data.PicasaStore", null, {constructor:function (args) {
        if (args && args.label) {
            this.label = args.label;
        }
        if (args && "urlPreventCache" in args) {
            this.urlPreventCache = args.urlPreventCache ? true : false;
        }
        if (args && "maxResults" in args) {
            this.maxResults = parseInt(args.maxResults);
            if (!this.maxResults) {
                this.maxResults = 20;
            }
        }
    }, _picasaUrl:"http://picasaweb.google.com/data/feed/api/all", _storeRef:"_S", label:"title", urlPreventCache:false, maxResults:20, _assertIsItem:function (item) {
        if (!this.isItem(item)) {
            throw new Error("dojox.data.PicasaStore: a function was passed an item argument that was not an item");
        }
    }, _assertIsAttribute:function (attribute) {
        if (typeof attribute !== "string") {
            throw new Error("dojox.data.PicasaStore: a function was passed an attribute argument that was not an attribute name string");
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
        return ["id", "published", "updated", "category", "title$type", "title", "summary$type", "summary", "rights$type", "rights", "link", "author", "gphoto$id", "gphoto$name", "location", "imageUrlSmall", "imageUrlMedium", "imageUrl", "datePublished", "dateTaken", "description"];
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
        if (attribute === "title") {
            return [this._unescapeHtml(item.title)];
        } else {
            if (attribute === "author") {
                return [this._unescapeHtml(item.author[0].name)];
            } else {
                if (attribute === "datePublished") {
                    return [dateAtamp.fromISOString(item.published)];
                } else {
                    if (attribute === "dateTaken") {
                        return [dateStamp.fromISOString(item.published)];
                    } else {
                        if (attribute === "updated") {
                            return [dateStamp.fromISOString(item.updated)];
                        } else {
                            if (attribute === "imageUrlSmall") {
                                return [item.media.thumbnail[1].url];
                            } else {
                                if (attribute === "imageUrl") {
                                    return [item.content$src];
                                } else {
                                    if (attribute === "imageUrlMedium") {
                                        return [item.media.thumbnail[2].url];
                                    } else {
                                        if (attribute === "link") {
                                            return [item.link[1]];
                                        } else {
                                            if (attribute === "tags") {
                                                return item.tags.split(" ");
                                            } else {
                                                if (attribute === "description") {
                                                    return [this._unescapeHtml(item.summary)];
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return [];
    }, isItem:function (item) {
        if (item && item[this._storeRef] === this) {
            return true;
        }
        return false;
    }, close:function (request) {
    }, _fetchItems:function (request, fetchHandler, errorHandler) {
        if (!request.query) {
            request.query = {};
        }
        var content = {alt:"jsonm", pp:"1", psc:"G"};
        content["start-index"] = "1";
        if (request.query.start) {
            content["start-index"] = request.query.start;
        }
        if (request.query.tags) {
            content.q = request.query.tags;
        }
        if (request.query.userid) {
            content.uname = request.query.userid;
        }
        if (request.query.userids) {
            content.ids = request.query.userids;
        }
        if (request.query.lang) {
            content.hl = request.query.lang;
        }
        content["max-results"] = this.maxResults;
        var self = this;
        var handle = null;
        var myHandler = function (data) {
            if (handle !== null) {
                connect.disconnect(handle);
            }
            fetchHandler(self._processPicasaData(data), request);
        };
        var getArgs = {url:this._picasaUrl, preventCache:this.urlPreventCache, content:content, callbackParamName:"callback", handle:myHandler};
        var deferred = scriptIO.get(getArgs);
        deferred.addErrback(function (error) {
            connect.disconnect(handle);
            errorHandler(error, request);
        });
    }, _processPicasaData:function (data) {
        var items = [];
        if (data.feed) {
            items = data.feed.entry;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                item[this._storeRef] = this;
            }
        }
        return items;
    }, _unescapeHtml:function (str) {
        if (str) {
            str = str.replace(/&amp;/gm, "&").replace(/&lt;/gm, "<").replace(/&gt;/gm, ">").replace(/&quot;/gm, "\"");
            str = str.replace(/&#39;/gm, "'");
        }
        return str;
    }});
    lang.extend(PicasaStore, simpleFetch);
    return PicasaStore;
});

