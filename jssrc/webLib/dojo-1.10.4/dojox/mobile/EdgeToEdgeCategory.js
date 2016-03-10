//>>built

define("dojox/mobile/EdgeToEdgeCategory", ["dojo/_base/declare", "./RoundRectCategory"], function (declare, RoundRectCategory) {
    return declare("dojox.mobile.EdgeToEdgeCategory", RoundRectCategory, {buildRendering:function () {
        this.inherited(arguments);
        this.domNode.className = "mblEdgeToEdgeCategory";
        if (this.type && this.type == "long") {
            this.domNode.className += " mblEdgeToEdgeCategoryLong";
        }
    }});
});

