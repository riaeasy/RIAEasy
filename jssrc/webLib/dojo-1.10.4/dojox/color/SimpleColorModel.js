//>>built

define("dojox/color/SimpleColorModel", ["dojo/_base/array", "dojo/_base/declare", "dojox/color"], function (arr, declare, color) {
    return declare("dojox.color.SimpleColorModel", null, {_startColor:null, _endColor:null, constructor:function (startColor, endColor) {
        if (endColor != undefined) {
            this._startColor = startColor;
            this._endColor = endColor;
        } else {
            var hsl = startColor.toHsl();
            hsl.s = 100;
            hsl.l = 85;
            this._startColor = color.fromHsl(hsl.h, hsl.s, hsl.l);
            this._startColor.a = startColor.a;
            hsl.l = 15;
            this._endColor = color.fromHsl(hsl.h, hsl.s, hsl.l);
            this._endColor.a = startColor.a;
        }
    }, _getInterpoledValue:function (from, to, value) {
        return (from + (to - from) * value);
    }, getNormalizedValue:function (value) {
    }, getColor:function (value) {
        var completion = this.getNormalizedValue(value);
        var hslFrom = this._startColor.toHsl();
        var hslTo = this._endColor.toHsl();
        var h = this._getInterpoledValue(hslFrom.h, hslTo.h, completion);
        var s = this._getInterpoledValue(hslFrom.s, hslTo.s, completion);
        var l = this._getInterpoledValue(hslFrom.l, hslTo.l, completion);
        var a = this._getInterpoledValue(this._startColor.a, this._endColor.a, completion);
        var c = color.fromHsl(h, s, l);
        c.a = a;
        return c;
    }});
});

