//>>built

define("dojox/dgauges/RectangularSegmentedRangeIndicator", ["dojo/_base/declare", "dojo/on", "dojox/gfx", "./IndicatorBase"], function (declare, on, gfx, IndicatorBase) {
    return declare("dojox.dgauges.RectangularSegmentedRangeIndicator", IndicatorBase, {start:0, startThickness:10, endThickness:10, fill:null, stroke:null, paddingLeft:0, paddingTop:0, paddingRight:0, paddingBottom:0, segments:10, segmentSpacing:2, rounded:true, ranges:null, constructor:function () {
        this.fill = [255, 120, 0];
        this.stroke = {color:"black", width:0.2};
        this.addInvalidatingProperties(["start", "startThickness", "endThickness", "fill", "stroke", "segments", "segmentSpacing", "ranges"]);
    }, _defaultHorizontalShapeFunc:function (indicator, group, scale, startX, startY, endPosition, startThickness, endThickness, fill, stroke) {
        var length = scale._contentBox.w;
        var shape, i, gp, radius;
        if (this.ranges) {
            fill = {type:"linear", colors:[]};
            fill.x1 = startX;
            fill.y1 = startY;
            fill.x2 = startX + length;
            fill.y2 = startY;
            var rangeStart = this.start;
            for (i = 0; i < this.ranges.length; i++) {
                var entry1 = {color:this.ranges[i].color, offset:scale.scaler.positionForValue(rangeStart)};
                var entry2 = {color:this.ranges[i].color, offset:scale.scaler.positionForValue(rangeStart + this.ranges[i].size)};
                fill.colors.push(entry1);
                fill.colors.push(entry2);
                rangeStart += this.ranges[i].size;
            }
        } else {
            if (fill && fill.colors) {
                fill.x1 = startX;
                fill.y1 = startY;
                fill.x2 = startX + length;
                fill.y2 = startY;
            }
        }
        var x = startX;
        var y = startY;
        var chicklet = (length / this.segments) - this.segmentSpacing;
        var visibleSegments = Math.abs((endPosition - startX) / (chicklet + this.segmentSpacing));
        var sw = this.startThickness;
        var inc = (this.endThickness - this.startThickness) / this.segments;
        var ew = sw + inc;
        var remain = visibleSegments - Math.floor(visibleSegments);
        for (i = 0; i < Math.floor(visibleSegments); i++) {
            var path = group.createPath();
            if (i == 0 && this.rounded && (sw / 2) < chicklet) {
                radius = sw / 2;
                path.moveTo(x + radius, y);
                path.lineTo(x + chicklet, y);
                path.lineTo(x + chicklet, y + ew);
                path.lineTo(x + radius, y + sw);
                path.arcTo(radius, radius, 0, 0, 1, x + radius, y);
            } else {
                if (i == Math.floor(visibleSegments) - 1 && (remain == 0) && this.rounded && (ew / 2) < chicklet) {
                    radius = ew / 2;
                    path.moveTo(x, y);
                    path.lineTo(x + chicklet - radius, y);
                    path.arcTo(radius, radius, 0, 0, 1, x + chicklet - radius, y + ew);
                    path.lineTo(x, y + sw);
                    path.lineTo(x, y);
                } else {
                    path.moveTo(x, y);
                    path.lineTo(x + chicklet, y);
                    path.lineTo(x + chicklet, y + ew);
                    path.lineTo(x, y + sw);
                    path.lineTo(x, y);
                }
            }
            path.setFill(fill).setStroke(stroke);
            sw = ew;
            ew += inc;
            x += chicklet + this.segmentSpacing;
        }
        if (remain > 0) {
            ew = sw + ((ew - sw) * remain);
            gp = [x, y, x + (chicklet * remain), y, x + (chicklet * remain), y + ew, x, y + sw, x, y];
            shape = group.createPolyline(gp).setFill(fill).setStroke(stroke);
        }
        return shape;
    }, _defaultVerticalShapeFunc:function (indicator, group, scale, startX, startY, endPosition, startThickness, endThickness, fill, stroke) {
        var length = scale._contentBox.h;
        var shape, i, gp, radius;
        if (this.ranges) {
            fill = {type:"linear", colors:[]};
            fill.x1 = startX;
            fill.y1 = startY;
            fill.x2 = startX;
            fill.y2 = startY + length;
            var rangeStart = 0;
            for (i = 0; i < this.ranges.length; i++) {
                var entry1 = {color:this.ranges[i].color, offset:scale.scaler.positionForValue(rangeStart)};
                var entry2 = {color:this.ranges[i].color, offset:scale.scaler.positionForValue(rangeStart + this.ranges[i].size)};
                fill.colors.push(entry1);
                fill.colors.push(entry2);
                rangeStart += this.ranges[i].size;
            }
        } else {
            if (fill && fill.colors) {
                fill.x1 = startX;
                fill.y1 = startY;
                fill.x2 = startX;
                fill.y2 = startY + length;
            }
        }
        var x = startX;
        var y = startY;
        var chicklet = (length / this.segments) - this.segmentSpacing;
        var visibleSegments = Math.abs((endPosition - startY) / (chicklet + this.segmentSpacing));
        var sw = this.startThickness;
        var inc = (this.endThickness - this.startThickness) / this.segments;
        var ew = sw + inc;
        var remain = visibleSegments - Math.floor(visibleSegments);
        for (i = 0; i < Math.floor(visibleSegments); i++) {
            var path = group.createPath();
            if (i == 0 && this.rounded && (sw / 2) < chicklet) {
                radius = sw / 2;
                path.moveTo(x, y + radius);
                path.lineTo(x, y + chicklet);
                path.lineTo(x + ew, y + chicklet);
                path.lineTo(x + sw, y + radius);
                path.arcTo(radius, radius, 0, 0, 0, x, y + radius);
            } else {
                if (i == Math.floor(visibleSegments) - 1 && (remain == 0) && this.rounded && (ew / 2) < chicklet) {
                    radius = ew / 2;
                    path.moveTo(x, y);
                    path.lineTo(x, y + chicklet - radius);
                    path.arcTo(radius, radius, 0, 0, 0, x + ew, y + chicklet - radius);
                    path.lineTo(x + sw, y);
                    path.lineTo(x, y);
                } else {
                    path.moveTo(x, y);
                    path.lineTo(x, y + chicklet);
                    path.lineTo(x + ew, y + chicklet);
                    path.lineTo(x + sw, y);
                    path.lineTo(x, y);
                }
            }
            path.setFill(fill).setStroke(stroke);
            sw = ew;
            ew += inc;
            y += chicklet + this.segmentSpacing;
        }
        if (remain > 0) {
            ew = sw + ((ew - sw) * remain);
            gp = [x, y, x, y + (chicklet * remain), x + ew, y + (chicklet * remain), x + sw, y, x, y];
            shape = group.createPolyline(gp).setFill(fill).setStroke(stroke);
        }
        return shape;
    }, indicatorShapeFunc:function (group, indicator, startX, startY, endPosition, startThickness, endThickness, fill, stroke) {
        if (indicator.scale._gauge.orientation == "horizontal") {
            this._defaultHorizontalShapeFunc(indicator, group, indicator.scale, startX, startY, endPosition, startThickness, endThickness, fill, stroke);
        } else {
            this._defaultVerticalShapeFunc(indicator, group, indicator.scale, startX, startY, endPosition, startThickness, endThickness, fill, stroke);
        }
    }, refreshRendering:function () {
        if (this._gfxGroup == null || this.scale == null) {
            return;
        }
        var spos = this.scale.positionForValue(this.start);
        var pos = this.scale.positionForValue(this.value);
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
        this.indicatorShapeFunc(this._gfxGroup, this, startX, startY, endPosition, this.startThickness, this.endThickness, this.fill, this.stroke);
    }});
});

