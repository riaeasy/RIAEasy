//>>built

define("dojox/gauges/GlossyCircularGaugeNeedle", ["dojo/_base/declare", "dojo/_base/Color", "./AnalogIndicatorBase"], function (declare, Color, AnalogIndicatorBase) {
    return declare("dojox.gauges.GlossyCircularGaugeNeedle", [AnalogIndicatorBase], {interactionMode:"gauge", color:"#c4c4c4", _getShapes:function (group) {
        var darkerColor = Color.blendColors(new Color(this.color), new Color("black"), 0.3);
        if (!this._gauge) {
            return null;
        }
        var shapes = [];
        shapes[0] = group.createGroup();
        var scale = Math.min((this._gauge.width / this._gauge._designWidth), (this._gauge.height / this._gauge._designHeight));
        shapes[0].createGroup().setTransform({xx:scale, xy:0, yx:0, yy:scale, dx:0, dy:0});
        shapes[0].children[0].createPath({path:"M357.1429 452.005 L333.0357 465.9233 L333.0357 438.0868 L357.1429 452.005 Z"}).setTransform({xx:0, xy:1, yx:-6.21481, yy:0, dx:-452.00505, dy:2069.75519}).setFill(this.color).setStroke({color:darkerColor, width:1, style:"Solid", cap:"butt", join:20});
        return shapes;
    }});
});

