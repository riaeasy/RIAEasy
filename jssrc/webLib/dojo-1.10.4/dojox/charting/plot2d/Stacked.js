//>>built

define("dojox/charting/plot2d/Stacked", ["dojo/_base/declare", "./Default", "./commonStacked"], function (declare, Default, commonStacked) {
    return declare("dojox.charting.plot2d.Stacked", Default, {getSeriesStats:function () {
        var stats = commonStacked.collectStats(this.series);
        return stats;
    }, buildSegments:function (i, indexed) {
        var run = this.series[i], min = indexed ? Math.max(0, Math.floor(this._hScaler.bounds.from - 1)) : 0, max = indexed ? Math.min(run.data.length - 1, Math.ceil(this._hScaler.bounds.to)) : run.data.length - 1, rseg = null, segments = [];
        for (var j = min; j <= max; j++) {
            var value = indexed ? commonStacked.getIndexValue(this.series, i, j) : commonStacked.getValue(this.series, i, run.data[j] ? run.data[j].x : null);
            if (value[0] != null && (indexed || value[0].y != null)) {
                if (!rseg) {
                    rseg = [];
                    segments.push({index:j, rseg:rseg});
                }
                rseg.push(value[0]);
            } else {
                if (!this.opt.interpolate || indexed) {
                    rseg = null;
                }
            }
        }
        return segments;
    }});
});

