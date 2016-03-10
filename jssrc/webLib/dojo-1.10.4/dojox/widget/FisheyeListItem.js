//>>built

define("dojox/widget/FisheyeListItem", ["dojo/_base/declare", "dojo/_base/sniff", "dojo/dom", "dojo/dom-attr", "dojo/dom-class", "dojo/dom-style", "dojo/dom-construct", "dojo/_base/window", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_Contained"], function (declare, has, dom, attr, domClass, style, construct, winUtil, _WidgetBase, _TemplatedMixin, _Contained) {
    return declare("dojox.widget.FisheyeListItem", [_WidgetBase, _TemplatedMixin, _Contained], {iconSrc:"", label:"", id:"", templateString:"<div class=\"dojoxFisheyeListItem\">" + "  <img class=\"dojoxFisheyeListItemImage\" data-dojo-attach-point=\"imgNode\" data-dojo-attach-event=\"onmouseover:onMouseOver,onmouseout:onMouseOut,onclick:onClick\">" + "  <div class=\"dojoxFisheyeListItemLabel\" data-dojo-attach-point=\"lblNode\"></div>" + "</div>", _isNode:function (wh) {
        if (typeof Element == "function") {
            try {
                return wh instanceof Element;
            }
            catch (e) {
            }
        } else {
            return wh && !isNaN(wh.nodeType);
        }
        return false;
    }, _hasParent:function (node) {
        return Boolean(node && node.parentNode && this._isNode(node.parentNode));
    }, postCreate:function () {
        var parent;
        if ((this.iconSrc.toLowerCase().substring(this.iconSrc.length - 4) == ".png") && has("ie") < 7) {
            if (this._hasParent(this.imgNode) && this.id != "") {
                parent = this.imgNode.parentNode;
                attr.set(parent, "id", this.id);
            }
            style.set(this.imgNode, "filter", "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + this.iconSrc + "', sizingMethod='scale')");
            this.imgNode.src = this._blankGif.toString();
        } else {
            if (this._hasParent(this.imgNode) && this.id != "") {
                parent = this.imgNode.parentNode;
                attr.set(parent, "id", this.id);
            }
            this.imgNode.src = this.iconSrc;
        }
        if (this.lblNode) {
            construct.place(winUtil.doc.createTextNode(this.label), this.lblNode);
        }
        dom.setSelectable(this.domNode, false);
        this.startup();
    }, startup:function () {
        this.parent = this.getParent();
    }, onMouseOver:function (e) {
        if (!this.parent.isOver) {
            this.parent._setActive(e);
        }
        if (this.label != "") {
            domClass.add(this.lblNode, "dojoxFishSelected");
            this.parent._positionLabel(this);
        }
    }, onMouseOut:function (e) {
        domClass.remove(this.lblNode, "dojoxFishSelected");
    }, onClick:function (e) {
    }});
});

