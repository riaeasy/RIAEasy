//>>built

define("dijit/layout/_LayoutWidget", ["dojo/_base/lang", "../_Widget", "../_Container", "../_Contained", "../Viewport", "dojo/_base/declare", "dojo/dom-class", "dojo/dom-geometry", "dojo/dom-style"], function (lang, _Widget, _Container, _Contained, Viewport, declare, domClass, domGeometry, domStyle) {
    return declare("dijit.layout._LayoutWidget", [_Widget, _Container, _Contained], {baseClass:"dijitLayoutContainer", isLayoutContainer:true, _setTitleAttr:null, buildRendering:function () {
        this.inherited(arguments);
        domClass.add(this.domNode, "dijitContainer");
    }, startup:function () {
        if (this._started) {
            return;
        }
        this.inherited(arguments);
        var parent = this.getParent && this.getParent();
        if (!(parent && parent.isLayoutContainer)) {
            this.resize();
            this.own(Viewport.on("resize", lang.hitch(this, "resize")));
        }
    }, resize:function (changeSize, resultSize) {
        var node = this.domNode;
        if (changeSize) {
            domGeometry.setMarginBox(node, changeSize);
        }
        var mb = resultSize || {};
        lang.mixin(mb, changeSize || {});
        if (!("h" in mb) || !("w" in mb)) {
            mb = lang.mixin(domGeometry.getMarginBox(node), mb);
        }
        var cs = domStyle.getComputedStyle(node);
        var me = domGeometry.getMarginExtents(node, cs);
        var be = domGeometry.getBorderExtents(node, cs);
        var bb = (this._borderBox = {w:mb.w - (me.w + be.w), h:mb.h - (me.h + be.h)});
        var pe = domGeometry.getPadExtents(node, cs);
        this._contentBox = {l:domStyle.toPixelValue(node, cs.paddingLeft), t:domStyle.toPixelValue(node, cs.paddingTop), w:bb.w - pe.w, h:bb.h - pe.h};
        this.layout();
    }, layout:function () {
    }, _setupChild:function (child) {
        var cls = this.baseClass + "-child " + (child.baseClass ? this.baseClass + "-" + child.baseClass : "");
        domClass.add(child.domNode, cls);
    }, addChild:function (child, insertIndex) {
        this.inherited(arguments);
        if (this._started) {
            this._setupChild(child);
        }
    }, removeChild:function (child) {
        var cls = this.baseClass + "-child" + (child.baseClass ? " " + this.baseClass + "-" + child.baseClass : "");
        domClass.remove(child.domNode, cls);
        this.inherited(arguments);
    }});
});

