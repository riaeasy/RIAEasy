//>>built

define("dojox/mobile/Rating", ["dojo/_base/declare", "dojo/_base/lang", "dojo/dom-construct", "dijit/_WidgetBase", "./iconUtils", "dojo/has", "require"], function (declare, lang, domConstruct, WidgetBase, iconUtils, has, BidiRating) {
    var Rating = declare(0 ? "dojox.mobile.NonBidiRating" : "dojox.mobile.Rating", [WidgetBase], {image:"", numStars:5, value:0, alt:"", baseClass:"mblRating", buildRendering:function () {
        this.inherited(arguments);
        this.domNode.style.display = "inline-block";
        var img = this.imgNode = domConstruct.create("img");
        this.connect(img, "onload", lang.hitch(this, function () {
            this.set("value", this.value);
        }));
        iconUtils.createIcon(this.image, null, img);
    }, _setValueAttr:function (value) {
        this._set("value", value);
        var h = this.imgNode.height;
        if (h == 0) {
            return;
        }
        domConstruct.empty(this.domNode);
        var i, left, w = this.imgNode.width / 3;
        for (i = 0; i < this.numStars; i++) {
            if (i <= value - 1) {
                left = 0;
            } else {
                if (i >= value) {
                    left = w;
                } else {
                    left = w * 2;
                }
            }
            var parent = domConstruct.create("div", {style:{"float":"left"}}, this.domNode);
            if (!this.isLeftToRight()) {
                parent = this._setCustomTransform(parent);
            }
            iconUtils.createIcon(this.image, "0," + left + "," + w + "," + h, null, this.alt, parent);
        }
    }, _setCustomTransform:function (parent) {
        return parent;
    }});
    return 0 ? declare("dojox.mobile.Rating", [Rating, BidiRating]) : Rating;
});

