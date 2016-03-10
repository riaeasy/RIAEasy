//>>built

define("dojox/mobile/EdgeToEdgeList", ["dojo/_base/declare", "./RoundRectList"], function (declare, RoundRectList) {
    return declare("dojox.mobile.EdgeToEdgeList", RoundRectList, {filterBoxClass:"mblFilteredEdgeToEdgeListSearchBox", buildRendering:function () {
        this.inherited(arguments);
        this.domNode.className = "mblEdgeToEdgeList";
    }});
});

