//>>built

define("dojox/mobile/app/ImageView", ["dijit", "dojo", "dojox", "dojo/require!dojox/mobile/app/_Widget,dojo/fx/easing"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.mobile.app.ImageView");
    dojo.experimental("dojox.mobile.app.ImageView");
    dojo.require("dojox.mobile.app._Widget");
    dojo.require("dojo.fx.easing");
    dojo.declare("dojox.mobile.app.ImageView", dojox.mobile.app._Widget, {zoom:1, zoomCenterX:0, zoomCenterY:0, maxZoom:5, autoZoomLevel:3, disableAutoZoom:false, disableSwipe:false, autoZoomEvent:null, _leftImg:null, _centerImg:null, _rightImg:null, _leftSmallImg:null, _centerSmallImg:null, _rightSmallImg:null, constructor:function () {
        this.panX = 0;
        this.panY = 0;
        this.handleLoad = dojo.hitch(this, this.handleLoad);
        this._updateAnimatedZoom = dojo.hitch(this, this._updateAnimatedZoom);
        this._updateAnimatedPan = dojo.hitch(this, this._updateAnimatedPan);
        this._onAnimPanEnd = dojo.hitch(this, this._onAnimPanEnd);
    }, buildRendering:function () {
        this.inherited(arguments);
        this.canvas = dojo.create("canvas", {}, this.domNode);
        dojo.addClass(this.domNode, "mblImageView");
    }, postCreate:function () {
        this.inherited(arguments);
        this.size = dojo.marginBox(this.domNode);
        dojo.style(this.canvas, {width:this.size.w + "px", height:this.size.h + "px"});
        this.canvas.height = this.size.h;
        this.canvas.width = this.size.w;
        var _this = this;
        this.connect(this.domNode, "onmousedown", function (event) {
            if (_this.isAnimating()) {
                return;
            }
            if (_this.panX) {
                _this.handleDragEnd();
            }
            _this.downX = event.targetTouches ? event.targetTouches[0].clientX : event.clientX;
            _this.downY = event.targetTouches ? event.targetTouches[0].clientY : event.clientY;
        });
        this.connect(this.domNode, "onmousemove", function (event) {
            if (_this.isAnimating()) {
                return;
            }
            if ((!_this.downX && _this.downX !== 0) || (!_this.downY && _this.downY !== 0)) {
                return;
            }
            if ((!_this.disableSwipe && _this.zoom == 1) || (!_this.disableAutoZoom && _this.zoom != 1)) {
                var x = event.targetTouches ? event.targetTouches[0].clientX : event.pageX;
                var y = event.targetTouches ? event.targetTouches[0].clientY : event.pageY;
                _this.panX = x - _this.downX;
                _this.panY = y - _this.downY;
                if (_this.zoom == 1) {
                    if (Math.abs(_this.panX) > 10) {
                        _this.render();
                    }
                } else {
                    if (Math.abs(_this.panX) > 10 || Math.abs(_this.panY) > 10) {
                        _this.render();
                    }
                }
            }
        });
        this.connect(this.domNode, "onmouseout", function (event) {
            if (!_this.isAnimating() && _this.panX) {
                _this.handleDragEnd();
            }
        });
        this.connect(this.domNode, "onmouseover", function (event) {
            _this.downX = _this.downY = null;
        });
        this.connect(this.domNode, "onclick", function (event) {
            if (_this.isAnimating()) {
                return;
            }
            if (_this.downX == null || _this.downY == null) {
                return;
            }
            var x = (event.targetTouches ? event.targetTouches[0].clientX : event.pageX);
            var y = (event.targetTouches ? event.targetTouches[0].clientY : event.pageY);
            if (Math.abs(_this.panX) > 14 || Math.abs(_this.panY) > 14) {
                _this.downX = _this.downY = null;
                _this.handleDragEnd();
                return;
            }
            _this.downX = _this.downY = null;
            if (!_this.disableAutoZoom) {
                if (!_this._centerImg || !_this._centerImg._loaded) {
                    return;
                }
                if (_this.zoom != 1) {
                    _this.set("animatedZoom", 1);
                    return;
                }
                var pos = dojo._abs(_this.domNode);
                var xRatio = _this.size.w / _this._centerImg.width;
                var yRatio = _this.size.h / _this._centerImg.height;
                _this.zoomTo(((x - pos.x) / xRatio) - _this.panX, ((y - pos.y) / yRatio) - _this.panY, _this.autoZoomLevel);
            }
        });
        dojo.connect(this.domNode, "flick", this, "handleFlick");
    }, isAnimating:function () {
        return this._anim && this._anim.status() == "playing";
    }, handleDragEnd:function () {
        this.downX = this.downY = null;
        console.log("handleDragEnd");
        if (this.zoom == 1) {
            if (!this.panX) {
                return;
            }
            var leftLoaded = (this._leftImg && this._leftImg._loaded) || (this._leftSmallImg && this._leftSmallImg._loaded);
            var rightLoaded = (this._rightImg && this._rightImg._loaded) || (this._rightSmallImg && this._rightSmallImg._loaded);
            var doMove = !(Math.abs(this.panX) < this._centerImg._baseWidth / 2) && ((this.panX > 0 && leftLoaded ? 1 : 0) || (this.panX < 0 && rightLoaded ? 1 : 0));
            if (!doMove) {
                this._animPanTo(0, dojo.fx.easing.expoOut, 700);
            } else {
                this.moveTo(this.panX);
            }
        } else {
            if (!this.panX && !this.panY) {
                return;
            }
            this.zoomCenterX -= (this.panX / this.zoom);
            this.zoomCenterY -= (this.panY / this.zoom);
            this.panX = this.panY = 0;
        }
    }, handleFlick:function (event) {
        if (this.zoom == 1 && event.duration < 500) {
            if (event.direction == "ltr") {
                this.moveTo(1);
            } else {
                if (event.direction == "rtl") {
                    this.moveTo(-1);
                }
            }
            this.downX = this.downY = null;
        }
    }, moveTo:function (direction) {
        direction = direction > 0 ? 1 : -1;
        var toImg;
        if (direction < 1) {
            if (this._rightImg && this._rightImg._loaded) {
                toImg = this._rightImg;
            } else {
                if (this._rightSmallImg && this._rightSmallImg._loaded) {
                    toImg = this._rightSmallImg;
                }
            }
        } else {
            if (this._leftImg && this._leftImg._loaded) {
                toImg = this._leftImg;
            } else {
                if (this._leftSmallImg && this._leftSmallImg._loaded) {
                    toImg = this._leftSmallImg;
                }
            }
        }
        this._moveDir = direction;
        var _this = this;
        if (toImg && toImg._loaded) {
            this._animPanTo(this.size.w * direction, null, 500, function () {
                _this.panX = 0;
                _this.panY = 0;
                if (direction < 0) {
                    _this._switchImage("left", "right");
                } else {
                    _this._switchImage("right", "left");
                }
                _this.render();
                _this.onChange(direction * -1);
            });
        } else {
            console.log("moveTo image not loaded!", toImg);
            this._animPanTo(0, dojo.fx.easing.expoOut, 700);
        }
    }, _switchImage:function (toImg, fromImg) {
        var toSmallImgName = "_" + toImg + "SmallImg";
        var toImgName = "_" + toImg + "Img";
        var fromSmallImgName = "_" + fromImg + "SmallImg";
        var fromImgName = "_" + fromImg + "Img";
        this[toImgName] = this._centerImg;
        this[toSmallImgName] = this._centerSmallImg;
        this[toImgName]._type = toImg;
        if (this[toSmallImgName]) {
            this[toSmallImgName]._type = toImg;
        }
        this._centerImg = this[fromImgName];
        this._centerSmallImg = this[fromSmallImgName];
        this._centerImg._type = "center";
        if (this._centerSmallImg) {
            this._centerSmallImg._type = "center";
        }
        this[fromImgName] = this[fromSmallImgName] = null;
    }, _animPanTo:function (to, easing, duration, callback) {
        this._animCallback = callback;
        this._anim = new dojo.Animation({curve:[this.panX, to], onAnimate:this._updateAnimatedPan, duration:duration || 500, easing:easing, onEnd:this._onAnimPanEnd});
        this._anim.play();
        return this._anim;
    }, onChange:function (direction) {
    }, _updateAnimatedPan:function (amount) {
        this.panX = amount;
        this.render();
    }, _onAnimPanEnd:function () {
        this.panX = this.panY = 0;
        if (this._animCallback) {
            this._animCallback();
        }
    }, zoomTo:function (centerX, centerY, zoom) {
        this.set("zoomCenterX", centerX);
        this.set("zoomCenterY", centerY);
        this.set("animatedZoom", zoom);
    }, render:function () {
        var cxt = this.canvas.getContext("2d");
        cxt.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this._renderImg(this._centerSmallImg, this._centerImg, this.zoom == 1 ? (this.panX < 0 ? 1 : this.panX > 0 ? -1 : 0) : 0);
        if (this.zoom == 1 && this.panX != 0) {
            if (this.panX > 0) {
                this._renderImg(this._leftSmallImg, this._leftImg, 1);
            } else {
                this._renderImg(this._rightSmallImg, this._rightImg, -1);
            }
        }
    }, _renderImg:function (smallImg, largeImg, panDir) {
        var img = (largeImg && largeImg._loaded) ? largeImg : smallImg;
        if (!img || !img._loaded) {
            return;
        }
        var cxt = this.canvas.getContext("2d");
        var baseWidth = img._baseWidth;
        var baseHeight = img._baseHeight;
        var desiredWidth = baseWidth * this.zoom;
        var desiredHeight = baseHeight * this.zoom;
        var destWidth = Math.min(this.size.w, desiredWidth);
        var destHeight = Math.min(this.size.h, desiredHeight);
        var sourceWidth = this.dispWidth = img.width * (destWidth / desiredWidth);
        var sourceHeight = this.dispHeight = img.height * (destHeight / desiredHeight);
        var zoomCenterX = this.zoomCenterX - (this.panX / this.zoom);
        var zoomCenterY = this.zoomCenterY - (this.panY / this.zoom);
        var centerX = Math.floor(Math.max(sourceWidth / 2, Math.min(img.width - sourceWidth / 2, zoomCenterX)));
        var centerY = Math.floor(Math.max(sourceHeight / 2, Math.min(img.height - sourceHeight / 2, zoomCenterY)));
        var sourceX = Math.max(0, Math.round((img.width - sourceWidth) / 2 + (centerX - img._centerX)));
        var sourceY = Math.max(0, Math.round((img.height - sourceHeight) / 2 + (centerY - img._centerY)));
        var destX = Math.round(Math.max(0, this.canvas.width - destWidth) / 2);
        var destY = Math.round(Math.max(0, this.canvas.height - destHeight) / 2);
        var oldDestWidth = destWidth;
        var oldSourceWidth = sourceWidth;
        if (this.zoom == 1 && panDir && this.panX) {
            if (this.panX < 0) {
                if (panDir > 0) {
                    destWidth -= Math.abs(this.panX);
                    destX = 0;
                } else {
                    if (panDir < 0) {
                        destWidth = Math.max(1, Math.abs(this.panX) - 5);
                        destX = this.size.w - destWidth;
                    }
                }
            } else {
                if (panDir > 0) {
                    destWidth = Math.max(1, Math.abs(this.panX) - 5);
                    destX = 0;
                } else {
                    if (panDir < 0) {
                        destWidth -= Math.abs(this.panX);
                        destX = this.size.w - destWidth;
                    }
                }
            }
            sourceWidth = Math.max(1, Math.floor(sourceWidth * (destWidth / oldDestWidth)));
            if (panDir > 0) {
                sourceX = (sourceX + oldSourceWidth) - (sourceWidth);
            }
            sourceX = Math.floor(sourceX);
        }
        try {
            cxt.drawImage(img, Math.max(0, sourceX), sourceY, Math.min(oldSourceWidth, sourceWidth), sourceHeight, destX, destY, Math.min(oldDestWidth, destWidth), destHeight);
        }
        catch (e) {
            console.log("Caught Error", e, "type=", img._type, "oldDestWidth = ", oldDestWidth, "destWidth", destWidth, "destX", destX, "oldSourceWidth=", oldSourceWidth, "sourceWidth=", sourceWidth, "sourceX = " + sourceX);
        }
    }, _setZoomAttr:function (amount) {
        this.zoom = Math.min(this.maxZoom, Math.max(1, amount));
        if (this.zoom == 1 && this._centerImg && this._centerImg._loaded) {
            if (!this.isAnimating()) {
                this.zoomCenterX = this._centerImg.width / 2;
                this.zoomCenterY = this._centerImg.height / 2;
            }
            this.panX = this.panY = 0;
        }
        this.render();
    }, _setZoomCenterXAttr:function (value) {
        if (value != this.zoomCenterX) {
            if (this._centerImg && this._centerImg._loaded) {
                value = Math.min(this._centerImg.width, value);
            }
            this.zoomCenterX = Math.max(0, Math.round(value));
        }
    }, _setZoomCenterYAttr:function (value) {
        if (value != this.zoomCenterY) {
            if (this._centerImg && this._centerImg._loaded) {
                value = Math.min(this._centerImg.height, value);
            }
            this.zoomCenterY = Math.max(0, Math.round(value));
        }
    }, _setZoomCenterAttr:function (value) {
        if (value.x != this.zoomCenterX || value.y != this.zoomCenterY) {
            this.set("zoomCenterX", value.x);
            this.set("zoomCenterY", value.y);
            this.render();
        }
    }, _setAnimatedZoomAttr:function (amount) {
        if (this._anim && this._anim.status() == "playing") {
            return;
        }
        this._anim = new dojo.Animation({curve:[this.zoom, amount], onAnimate:this._updateAnimatedZoom, onEnd:this._onAnimEnd});
        this._anim.play();
    }, _updateAnimatedZoom:function (amount) {
        this._setZoomAttr(amount);
    }, _setCenterUrlAttr:function (urlOrObj) {
        this._setImage("center", urlOrObj);
    }, _setLeftUrlAttr:function (urlOrObj) {
        this._setImage("left", urlOrObj);
    }, _setRightUrlAttr:function (urlOrObj) {
        this._setImage("right", urlOrObj);
    }, _setImage:function (name, urlOrObj) {
        var smallUrl = null;
        var largeUrl = null;
        if (dojo.isString(urlOrObj)) {
            largeUrl = urlOrObj;
        } else {
            largeUrl = urlOrObj.large;
            smallUrl = urlOrObj.small;
        }
        if (this["_" + name + "Img"] && this["_" + name + "Img"]._src == largeUrl) {
            return;
        }
        var largeImg = this["_" + name + "Img"] = new Image();
        largeImg._type = name;
        largeImg._loaded = false;
        largeImg._src = largeUrl;
        largeImg._conn = dojo.connect(largeImg, "onload", this.handleLoad);
        if (smallUrl) {
            var smallImg = this["_" + name + "SmallImg"] = new Image();
            smallImg._type = name;
            smallImg._loaded = false;
            smallImg._conn = dojo.connect(smallImg, "onload", this.handleLoad);
            smallImg._isSmall = true;
            smallImg._src = smallUrl;
            smallImg.src = smallUrl;
        }
        largeImg.src = largeUrl;
    }, handleLoad:function (evt) {
        var img = evt.target;
        img._loaded = true;
        dojo.disconnect(img._conn);
        var type = img._type;
        switch (type) {
          case "center":
            this.zoomCenterX = img.width / 2;
            this.zoomCenterY = img.height / 2;
            break;
        }
        var height = img.height;
        var width = img.width;
        if (width / this.size.w < height / this.size.h) {
            img._baseHeight = this.canvas.height;
            img._baseWidth = width / (height / this.size.h);
        } else {
            img._baseWidth = this.canvas.width;
            img._baseHeight = height / (width / this.size.w);
        }
        img._centerX = width / 2;
        img._centerY = height / 2;
        this.render();
        this.onLoad(img._type, img._src, img._isSmall);
    }, onLoad:function (type, url, isSmall) {
    }});
});

