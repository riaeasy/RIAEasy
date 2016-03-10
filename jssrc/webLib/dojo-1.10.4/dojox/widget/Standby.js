//>>built

define("dojox/widget/Standby", ["dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/array", "dojo/_base/event", "dojo/_base/sniff", "dojo/dom", "dojo/dom-attr", "dojo/dom-construct", "dojo/dom-geometry", "dojo/dom-style", "dojo/window", "dojo/_base/window", "dojo/_base/fx", "dojo/fx", "dijit/_Widget", "dijit/_TemplatedMixin", "dijit/registry"], function (kernel, declare, array, event, has, dom, attr, construct, geometry, domStyle, window, baseWindow, baseFx, fx, _Widget, _TemplatedMixin, registry) {
    kernel.experimental("dojox.widget.Standby");
    return declare("dojox.widget.Standby", [_Widget, _TemplatedMixin], {image:require.toUrl("dojox/widget/Standby/images/loading.gif").toString(), imageText:"Please Wait...", text:"Please wait...", centerIndicator:"image", target:"", color:"#C0C0C0", duration:500, zIndex:"auto", opacity:0.75, templateString:"<div>" + "<div style=\"display: none; opacity: 0; z-index: 9999; " + "position: absolute; cursor:wait;\" dojoAttachPoint=\"_underlayNode\"></div>" + "<img src=\"${image}\" style=\"opacity: 0; display: none; z-index: -10000; " + "position: absolute; top: 0px; left: 0px; cursor:wait;\" " + "dojoAttachPoint=\"_imageNode\">" + "<div style=\"opacity: 0; display: none; z-index: -10000; position: absolute; " + "top: 0px;\" dojoAttachPoint=\"_textNode\"></div>" + "</div>", _underlayNode:null, _imageNode:null, _textNode:null, _centerNode:null, _displayed:false, _resizeCheck:null, _started:false, _parent:null, startup:function (args) {
        if (!this._started) {
            if (typeof this.target === "string") {
                var w = registry.byId(this.target);
                this.target = w ? w.domNode : dom.byId(this.target);
            }
            if (this.text) {
                this._textNode.innerHTML = this.text;
            }
            if (this.centerIndicator === "image") {
                this._centerNode = this._imageNode;
                attr.set(this._imageNode, "src", this.image);
                attr.set(this._imageNode, "alt", this.imageText);
            } else {
                this._centerNode = this._textNode;
            }
            domStyle.set(this._underlayNode, {display:"none", backgroundColor:this.color});
            domStyle.set(this._centerNode, "display", "none");
            this.connect(this._underlayNode, "onclick", "_ignore");
            if (this.domNode.parentNode && this.domNode.parentNode != baseWindow.body()) {
                baseWindow.body().appendChild(this.domNode);
            }
            if (has("ie") == 7) {
                this._ieFixNode = construct.create("div");
                domStyle.set(this._ieFixNode, {opacity:"0", zIndex:"-1000", position:"absolute", top:"-1000px"});
                baseWindow.body().appendChild(this._ieFixNode);
            }
            this.inherited(arguments);
        }
    }, show:function () {
        if (!this._displayed) {
            if (this._anim) {
                this._anim.stop();
                delete this._anim;
            }
            this._displayed = true;
            this._size();
            this._disableOverflow();
            this._fadeIn();
        }
    }, hide:function () {
        if (this._displayed) {
            if (this._anim) {
                this._anim.stop();
                delete this._anim;
            }
            this._size();
            this._fadeOut();
            this._displayed = false;
            if (this._resizeCheck !== null) {
                clearInterval(this._resizeCheck);
                this._resizeCheck = null;
            }
        }
    }, isVisible:function () {
        return this._displayed;
    }, onShow:function () {
    }, onHide:function () {
    }, uninitialize:function () {
        this._displayed = false;
        if (this._resizeCheck) {
            clearInterval(this._resizeCheck);
        }
        domStyle.set(this._centerNode, "display", "none");
        domStyle.set(this._underlayNode, "display", "none");
        if (has("ie") == 7 && this._ieFixNode) {
            baseWindow.body().removeChild(this._ieFixNode);
            delete this._ieFixNode;
        }
        if (this._anim) {
            this._anim.stop();
            delete this._anim;
        }
        this.target = null;
        this._imageNode = null;
        this._textNode = null;
        this._centerNode = null;
        this.inherited(arguments);
    }, _size:function () {
        if (this._displayed) {
            var dir = attr.get(baseWindow.body(), "dir");
            if (dir) {
                dir = dir.toLowerCase();
            }
            var _ie7zoom;
            var scrollers = this._scrollerWidths();
            var target = this.target;
            var curStyle = domStyle.get(this._centerNode, "display");
            domStyle.set(this._centerNode, "display", "block");
            var box = geometry.position(target, true);
            if (target === baseWindow.body() || target === baseWindow.doc) {
                box = window.getBox();
                box.x = box.l;
                box.y = box.t;
            }
            var cntrIndicator = geometry.getMarginBox(this._centerNode);
            domStyle.set(this._centerNode, "display", curStyle);
            if (this._ieFixNode) {
                _ie7zoom = -this._ieFixNode.offsetTop / 1000;
                box.x = Math.floor((box.x + 0.9) / _ie7zoom);
                box.y = Math.floor((box.y + 0.9) / _ie7zoom);
                box.w = Math.floor((box.w + 0.9) / _ie7zoom);
                box.h = Math.floor((box.h + 0.9) / _ie7zoom);
            }
            var zi = domStyle.get(target, "zIndex");
            var ziUl = zi;
            var ziIn = zi;
            if (this.zIndex === "auto") {
                if (zi != "auto") {
                    ziUl = parseInt(ziUl, 10) + 1;
                    ziIn = parseInt(ziIn, 10) + 2;
                } else {
                    var cNode = target;
                    if (cNode && cNode !== baseWindow.body() && cNode !== baseWindow.doc) {
                        cNode = target.parentNode;
                        var oldZi = -100000;
                        while (cNode && cNode !== baseWindow.body()) {
                            zi = domStyle.get(cNode, "zIndex");
                            if (!zi || zi === "auto") {
                                cNode = cNode.parentNode;
                            } else {
                                var newZi = parseInt(zi, 10);
                                if (oldZi < newZi) {
                                    oldZi = newZi;
                                    ziUl = newZi + 1;
                                    ziIn = newZi + 2;
                                }
                                cNode = cNode.parentNode;
                            }
                        }
                    }
                }
            } else {
                ziUl = parseInt(this.zIndex, 10) + 1;
                ziIn = parseInt(this.zIndex, 10) + 2;
            }
            domStyle.set(this._centerNode, "zIndex", ziIn);
            domStyle.set(this._underlayNode, "zIndex", ziUl);
            var pn = target.parentNode;
            if (pn && pn !== baseWindow.body() && target !== baseWindow.body() && target !== baseWindow.doc) {
                var obh = box.h;
                var obw = box.w;
                var pnBox = geometry.position(pn, true);
                if (this._ieFixNode) {
                    _ie7zoom = -this._ieFixNode.offsetTop / 1000;
                    pnBox.x = Math.floor((pnBox.x + 0.9) / _ie7zoom);
                    pnBox.y = Math.floor((pnBox.y + 0.9) / _ie7zoom);
                    pnBox.w = Math.floor((pnBox.w + 0.9) / _ie7zoom);
                    pnBox.h = Math.floor((pnBox.h + 0.9) / _ie7zoom);
                }
                pnBox.w -= pn.scrollHeight > pn.clientHeight && pn.clientHeight > 0 ? scrollers.v : 0;
                pnBox.h -= pn.scrollWidth > pn.clientWidth && pn.clientWidth > 0 ? scrollers.h : 0;
                if (dir === "rtl") {
                    if (has("opera")) {
                        box.x += pn.scrollHeight > pn.clientHeight && pn.clientHeight > 0 ? scrollers.v : 0;
                        pnBox.x += pn.scrollHeight > pn.clientHeight && pn.clientHeight > 0 ? scrollers.v : 0;
                    } else {
                        if (has("ie")) {
                            pnBox.x += pn.scrollHeight > pn.clientHeight && pn.clientHeight > 0 ? scrollers.v : 0;
                        } else {
                            if (has("webkit")) {
                            }
                        }
                    }
                }
                if (pnBox.w < box.w) {
                    box.w = box.w - pnBox.w;
                }
                if (pnBox.h < box.h) {
                    box.h = box.h - pnBox.h;
                }
                var vpTop = pnBox.y;
                var vpBottom = pnBox.y + pnBox.h;
                var bTop = box.y;
                var bBottom = box.y + obh;
                var vpLeft = pnBox.x;
                var vpRight = pnBox.x + pnBox.w;
                var bLeft = box.x;
                var bRight = box.x + obw;
                var delta;
                if (bBottom > vpTop && bTop < vpTop) {
                    box.y = pnBox.y;
                    delta = vpTop - bTop;
                    var visHeight = obh - delta;
                    if (visHeight < pnBox.h) {
                        box.h = visHeight;
                    } else {
                        box.h -= 2 * (pn.scrollWidth > pn.clientWidth && pn.clientWidth > 0 ? scrollers.h : 0);
                    }
                } else {
                    if (bTop < vpBottom && bBottom > vpBottom) {
                        box.h = vpBottom - bTop;
                    } else {
                        if (bBottom <= vpTop || bTop >= vpBottom) {
                            box.h = 0;
                        }
                    }
                }
                if (bRight > vpLeft && bLeft < vpLeft) {
                    box.x = pnBox.x;
                    delta = vpLeft - bLeft;
                    var visWidth = obw - delta;
                    if (visWidth < pnBox.w) {
                        box.w = visWidth;
                    } else {
                        box.w -= 2 * (pn.scrollHeight > pn.clientHeight && pn.clientHeight > 0 ? scrollers.w : 0);
                    }
                } else {
                    if (bLeft < vpRight && bRight > vpRight) {
                        box.w = vpRight - bLeft;
                    } else {
                        if (bRight <= vpLeft || bLeft >= vpRight) {
                            box.w = 0;
                        }
                    }
                }
            }
            if (box.h > 0 && box.w > 0) {
                domStyle.set(this._underlayNode, {display:"block", width:box.w + "px", height:box.h + "px", top:box.y + "px", left:box.x + "px"});
                var styles = ["borderRadius", "borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius"];
                this._cloneStyles(styles);
                if (!has("ie")) {
                    styles = ["MozBorderRadius", "MozBorderRadiusTopleft", "MozBorderRadiusTopright", "MozBorderRadiusBottomleft", "MozBorderRadiusBottomright", "WebkitBorderRadius", "WebkitBorderTopLeftRadius", "WebkitBorderTopRightRadius", "WebkitBorderBottomLeftRadius", "WebkitBorderBottomRightRadius"];
                    this._cloneStyles(styles, this);
                }
                var cntrIndicatorTop = (box.h / 2) - (cntrIndicator.h / 2);
                var cntrIndicatorLeft = (box.w / 2) - (cntrIndicator.w / 2);
                if (box.h >= cntrIndicator.h && box.w >= cntrIndicator.w) {
                    domStyle.set(this._centerNode, {top:(cntrIndicatorTop + box.y) + "px", left:(cntrIndicatorLeft + box.x) + "px", display:"block"});
                } else {
                    domStyle.set(this._centerNode, "display", "none");
                }
            } else {
                domStyle.set(this._underlayNode, "display", "none");
                domStyle.set(this._centerNode, "display", "none");
            }
            if (this._resizeCheck === null) {
                var self = this;
                this._resizeCheck = setInterval(function () {
                    self._size();
                }, 100);
            }
        }
    }, _cloneStyles:function (list) {
        array.forEach(list, function (s) {
            domStyle.set(this._underlayNode, s, domStyle.get(this.target, s));
        }, this);
    }, _fadeIn:function () {
        var self = this;
        var underlayNodeAnim = baseFx.animateProperty({duration:self.duration, node:self._underlayNode, properties:{opacity:{start:0, end:self.opacity}}});
        var imageAnim = baseFx.animateProperty({duration:self.duration, node:self._centerNode, properties:{opacity:{start:0, end:1}}, onEnd:function () {
            self.onShow();
            delete self._anim;
        }});
        this._anim = fx.combine([underlayNodeAnim, imageAnim]);
        this._anim.play();
    }, _fadeOut:function () {
        var self = this;
        var underlayNodeAnim = baseFx.animateProperty({duration:self.duration, node:self._underlayNode, properties:{opacity:{start:self.opacity, end:0}}, onEnd:function () {
            domStyle.set(this.node, {"display":"none", "zIndex":"-1000"});
        }});
        var imageAnim = baseFx.animateProperty({duration:self.duration, node:self._centerNode, properties:{opacity:{start:1, end:0}}, onEnd:function () {
            domStyle.set(this.node, {"display":"none", "zIndex":"-1000"});
            self.onHide();
            self._enableOverflow();
            delete self._anim;
        }});
        this._anim = fx.combine([underlayNodeAnim, imageAnim]);
        this._anim.play();
    }, _ignore:function (e) {
        if (e) {
            event.stop(e);
        }
    }, _scrollerWidths:function () {
        var div = construct.create("div");
        domStyle.set(div, {position:"absolute", opacity:0, overflow:"hidden", width:"50px", height:"50px", zIndex:"-100", top:"-200px", padding:"0px", margin:"0px"});
        var iDiv = construct.create("div");
        domStyle.set(iDiv, {width:"200px", height:"10px"});
        div.appendChild(iDiv);
        baseWindow.body().appendChild(div);
        var b = geometry.getContentBox(div);
        domStyle.set(div, "overflow", "scroll");
        var a = geometry.getContentBox(div);
        baseWindow.body().removeChild(div);
        return {v:b.w - a.w, h:b.h - a.h};
    }, _setTextAttr:function (text) {
        this._textNode.innerHTML = text;
        this.text = text;
    }, _setColorAttr:function (c) {
        domStyle.set(this._underlayNode, "backgroundColor", c);
        this.color = c;
    }, _setImageTextAttr:function (text) {
        attr.set(this._imageNode, "alt", text);
        this.imageText = text;
    }, _setImageAttr:function (url) {
        attr.set(this._imageNode, "src", url);
        this.image = url;
    }, _setCenterIndicatorAttr:function (indicator) {
        this.centerIndicator = indicator;
        if (indicator === "image") {
            this._centerNode = this._imageNode;
            domStyle.set(this._textNode, "display", "none");
        } else {
            this._centerNode = this._textNode;
            domStyle.set(this._imageNode, "display", "none");
        }
    }, _disableOverflow:function () {
        if (this.target === baseWindow.body() || this.target === baseWindow.doc) {
            this._overflowDisabled = true;
            var body = baseWindow.body();
            if (body.style && body.style.overflow) {
                this._oldOverflow = domStyle.get(body, "overflow");
            } else {
                this._oldOverflow = "";
            }
            if (has("ie") && !has("quirks")) {
                if (body.parentNode && body.parentNode.style && body.parentNode.style.overflow) {
                    this._oldBodyParentOverflow = body.parentNode.style.overflow;
                } else {
                    try {
                        this._oldBodyParentOverflow = domStyle.get(body.parentNode, "overflow");
                    }
                    catch (e) {
                        this._oldBodyParentOverflow = "scroll";
                    }
                }
                domStyle.set(body.parentNode, "overflow", "hidden");
            }
            domStyle.set(body, "overflow", "hidden");
        }
    }, _enableOverflow:function () {
        if (this._overflowDisabled) {
            delete this._overflowDisabled;
            var body = baseWindow.body();
            if (has("ie") && !has("quirks")) {
                body.parentNode.style.overflow = this._oldBodyParentOverflow;
                delete this._oldBodyParentOverflow;
            }
            domStyle.set(body, "overflow", this._oldOverflow);
            if (has("webkit")) {
                var div = construct.create("div", {style:{height:"2px"}});
                body.appendChild(div);
                setTimeout(function () {
                    body.removeChild(div);
                }, 0);
            }
            delete this._oldOverflow;
        }
    }});
});

