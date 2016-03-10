//>>built

define("dojox/dgauges/CircularValueIndicator", ["dojo/_base/declare", "dojox/gfx", "./ScaleIndicatorBase", "dojo/_base/event"], function (declare, gfx, ScaleIndicatorBase, eventUtil) {
    return declare("dojox.dgauges.CircularValueIndicator", ScaleIndicatorBase, {indicatorShapeFunc:function (group, indicator) {
        return group.createLine({x1:0, y1:0, x2:40, y2:0}).setStroke({color:"black", width:1});
    }, refreshRendering:function () {
        this.inherited(arguments);
        var v = isNaN(this._transitionValue) ? this.value : this._transitionValue;
        var angle = this.scale.positionForValue(v);
        this._gfxGroup.setTransform([{dx:this.scale.originX, dy:this.scale.originY}, gfx.matrix.rotateg(angle)]);
    }, _onMouseDown:function (event) {
        this.inherited(arguments);
        var origin = this.scale._gauge._gaugeToPage(this.scale.originX, this.scale.originY);
        var angle = ((Math.atan2(event.pageY - origin.y, event.pageX - origin.x)) * 180) / (Math.PI);
        this.set("value", this.scale.valueForPosition(angle));
        eventUtil.stop(event);
    }, _onMouseMove:function (event) {
        this.inherited(arguments);
        var origin = this.scale._gauge._gaugeToPage(this.scale.originX, this.scale.originY);
        var angle = ((Math.atan2(event.pageY - origin.y, event.pageX - origin.x)) * 180) / (Math.PI);
        this.set("value", this.scale.valueForPosition(angle));
    }});
});

