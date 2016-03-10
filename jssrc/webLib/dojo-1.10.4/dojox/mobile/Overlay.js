//>>built

define("dojox/mobile/Overlay", ["dojo/_base/declare", "dojo/_base/lang", "dojo/sniff", "dojo/_base/window", "dojo/dom-class", "dojo/dom-geometry", "dojo/dom-style", "dojo/window", "dijit/_WidgetBase", "dojo/_base/array", "dijit/registry", "dojo/touch", "./viewRegistry", "./_css3"], function (declare, lang, has, win, domClass, domGeometry, domStyle, windowUtils, WidgetBase, array, registry, touch, viewRegistry, css3) {
    return declare("dojox.mobile.Overlay", WidgetBase, {baseClass:"mblOverlay mblOverlayHidden", buildRendering:function () {
        this.inherited(arguments);
        if (!this.containerNode) {
            this.containerNode = this.domNode;
        }
    }, _reposition:function () {
        var popupPos = domGeometry.position(this.domNode);
        var vp = windowUtils.getBox();
        var scrollableParent = viewRegistry.getEnclosingScrollable(this.domNode);
        if (scrollableParent) {
            vp.t -= scrollableParent.getPos().y;
        }
        if ((popupPos.y + popupPos.h) != vp.h || (domStyle.get(this.domNode, "position") != "absolute" && has("android") < 3)) {
            popupPos.y = vp.t + vp.h - popupPos.h;
            domStyle.set(this.domNode, {position:"absolute", top:popupPos.y + "px", bottom:"auto"});
        }
        return popupPos;
    }, show:function (aroundNode) {
        array.forEach(registry.findWidgets(this.domNode), function (w) {
            if (w && w.height == "auto" && typeof w.resize == "function") {
                w.resize();
            }
        });
        var popupPos = this._reposition();
        if (aroundNode) {
            var aroundPos = domGeometry.position(aroundNode);
            if (popupPos.y < aroundPos.y) {
                win.global.scrollBy(0, aroundPos.y + aroundPos.h - popupPos.y);
                this._reposition();
            }
        }
        var _domNode = this.domNode;
        domClass.replace(_domNode, ["mblCoverv", "mblIn"], ["mblOverlayHidden", "mblRevealv", "mblOut", "mblReverse", "mblTransition"]);
        this.defer(function () {
            var handler = this.connect(_domNode, css3.name("transitionEnd"), function () {
                this.disconnect(handler);
                domClass.remove(_domNode, ["mblCoverv", "mblIn", "mblTransition"]);
                this._reposition();
            });
            domClass.add(_domNode, "mblTransition");
        }, 100);
        var skipReposition = false;
        this._moveHandle = this.connect(win.doc.documentElement, touch.move, function () {
            skipReposition = true;
        });
        this._repositionTimer = setInterval(lang.hitch(this, function () {
            if (skipReposition) {
                skipReposition = false;
                return;
            }
            this._reposition();
        }), 50);
        return popupPos;
    }, hide:function () {
        var _domNode = this.domNode;
        if (this._moveHandle) {
            this.disconnect(this._moveHandle);
            this._moveHandle = null;
            clearInterval(this._repositionTimer);
            this._repositionTimer = null;
        }
        if (has("css3-animations")) {
            domClass.replace(_domNode, ["mblRevealv", "mblOut", "mblReverse"], ["mblCoverv", "mblIn", "mblOverlayHidden", "mblTransition"]);
            this.defer(function () {
                var handler = this.connect(_domNode, css3.name("transitionEnd"), function () {
                    this.disconnect(handler);
                    domClass.replace(_domNode, ["mblOverlayHidden"], ["mblRevealv", "mblOut", "mblReverse", "mblTransition"]);
                });
                domClass.add(_domNode, "mblTransition");
            }, 100);
        } else {
            domClass.replace(_domNode, ["mblOverlayHidden"], ["mblCoverv", "mblIn", "mblRevealv", "mblOut", "mblReverse"]);
        }
    }, onBlur:function (e) {
        return false;
    }});
});

