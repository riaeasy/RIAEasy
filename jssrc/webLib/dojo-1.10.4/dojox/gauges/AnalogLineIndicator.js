//>>built

define("dojox/gauges/AnalogLineIndicator", ["dojo/_base/declare", "./AnalogIndicatorBase"], function (declare, AnalogIndicatorBase) {
    return declare("dojox.gauges.AnalogLineIndicator", [AnalogIndicatorBase], {_getShapes:function (group) {
        var direction = this.direction;
        var length = this.length;
        if (direction == "inside") {
            length = -length;
        }
        return [group.createLine({x1:0, y1:-this.offset, x2:0, y2:-length - this.offset}).setStroke({color:this.color, width:this.width})];
    }});
});

