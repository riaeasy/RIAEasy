//>>built

define("dojox/app/widgets/Container", ["dojo/_base/declare", "dojo/_base/lang", "dijit/registry", "dojo/dom-attr", "dojo/dom-geometry", "dojo/dom-style", "dijit/_WidgetBase", "dijit/_Container", "dijit/_Contained", "dojo/_base/array", "dojo/query", "../utils/layout", "./_ScrollableMixin"], function (declare, lang, registry, domAttr, domGeom, domStyle, WidgetBase, Container, Contained, array, query, layoutUtils, ScrollableMixin) {
    return declare("dojox.app.widgets.Container", [WidgetBase, Container, Contained, ScrollableMixin], {scrollable:false, fixedFooter:"", fixedHeader:"", buildRendering:function () {
        if (!this._constraint) {
            this._constraint = "center";
            domAttr.set(this.srcNodeRef, "data-app-constraint", "center");
        }
        this.inherited(arguments);
        domStyle.set(this.domNode, "overflow-x", "hidden");
        domStyle.set(this.domNode, "overflow-y", "auto");
        if (this.scrollable) {
            this.inherited(arguments);
            this.domNode.style.position = "absolute";
            this.domNode.style.width = "100%";
            this.domNode.style.height = "100%";
        }
    }, startup:function () {
        if (this._started) {
            return;
        }
        if (this.scrollable) {
            this.inherited(arguments);
        }
        this._started = true;
    }, resize:function (changeSize, resultSize) {
        var node = this.domNode;
        if (this.scrollable) {
            this.inherited(arguments);
            this.layout();
            return;
        }
        if (changeSize) {
            domGeom.setMarginBox(node, changeSize);
        }
        var mb = resultSize || {};
        lang.mixin(mb, changeSize || {});
        if (!("h" in mb) || !("w" in mb)) {
            mb = lang.mixin(domGeom.getMarginBox(node), mb);
        }
        var cs = domStyle.getComputedStyle(node);
        var me = domGeom.getMarginExtents(node, cs);
        var be = domGeom.getBorderExtents(node, cs);
        var bb = (this._borderBox = {w:mb.w - (me.w + be.w), h:mb.h - (me.h + be.h)});
        var pe = domGeom.getPadExtents(node, cs);
        this._contentBox = {l:domStyle.toPixelValue(node, cs.paddingLeft), t:domStyle.toPixelValue(node, cs.paddingTop), w:bb.w - pe.w, h:bb.h - pe.h};
        this.layout();
    }, layout:function () {
        var children = query("> [data-app-constraint]", this.domNode).map(function (node) {
            var w = registry.getEnclosingWidget(node);
            if (w) {
                w._constraint = domAttr.get(node, "data-app-constraint");
                return w;
            }
            return {domNode:node, _constraint:domAttr.get(node, "data-app-constraint")};
        });
        if (this._contentBox) {
            layoutUtils.layoutChildren(this.domNode, this._contentBox, children);
        }
        array.forEach(this.getChildren(), function (child) {
            if (!child._started && child.startup) {
                child.startup();
            }
        });
    }});
});

