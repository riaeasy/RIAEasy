//>>built

define("dojox/charting/plot2d/StackedAreas", ["dojo/_base/declare", "./Stacked"], function (declare, Stacked) {
    return declare("dojox.charting.plot2d.StackedAreas", Stacked, {constructor:function () {
        this.opt.lines = true;
        this.opt.areas = true;
    }});
});

