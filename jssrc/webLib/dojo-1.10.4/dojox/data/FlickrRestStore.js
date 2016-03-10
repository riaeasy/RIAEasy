//>>built

define("dojox/data/FlickrRestStore", ["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/array", "dojo/io/script", "dojox/data/FlickrStore", "dojo/_base/connect"], function (lang, declare, array, scriptIO, FlickrStore, connect) {
    var FlickrRestStore = declare("dojox.data.FlickrRestStore", FlickrStore, {constructor:function (args) {
        if (args) {
            if (args.label) {
                this.label = args.label;
            }
            if (args.apikey) {
                this._apikey = args.apikey;
            }
        }
        this._cache = [];
        this._prevRequests = {};
        this._handlers = {};
        this._prevRequestRanges = [];
        this._maxPhotosPerUser = {};
        this._id = FlickrRestStore.prototype._id++;
    }, _id:0, _requestCount:0, _flickrRestUrl:"http://www.flickr.com/services/rest/", _apikey:null, _storeRef:"_S", _cache:null, _prevRequests:null, _handlers:null, _sortAttributes:{"date-posted":true, "date-taken":true, "interestingness":true}, _fetchItems:function (request, fetchHandler, errorHandler) {
        var query = {};
        if (!request.query) {
            request.query = query = {};
        } else {
            lang.mixin(query, request.query);
        }
        var primaryKey = [];
        var secondaryKey = [];
        var content = {format:"json", method:"flickr.photos.search", api_key:this._apikey, extras:"owner_name,date_upload,date_taken"};
        var isRest = false;
        if (query.userid) {
            isRest = true;
            content.user_id = request.query.userid;
            primaryKey.push("userid" + request.query.userid);
        }
        if (query.groupid) {
            isRest = true;
            content.group_id = query.groupid;
            primaryKey.push("groupid" + query.groupid);
        }
        if (query.apikey) {
            isRest = true;
            content.api_key = request.query.apikey;
            secondaryKey.push("api" + request.query.apikey);
        } else {
            if (content.api_key) {
                isRest = true;
                request.query.apikey = content.api_key;
                secondaryKey.push("api" + content.api_key);
            } else {
                throw Error("dojox.data.FlickrRestStore: An API key must be specified.");
            }
        }
        request._curCount = request.count;
        if (query.page) {
            content.page = request.query.page;
            secondaryKey.push("page" + content.page);
        } else {
            if (("start" in request) && request.start !== null) {
                if (!request.count) {
                    request.count = 20;
                }
                var diff = request.start % request.count;
                var start = request.start, count = request.count;
                if (diff !== 0) {
                    if (start < count / 2) {
                        count = start + count;
                        start = 0;
                    } else {
                        var divLimit = 20, div = 2;
                        for (var i = divLimit; i > 0; i--) {
                            if (start % i === 0 && (start / i) >= count) {
                                div = i;
                                break;
                            }
                        }
                        count = start / div;
                    }
                    request._realStart = request.start;
                    request._realCount = request.count;
                    request._curStart = start;
                    request._curCount = count;
                } else {
                    request._realStart = request._realCount = null;
                    request._curStart = request.start;
                    request._curCount = request.count;
                }
                content.page = (start / count) + 1;
                secondaryKey.push("page" + content.page);
            }
        }
        if (request._curCount) {
            content.per_page = request._curCount;
            secondaryKey.push("count" + request._curCount);
        }
        if (query.lang) {
            content.lang = request.query.lang;
            primaryKey.push("lang" + request.lang);
        }
        if (query.setid) {
            content.method = "flickr.photosets.getPhotos";
            content.photoset_id = request.query.setid;
            primaryKey.push("set" + request.query.setid);
        }
        if (query.tags) {
            if (query.tags instanceof Array) {
                content.tags = query.tags.join(",");
            } else {
                content.tags = query.tags;
            }
            primaryKey.push("tags" + content.tags);
            if (query["tag_mode"] && (query.tag_mode.toLowerCase() === "any" || query.tag_mode.toLowerCase() === "all")) {
                content.tag_mode = query.tag_mode;
            }
        }
        if (query.text) {
            content.text = query.text;
            primaryKey.push("text:" + query.text);
        }
        if (query.sort && query.sort.length > 0) {
            if (!query.sort[0].attribute) {
                query.sort[0].attribute = "date-posted";
            }
            if (this._sortAttributes[query.sort[0].attribute]) {
                if (query.sort[0].descending) {
                    content.sort = query.sort[0].attribute + "-desc";
                } else {
                    content.sort = query.sort[0].attribute + "-asc";
                }
            }
        } else {
            content.sort = "date-posted-asc";
        }
        primaryKey.push("sort:" + content.sort);
        primaryKey = primaryKey.join(".");
        secondaryKey = secondaryKey.length > 0 ? "." + secondaryKey.join(".") : "";
        var requestKey = primaryKey + secondaryKey;
        request = {query:query, count:request._curCount, start:request._curStart, _realCount:request._realCount, _realStart:request._realStart, onBegin:request.onBegin, onComplete:request.onComplete, onItem:request.onItem};
        var thisHandler = {request:request, fetchHandler:fetchHandler, errorHandler:errorHandler};
        if (this._handlers[requestKey]) {
            this._handlers[requestKey].push(thisHandler);
            return;
        }
        this._handlers[requestKey] = [thisHandler];
        var handle = null;
        var getArgs = {url:this._flickrRestUrl, preventCache:this.urlPreventCache, content:content, callbackParamName:"jsoncallback"};
        var doHandle = lang.hitch(this, function (processedData, data, handler) {
            var onBegin = handler.request.onBegin;
            handler.request.onBegin = null;
            var maxPhotos;
            var req = handler.request;
            if (("_realStart" in req) && req._realStart != null) {
                req.start = req._realStart;
                req.count = req._realCount;
                req._realStart = req._realCount = null;
            }
            if (onBegin) {
                var photos = null;
                if (data) {
                    photos = (data.photoset ? data.photoset : data.photos);
                }
                if (photos && ("perpage" in photos) && ("pages" in photos)) {
                    if (photos.perpage * photos.pages <= handler.request.start + handler.request.count) {
                        maxPhotos = handler.request.start + photos.photo.length;
                    } else {
                        maxPhotos = photos.perpage * photos.pages;
                    }
                    this._maxPhotosPerUser[primaryKey] = maxPhotos;
                    onBegin(maxPhotos, handler.request);
                } else {
                    if (this._maxPhotosPerUser[primaryKey]) {
                        onBegin(this._maxPhotosPerUser[primaryKey], handler.request);
                    }
                }
            }
            handler.fetchHandler(processedData, handler.request);
            if (onBegin) {
                handler.request.onBegin = onBegin;
            }
        });
        var myHandler = lang.hitch(this, function (data) {
            if (data.stat != "ok") {
                errorHandler(null, request);
            } else {
                var handlers = this._handlers[requestKey];
                if (!handlers) {
                    console.log("FlickrRestStore: no handlers for data", data);
                    return;
                }
                this._handlers[requestKey] = null;
                this._prevRequests[requestKey] = data;
                var processedData = this._processFlickrData(data, request, primaryKey);
                if (!this._prevRequestRanges[primaryKey]) {
                    this._prevRequestRanges[primaryKey] = [];
                }
                this._prevRequestRanges[primaryKey].push({start:request.start, end:request.start + (data.photoset ? data.photoset.photo.length : data.photos.photo.length)});
                array.forEach(handlers, function (i) {
                    doHandle(processedData, data, i);
                });
            }
        });
        var data = this._prevRequests[requestKey];
        if (data) {
            this._handlers[requestKey] = null;
            doHandle(this._cache[primaryKey], data, thisHandler);
            return;
        } else {
            if (this._checkPrevRanges(primaryKey, request.start, request.count)) {
                this._handlers[requestKey] = null;
                doHandle(this._cache[primaryKey], null, thisHandler);
                return;
            }
        }
        var deferred = scriptIO.get(getArgs);
        deferred.addCallback(myHandler);
        deferred.addErrback(function (error) {
            connect.disconnect(handle);
            errorHandler(error, request);
        });
    }, getAttributes:function (item) {
        return ["title", "author", "imageUrl", "imageUrlSmall", "imageUrlMedium", "imageUrlThumb", "imageUrlLarge", "imageUrlOriginal", "link", "dateTaken", "datePublished"];
    }, getValues:function (item, attribute) {
        this._assertIsItem(item);
        this._assertIsAttribute(attribute);
        switch (attribute) {
          case "title":
            return [this._unescapeHtml(item.title)];
          case "author":
            return [item.ownername];
          case "imageUrlSmall":
            return [item.media.s];
          case "imageUrl":
            return [item.media.l];
          case "imageUrlOriginal":
            return [item.media.o];
          case "imageUrlLarge":
            return [item.media.l];
          case "imageUrlMedium":
            return [item.media.m];
          case "imageUrlThumb":
            return [item.media.t];
          case "link":
            return ["http://www.flickr.com/photos/" + item.owner + "/" + item.id];
          case "dateTaken":
            return [item.datetaken];
          case "datePublished":
            return [item.datepublished];
          default:
            return undefined;
        }
    }, _processFlickrData:function (data, request, cacheKey) {
        if (data.items) {
            return FlickrStore.prototype._processFlickrData.apply(this, arguments);
        }
        var template = ["http://farm", null, ".static.flickr.com/", null, "/", null, "_", null];
        var items = [];
        var photos = (data.photoset ? data.photoset : data.photos);
        if (data.stat == "ok" && photos && photos.photo) {
            items = photos.photo;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                item[this._storeRef] = this;
                template[1] = item.farm;
                template[3] = item.server;
                template[5] = item.id;
                template[7] = item.secret;
                var base = template.join("");
                item.media = {s:base + "_s.jpg", m:base + "_m.jpg", l:base + ".jpg", t:base + "_t.jpg", o:base + "_o.jpg"};
                if (!item.owner && data.photoset) {
                    item.owner = data.photoset.owner;
                }
            }
        }
        var start = request.start ? request.start : 0;
        var arr = this._cache[cacheKey];
        if (!arr) {
            this._cache[cacheKey] = arr = [];
        }
        array.forEach(items, function (i, idx) {
            arr[idx + start] = i;
        });
        return arr;
    }, _checkPrevRanges:function (primaryKey, start, count) {
        var end = start + count;
        var arr = this._prevRequestRanges[primaryKey];
        return (!!arr) && array.some(arr, function (item) {
            return ((start >= item.start) && (end <= item.end));
        });
    }});
    return FlickrRestStore;
});

