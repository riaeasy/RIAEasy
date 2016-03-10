//>>built

define("dojox/dgauges/RectangularValueIndicator", ["dojo/_base/declare", "./ScaleIndicatorBase", "dojox/gfx", "dojo/_base/event", "dojo/dom-geometry"], function (declare, ScaleIndicatorBase, gfx, eventUtil, domGeom) {
    return declare("dojox.dgauges.RectangularValueIndicator", ScaleIndicatorBase, {paddingLeft:0, paddingTop:0, paddingRight:0, paddingBottom:0, constructor:function () {
        this.addInvalidatingProperties(["paddingTop", "paddingLeft", "paddingRight", "paddingBottom"]);
    }, indicatorShapeFunc:function (group, indicator) {
        return group.createPolyline([0, 0, 10, 0, 0, 10, -10, 0, 0, 0]).setStroke({color:"black", width:1});
    }, refreshRendering:function () {
        this.inherited(arguments);
        var v = isNaN(this._transitionValue) ? this.value : this._transitionValue;
        var pos = this.scale.positionForValue(v);
        var dx = 0, dy = 0;
        var angle = 0;
        if (this.scale._gauge.orientation == "horizontal") {
            dx = pos;
            dy = this.paddingTop;
        } else {
            dx = this.paddingLeft;
            dy = pos;
            angle = 90;
        }
        this._gfxGroup.setTransform([{dx:dx, dy:dy}, gfx.matrix.rotateg(angle)]);
    }, _onMouseDown:function (event) {
        this.inherited(arguments);
        var np = domGeom.position(this.scale._gauge.domNode, true);
        this.set("value", this.scale.valueForPosition({x:event.pageX - np.x, y:event.pageY - np.y}));
        eventUtil.stop(event);
    }, _onMouseMove:function (event) {
        this.inherited(arguments);
        var np = domGeom.position(this.scale._gauge.domNode, true);
        this.set("value", this.scale.valueForPosition({x:event.pageX - np.x, y:event.pageY - np.y}));
    }});
});

