//>>built

define("dojox/gauges/TextIndicator", ["dojo/_base/declare", "./_Indicator"], function (declare, Indicator) {
    return declare("dojox.gauges.TextIndicator", [Indicator], {x:0, y:0, align:"middle", fixedPrecision:true, precision:0, draw:function (group, dontAnimate) {
        var v = this.value;
        if (v < this._gauge.min) {
            v = this._gauge.min;
        }
        if (v > this._gauge.max) {
            v = this._gauge.max;
        }
        var txt;
        var NumberUtils = this._gauge ? this._gauge._getNumberModule() : null;
        if (NumberUtils) {
            txt = this.fixedPrecision ? NumberUtils.format(v, {places:this.precision}) : NumberUtils.format(v);
        } else {
            txt = this.fixedPrecision ? v.toFixed(this.precision) : v.toString();
        }
        var x = this.x ? this.x : 0;
        var y = this.y ? this.y : 0;
        var align = this.align ? this.align : "middle";
        if (!this.shape) {
            this.shape = group.createText({x:x, y:y, text:txt, align:align});
        } else {
            this.shape.setShape({x:x, y:y, text:txt, align:align});
        }
        this.shape.setFill(this.color);
        if (this.font) {
            this.shape.setFont(this.font);
        }
    }});
});

