//>>built

define("dojox/charting/plot2d/ClusteredBars", ["dojo/_base/declare", "dojo/_base/array", "./Bars", "./common"], function (declare, array, Bars, dc) {
    return declare("dojox.charting.plot2d.ClusteredBars", Bars, {getBarProperties:function () {
        var length = this.series.length;
        array.forEach(this.series, function (serie) {
            if (serie.hidden) {
                length--;
            }
        });
        var f = dc.calculateBarSize(this._vScaler.bounds.scale, this.opt, length);
        return {gap:f.gap, height:f.size, thickness:f.size};
    }});
});

