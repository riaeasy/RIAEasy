//>>built

define("dojox/mobile/scrollable", ["dojo/_base/kernel", "dojo/_base/connect", "dojo/_base/event", "dojo/_base/lang", "dojo/_base/window", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-style", "dojo/dom-geometry", "dojo/touch", "dijit/registry", "dijit/form/_TextBoxMixin", "./sniff", "./_css3", "./_maskUtils", "dojo/_base/declare", "require"], function (dojo, connect, event, lang, win, domClass, domConstruct, domStyle, domGeom, touch, registry, TextBoxMixin, has, css3, maskUtils, declare, BidiScrollable) {
    var dm = lang.getObject("dojox.mobile", true);
    has.add("translate3d", function () {
        if (has("css3-animations")) {
            var elem = win.doc.createElement("div");
            elem.style[css3.name("transform")] = "translate3d(0px,1px,0px)";
            win.doc.documentElement.appendChild(elem);
            var v = win.doc.defaultView.getComputedStyle(elem, "")[css3.name("transform", true)];
            var hasTranslate3d = v && v.indexOf("matrix") === 0;
            win.doc.documentElement.removeChild(elem);
            return hasTranslate3d;
        }
    });
    var Scrollable = function () {
    };
    lang.extend(Scrollable, {fixedHeaderHeight:0, fixedFooterHeight:0, isLocalFooter:false, scrollBar:true, scrollDir:"v", weight:0.6, fadeScrollBar:true, disableFlashScrollBar:false, threshold:4, constraint:true, touchNode:null, propagatable:true, dirLock:false, height:"", scrollType:0, _parentPadBorderExtentsBottom:0, _moved:false, init:function (params) {
        if (params) {
            for (var p in params) {
                if (params.hasOwnProperty(p)) {
                    this[p] = ((p == "domNode" || p == "containerNode") && typeof params[p] == "string") ? win.doc.getElementById(params[p]) : params[p];
                }
            }
        }
        if (typeof this.domNode.style.msTouchAction != "undefined") {
            this.domNode.style.msTouchAction = "none";
        }
        this.touchNode = this.touchNode || this.containerNode;
        this._v = (this.scrollDir.indexOf("v") != -1);
        this._h = (this.scrollDir.indexOf("h") != -1);
        this._f = (this.scrollDir == "f");
        this._ch = [];
        this._ch.push(connect.connect(this.touchNode, touch.press, this, "onTouchStart"));
        if (has("css3-animations")) {
            this._useTopLeft = this.scrollType ? this.scrollType === 2 : false;
            if (!this._useTopLeft) {
                this._useTransformTransition = this.scrollType ? this.scrollType === 3 : has("ios") >= 6 || has("android") || has("bb");
            }
            if (!this._useTopLeft) {
                if (this._useTransformTransition) {
                    this._ch.push(connect.connect(this.containerNode, css3.name("transitionEnd"), this, "onFlickAnimationEnd"));
                } else {
                    this._ch.push(connect.connect(this.containerNode, css3.name("animationEnd"), this, "onFlickAnimationEnd"));
                    this._ch.push(connect.connect(this.containerNode, css3.name("animationStart"), this, "onFlickAnimationStart"));
                    for (var i = 0; i < 3; i++) {
                        this.setKeyframes(null, null, i);
                    }
                }
                if (has("translate3d")) {
                    domStyle.set(this.containerNode, css3.name("transform"), "translate3d(0,0,0)");
                }
            } else {
                this._ch.push(connect.connect(this.containerNode, css3.name("transitionEnd"), this, "onFlickAnimationEnd"));
            }
        }
        this._speed = {x:0, y:0};
        this._appFooterHeight = 0;
        if (this.isTopLevel() && !this.noResize) {
            this.resize();
        }
        var _this = this;
        setTimeout(function () {
            _this.flashScrollBar();
        }, 600);
        if (win.global.addEventListener) {
            this._onScroll = function (e) {
                if (!_this.domNode || _this.domNode.style.display === "none") {
                    return;
                }
                var scrollTop = _this.domNode.scrollTop;
                var scrollLeft = _this.domNode.scrollLeft;
                var pos;
                if (scrollTop > 0 || scrollLeft > 0) {
                    pos = _this.getPos();
                    _this.domNode.scrollLeft = 0;
                    _this.domNode.scrollTop = 0;
                    _this.scrollTo({x:pos.x - scrollLeft, y:pos.y - scrollTop});
                }
            };
            win.global.addEventListener("scroll", this._onScroll, true);
        }
        if (!this.disableTouchScroll && this.domNode.addEventListener) {
            this._onFocusScroll = function (e) {
                if (!_this.domNode || _this.domNode.style.display === "none") {
                    return;
                }
                var node = win.doc.activeElement;
                var nodeRect, scrollableRect;
                if (node) {
                    nodeRect = node.getBoundingClientRect();
                    scrollableRect = _this.domNode.getBoundingClientRect();
                    if (nodeRect.height < _this.getDim().d.h) {
                        if (nodeRect.top < (scrollableRect.top + _this.fixedHeaderHeight)) {
                            _this.scrollIntoView(node, true);
                        } else {
                            if ((nodeRect.top + nodeRect.height) > (scrollableRect.top + scrollableRect.height - _this.fixedFooterHeight)) {
                                _this.scrollIntoView(node, false);
                            }
                        }
                    }
                }
            };
            this.domNode.addEventListener("focus", this._onFocusScroll, true);
        }
    }, isTopLevel:function () {
        return true;
    }, cleanup:function () {
        if (this._ch) {
            for (var i = 0; i < this._ch.length; i++) {
                connect.disconnect(this._ch[i]);
            }
            this._ch = null;
        }
        if (this._onScroll && win.global.removeEventListener) {
            win.global.removeEventListener("scroll", this._onScroll, true);
            this._onScroll = null;
        }
        if (this._onFocusScroll && this.domNode.removeEventListener) {
            this.domNode.removeEventListener("focus", this._onFocusScroll, true);
            this._onFocusScroll = null;
        }
    }, findDisp:function (node) {
        if (!node.parentNode) {
            return null;
        }
        if (node.nodeType === 1 && domClass.contains(node, "mblSwapView") && node.style.display !== "none") {
            return node;
        }
        var nodes = node.parentNode.childNodes;
        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            if (n.nodeType === 1 && domClass.contains(n, "mblView") && n.style.display !== "none") {
                return n;
            }
        }
        return node;
    }, getScreenSize:function () {
        return {h:win.global.innerHeight || win.doc.documentElement.clientHeight || win.doc.documentElement.offsetHeight, w:win.global.innerWidth || win.doc.documentElement.clientWidth || win.doc.documentElement.offsetWidth};
    }, resize:function (e) {
        this._appFooterHeight = (this._fixedAppFooter) ? this._fixedAppFooter.offsetHeight : 0;
        if (this.isLocalHeader) {
            this.containerNode.style.marginTop = this.fixedHeaderHeight + "px";
        }
        var top = 0;
        for (var n = this.domNode; n && n.tagName != "BODY"; n = n.offsetParent) {
            n = this.findDisp(n);
            if (!n) {
                break;
            }
            top += n.offsetTop + domGeom.getBorderExtents(n).h;
        }
        var h, screenHeight = this.getScreenSize().h, dh = screenHeight - top - this._appFooterHeight;
        if (this.height === "inherit") {
            if (this.domNode.offsetParent) {
                h = domGeom.getContentBox(this.domNode.offsetParent).h - domGeom.getBorderExtents(this.domNode).h + "px";
            }
        } else {
            if (this.height === "auto") {
                var parent = this.domNode.offsetParent;
                if (parent) {
                    this.domNode.style.height = "0px";
                    var parentRect = parent.getBoundingClientRect(), scrollableRect = this.domNode.getBoundingClientRect(), contentBottom = parentRect.bottom - this._appFooterHeight - this._parentPadBorderExtentsBottom;
                    if (scrollableRect.bottom >= contentBottom) {
                        dh = screenHeight - (scrollableRect.top - parentRect.top) - this._appFooterHeight - this._parentPadBorderExtentsBottom;
                    } else {
                        dh = contentBottom - scrollableRect.bottom;
                    }
                }
                var contentHeight = Math.max(this.domNode.scrollHeight, this.containerNode.scrollHeight);
                h = (contentHeight ? Math.min(contentHeight, dh) : dh) + "px";
            } else {
                if (this.height) {
                    h = this.height;
                }
            }
        }
        if (!h) {
            h = dh + "px";
        }
        if (h.charAt(0) !== "-" && h !== "default") {
            this.domNode.style.height = h;
        }
        if (!this._conn) {
            this.onTouchEnd();
        }
    }, onFlickAnimationStart:function (e) {
        if (e) {
            event.stop(e);
        }
    }, onFlickAnimationEnd:function (e) {
        if (has("ios")) {
            this._keepInputCaretInActiveElement();
        }
        if (e) {
            var an = e.animationName;
            if (an && an.indexOf("scrollableViewScroll2") === -1) {
                if (an.indexOf("scrollableViewScroll0") !== -1) {
                    if (this._scrollBarNodeV) {
                        domClass.remove(this._scrollBarNodeV, "mblScrollableScrollTo0");
                    }
                } else {
                    if (an.indexOf("scrollableViewScroll1") !== -1) {
                        if (this._scrollBarNodeH) {
                            domClass.remove(this._scrollBarNodeH, "mblScrollableScrollTo1");
                        }
                    } else {
                        if (this._scrollBarNodeV) {
                            this._scrollBarNodeV.className = "";
                        }
                        if (this._scrollBarNodeH) {
                            this._scrollBarNodeH.className = "";
                        }
                    }
                }
                return;
            }
            if (this._useTransformTransition || this._useTopLeft) {
                var n = e.target;
                if (n === this._scrollBarV || n === this._scrollBarH) {
                    var cls = "mblScrollableScrollTo" + (n === this._scrollBarV ? "0" : "1");
                    if (domClass.contains(n, cls)) {
                        domClass.remove(n, cls);
                    } else {
                        n.className = "";
                    }
                    return;
                }
            }
            if (e.srcElement) {
                event.stop(e);
            }
        }
        this.stopAnimation();
        if (this._bounce) {
            var _this = this;
            var bounce = _this._bounce;
            setTimeout(function () {
                _this.slideTo(bounce, 0.3, "ease-out");
            }, 0);
            _this._bounce = undefined;
        } else {
            this.hideScrollBar();
            this.removeCover();
        }
    }, isFormElement:function (node) {
        if (node && node.nodeType !== 1) {
            node = node.parentNode;
        }
        if (!node || node.nodeType !== 1) {
            return false;
        }
        var t = node.tagName;
        return (t === "SELECT" || t === "INPUT" || t === "TEXTAREA" || t === "BUTTON");
    }, onTouchStart:function (e) {
        if (this.disableTouchScroll) {
            return;
        }
        if (this._conn && (new Date()).getTime() - this.startTime < 500) {
            return;
        }
        if (!this._conn) {
            this._conn = [];
            this._conn.push(connect.connect(win.doc, touch.move, this, "onTouchMove"));
            this._conn.push(connect.connect(win.doc, touch.release, this, "onTouchEnd"));
        }
        this._aborted = false;
        if (domClass.contains(this.containerNode, "mblScrollableScrollTo2")) {
            this.abort();
        } else {
            if (this._scrollBarNodeV) {
                this._scrollBarNodeV.className = "";
            }
            if (this._scrollBarNodeH) {
                this._scrollBarNodeH.className = "";
            }
        }
        this.touchStartX = e.touches ? e.touches[0].pageX : e.clientX;
        this.touchStartY = e.touches ? e.touches[0].pageY : e.clientY;
        this.startTime = (new Date()).getTime();
        this.startPos = this.getPos();
        this._dim = this.getDim();
        this._time = [0];
        this._posX = [this.touchStartX];
        this._posY = [this.touchStartY];
        this._locked = false;
        this._moved = false;
        this._preventDefaultInNextTouchMove = true;
        if (!this.isFormElement(e.target)) {
            this.propagatable ? e.preventDefault() : event.stop(e);
            this._preventDefaultInNextTouchMove = false;
        }
    }, onTouchMove:function (e) {
        if (this._locked) {
            return;
        }
        if (this._preventDefaultInNextTouchMove) {
            this._preventDefaultInNextTouchMove = false;
            var enclosingWidget = registry.getEnclosingWidget(((e.targetTouches && e.targetTouches.length === 1) ? e.targetTouches[0] : e).target);
            if (enclosingWidget && enclosingWidget.isInstanceOf(TextBoxMixin)) {
                this.propagatable ? e.preventDefault() : event.stop(e);
            }
        }
        var x = e.touches ? e.touches[0].pageX : e.clientX;
        var y = e.touches ? e.touches[0].pageY : e.clientY;
        var dx = x - this.touchStartX;
        var dy = y - this.touchStartY;
        var to = {x:this.startPos.x + dx, y:this.startPos.y + dy};
        var dim = this._dim;
        dx = Math.abs(dx);
        dy = Math.abs(dy);
        if (this._time.length == 1) {
            if (this.dirLock) {
                if (this._v && !this._h && dx >= this.threshold && dx >= dy || (this._h || this._f) && !this._v && dy >= this.threshold && dy >= dx) {
                    this._locked = true;
                    return;
                }
            }
            if (this._v && this._h) {
                if (dy < this.threshold && dx < this.threshold) {
                    return;
                }
            } else {
                if (this._v && dy < this.threshold || (this._h || this._f) && dx < this.threshold) {
                    return;
                }
            }
            this._moved = true;
            this.addCover();
            this.showScrollBar();
        }
        var weight = this.weight;
        if (this._v && this.constraint) {
            if (to.y > 0) {
                to.y = Math.round(to.y * weight);
            } else {
                if (to.y < -dim.o.h) {
                    if (dim.c.h < dim.d.h) {
                        to.y = Math.round(to.y * weight);
                    } else {
                        to.y = -dim.o.h - Math.round((-dim.o.h - to.y) * weight);
                    }
                }
            }
        }
        if ((this._h || this._f) && this.constraint) {
            if (to.x > 0) {
                to.x = Math.round(to.x * weight);
            } else {
                if (to.x < -dim.o.w) {
                    if (dim.c.w < dim.d.w) {
                        to.x = Math.round(to.x * weight);
                    } else {
                        to.x = -dim.o.w - Math.round((-dim.o.w - to.x) * weight);
                    }
                }
            }
        }
        this.scrollTo(to);
        var max = 10;
        var n = this._time.length;
        if (n >= 2) {
            this._moved = true;
            var d0, d1;
            if (this._v && !this._h) {
                d0 = this._posY[n - 1] - this._posY[n - 2];
                d1 = y - this._posY[n - 1];
            } else {
                if (!this._v && this._h) {
                    d0 = this._posX[n - 1] - this._posX[n - 2];
                    d1 = x - this._posX[n - 1];
                }
            }
            if (d0 * d1 < 0) {
                this._time = [this._time[n - 1]];
                this._posX = [this._posX[n - 1]];
                this._posY = [this._posY[n - 1]];
                n = 1;
            }
        }
        if (n == max) {
            this._time.shift();
            this._posX.shift();
            this._posY.shift();
        }
        this._time.push((new Date()).getTime() - this.startTime);
        this._posX.push(x);
        this._posY.push(y);
    }, _keepInputCaretInActiveElement:function () {
        var activeElement = win.doc.activeElement;
        var initialValue;
        if (activeElement && (activeElement.tagName == "INPUT" || activeElement.tagName == "TEXTAREA")) {
            initialValue = activeElement.value;
            if (activeElement.type == "number" || activeElement.type == "week") {
                if (initialValue) {
                    activeElement.value = activeElement.value + 1;
                } else {
                    activeElement.value = (activeElement.type == "week") ? "2013-W10" : 1;
                }
                activeElement.value = initialValue;
            } else {
                activeElement.value = activeElement.value + " ";
                activeElement.value = initialValue;
            }
        }
    }, onTouchEnd:function (e) {
        if (this._locked) {
            return;
        }
        var speed = this._speed = {x:0, y:0};
        var dim = this._dim;
        var pos = this.getPos();
        var to = {};
        if (e) {
            if (!this._conn) {
                return;
            }
            for (var i = 0; i < this._conn.length; i++) {
                connect.disconnect(this._conn[i]);
            }
            this._conn = null;
            var clicked = false;
            if (!this._aborted && !this._moved) {
                clicked = true;
            }
            if (clicked) {
                this.hideScrollBar();
                this.removeCover();
                if (1 && has("clicks-prevented") && !this.isFormElement(e.target)) {
                    var elem = e.target;
                    if (elem.nodeType != 1) {
                        elem = elem.parentNode;
                    }
                    setTimeout(function () {
                        dm._sendClick(elem, e);
                    });
                }
                return;
            }
            speed = this._speed = this.getSpeed();
        } else {
            if (pos.x == 0 && pos.y == 0) {
                return;
            }
            dim = this.getDim();
        }
        if (this._v) {
            to.y = pos.y + speed.y;
        }
        if (this._h || this._f) {
            to.x = pos.x + speed.x;
        }
        if (this.adjustDestination(to, pos, dim) === false) {
            return;
        }
        if (this.constraint) {
            if (this.scrollDir == "v" && dim.c.h < dim.d.h) {
                this.slideTo({y:0}, 0.3, "ease-out");
                return;
            } else {
                if (this.scrollDir == "h" && dim.c.w < dim.d.w) {
                    this.slideTo({x:0}, 0.3, "ease-out");
                    return;
                } else {
                    if (this._v && this._h && dim.c.h < dim.d.h && dim.c.w < dim.d.w) {
                        this.slideTo({x:0, y:0}, 0.3, "ease-out");
                        return;
                    }
                }
            }
        }
        var duration, easing = "ease-out";
        var bounce = {};
        if (this._v && this.constraint) {
            if (to.y > 0) {
                if (pos.y > 0) {
                    duration = 0.3;
                    to.y = 0;
                } else {
                    to.y = Math.min(to.y, 20);
                    easing = "linear";
                    bounce.y = 0;
                }
            } else {
                if (-speed.y > dim.o.h - (-pos.y)) {
                    if (pos.y < -dim.o.h) {
                        duration = 0.3;
                        to.y = dim.c.h <= dim.d.h ? 0 : -dim.o.h;
                    } else {
                        to.y = Math.max(to.y, -dim.o.h - 20);
                        easing = "linear";
                        bounce.y = -dim.o.h;
                    }
                }
            }
        }
        if ((this._h || this._f) && this.constraint) {
            if (to.x > 0) {
                if (pos.x > 0) {
                    duration = 0.3;
                    to.x = 0;
                } else {
                    to.x = Math.min(to.x, 20);
                    easing = "linear";
                    bounce.x = 0;
                }
            } else {
                if (-speed.x > dim.o.w - (-pos.x)) {
                    if (pos.x < -dim.o.w) {
                        duration = 0.3;
                        to.x = dim.c.w <= dim.d.w ? 0 : -dim.o.w;
                    } else {
                        to.x = Math.max(to.x, -dim.o.w - 20);
                        easing = "linear";
                        bounce.x = -dim.o.w;
                    }
                }
            }
        }
        this._bounce = (bounce.x !== undefined || bounce.y !== undefined) ? bounce : undefined;
        if (duration === undefined) {
            var distance, velocity;
            if (this._v && this._h) {
                velocity = Math.sqrt(speed.x * speed.x + speed.y * speed.y);
                distance = Math.sqrt(Math.pow(to.y - pos.y, 2) + Math.pow(to.x - pos.x, 2));
            } else {
                if (this._v) {
                    velocity = speed.y;
                    distance = to.y - pos.y;
                } else {
                    if (this._h) {
                        velocity = speed.x;
                        distance = to.x - pos.x;
                    }
                }
            }
            if (distance === 0 && !e) {
                return;
            }
            duration = velocity !== 0 ? Math.abs(distance / velocity) : 0.01;
        }
        this.slideTo(to, duration, easing);
    }, adjustDestination:function (to, pos, dim) {
        return true;
    }, abort:function () {
        this._aborted = true;
        this.scrollTo(this.getPos());
        this.stopAnimation();
    }, stopAnimation:function () {
        domClass.remove(this.containerNode, "mblScrollableScrollTo2");
        if (this._scrollBarV) {
            this._scrollBarV.className = "";
        }
        if (this._scrollBarH) {
            this._scrollBarH.className = "";
        }
        if (this._useTransformTransition || this._useTopLeft) {
            this.containerNode.style[css3.name("transition")] = "";
            if (this._scrollBarV) {
                this._scrollBarV.style[css3.name("transition")] = "";
            }
            if (this._scrollBarH) {
                this._scrollBarH.style[css3.name("transition")] = "";
            }
        }
    }, scrollIntoView:function (node, alignWithTop, duration) {
        if (!this._v) {
            return;
        }
        var c = this.containerNode, h = this.getDim().d.h, top = 0;
        for (var n = node; n !== c; n = n.offsetParent) {
            if (!n || n.tagName === "BODY") {
                return;
            }
            top += n.offsetTop;
        }
        var y = alignWithTop ? Math.max(h - c.offsetHeight, -top) : Math.min(0, h - top - node.offsetHeight);
        (duration && typeof duration === "number") ? this.slideTo({y:y}, duration, "ease-out") : this.scrollTo({y:y});
    }, getSpeed:function () {
        var x = 0, y = 0, n = this._time.length;
        if (n >= 2 && (new Date()).getTime() - this.startTime - this._time[n - 1] < 500) {
            var dy = this._posY[n - (n > 3 ? 2 : 1)] - this._posY[(n - 6) >= 0 ? n - 6 : 0];
            var dx = this._posX[n - (n > 3 ? 2 : 1)] - this._posX[(n - 6) >= 0 ? n - 6 : 0];
            var dt = this._time[n - (n > 3 ? 2 : 1)] - this._time[(n - 6) >= 0 ? n - 6 : 0];
            y = this.calcSpeed(dy, dt);
            x = this.calcSpeed(dx, dt);
        }
        return {x:x, y:y};
    }, calcSpeed:function (distance, time) {
        return Math.round(distance / time * 100) * 4;
    }, scrollTo:function (to, doNotMoveScrollBar, node) {
        var scrollEvent, beforeTopHeight, afterBottomHeight;
        var doScroll = true;
        if (!this._aborted && this._conn) {
            if (!this._dim) {
                this._dim = this.getDim();
            }
            beforeTopHeight = (to.y > 0) ? to.y : 0;
            afterBottomHeight = (this._dim.o.h + to.y < 0) ? -1 * (this._dim.o.h + to.y) : 0;
            scrollEvent = {bubbles:false, cancelable:false, x:to.x, y:to.y, beforeTop:beforeTopHeight > 0, beforeTopHeight:beforeTopHeight, afterBottom:afterBottomHeight > 0, afterBottomHeight:afterBottomHeight};
            doScroll = this.onBeforeScroll(scrollEvent);
        }
        if (doScroll) {
            var s = (node || this.containerNode).style;
            if (has("css3-animations")) {
                if (!this._useTopLeft) {
                    if (this._useTransformTransition) {
                        s[css3.name("transition")] = "";
                    }
                    s[css3.name("transform")] = this.makeTranslateStr(to);
                } else {
                    s[css3.name("transition")] = "";
                    if (this._v) {
                        s.top = to.y + "px";
                    }
                    if (this._h || this._f) {
                        s.left = to.x + "px";
                    }
                }
            } else {
                if (this._v) {
                    s.top = to.y + "px";
                }
                if (this._h || this._f) {
                    s.left = to.x + "px";
                }
            }
            if (has("ios")) {
                this._keepInputCaretInActiveElement();
            }
            if (!doNotMoveScrollBar) {
                this.scrollScrollBarTo(this.calcScrollBarPos(to));
            }
            if (scrollEvent) {
                this.onAfterScroll(scrollEvent);
            }
        }
    }, onBeforeScroll:function (e) {
        return true;
    }, onAfterScroll:function (e) {
    }, slideTo:function (to, duration, easing) {
        this._runSlideAnimation(this.getPos(), to, duration, easing, this.containerNode, 2);
        this.slideScrollBarTo(to, duration, easing);
    }, makeTranslateStr:function (to) {
        var y = this._v && typeof to.y == "number" ? to.y + "px" : "0px";
        var x = (this._h || this._f) && typeof to.x == "number" ? to.x + "px" : "0px";
        return has("translate3d") ? "translate3d(" + x + "," + y + ",0px)" : "translate(" + x + "," + y + ")";
    }, getPos:function () {
        if (has("css3-animations")) {
            var s = win.doc.defaultView.getComputedStyle(this.containerNode, "");
            if (!this._useTopLeft) {
                var m = s[css3.name("transform")];
                if (m && m.indexOf("matrix") === 0) {
                    var arr = m.split(/[,\s\)]+/);
                    var i = m.indexOf("matrix3d") === 0 ? 12 : 4;
                    return {y:arr[i + 1] - 0, x:arr[i] - 0};
                }
                return {x:0, y:0};
            } else {
                return {x:parseInt(s.left) || 0, y:parseInt(s.top) || 0};
            }
        } else {
            var y = parseInt(this.containerNode.style.top) || 0;
            return {y:y, x:this.containerNode.offsetLeft};
        }
    }, getDim:function () {
        var d = {};
        d.c = {h:this.containerNode.offsetHeight, w:this.containerNode.offsetWidth};
        d.v = {h:this.domNode.offsetHeight + this._appFooterHeight, w:this.domNode.offsetWidth};
        d.d = {h:d.v.h - this.fixedHeaderHeight - this.fixedFooterHeight - this._appFooterHeight, w:d.v.w};
        d.o = {h:d.c.h - d.v.h + this.fixedHeaderHeight + this.fixedFooterHeight + this._appFooterHeight, w:d.c.w - d.v.w};
        return d;
    }, showScrollBar:function () {
        if (!this.scrollBar) {
            return;
        }
        var dim = this._dim;
        if (this.scrollDir == "v" && dim.c.h <= dim.d.h) {
            return;
        }
        if (this.scrollDir == "h" && dim.c.w <= dim.d.w) {
            return;
        }
        if (this._v && this._h && dim.c.h <= dim.d.h && dim.c.w <= dim.d.w) {
            return;
        }
        var createBar = function (self, dir) {
            var bar = self["_scrollBarNode" + dir];
            if (!bar) {
                var wrapper = domConstruct.create("div", null, self.domNode);
                var props = {position:"absolute", overflow:"hidden"};
                if (dir == "V") {
                    props.right = "2px";
                    props.width = "5px";
                } else {
                    props.bottom = (self.isLocalFooter ? self.fixedFooterHeight : 0) + 2 + "px";
                    props.height = "5px";
                }
                domStyle.set(wrapper, props);
                wrapper.className = "mblScrollBarWrapper";
                self["_scrollBarWrapper" + dir] = wrapper;
                bar = domConstruct.create("div", null, wrapper);
                domStyle.set(bar, css3.add({opacity:0.6, position:"absolute", backgroundColor:"#606060", fontSize:"1px", MozBorderRadius:"2px", zIndex:2147483647}, {borderRadius:"2px", transformOrigin:"0 0"}));
                domStyle.set(bar, dir == "V" ? {width:"5px"} : {height:"5px"});
                self["_scrollBarNode" + dir] = bar;
            }
            return bar;
        };
        if (this._v && !this._scrollBarV) {
            this._scrollBarV = createBar(this, "V");
        }
        if (this._h && !this._scrollBarH) {
            this._scrollBarH = createBar(this, "H");
        }
        this.resetScrollBar();
    }, hideScrollBar:function () {
        if (this.fadeScrollBar && has("css3-animations")) {
            if (!dm._fadeRule) {
                var node = domConstruct.create("style", null, win.doc.getElementsByTagName("head")[0]);
                node.textContent = ".mblScrollableFadeScrollBar{" + "  " + css3.name("animation-duration", true) + ": 1s;" + "  " + css3.name("animation-name", true) + ": scrollableViewFadeScrollBar;}" + "@" + css3.name("keyframes", true) + " scrollableViewFadeScrollBar{" + "  from { opacity: 0.6; }" + "  to { opacity: 0; }}";
                dm._fadeRule = node.sheet.cssRules[1];
            }
        }
        if (!this.scrollBar) {
            return;
        }
        var f = function (bar, self) {
            domStyle.set(bar, css3.add({opacity:0}, {animationDuration:""}));
            if (!(self._useTopLeft && has("android"))) {
                bar.className = "mblScrollableFadeScrollBar";
            }
        };
        if (this._scrollBarV) {
            f(this._scrollBarV, this);
            this._scrollBarV = null;
        }
        if (this._scrollBarH) {
            f(this._scrollBarH, this);
            this._scrollBarH = null;
        }
    }, calcScrollBarPos:function (to) {
        var pos = {};
        var dim = this._dim;
        var f = function (wrapperH, barH, t, d, c) {
            var y = Math.round((d - barH - 8) / (d - c) * t);
            if (y < -barH + 5) {
                y = -barH + 5;
            }
            if (y > wrapperH - 5) {
                y = wrapperH - 5;
            }
            return y;
        };
        if (typeof to.y == "number" && this._scrollBarV) {
            pos.y = f(this._scrollBarWrapperV.offsetHeight, this._scrollBarV.offsetHeight, to.y, dim.d.h, dim.c.h);
        }
        if (typeof to.x == "number" && this._scrollBarH) {
            pos.x = f(this._scrollBarWrapperH.offsetWidth, this._scrollBarH.offsetWidth, to.x, dim.d.w, dim.c.w);
        }
        return pos;
    }, scrollScrollBarTo:function (to) {
        if (!this.scrollBar) {
            return;
        }
        if (this._v && this._scrollBarV && typeof to.y == "number") {
            if (has("css3-animations")) {
                if (!this._useTopLeft) {
                    if (this._useTransformTransition) {
                        this._scrollBarV.style[css3.name("transition")] = "";
                    }
                    this._scrollBarV.style[css3.name("transform")] = this.makeTranslateStr({y:to.y});
                } else {
                    domStyle.set(this._scrollBarV, css3.add({top:to.y + "px"}, {transition:""}));
                }
            } else {
                this._scrollBarV.style.top = to.y + "px";
            }
        }
        if (this._h && this._scrollBarH && typeof to.x == "number") {
            if (has("css3-animations")) {
                if (!this._useTopLeft) {
                    if (this._useTransformTransition) {
                        this._scrollBarH.style[css3.name("transition")] = "";
                    }
                    this._scrollBarH.style[css3.name("transform")] = this.makeTranslateStr({x:to.x});
                } else {
                    domStyle.set(this._scrollBarH, css3.add({left:to.x + "px"}, {transition:""}));
                }
            } else {
                this._scrollBarH.style.left = to.x + "px";
            }
        }
    }, slideScrollBarTo:function (to, duration, easing) {
        if (!this.scrollBar) {
            return;
        }
        var fromPos = this.calcScrollBarPos(this.getPos());
        var toPos = this.calcScrollBarPos(to);
        if (this._v && this._scrollBarV) {
            this._runSlideAnimation({y:fromPos.y}, {y:toPos.y}, duration, easing, this._scrollBarV, 0);
        }
        if (this._h && this._scrollBarH) {
            this._runSlideAnimation({x:fromPos.x}, {x:toPos.x}, duration, easing, this._scrollBarH, 1);
        }
    }, _runSlideAnimation:function (from, to, duration, easing, node, idx) {
        if (has("css3-animations")) {
            if (!this._useTopLeft) {
                if (this._useTransformTransition) {
                    if (to.x === undefined) {
                        to.x = from.x;
                    }
                    if (to.y === undefined) {
                        to.y = from.y;
                    }
                    if (to.x !== from.x || to.y !== from.y) {
                        this.onFlickAnimationStart();
                        domStyle.set(node, css3.add({}, {transitionProperty:css3.name("transform"), transitionDuration:duration + "s", transitionTimingFunction:easing}));
                        var t = this.makeTranslateStr(to);
                        setTimeout(function () {
                            domStyle.set(node, css3.add({}, {transform:t}));
                        }, 0);
                        domClass.add(node, "mblScrollableScrollTo" + idx);
                    } else {
                        this.hideScrollBar();
                        this.removeCover();
                    }
                } else {
                    this.setKeyframes(from, to, idx);
                    domStyle.set(node, css3.add({}, {animationDuration:duration + "s", animationTimingFunction:easing}));
                    domClass.add(node, "mblScrollableScrollTo" + idx);
                    if (idx == 2) {
                        this.scrollTo(to, true, node);
                    } else {
                        this.scrollScrollBarTo(to);
                    }
                }
            } else {
                if (to.x !== undefined || to.y !== undefined) {
                    this.onFlickAnimationStart();
                    domStyle.set(node, css3.add({}, {transitionProperty:(to.x !== undefined && to.y !== undefined) ? "top, left" : to.y !== undefined ? "top" : "left", transitionDuration:duration + "s", transitionTimingFunction:easing}));
                    setTimeout(function () {
                        var style = {};
                        if (to.x !== undefined) {
                            style.left = to.x + "px";
                        }
                        if (to.y !== undefined) {
                            style.top = to.y + "px";
                        }
                        domStyle.set(node, style);
                    }, 0);
                    domClass.add(node, "mblScrollableScrollTo" + idx);
                }
            }
        } else {
            if (dojo.fx && dojo.fx.easing && duration) {
                var self = this;
                var s = dojo.fx.slideTo({node:node, duration:duration * 1000, left:to.x, top:to.y, easing:(easing == "ease-out") ? dojo.fx.easing.quadOut : dojo.fx.easing.linear, onBegin:function () {
                    if (idx == 2) {
                        self.onFlickAnimationStart();
                    }
                }, onEnd:function () {
                    if (idx == 2) {
                        self.onFlickAnimationEnd();
                    }
                }}).play();
            } else {
                if (idx == 2) {
                    this.onFlickAnimationStart();
                    this.scrollTo(to, false, node);
                    this.onFlickAnimationEnd();
                } else {
                    this.scrollScrollBarTo(to);
                }
            }
        }
    }, resetScrollBar:function () {
        var f = function (wrapper, bar, d, c, hd, v) {
            if (!bar) {
                return;
            }
            var props = {};
            props[v ? "top" : "left"] = hd + 4 + "px";
            var t = (d - 8) <= 0 ? 1 : d - 8;
            props[v ? "height" : "width"] = t + "px";
            domStyle.set(wrapper, props);
            var l = Math.round(d * d / c);
            l = Math.min(Math.max(l - 8, 5), t);
            bar.style[v ? "height" : "width"] = l + "px";
            domStyle.set(bar, {"opacity":0.6});
        };
        var dim = this.getDim();
        f(this._scrollBarWrapperV, this._scrollBarV, dim.d.h, dim.c.h, this.fixedHeaderHeight, true);
        f(this._scrollBarWrapperH, this._scrollBarH, dim.d.w, dim.c.w, 0);
        this.createMask();
    }, createMask:function () {
        if (!(has("mask-image"))) {
            return;
        }
        if (this._scrollBarWrapperV) {
            var h = this._scrollBarWrapperV.offsetHeight;
            maskUtils.createRoundMask(this._scrollBarWrapperV, 0, 0, 0, 0, 5, h, 2, 2, 0.5);
        }
        if (this._scrollBarWrapperH) {
            var w = this._scrollBarWrapperH.offsetWidth;
            maskUtils.createRoundMask(this._scrollBarWrapperH, 0, 0, 0, 0, w, 5, 2, 2, 0.5);
        }
    }, flashScrollBar:function () {
        if (this.disableFlashScrollBar || !this.domNode) {
            return;
        }
        this._dim = this.getDim();
        if (this._dim.d.h <= 0) {
            return;
        }
        this.showScrollBar();
        var _this = this;
        setTimeout(function () {
            _this.hideScrollBar();
        }, 300);
    }, addCover:function () {
        if (!1 && !this.noCover) {
            if (!dm._cover) {
                dm._cover = domConstruct.create("div", null, win.doc.body);
                dm._cover.className = "mblScrollableCover";
                domStyle.set(dm._cover, {backgroundColor:"#ffff00", opacity:0, position:"absolute", top:"0px", left:"0px", width:"100%", height:"100%", zIndex:2147483647});
                this._ch.push(connect.connect(dm._cover, touch.press, this, "onTouchEnd"));
            } else {
                dm._cover.style.display = "";
            }
            this.setSelectable(dm._cover, false);
            this.setSelectable(this.domNode, false);
        }
    }, removeCover:function () {
        if (!1 && dm._cover) {
            dm._cover.style.display = "none";
            this.setSelectable(dm._cover, true);
            this.setSelectable(this.domNode, true);
        }
    }, setKeyframes:function (from, to, idx) {
        if (!dm._rule) {
            dm._rule = [];
        }
        if (!dm._rule[idx]) {
            var node = domConstruct.create("style", null, win.doc.getElementsByTagName("head")[0]);
            node.textContent = ".mblScrollableScrollTo" + idx + "{" + css3.name("animation-name", true) + ": scrollableViewScroll" + idx + ";}" + "@" + css3.name("keyframes", true) + " scrollableViewScroll" + idx + "{}";
            dm._rule[idx] = node.sheet.cssRules[1];
        }
        var rule = dm._rule[idx];
        if (rule) {
            if (from) {
                rule.deleteRule(has("webkit") ? "from" : 0);
                (rule.insertRule || rule.appendRule).call(rule, "from { " + css3.name("transform", true) + ": " + this.makeTranslateStr(from) + "; }");
            }
            if (to) {
                if (to.x === undefined) {
                    to.x = from.x;
                }
                if (to.y === undefined) {
                    to.y = from.y;
                }
                rule.deleteRule(has("webkit") ? "to" : 1);
                (rule.insertRule || rule.appendRule).call(rule, "to { " + css3.name("transform", true) + ": " + this.makeTranslateStr(to) + "; }");
            }
        }
    }, setSelectable:function (node, selectable) {
        node.style.KhtmlUserSelect = selectable ? "auto" : "none";
        node.style.MozUserSelect = selectable ? "" : "none";
        node.onselectstart = selectable ? null : function () {
            return false;
        };
        if (has("ie")) {
            node.unselectable = selectable ? "" : "on";
            var nodes = node.getElementsByTagName("*");
            for (var i = 0; i < nodes.length; i++) {
                nodes[i].unselectable = selectable ? "" : "on";
            }
        }
    }});
    Scrollable = 0 ? declare("dojox.mobile.Scrollable", [Scrollable, BidiScrollable]) : Scrollable;
    lang.setObject("dojox.mobile.scrollable", Scrollable);
    return Scrollable;
});

