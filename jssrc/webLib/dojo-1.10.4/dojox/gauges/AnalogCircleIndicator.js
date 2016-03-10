//>>built

define("dojox/gauges/AnalogCircleIndicator", ["dojo/_base/declare", "./AnalogIndicatorBase"], function (declare, AnalogIndicatorBase) {
    return declare("dojox.gauges.AnalogCircleIndicator", [AnalogIndicatorBase], {_getShapes:function (group) {
        var color = this.color ? this.color : "black";
        var strokeColor = this.strokeColor ? this.strokeColor : color;
        var stroke = {color:strokeColor, width:1};
        if (this.color.type && !this.strokeColor) {
            stroke.color = this.color.colors[0].color;
        }
        return [group.createCircle({cx:0, cy:-this.offset, r:this.length}).setFill(color).setStroke(stroke)];
    }});
});

