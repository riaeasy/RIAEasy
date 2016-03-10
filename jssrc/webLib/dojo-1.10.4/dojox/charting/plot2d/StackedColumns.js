//>>built

define("dojox/charting/plot2d/StackedColumns", ["dojo/_base/declare", "./Columns", "./commonStacked"], function (declare, Columns, commonStacked) {
    return declare("dojox.charting.plot2d.StackedColumns", Columns, {getSeriesStats:function () {
        var stats = commonStacked.collectStats(this.series);
        stats.hmin -= 0.5;
        stats.hmax += 0.5;
        return stats;
    }, getValue:function (value, index, seriesIndex, indexed) {
        var x, y;
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

