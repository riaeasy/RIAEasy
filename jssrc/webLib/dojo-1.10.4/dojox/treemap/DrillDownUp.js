//>>built

define("dojox/treemap/DrillDownUp", ["dojo/_base/lang", "dojo/_base/event", "dojo/_base/declare", "dojo/on", "dojo/dom-geometry", "dojo/dom-construct", "dojo/dom-style", "dojo/_base/fx", "dojox/gesture/tap"], function (lang, event, declare, on, domGeom, domConstruct, domStyle, fx, tap) {
    return declare("dojox.treemap.DrillDownUp", null, {postCreate:function () {
        this.inherited(arguments);
        this.own(on(this.domNode, "dblclick", lang.hitch(this, this._onDoubleClick)));
        if (tap) {
            this.own(on(this.domNode, tap.doubletap, lang.hitch(this, this._onDoubleClick)));
        }
    }, _onDoubleClick:function (e) {
        var renderer = this._getRendererFromTarget(e.target);
        if (renderer.item) {
            var item = renderer.item;
            if (this._isLeaf(item)) {
                item = renderer.parentItem;
                renderer = this.itemToRenderer[this.getIdentity(item)];
                if (renderer == null) {
                    return;
                }
            }
            if (this.rootItem == item) {
                this.drillUp(renderer);
            } else {
                this.drillDown(renderer);
            }
            event.stop(e);
        }
    }, drillUp:function (renderer) {
        var item = renderer.item;
        this.domNode.removeChild(renderer);
        var parent = this._getRenderer(item).parentItem;
        this.set("rootItem", parent);
        this.validateRendering();
        domConstruct.place(renderer, this.domNode);
        domStyle.set(renderer, "zIndex", 40);
        var finalBox = domGeom.position(this._getRenderer(item), true);
        var corner = domGeom.getMarginBox(this.domNode);
        fx.animateProperty({node:renderer, duration:500, properties:{left:{end:finalBox.x - corner.l}, top:{end:finalBox.y - corner.t}, height:{end:finalBox.h}, width:{end:finalBox.w}}, onAnimate:lang.hitch(this, function (values) {
            var box = domGeom.getContentBox(renderer);
            this._layoutGroupContent(renderer, box.w, box.h, renderer.level + 1, false, true);
        }), onEnd:lang.hitch(this, function () {
            this.domNode.removeChild(renderer);
        })}).play();
    }, drillDown:function (renderer) {
        var box = domGeom.getMarginBox(this.domNode);
        var item = renderer.item;
        var parentNode = renderer.parentNode;
        var spanInfo = domGeom.position(renderer, true);
        parentNode.removeChild(renderer);
        domConstruct.place(renderer, this.domNode);
        domStyle.set(renderer, {left:(spanInfo.x - box.l) + "px", top:(spanInfo.y - box.t) + "px"});
        var zIndex = domStyle.get(renderer, "zIndex");
        domStyle.set(renderer, "zIndex", 40);
        fx.animateProperty({node:renderer, duration:500, properties:{left:{end:box.l}, top:{end:box.t}, height:{end:box.h}, width:{end:box.w}}, onAnimate:lang.hitch(this, function (values) {
            var box2 = domGeom.getContentBox(renderer);
            this._layoutGroupContent(renderer, box2.w, box2.h, renderer.level + 1, false);
        }), onEnd:lang.hitch(this, function () {
            domStyle.set(renderer, "zIndex", zIndex);
            this.set("rootItem", item);
        })}).play();
    }});
});

