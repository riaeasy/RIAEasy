//>>built

define("dojox/dgauges/RectangularRangeIndicator", ["dojo/_base/declare", "dojox/gfx", "./ScaleIndicatorBase", "dojo/_base/event", "dojo/dom-geometry"], function (declare, gfx, ScaleIndicatorBase, eventUtil, domGeom) {
    return declare("dojox.dgauges.RectangularRangeIndicator", ScaleIndicatorBase, {start:0, startThickness:10, endThickness:10, fill:null, stroke:null, paddingLeft:10, paddingTop:10, paddingRight:10, paddingBottom:10, constructor:function () {
        this.fill = [255, 120, 0];
        this.stroke = {color:"black", width:0.2};
        this.interactionMode = "none";
        this.addInvalidatingProperties(["start", "startThickness", "endThickness", "fill", "stroke"]);
    }, _defaultHorizontalShapeFunc:function (indicator, group, scale, startX, startY, endPosition, startThickness, endThickness, fill, stroke) {
        var gp = [startX, startY, endPosition, startY, endPosition, startY + endThickness, startX, startY + startThickness, startX, startY];
        if (fill && fill.colors) {
            fill.x1 = startX;
            fill.y1 = startY;
            fill.x2 = endPosition;
            fill.y2 = startY;
        }
        return group.createPolyline(gp).setFill(fill).setStroke(stroke);
    }, _defaultVerticalShapeFunc:function (indicator, group, scale, startX, startY, endPosition, startThickness, endThickness, fill, stroke) {
        var gp = [startX, startY, startX, endPosition, startX + endThickness, endPosition, startX + startThickness, startY, startX, startY];
        if (fill && fill.colors) {
            fill.x1 = startX;
            fill.y1 = startY;
            fill.x2 = startX;
            fill.y2 = endPosition;
        }
        return group.createPolyline(gp).setFill(fill).setStroke(stroke);
    }, _shapeFunc:function (indicator, group, scale, startX, startY, endPosition, startThickness, endThickness, fill, stroke) {
        if (this.scale._gauge.orientation == "horizontal") {
            this._defaultHorizontalShapeFunc(indicator, group, scale, startX, startY, endPosition, startThickness, endThickness, fill, stroke);
        } else {
            this._defaultVerticalShapeFunc(indicator, group, scale, startX, startY, endPosition, startThickness, endThickness, fill, stroke);
        }
    }, refreshRendering:function () {
        this.inherited(arguments);
        if (this._gfxGroup == null || this.scale == null) {
            return;
        }
        var spos = this.scale.positionForValue(this.start);
        var v = isNaN(this._transitionValue) ? this.value : this._transitionValue;
        var pos = this.scale.positionForValue(v);
        this._gfxGroup.clear();
        var startX;
        var startY;
        var endPosition;
        if (this.scale._gauge.orientation == "horizontal") {
            startX = spos;
            startY = this.paddingTop;
            endPosition = pos;
        } else {
            startX = this.paddingLeft;
            startY = spos;
            endPosition = pos;
        }
        this._shapeFunc(this, this._gfxGroup, this.scale, startX, startY, endPosition, this.startThickness, this.endThickness, this.fill, this.stroke);
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

