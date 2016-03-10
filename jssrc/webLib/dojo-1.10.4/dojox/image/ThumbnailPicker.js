//>>built

define("dojox/image/ThumbnailPicker", ["dijit", "dojo", "dojox", "dojo/require!dojox/fx/scroll,dojo/fx/easing,dojo/fx,dijit/_Widget,dijit/_Templated"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.image.ThumbnailPicker");
    dojo.experimental("dojox.image.ThumbnailPicker");
    dojo.require("dojox.fx.scroll");
    dojo.require("dojo.fx.easing");
    dojo.require("dojo.fx");
    dojo.require("dijit._Widget");
    dojo.require("dijit._Templated");
    dojo.declare("dojox.image.ThumbnailPicker", [dijit._Widget, dijit._Templated], {imageStore:null, request:null, size:500, thumbHeight:75, thumbWidth:100, useLoadNotifier:false, useHyperlink:false, hyperlinkTarget:"new", isClickable:true, isScrollable:true, isHorizontal:true, autoLoad:true, linkAttr:"link", imageThumbAttr:"imageUrlThumb", imageLargeAttr:"imageUrl", pageSize:20, titleAttr:"title", templateString:dojo.cache("dojox.image", "resources/ThumbnailPicker.html", "<div dojoAttachPoint=\"outerNode\" class=\"thumbOuter\">\n\t<div dojoAttachPoint=\"navPrev\" class=\"thumbNav thumbClickable\">\n\t  <img src=\"\" dojoAttachPoint=\"navPrevImg\"/>    \n\t</div>\n\t<div dojoAttachPoint=\"thumbScroller\" class=\"thumbScroller\">\n\t  <div dojoAttachPoint=\"thumbsNode\" class=\"thumbWrapper\"></div>\n\t</div>\n\t<div dojoAttachPoint=\"navNext\" class=\"thumbNav thumbClickable\">\n\t  <img src=\"\" dojoAttachPoint=\"navNextImg\"/>  \n\t</div>\n</div>"), _thumbs:[], _thumbIndex:0, _maxPhotos:0, _loadedImages:{}, baseClass:"ThumbnailPicker", cellClass:"Thumbnail", postCreate:function () {
        this.inherited(arguments);
        this.pageSize = Number(this.pageSize);
        this._scrollerSize = this.size - (51 * 2);
        var sizeProp = this._sizeProperty = this.isHorizontal ? "width" : "height";
        dojo.style(this.outerNode, "textAlign", "center");
        dojo.style(this.outerNode, sizeProp, this.size + "px");
        dojo.style(this.thumbScroller, sizeProp, this._scrollerSize + "px");
        if (this.useHyperlink) {
            dojo.subscribe(this.getClickTopicName(), this, function (packet) {
                var index = packet.index;
                var url = this.imageStore.getValue(packet.data, this.linkAttr);
                if (!url) {
                    return;
                }
                if (this.hyperlinkTarget == "new") {
                    window.open(url);
                } else {
                    window.location = url;
                }
            });
        }
        if (this.isClickable) {
            dojo.addClass(this.thumbsNode, "thumbClickable");
        }
        this._totalSize = 0;
        var classExt = this.isHorizontal ? "Horiz" : "Vert";
        dojo.addClass(this.navPrev, "prev" + classExt);
        dojo.addClass(this.navNext, "next" + classExt);
        dojo.addClass(this.thumbsNode, "thumb" + classExt);
        dojo.addClass(this.outerNode, "thumb" + classExt);
        dojo.attr(this.navNextImg, "src", this._blankGif);
        dojo.attr(this.navPrevImg, "src", this._blankGif);
        this.connect(this.navPrev, "onclick", "_prev");
        this.connect(this.navNext, "onclick", "_next");
        if (this.isHorizontal) {
            this._sizeAttr = "offsetWidth";
            this._scrollAttr = "scrollLeft";
        } else {
            this._sizeAttr = "offsetHeight";
            this._scrollAttr = "scrollTop";
        }
        this._updateNavControls();
        this.init();
    }, init:function () {
        if (this.isInitialized) {
            return false;
        }
        this.isInitialized = true;
        if (this.imageStore && this.request) {
            this._loadNextPage();
        }
        return true;
    }, getClickTopicName:function () {
        return this.id + "/select";
    }, getShowTopicName:function () {
        return this.id + "/show";
    }, setDataStore:function (dataStore, request, paramNames) {
        this.reset();
        this.request = {query:{}, start:request.start || 0, count:request.count || 10, onBegin:dojo.hitch(this, function (total) {
            this._maxPhotos = total;
        })};
        if (request.query) {
            dojo.mixin(this.request.query, request.query);
        }
        if (paramNames) {
            dojo.forEach(["imageThumbAttr", "imageLargeAttr", "linkAttr", "titleAttr"], function (attrName) {
                if (paramNames[attrName]) {
                    this[attrName] = paramNames[attrName];
                }
            }, this);
        }
        this.request.start = 0;
        this.request.count = this.pageSize;
        this.imageStore = dataStore;
        this._loadInProgress = false;
        if (!this.init()) {
            this._loadNextPage();
        }
    }, reset:function () {
        this._loadedImages = {};
        dojo.forEach(this._thumbs, function (img) {
            if (img && img.parentNode) {
                dojo.destroy(img);
            }
        });
        this._thumbs = [];
        this.isInitialized = false;
        this._noImages = true;
    }, isVisible:function (index) {
        var img = this._thumbs[index];
        if (!img) {
            return false;
        }
        var pos = this.isHorizontal ? "offsetLeft" : "offsetTop";
        var size = this.isHorizontal ? "offsetWidth" : "offsetHeight";
        var scrollAttr = this.isHorizontal ? "scrollLeft" : "scrollTop";
        var offset = img[pos] - this.thumbsNode[pos];
        return (offset >= this.thumbScroller[scrollAttr] && offset + img[size] <= this.thumbScroller[scrollAttr] + this._scrollerSize);
    }, resize:function (dim) {
        var sizeParam = this.isHorizontal ? "w" : "h";
        var total = 0;
        if (this._thumbs.length > 0 && dojo.marginBox(this._thumbs[0]).w == 0) {
            return;
        }
        dojo.forEach(this._thumbs, dojo.hitch(this, function (imgContainer) {
            var mb = dojo.marginBox(imgContainer.firstChild);
            var size = mb[sizeParam];
            total += (Number(size) + 10);
            if (this.useLoadNotifier && mb.w > 0) {
                dojo.style(imgContainer.lastChild, "width", (mb.w - 4) + "px");
            }
            dojo.style(imgContainer, "width", mb.w + "px");
        }));
        dojo.style(this.thumbsNode, this._sizeProperty, total + "px");
        this._updateNavControls();
    }, _next:function () {
        var pos = this.isHorizontal ? "offsetLeft" : "offsetTop";
        var size = this.isHorizontal ? "offsetWidth" : "offsetHeight";
        var baseOffset = this.thumbsNode[pos];
        var firstThumb = this._thumbs[this._thumbIndex];
        var origOffset = firstThumb[pos] - baseOffset;
        var index = -1, img;
        for (var i = this._thumbIndex + 1; i < this._thumbs.length; i++) {
            img = this._thumbs[i];
            if (img[pos] - baseOffset + img[size] - origOffset > this._scrollerSize) {
                this._showThumbs(i);
                return;
            }
        }
    }, _prev:function () {
        if (this.thumbScroller[this.isHorizontal ? "scrollLeft" : "scrollTop"] == 0) {
            return;
        }
        var pos = this.isHorizontal ? "offsetLeft" : "offsetTop";
        var size = this.isHorizontal ? "offsetWidth" : "offsetHeight";
        var firstThumb = this._thumbs[this._thumbIndex];
        var origOffset = firstThumb[pos] - this.thumbsNode[pos];
        var index = -1, img;
        for (var i = this._thumbIndex - 1; i > -1; i--) {
            img = this._thumbs[i];
            if (origOffset - img[pos] > this._scrollerSize) {
                this._showThumbs(i + 1);
                return;
            }
        }
        this._showThumbs(0);
    }, _checkLoad:function (img, index) {
        dojo.publish(this.getShowTopicName(), [{index:index}]);
        this._updateNavControls();
        this._loadingImages = {};
        this._thumbIndex = index;
        if (this.thumbsNode.offsetWidth - img.offsetLeft < (this._scrollerSize * 2)) {
            this._loadNextPage();
        }
    }, _showThumbs:function (index) {
        index = Math.min(Math.max(index, 0), this._maxPhotos);
        if (index >= this._maxPhotos) {
            return;
        }
        var img = this._thumbs[index];
        if (!img) {
            return;
        }
        var left = img.offsetLeft - this.thumbsNode.offsetLeft;
        var top = img.offsetTop - this.thumbsNode.offsetTop;
        var offset = this.isHorizontal ? left : top;
        if ((offset >= this.thumbScroller[this._scrollAttr]) && (offset + img[this._sizeAttr] <= this.thumbScroller[this._scrollAttr] + this._scrollerSize)) {
            return;
        }
        if (this.isScrollable) {
            var target = this.isHorizontal ? {x:left, y:0} : {x:0, y:top};
            dojox.fx.smoothScroll({target:target, win:this.thumbScroller, duration:300, easing:dojo.fx.easing.easeOut, onEnd:dojo.hitch(this, "_checkLoad", img, index)}).play(10);
        } else {
            if (this.isHorizontal) {
                this.thumbScroller.scrollLeft = left;
            } else {
                this.thumbScroller.scrollTop = top;
            }
            this._checkLoad(img, index);
        }
    }, markImageLoaded:function (index) {
        var thumbNotifier = dojo.byId("loadingDiv_" + this.id + "_" + index);
        if (thumbNotifier) {
            this._setThumbClass(thumbNotifier, "thumbLoaded");
        }
        this._loadedImages[index] = true;
    }, _setThumbClass:function (thumb, className) {
        if (!this.autoLoad) {
            return;
        }
        dojo.addClass(thumb, className);
    }, _loadNextPage:function () {
        if (this._loadInProgress) {
            return;
        }
        this._loadInProgress = true;
        var start = this.request.start + (this._noImages ? 0 : this.pageSize);
        var pos = start;
        while (pos < this._thumbs.length && this._thumbs[pos]) {
            pos++;
        }
        var store = this.imageStore;
        var complete = function (items, request) {
            if (store != this.imageStore) {
                return;
            }
            if (items && items.length) {
                var itemCounter = 0;
                var loadNext = dojo.hitch(this, function () {
                    if (itemCounter >= items.length) {
                        this._loadInProgress = false;
                        return;
                    }
                    var counter = itemCounter++;
                    this._loadImage(items[counter], pos + counter, loadNext);
                });
                loadNext();
                this._updateNavControls();
            } else {
                this._loadInProgress = false;
            }
        };
        var error = function () {
            this._loadInProgress = false;
            console.log("Error getting items");
        };
        this.request.onComplete = dojo.hitch(this, complete);
        this.request.onError = dojo.hitch(this, error);
        this.request.start = start;
        this._noImages = false;
        this.imageStore.fetch(this.request);
    }, _loadImage:function (data, index, callback) {
        var store = this.imageStore;
        var url = store.getValue(data, this.imageThumbAttr);
        var imgContainer = dojo.create("div", {id:"img_" + this.id + "_" + index, "class":this.cellClass});
        var img = dojo.create("img", {}, imgContainer);
        img._index = index;
        img._data = data;
        this._thumbs[index] = imgContainer;
        var loadingDiv;
        if (this.useLoadNotifier) {
            loadingDiv = dojo.create("div", {id:"loadingDiv_" + this.id + "_" + index}, imgContainer);
            this._setThumbClass(loadingDiv, this._loadedImages[index] ? "thumbLoaded" : "thumbNotifier");
        }
        var size = dojo.marginBox(this.thumbsNode);
        var defaultSize;
        var sizeParam;
        if (this.isHorizontal) {
            defaultSize = this.thumbWidth;
            sizeParam = "w";
        } else {
            defaultSize = this.thumbHeight;
            sizeParam = "h";
        }
        size = size[sizeParam];
        var sl = this.thumbScroller.scrollLeft, st = this.thumbScroller.scrollTop;
        dojo.style(this.thumbsNode, this._sizeProperty, (size + defaultSize + 20) + "px");
        this.thumbScroller.scrollLeft = sl;
        this.thumbScroller.scrollTop = st;
        this.thumbsNode.appendChild(imgContainer);
        dojo.connect(img, "onload", this, dojo.hitch(this, function () {
            if (store != this.imageStore) {
                return false;
            }
            this.resize();
            setTimeout(callback, 0);
            return false;
        }));
        dojo.connect(img, "onclick", this, function (evt) {
            dojo.publish(this.getClickTopicName(), [{index:evt.target._index, data:evt.target._data, url:img.getAttribute("src"), largeUrl:this.imageStore.getValue(data, this.imageLargeAttr), title:this.imageStore.getValue(data, this.titleAttr), link:this.imageStore.getValue(data, this.linkAttr)}]);
            dojo.query("." + this.cellClass, this.thumbsNode).removeClass(this.cellClass + "Selected");
            dojo.addClass(evt.target.parentNode, this.cellClass + "Selected");
            return false;
        });
        dojo.addClass(img, "imageGalleryThumb");
        img.setAttribute("src", url);
        var title = this.imageStore.getValue(data, this.titleAttr);
        if (title) {
            img.setAttribute("title", title);
        }
        this._updateNavControls();
    }, _updateNavControls:function () {
        var change = function (node, add) {
            var fn = add ? "addClass" : "removeClass";
            dojo[fn](node, "enabled");
            dojo[fn](node, "thumbClickable");
        };
        var pos = this.isHorizontal ? "scrollLeft" : "scrollTop";
        var size = this.isHorizontal ? "offsetWidth" : "offsetHeight";
        change(this.navPrev, (this.thumbScroller[pos] > 0));
        var addClass = (this.thumbScroller[pos] + this._scrollerSize < this.thumbsNode[size]);
        change(this.navNext, addClass);
    }});
});

