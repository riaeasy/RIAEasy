//>>built

define("dojox/dgauges/LogScaler", ["dojo/_base/lang", "dojo/_base/declare", "dojo/Stateful"], function (lang, declare, Stateful) {
    return declare("dojox.dgauges.LogScaler", Stateful, {minimum:0, maximum:1000, multiplier:10, majorTicks:null, _computedMultiplier:NaN, constructor:function () {
        this.watchedProperties = ["minimum", "maximum", "multiplier"];
    }, _buildMajorTickItems:function () {
        var majorTickCache = [];
        this._computedMinimum = this.getComputedMinimum();
        this._computedMaximum = this.getComputedMaximum();
        this._computedMultiplier = this.getComputedMultiplier();
        if (this._computedMaximum > this._computedMinimum) {
            var start = Math.max(0, Math.floor(Math.log(this._computedMinimum + 1e-9) / Math.LN10));
            var end = Math.max(0, Math.floor(Math.log(this._computedMaximum + 1e-9) / Math.LN10));
            var data;
            for (var i = start; i <= end; i += this._computedMultiplier) {
                data = {};
                data.value = Math.pow(10, i);
                data.position = (i - start) / (end - start);
                majorTickCache.push(data);
            }
        }
        return majorTickCache;
    }, getComputedMinimum:function () {
        return Math.pow(10, Math.max(0, Math.floor(Math.log(this.minimum + 1e-9) / Math.LN10)));
    }, getComputedMaximum:function () {
        return Math.pow(10, Math.max(0, Math.floor(Math.log(this.maximum + 1e-9) / Math.LN10)));
    }, getComputedMultiplier:function () {
        return Math.max(1, Math.floor(Math.log(this.multiplier + 1e-9) / Math.LN10));
    }, computeTicks:function () {
        this.majorTicks = this._buildMajorTickItems();
        return this.majorTicks.concat();
    }, positionForValue:function (value) {
        if (this._computedMaximum < this._computedMinimum || value <= this._computedMinimum || value < 1 || isNaN(value)) {
            value = this._computedMinimum;
        }
        if (value >= this._computedMaximum) {
            value = this._computedMaximum;
        }
        value = Math.log(value) / Math.LN10;
        var sv = Math.log(this._computedMinimum) / Math.LN10;
        var ev = Math.log(this._computedMaximum) / Math.LN10;
        return (value - sv) / (ev - sv);
    }, valueForPosition:function (position) {
        var sv = Math.log(this._computedMinimum) / Math.LN10;
        var ev = Math.log(this._computedMaximum) / Math.LN10;
        return Math.pow(10, sv + position * (ev - sv));
    }});
});

