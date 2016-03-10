//>>built

define("dojox/charting/plot2d/MarkersOnly", ["dojo/_base/declare", "./Default"], function (declare, Default) {
    return declare("dojox.charting.plot2d.MarkersOnly", Default, {constructor:function () {
        this.opt.lines = false;
        this.opt.markers = true;
    }});
});

