//>>built

define("dojox/gauges/AnalogIndicatorBase", ["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/connect", "dojo/_base/fx", "dojox/gfx", "./_Indicator"], function (lang, declare, connect, fx, gfx, Indicator) {
    return declare("dojox.gauges.AnalogIndicatorBase", [Indicator], {draw:function (group, dontAnimate) {
        if (this.shape) {
            this._move(dontAnimate);
        } else {
            if (this.text) {
                this.text.parent.remove(this.text);
                this.text = null;
            }
            var a = this._gauge._getAngle(Math.min(Math.max(this.value, this._gauge.min), this._gauge.max));
            this.color = this.color || "#000000";
            this.length = this.length || this._gauge.radius;
            this.width = this.width || 1;
            this.offset = this.offset || 0;
            this.highlight = this.highlight || "#D0D0D0";
            var shapes = this._getShapes(group, this._gauge, this);
            if (shapes) {
                if (shapes.length > 1) {
                    this.shape = group.createGroup();
                    for (var s = 0; s < shapes.length; s++) {
                        this.shape.add(shapes[s]);
                    }
                } else {
                    this.shape = shapes[0];
                }
                this.shape.setTransform([{dx:this._gauge.cx, dy:this._gauge.cy}, gfx.matrix.rotateg(a)]);
                this.shape.connect("onmouseover", this, this.handleMouseOver);
                this.shape.connect("onmouseout", this, this.handleMouseOut);
                this.shape.connect("onmousedown", this, this.handleMouseDown);
                this.shape.connect("touchstart", this, this.handleTouchStart);
            }
            if (this.label) {
                var direction = this.direction;
                if (!direction) {
                    direction = "outside";
                }
                var len;
                if (direction == "inside") {
                    len = -this.length + this.offset - 5;
                } else {
                    len = this.length + this.offset + 5;
                }
                var rad = this._gauge._getRadians(90 - a);
                this._layoutLabel(group, this.label + "", this._gauge.cx, this._gauge.cy, len, rad, direction);
            }
            this.currentValue = this.value;
        }
    }, _layoutLabel:function (group, txt, ox, oy, lrad, angle, labelPlacement) {
        var font = this.font ? this.font : gfx.defaultFont;
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
        this.text = this._gauge.drawText(group, txt, tfx + tw / 2, tfy + th, "middle", this.color, this.font);
    }, _distance:function (x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }, _move:function (dontAnimate) {
        var v = Math.min(Math.max(this.value, this._gauge.min), this._gauge.max), c = this.currentValue;
        if (dontAnimate) {
            var angle = this._gauge._getAngle(v);
            this.shape.setTransform([{dx:this._gauge.cx, dy:this._gauge.cy}, gfx.matrix.rotateg(angle)]);
            this.currentValue = v;
        } else {
            if (c != v) {
                var anim = new fx.Animation({curve:[c, v], duration:this.duration, easing:this.easing});
                connect.connect(anim, "onAnimate", lang.hitch(this, function (step) {
                    this.shape.setTransform([{dx:this._gauge.cx, dy:this._gauge.cy}, gfx.matrix.rotateg(this._gauge._getAngle(step))]);
                    this.currentValue = step;
                }));
                anim.play();
            }
        }
    }});
});

