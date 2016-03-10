//>>built

define("dojox/gauges/Range", ["dojo/_base/declare", "dijit/_Widget"], function (declare, Widget) {
    return declare("dojox.gauges.Range", [Widget], {low:0, high:0, hover:"", color:null, size:0, startup:function () {
        this.color = this.color ? (this.color.color || this.color) : "black";
    }});
});

