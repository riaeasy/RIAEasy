//>>built

define("dojox/mobile/SwapView", ["dojo/_base/array", "dojo/_base/connect", "dojo/_base/declare", "dojo/dom", "dojo/dom-class", "dijit/registry", "./View", "./_ScrollableMixin", "./sniff", "./_css3", "require"], function (array, connect, declare, dom, domClass, registry, View, ScrollableMixin, has, css3, BidiSwapView) {
    var SwapView = declare(0 ? "dojox.mobile.NonBidiSwapView" : "dojox.mobile.SwapView", [View, ScrollableMixin], {scrollDir:"f", weight:1.2, _endOfTransitionTimeoutHandle:null, buildRendering:function () {
        this.inherited(arguments);
        domClass.add(this.domNode, "mblSwapView");
        this.setSelectable(this.domNode, false);
        this.containerNode = this.domNode;
        this.subscribe("/dojox/mobile/nextPage", "handleNextPage");
        this.subscribe("/dojox/mobile/prevPage", "handlePrevPage");
        this.noResize = true;
    }, startup:function () {
        if (this._started) {
            return;
        }
        this.inherited(arguments);
    }, resize:function () {
        this.inherited(arguments);
        array.forEach(this.getChildren(), function (child) {
            if (child.resize) {
                child.resize();
            }
        });
    }, onTouchStart:function (e) {
        if (this._siblingViewsInMotion()) {
            this.propagatable ? e.preventDefault() : event.stop(e);
            return;
        }
        var fromTop = this.domNode.offsetTop;
        var nextView = this.nextView(this.domNode);
        if (nextView) {
            nextView.stopAnimation();
            domClass.add(nextView.domNode, "mblIn");
            nextView.containerNode.style.paddingTop = fromTop + "px";
        }
        var prevView = this.previousView(this.domNode);
        if (prevView) {
            prevView.stopAnimation();
            domClass.add(prevView.domNode, "mblIn");
            prevView.containerNode.style.paddingTop = fromTop + "px";
        }
        this._setSiblingViewsInMotion(true);
        this.inherited(arguments);
    }, onTouchEnd:function (e) {
        if (e) {
            if (!this._moved) {
                this._setSiblingViewsInMotion(false);
            } else {
                this._endOfTransitionTimeoutHandle = this.defer(function () {
                    this._setSiblingViewsInMotion(false);
                }, 1000);
            }
        }
        this.inherited(arguments);
    }, handleNextPage:function (w) {
        var refNode = w.refId && dom.byId(w.refId) || w.domNode;
        if (this.domNode.parentNode !== refNode.parentNode) {
            return;
        }
        if (this.getShowingView() !== this) {
            return;
        }
        this.goTo(1);
    }, handlePrevPage:function (w) {
        var refNode = w.refId && dom.byId(w.refId) || w.domNode;
        if (this.domNode.parentNode !== refNode.parentNode) {
            return;
        }
        if (this.getShowingView() !== this) {
            return;
        }
        this.goTo(-1);
    }, goTo:function (dir, moveTo) {
        var view = moveTo ? registry.byId(moveTo) : ((dir == 1) ? this.nextView(this.domNode) : this.previousView(this.domNode));
        if (view && view !== this) {
            this.stopAnimation();
            view.stopAnimation();
            this.domNode._isShowing = false;
            view.domNode._isShowing = true;
            this.performTransition(view.id, dir, "slide", null, function () {
                connect.publish("/dojox/mobile/viewChanged", [view]);
            });
        }
    }, isSwapView:function (node) {
        return (node && node.nodeType === 1 && domClass.contains(node, "mblSwapView"));
    }, nextView:function (node) {
        for (var n = node.nextSibling; n; n = n.nextSibling) {
            if (this.isSwapView(n)) {
                return registry.byNode(n);
            }
        }
        return null;
    }, previousView:function (node) {
        for (var n = node.previousSibling; n; n = n.previousSibling) {
            if (this.isSwapView(n)) {
                return registry.byNode(n);
            }
        }
        return null;
    }, scrollTo:function (to) {
        if (!this._beingFlipped) {
            var newView, x;
            if (to.x) {
                if (to.x < 0) {
                    newView = this.nextView(this.domNode);
                    x = to.x + this.domNode.offsetWidth;
                } else {
                    newView = this.previousView(this.domNode);
                    x = to.x - this.domNode.offsetWidth;
                }
            }
            if (newView) {
                if (newView.domNode.style.display === "none") {
                    newView.domNode.style.display = "";
                    newView.resize();
                }
                newView._beingFlipped = true;
                newView.scrollTo({x:x});
                newView._beingFlipped = false;
            }
        }
        this.inherited(arguments);
    }, findDisp:function (node) {
        if (!domClass.contains(node, "mblSwapView")) {
            return this.inherited(arguments);
        }
        if (!node.parentNode) {
            return null;
        }
        var nodes = node.parentNode.childNodes;
        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            if (n.nodeType === 1 && domClass.contains(n, "mblSwapView") && !domClass.contains(n, "mblIn") && n.style.display !== "none") {
                return n;
            }
        }
        return node;
    }, slideTo:function (to, duration, easing, fake_pos) {
        if (!this._beingFlipped) {
            var w = this.domNode.offsetWidth;
            var pos = fake_pos || this.getPos();
            var newView, newX;
            if (pos.x < 0) {
                newView = this.nextView(this.domNode);
                if (pos.x < -w / 4) {
                    if (newView) {
                        to.x = -w;
                        newX = 0;
                    }
                } else {
                    if (newView) {
                        newX = w;
                    }
                }
            } else {
                newView = this.previousView(this.domNode);
                if (pos.x > w / 4) {
                    if (newView) {
                        to.x = w;
                        newX = 0;
                    }
                } else {
                    if (newView) {
                        newX = -w;
                    }
                }
            }
            if (newView) {
                newView._beingFlipped = true;
                newView.slideTo({x:newX}, duration, easing);
                newView._beingFlipped = false;
                newView.domNode._isShowing = (newView && newX === 0);
            }
            this.domNode._isShowing = !(newView && newX === 0);
        }
        this.inherited(arguments);
    }, onAnimationEnd:function (e) {
        if (e && e.target && domClass.contains(e.target, "mblScrollableScrollTo2")) {
            return;
        }
        this.inherited(arguments);
    }, onFlickAnimationEnd:function (e) {
        if (this._endOfTransitionTimeoutHandle) {
            this._endOfTransitionTimeoutHandle = this._endOfTransitionTimeoutHandle.remove();
        }
        if (e && e.target && !domClass.contains(e.target, "mblScrollableScrollTo2")) {
            return;
        }
        this.inherited(arguments);
        if (this.domNode._isShowing) {
            array.forEach(this.domNode.parentNode.childNodes, function (c) {
                if (this.isSwapView(c)) {
                    domClass.remove(c, "mblIn");
                    if (!c._isShowing) {
                        c.style.display = "none";
                        c.style[css3.name("transform")] = "";
                        c.style.left = "0px";
                        c.style.paddingTop = "";
                    }
                }
            }, this);
            connect.publish("/dojox/mobile/viewChanged", [this]);
            this.containerNode.style.paddingTop = "";
        } else {
            if (!has("css3-animations")) {
                this.containerNode.style.left = "0px";
            }
        }
        this._setSiblingViewsInMotion(false);
    }, _setSiblingViewsInMotion:function (inMotion) {
        var inMotionAttributeValue = inMotion ? "true" : false;
        var parent = this.domNode.parentNode;
        if (parent) {
            parent.setAttribute("data-dojox-mobile-swapview-inmotion", inMotionAttributeValue);
        }
    }, _siblingViewsInMotion:function () {
        var parent = this.domNode.parentNode;
        if (parent) {
            return parent.getAttribute("data-dojox-mobile-swapview-inmotion") == "true";
        } else {
            return false;
        }
    }});
    return 0 ? declare("dojox.mobile.SwapView", [SwapView, BidiSwapView]) : SwapView;
});

