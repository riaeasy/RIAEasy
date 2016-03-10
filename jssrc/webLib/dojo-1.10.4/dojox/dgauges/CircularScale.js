//>>built

define("dojox/dgauges/CircularScale", ["dojo/_base/declare", "dojox/gfx", "./ScaleBase", "./_circularUtils"], function (declare, gfx, ScaleBase, _circularUtils) {
    return declare("dojox.dgauges.CircularScale", ScaleBase, {originX:50, originY:50, radius:50, startAngle:0, endAngle:180, orientation:"clockwise", constructor:function () {
        this.labelPosition = "inside";
        this.addInvalidatingProperties(["originX", "originY", "radius", "startAngle", "endAngle", "orientation"]);
    }, _getOrientationNum:function () {
        return this.orientation == "cclockwise" ? -1 : 1;
    }, positionForValue:function (value) {
        var totalAngle = _circularUtils.computeTotalAngle(this.startAngle, this.endAngle, this.orientation);
        var relativePos = this.scaler.positionForValue(value);
        return _circularUtils.modAngle(this.startAngle + this._getOrientationNum() * totalAngle * relativePos, 360);
    }, _positionForTickItem:function (tickItem) {
        var totalAngle = _circularUtils.computeTotalAngle(this.startAngle, this.endAngle, this.orientation);
        return _circularUtils.modAngle(this.startAngle + this._getOrientationNum() * totalAngle * tickItem.position, 360);
    }, valueForPosition:function (angle) {
        if (!this.positionInRange(angle)) {
            var min1 = _circularUtils.modAngle(this.startAngle - angle, 360);
            var min2 = 360 - min1;
            var max1 = _circularUtils.modAngle(this.endAngle - angle, 360);
            var max2 = 360 - max1;
            var pos;
            if (Math.min(min1, min2) < Math.min(max1, max2)) {
                pos = 0;
            } else {
                pos = 1;
            }
        } else {
            var relativeAngle = _circularUtils.modAngle(this._getOrientationNum() * (angle - this.startAngle), 360);
            var totalAngle = _circularUtils.computeTotalAngle(this.startAngle, this.endAngle, this.orientation);
            pos = relativeAngle / totalAngle;
        }
        return this.scaler.valueForPosition(pos);
    }, positionInRange:function (value) {
        if (this.startAngle == this.endAngle) {
            return true;
        }
        value = _circularUtils.modAngle(value, 360);
        if (this._getOrientationNum() == 1) {
            if (this.startAngle < this.endAngle) {
                return value >= this.startAngle && value <= this.endAngle;
            } else {
                return !(value > this.endAngle && value < this.startAngle);
            }
        } else {
            if (this.startAngle < this.endAngle) {
                return !(value > this.startAngle && value < this.endAngle);
            } else {
                return value >= this.endAngle && value <= this.startAngle;
            }
        }
    }, _distance:function (x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }, _layoutLabel:function (label, txt, ox, oy, lrad, angle, labelPlacement) {
        var font = this._getFont();
        var box = gfx._base._getTextBox(txt, {font:gfx.makeFontString(gfx.makeParameters(gfx.defaultFont, font))});
        var tw = box.w;
        var fz = font.size;
        var th = gfx.normalizedLength(fz);
        var tfx = ox + Math.cos(angle) * lrad - tw / 2;
        var tfy = oy - Math.sin(angle) * lrad - th / 2;
        var side;
        var intersections = [];
        side = tfx;
        var ipx = side;
        var ipy = -Math.tan(angle) * side + oy + Math.tan(angle) * ox;
        if (ipy >= tfy && ipy <= tfy + th) {
            intersections.push({x:ipx, y:ipy});
        }
        side = tfx + tw;
        ipx = side;
        ipy = -Math.tan(angle) * side + oy + Math.tan(angle) * ox;
        if (ipy >= tfy && ipy <= tfy + th) {
            intersections.push({x:ipx, y:ipy});
        }
        side = tfy;
        ipx = -1 / Math.tan(angle) * side + ox + 1 / Math.tan(angle) * oy;
        ipy = side;
        if (ipx >= tfx && ipx <= tfx + tw) {
            intersections.push({x:ipx, y:ipy});
        }
        side = tfy + th;
        ipx = -1 / Math.tan(angle) * side + ox + 1 / Math.tan(angle) * oy;
        ipy = side;
        if (ipx >= tfx && ipx <= tfx + tw) {
            intersections.push({x:ipx, y:ipy});
        }
        var dif;
        if (labelPlacement == "inside") {
            for (var it = 0; it < intersections.length; it++) {
                var ip = intersections[it];
                dif = this._distance(ip.x, ip.y, ox, oy) - lrad;
                if (dif >= 0) {
                    tfx = ox + Math.cos(angle) * (lrad - dif) - tw / 2;
                    tfy = oy - Math.sin(angle) * (lrad - dif) - th / 2;
                    break;
                }
            }
        } else {
            for (it = 0; it < intersections.length; it++) {
                ip = intersections[it];
                dif = this._distance(ip.x, ip.y, ox, oy) - lrad;
                if (dif <= 0) {
                    tfx = ox + Math.cos(angle) * (lrad - dif) - tw / 2;
                    tfy = oy - Math.sin(angle) * (lrad - dif) - th / 2;
                    break;
                }
            }
        }
        if (label) {
            label.setTransform([{dx:tfx + tw / 2, dy:tfy + th}]);
        }
    }, refreshRendering:function () {
        this.inherited(arguments);
        if (!this._gfxGroup || !this.scaler) {
            return;
        }
        this.startAngle = _circularUtils.modAngle(this.startAngle, 360);
        this.endAngle = _circularUtils.modAngle(this.endAngle, 360);
        this._ticksGroup.clear();
        var renderer;
        var label;
        var labelText;
        var allTicks = this.scaler.computeTicks();
        var tickBB;
        for (var i = 0; i < allTicks.length; i++) {
            var tickItem = allTicks[i];
            renderer = this.tickShapeFunc(this._ticksGroup, this, tickItem);
            tickBB = this._gauge._computeBoundingBox(renderer);
            var a;
            if (tickItem.position) {
                a = this._positionForTickItem(tickItem);
            } else {
                a = this.positionForValue(tickItem.value);
            }
            if (renderer) {
                renderer.setTransform([{dx:this.originX, dy:this.originY}, gfx.matrix.rotateg(a), {dx:this.radius - tickBB.width - 2 * tickBB.x, dy:0}]);
            }
            labelText = this.tickLabelFunc(tickItem);
            if (labelText) {
                label = this._ticksGroup.createText({x:0, y:0, text:labelText, align:"middle"}).setFont(this._getFont()).setFill(this._getFont().color ? this._getFont().color : "black");
                var rad = this.radius;
                if (this.labelPosition == "inside") {
                    rad -= (tickBB.width + this.labelGap);
                } else {
                    rad += this.labelGap;
                }
                this._layoutLabel(label, labelText, this.originX, this.originY, rad, _circularUtils.toRadians(360 - a), this.labelPosition);
            }
        }
        for (var key in this._indicatorsIndex) {
            this._indicatorsRenderers[key] = this._indicatorsIndex[key].invalidateRendering();
        }
    }});
});

