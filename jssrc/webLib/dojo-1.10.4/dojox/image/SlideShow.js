//>>built

define("dojox/image/SlideShow", ["dijit", "dojo", "dojox", "dojo/require!dojo/string,dojo/fx,dijit/_Widget,dijit/_Templated"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.image.SlideShow");
    dojo.require("dojo.string");
    dojo.require("dojo.fx");
    dojo.require("dijit._Widget");
    dojo.require("dijit._Templated");
    dojo.declare("dojox.image.SlideShow", [dijit._Widget, dijit._Templated], {imageHeight:375, imageWidth:500, title:"", titleTemplate:"${title} <span class=\"slideShowCounterText\">(${current} of ${total})</span>", noLink:false, loop:true, hasNav:true, images:[], pageSize:20, autoLoad:true, autoStart:false, fixedHeight:false, imageStore:null, linkAttr:"link", imageLargeAttr:"imageUrl", titleAttr:"title", slideshowInterval:3, templateString:dojo.cache("dojox.image", "resources/SlideShow.html", "<div dojoAttachPoint=\"outerNode\" class=\"slideShowWrapper\">\n\t<div style=\"position:relative;\" dojoAttachPoint=\"innerWrapper\">\n\t\t<div class=\"slideShowNav\" dojoAttachEvent=\"onclick: _handleClick\">\n\t\t\t<div class=\"dijitInline slideShowTitle\" dojoAttachPoint=\"titleNode\">${title}</div>\n\t\t</div>\n\t\t<div dojoAttachPoint=\"navNode\" class=\"slideShowCtrl\" dojoAttachEvent=\"onclick: _handleClick\">\n\t\t\t<span dojoAttachPoint=\"navPrev\" class=\"slideShowCtrlPrev\"></span>\n\t\t\t<span dojoAttachPoint=\"navPlay\" class=\"slideShowCtrlPlay\"></span>\n\t\t\t<span dojoAttachPoint=\"navNext\" class=\"slideShowCtrlNext\"></span>\n\t\t</div>\n\t\t<div dojoAttachPoint=\"largeNode\" class=\"slideShowImageWrapper\"></div>\t\t\n\t\t<div dojoAttachPoint=\"hiddenNode\" class=\"slideShowHidden\"></div>\n\t</div>\n</div>"), _imageCounter:0, _tmpImage:null, _request:null, postCreate:function () {
        this.inherited(arguments);
        var img = document.createElement("img");
        img.setAttribute("width", this.imageWidth);
        img.setAttribute("height", this.imageHeight);
        if (this.hasNav) {
            dojo.connect(this.outerNode, "onmouseover", this, function (evt) {
                try {
                    this._showNav();
                }
                catch (e) {
                }
            });
            dojo.connect(this.outerNode, "onmouseout", this, function (evt) {
                try {
                    this._hideNav(evt);
                }
                catch (e) {
                }
            });
        }
        this.outerNode.style.width = this.imageWidth + "px";
        img.setAttribute("src", this._blankGif);
        var _this = this;
        this.largeNode.appendChild(img);
        this._tmpImage = this._currentImage = img;
        this._fitSize(true);
        this._loadImage(0, dojo.hitch(this, "showImage", 0));
        this._calcNavDimensions();
        dojo.style(this.navNode, "opacity", 0);
    }, setDataStore:function (dataStore, request, paramNames) {
        this.reset();
        var _this = this;
        this._request = {query:{}, start:request.start || 0, count:request.count || this.pageSize, onBegin:function (count, request) {
            _this.maxPhotos = count;
        }};
        if (request.query) {
            dojo.mixin(this._request.query, request.query);
        }
        if (paramNames) {
            dojo.forEach(["imageLargeAttr", "linkAttr", "titleAttr"], function (attrName) {
                if (paramNames[attrName]) {
                    this[attrName] = paramNames[attrName];
                }
            }, this);
        }
        var _complete = function (items) {
            _this.maxPhotos = items.length;
            _this._request.onComplete = null;
            if (_this.autoStart) {
                _this.imageIndex = -1;
                _this.toggleSlideShow();
            } else {
                _this.showImage(0);
            }
        };
        this.imageStore = dataStore;
        this._request.onComplete = _complete;
        this._request.start = 0;
        this.imageStore.fetch(this._request);
    }, reset:function () {
        dojo.query("> *", this.largeNode).orphan();
        this.largeNode.appendChild(this._tmpImage);
        dojo.query("> *", this.hiddenNode).orphan();
        dojo.forEach(this.images, function (img) {
            if (img && img.parentNode) {
                img.parentNode.removeChild(img);
            }
        });
        this.images = [];
        this.isInitialized = false;
        this._imageCounter = 0;
    }, isImageLoaded:function (index) {
        return this.images && this.images.length > index && this.images[index];
    }, moveImageLoadingPointer:function (index) {
        this._imageCounter = index;
    }, destroy:function () {
        if (this._slideId) {
            this._stop();
        }
        this.inherited(arguments);
    }, showNextImage:function (inTimer, forceLoop) {
        if (inTimer && this._timerCancelled) {
            return false;
        }
        if (this.imageIndex + 1 >= this.maxPhotos) {
            if (inTimer && (this.loop || forceLoop)) {
                this.imageIndex = -1;
            } else {
                if (this._slideId) {
                    this._stop();
                }
                return false;
            }
        }
        this.showImage(this.imageIndex + 1, dojo.hitch(this, function () {
            if (inTimer) {
                this._startTimer();
            }
        }));
        return true;
    }, toggleSlideShow:function () {
        if (this._slideId) {
            this._stop();
        } else {
            dojo.toggleClass(this.domNode, "slideShowPaused");
            this._timerCancelled = false;
            var idx = this.imageIndex;
            if (idx < 0 || (this.images[idx] && this.images[idx]._img.complete)) {
                var success = this.showNextImage(true, true);
                if (!success) {
                    this._stop();
                }
            } else {
                var handle = dojo.subscribe(this.getShowTopicName(), dojo.hitch(this, function (info) {
                    setTimeout(dojo.hitch(this, function () {
                        if (info.index == idx) {
                            var success = this.showNextImage(true, true);
                            if (!success) {
                                this._stop();
                            }
                            dojo.unsubscribe(handle);
                        }
                    }), this.slideshowInterval * 1000);
                }));
                dojo.publish(this.getShowTopicName(), [{index:idx, title:"", url:""}]);
            }
        }
    }, getShowTopicName:function () {
        return (this.widgetId || this.id) + "/imageShow";
    }, getLoadTopicName:function () {
        return (this.widgetId ? this.widgetId : this.id) + "/imageLoad";
    }, showImage:function (index, callback) {
        if (!callback && this._slideId) {
            this.toggleSlideShow();
        }
        var _this = this;
        var current = this.largeNode.getElementsByTagName("div");
        this.imageIndex = index;
        var showOrLoadIt = function () {
            if (_this.images[index]) {
                while (_this.largeNode.firstChild) {
                    _this.largeNode.removeChild(_this.largeNode.firstChild);
                }
                dojo.style(_this.images[index], "opacity", 0);
                _this.largeNode.appendChild(_this.images[index]);
                _this._currentImage = _this.images[index]._img;
                _this._fitSize();
                var onEnd = function (a, b, c) {
                    var img = _this.images[index].firstChild;
                    if (img.tagName.toLowerCase() != "img") {
                        img = img.firstChild;
                    }
                    var title = img.getAttribute("title") || "";
                    if (_this._navShowing) {
                        _this._showNav(true);
                    }
                    dojo.publish(_this.getShowTopicName(), [{index:index, title:title, url:img.getAttribute("src")}]);
                    if (callback) {
                        callback(a, b, c);
                    }
                    _this._setTitle(title);
                };
                dojo.fadeIn({node:_this.images[index], duration:300, onEnd:onEnd}).play();
            } else {
                _this._loadImage(index, function () {
                    _this.showImage(index, callback);
                });
            }
        };
        if (current && current.length > 0) {
            dojo.fadeOut({node:current[0], duration:300, onEnd:function () {
                _this.hiddenNode.appendChild(current[0]);
                showOrLoadIt();
            }}).play();
        } else {
            showOrLoadIt();
        }
    }, _fitSize:function (force) {
        if (!this.fixedHeight || force) {
            var height = (this._currentImage.height + (this.hasNav ? 20 : 0));
            dojo.style(this.innerWrapper, "height", height + "px");
            return;
        }
        dojo.style(this.largeNode, "paddingTop", this._getTopPadding() + "px");
    }, _getTopPadding:function () {
        if (!this.fixedHeight) {
            return 0;
        }
        return (this.imageHeight - this._currentImage.height) / 2;
    }, _loadNextImage:function () {
        if (!this.autoLoad) {
            return;
        }
        while (this.images.length >= this._imageCounter && this.images[this._imageCounter]) {
            this._imageCounter++;
        }
        this._loadImage(this._imageCounter);
    }, _loadImage:function (index, callbackFn) {
        if (this.images[index] || !this._request) {
            return;
        }
        var pageStart = index - (index % (this._request.count || this.pageSize));
        this._request.start = pageStart;
        this._request.onComplete = function (items) {
            var diff = index - pageStart;
            if (items && items.length > diff) {
                loadIt(items[diff]);
            } else {
            }
        };
        var _this = this;
        var store = this.imageStore;
        var loadIt = function (item) {
            var url = _this.imageStore.getValue(item, _this.imageLargeAttr);
            var img = new Image();
            var div = dojo.create("div", {id:_this.id + "_imageDiv" + index});
            div._img = img;
            var link = _this.imageStore.getValue(item, _this.linkAttr);
            if (!link || _this.noLink) {
                div.appendChild(img);
            } else {
                var a = dojo.create("a", {"href":link, "target":"_blank"}, div);
                a.appendChild(img);
            }
            dojo.connect(img, "onload", function () {
                if (store != _this.imageStore) {
                    return;
                }
                _this._fitImage(img);
                dojo.attr(div, {"width":_this.imageWidth, "height":_this.imageHeight});
                dojo.publish(_this.getLoadTopicName(), [index]);
                setTimeout(function () {
                    _this._loadNextImage();
                }, 1);
                if (callbackFn) {
                    callbackFn();
                }
            });
            _this.hiddenNode.appendChild(div);
            var titleDiv = dojo.create("div", {className:"slideShowTitle"}, div);
            _this.images[index] = div;
            dojo.attr(img, "src", url);
            var title = _this.imageStore.getValue(item, _this.titleAttr);
            if (title) {
                dojo.attr(img, "title", title);
            }
        };
        this.imageStore.fetch(this._request);
    }, _stop:function () {
        if (this._slideId) {
            clearTimeout(this._slideId);
        }
        this._slideId = null;
        this._timerCancelled = true;
        dojo.removeClass(this.domNode, "slideShowPaused");
    }, _prev:function () {
        if (this.imageIndex < 1) {
            return;
        }
        this.showImage(this.imageIndex - 1);
    }, _next:function () {
        this.showNextImage();
    }, _startTimer:function () {
        var id = this.id;
        this._slideId = setTimeout(function () {
            dijit.byId(id).showNextImage(true);
        }, this.slideshowInterval * 1000);
    }, _calcNavDimensions:function () {
        dojo.style(this.navNode, "position", "absolute");
        dojo.style(this.navNode, "top", "-10000px");
        dojo.style(this.navPlay, "marginLeft", 0);
        this.navPlay._size = dojo.marginBox(this.navPlay);
        this.navPrev._size = dojo.marginBox(this.navPrev);
        this.navNext._size = dojo.marginBox(this.navNext);
        dojo.style(this.navNode, {"position":"", top:""});
    }, _setTitle:function (title) {
        this.titleNode.innerHTML = dojo.string.substitute(this.titleTemplate, {title:title, current:1 + this.imageIndex, total:this.maxPhotos || ""});
    }, _fitImage:function (img) {
        var width = img.width;
        var height = img.height;
        if (width > this.imageWidth) {
            height = Math.floor(height * (this.imageWidth / width));
            img.height = height;
            img.width = width = this.imageWidth;
        }
        if (height > this.imageHeight) {
            width = Math.floor(width * (this.imageHeight / height));
            img.height = this.imageHeight;
            img.width = width;
        }
    }, _handleClick:function (e) {
        switch (e.target) {
          case this.navNext:
            this._next();
            break;
          case this.navPrev:
            this._prev();
            break;
          case this.navPlay:
            this.toggleSlideShow();
            break;
        }
    }, _showNav:function (force) {
        if (this._navShowing && !force) {
            return;
        }
        this._calcNavDimensions();
        dojo.style(this.navNode, "marginTop", "0px");
        var navPlayPos = dojo.style(this.navNode, "width") / 2 - this.navPlay._size.w / 2 - this.navPrev._size.w;
        console.log("navPlayPos = " + dojo.style(this.navNode, "width") / 2 + " - " + this.navPlay._size.w + "/2 - " + this.navPrev._size.w);
        dojo.style(this.navPlay, "marginLeft", navPlayPos + "px");
        var wrapperSize = dojo.marginBox(this.outerNode);
        var margin = this._currentImage.height - this.navPlay._size.h - 10 + this._getTopPadding();
        if (margin > this._currentImage.height) {
            margin += 10;
        }
        dojo[this.imageIndex < 1 ? "addClass" : "removeClass"](this.navPrev, "slideShowCtrlHide");
        dojo[this.imageIndex + 1 >= this.maxPhotos ? "addClass" : "removeClass"](this.navNext, "slideShowCtrlHide");
        var _this = this;
        if (this._navAnim) {
            this._navAnim.stop();
        }
        if (this._navShowing) {
            return;
        }
        this._navAnim = dojo.fadeIn({node:this.navNode, duration:300, onEnd:function () {
            _this._navAnim = null;
        }});
        this._navAnim.play();
        this._navShowing = true;
    }, _hideNav:function (e) {
        if (!e || !this._overElement(this.outerNode, e)) {
            var _this = this;
            if (this._navAnim) {
                this._navAnim.stop();
            }
            this._navAnim = dojo.fadeOut({node:this.navNode, duration:300, onEnd:function () {
                _this._navAnim = null;
            }});
            this._navAnim.play();
            this._navShowing = false;
        }
    }, _overElement:function (element, e) {
        if (typeof (dojo) == "undefined") {
            return false;
        }
        element = dojo.byId(element);
        var m = {x:e.pageX, y:e.pageY};
        var bb = dojo.position(element, true);
        return (m.x >= bb.x && m.x <= (bb.x + bb.w) && m.y >= bb.y && m.y <= (top + bb.h));
    }});
});

