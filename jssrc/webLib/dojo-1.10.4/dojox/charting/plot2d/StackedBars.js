//>>built

define("dojox/charting/plot2d/StackedBars", ["dojo/_base/declare", "./Bars", "./commonStacked"], function (declare, Bars, commonStacked) {
    return declare("dojox.charting.plot2d.StackedBars", Bars, {getSeriesStats:function () {
        var stats = commonStacked.collectStats(this.series), t;
        stats.hmin -= 0.5;
        stats.hmax += 0.5;
        t = stats.hmin, stats.hmin = stats.vmin, stats.vmin = t;
        t = stats.hmax, stats.hmax = stats.vmax, stats.vmax = t;
        return stats;
    }, getValue:function (value, index, seriesIndex, indexed) {
        var y, x;
        if (indexed) {
            x = index;
            y = commonStacked.getIndexValue(this.series, seriesIndex, x);
        } else {
            x = value.x - 1;
            y = commonStacked.getValue(this.series, seriesIndex, value.x);
            y = [y[0] ? y[0].y : null, y[1] ? y[1] : null];
        }
        return {x:x, y:y[0], py:y[1]};
    }});
});

