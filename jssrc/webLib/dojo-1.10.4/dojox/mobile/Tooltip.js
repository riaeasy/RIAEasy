//>>built

define("dojox/mobile/Tooltip", ["dojo/_base/array", "dijit/registry", "dojo/_base/declare", "dojo/_base/lang", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-geometry", "dojo/dom-style", "dijit/place", "dijit/_WidgetBase", "dojo/has", "require"], function (array, registry, declare, lang, domClass, domConstruct, domGeometry, domStyle, place, WidgetBase, has, BidiTooltip) {
    var Tooltip = declare(0 ? "dojox.mobile.NonBidiTooltip" : "dojox.mobile.Tooltip", WidgetBase, {baseClass:"mblTooltip mblTooltipHidden", buildRendering:function () {
        this.inherited(arguments);
        this.anchor = domConstruct.create("div", {"class":"mblTooltipAnchor"}, this.domNode, "first");
        this.arrow = domConstruct.create("div", {"class":"mblTooltipArrow"}, this.anchor);
        this.innerArrow = domConstruct.create("div", {"class":"mblTooltipInnerArrow"}, this.anchor);
        if (!this.containerNode) {
            this.containerNode = this.domNode;
        }
    }, show:function (aroundNode, positions) {
        var domNode = this.domNode;
        var connectorClasses = {"MRM":"mblTooltipAfter", "MLM":"mblTooltipBefore", "BMT":"mblTooltipBelow", "TMB":"mblTooltipAbove", "BLT":"mblTooltipBelow", "TLB":"mblTooltipAbove", "BRT":"mblTooltipBelow", "TRB":"mblTooltipAbove", "TLT":"mblTooltipBefore", "TRT":"mblTooltipAfter", "BRB":"mblTooltipAfter", "BLB":"mblTooltipBefore"};
        domClass.remove(domNode, ["mblTooltipAfter", "mblTooltipBefore", "mblTooltipBelow", "mblTooltipAbove"]);
        array.forEach(registry.findWidgets(domNode), function (widget) {
            if (widget.height == "auto" && typeof widget.resize == "function") {
                if (!widget._parentPadBorderExtentsBottom) {
                    widget._parentPadBorderExtentsBottom = domGeometry.getPadBorderExtents(domNode).b;
                }
                widget.resize();
            }
        });
        if (positions) {
            positions = array.map(positions, function (pos) {
                return {after:"after-centered", before:"before-centered"}[pos] || pos;
            });
        }
        var best = place.around(domNode, aroundNode, positions || ["below-centered", "above-centered", "after-centered", "before-centered"], this.isLeftToRight());
        var connectorClass = connectorClasses[best.corner + best.aroundCorner.charAt(0)] || "";
        domClass.add(domNode, connectorClass);
        var pos = domGeometry.position(aroundNode, true);
        domStyle.set(this.anchor, (connectorClass == "mblTooltipAbove" || connectorClass == "mblTooltipBelow") ? {top:"", left:Math.max(0, pos.x - best.x + (pos.w >> 1) - (this.arrow.offsetWidth >> 1)) + "px"} : {left:"", top:Math.max(0, pos.y - best.y + (pos.h >> 1) - (this.arrow.offsetHeight >> 1)) + "px"});
        domClass.replace(domNode, "mblTooltipVisible", "mblTooltipHidden");
        this.resize = lang.hitch(this, "show", aroundNode, positions);
        return best;
    }, hide:function () {
        this.resize = undefined;
        domClass.replace(this.domNode, "mblTooltipHidden", "mblTooltipVisible");
    }, onBlur:function (e) {
        return true;
    }, destroy:function () {
        if (this.anchor) {
            this.anchor.removeChild(this.innerArrow);
            this.anchor.removeChild(this.arrow);
            this.domNode.removeChild(this.anchor);
            this.anchor = this.arrow = this.innerArrow = undefined;
        }
        this.inherited(arguments);
    }});
    return 0 ? declare("dojox.mobile.Tooltip", [Tooltip, BidiTooltip]) : Tooltip;
});

