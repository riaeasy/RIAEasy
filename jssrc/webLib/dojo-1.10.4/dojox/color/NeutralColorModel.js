//>>built

define("dojox/color/NeutralColorModel", ["dojo/_base/array", "dojo/_base/declare", "./SimpleColorModel"], function (arr, declare, SimpleColorModel) {
    return declare("dojox.color.NeutralColorModel", SimpleColorModel, {_min:0, _max:0, _e:0, constructor:function (startColor, endColor) {
    }, initialize:function (items, colorFunc) {
        var values = [];
        var sum = 0;
        var min = 100000000;
        var max = -min;
        arr.forEach(items, function (item) {
            var value = colorFunc(item);
            min = Math.min(min, value);
            max = Math.max(max, value);
            sum += value;
            values.push(value);
        });
        values.sort(function (a, b) {
            return a - b;
        });
        var neutral = this.computeNeutral(min, max, sum, values);
        this._min = min;
        this._max = max;
        if (this._min == this._max || neutral == this._min) {
            this._e = -1;
        } else {
            this._e = Math.log(0.5) / Math.log((neutral - this._min) / (this._max - this._min));
        }
    }, computeNeutral:function (min, max, sum, values) {
    }, getNormalizedValue:function (value) {
        if (this._e < 0) {
            return 0;
        }
        value = (value - this._min) / (this._max - this._min);
        return Math.pow(value, this._e);
    }});
});

