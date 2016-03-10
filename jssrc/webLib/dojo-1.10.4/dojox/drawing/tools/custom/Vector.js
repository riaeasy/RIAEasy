//>>built

define("dojox/drawing/tools/custom/Vector", ["dojo", "../../util/oo", "../../manager/_registry", "../../util/positioning", "../Arrow"], function (dojo, oo, registry, positioning, Arrow) {
    var Vector = oo.declare(Arrow, function (options) {
        this.minimumSize = this.style.arrows.length;
        this.addShadow({size:3, mult:2});
    }, {draws:true, type:"dojox.drawing.tools.custom.Vector", minimumSize:30, showAngle:true, changeAxis:function (cosphi) {
        cosphi = cosphi !== undefined ? cosphi : this.style.zAxis ? 0 : 1;
        if (cosphi == 0) {
            this.style.zAxis = false;
            this.data.cosphi = 0;
        } else {
            this.style.zAxis = true;
            var p = this.points;
            var pt = this.zPoint();
            this.setPoints([{x:p[0].x, y:p[0].y}, {x:pt.x, y:pt.y}]);
        }
        this.render();
    }, _createZeroVector:function (shp, d, sty) {
        var s = shp == "hit" ? this.minimumSize : this.minimumSize / 6;
        var f = shp == "hit" ? sty.fill : null;
        d = {cx:this.data.x1, cy:this.data.y1, rx:s, ry:s};
        this.remove(this[shp]);
        this[shp] = this.container.createEllipse(d).setStroke(sty).setFill(f);
        this.util.attr(this[shp], "drawingType", "stencil");
    }, _create:function (shp, d, sty) {
        this.remove(this[shp]);
        this[shp] = this.container.createLine(d).setStroke(sty);
        this._setNodeAtts(this[shp]);
    }, onDrag:function (obj) {
        if (this.created) {
            return;
        }
        var x1 = obj.start.x, y1 = obj.start.y, x2 = obj.x, y2 = obj.y;
        if (this.keys.shift && !this.style.zAxis) {
            var pt = this.util.snapAngle(obj, 45 / 180);
            x2 = pt.x;
            y2 = pt.y;
        }
        if (this.keys.alt) {
            var dx = x2 > x1 ? ((x2 - x1) / 2) : ((x1 - x2) / -2);
            var dy = y2 > y1 ? ((y2 - y1) / 2) : ((y1 - y2) / -2);
            x1 -= dx;
            x2 -= dx;
            y1 -= dy;
            y2 -= dy;
        }
        if (this.style.zAxis) {
            var pts = this.zPoint(obj);
            x2 = pts.x;
            y2 = pts.y;
        }
        this.setPoints([{x:x1, y:y1}, {x:x2, y:y2}]);
        this.render();
    }, onTransform:function (anchor) {
        if (!this._isBeingModified) {
            this.onTransformBegin();
        }
        this.setPoints(this.points);
        this.render();
    }, anchorConstrain:function (x, y) {
        if (!this.style.zAxis) {
            return null;
        }
        var radians = this.style.zAngle * Math.PI / 180;
        var test = x < 0 ? x > -y : x < -y;
        var dx = test ? x : -y / Math.tan(radians);
        var dy = !test ? y : -Math.tan(radians) * x;
        return {x:dx, y:dy};
    }, zPoint:function (obj) {
        if (obj === undefined) {
            if (!this.points[0]) {
                return null;
            }
            var d = this.pointsToData();
            obj = {start:{x:d.x1, y:d.y1}, x:d.x2, y:d.y2};
        }
        var radius = this.util.length(obj);
        var angle = positioning.angle(obj.start, obj);
        angle < 0 ? angle = 360 + angle : angle;
        angle = angle > 135 && angle < 315 ? this.style.zAngle : this.util.oppAngle(this.style.zAngle);
        return this.util.pointOnCircle(obj.start.x, obj.start.y, radius, angle);
    }, pointsToData:function (p) {
        p = p || this.points;
        var cosphi = 0;
        var obj = {start:{x:p[0].x, y:p[0].y}, x:p[1].x, y:p[1].y};
        if (this.style.zAxis && (this.util.length(obj) > this.minimumSize)) {
            var angle = positioning.angle(obj.start, obj);
            angle < 0 ? angle = 360 + angle : angle;
            cosphi = angle > 135 && angle < 315 ? 1 : -1;
        }
        this.data = {x1:p[0].x, y1:p[0].y, x2:p[1].x, y2:p[1].y, cosphi:cosphi};
        return this.data;
    }, dataToPoints:function (o) {
        o = o || this.data;
        if (o.radius || o.angle) {
            var cosphi = 0;
            var pt = this.util.pointOnCircle(o.x, o.y, o.radius, o.angle);
            if (this.style.zAxis || (o.cosphi && o.cosphi != 0)) {
                this.style.zAxis = true;
                cosphi = o.angle > 135 && o.angle < 315 ? 1 : -1;
            }
            this.data = o = {x1:o.x, y1:o.y, x2:pt.x, y2:pt.y, cosphi:cosphi};
        }
        this.points = [{x:o.x1, y:o.y1}, {x:o.x2, y:o.y2}];
        return this.points;
    }, render:function () {
        this.onBeforeRender(this);
        if (this.getRadius() >= this.minimumSize) {
            this._create("hit", this.data, this.style.currentHit);
            this._create("shape", this.data, this.style.current);
        } else {
            this.data.cosphi = 0;
            this._createZeroVector("hit", this.data, this.style.currentHit);
            this._createZeroVector("shape", this.data, this.style.current);
        }
    }, onUp:function (obj) {
        if (this.created || !this._downOnCanvas) {
            return;
        }
        this._downOnCanvas = false;
        if (!this.shape) {
            var d = 100;
            obj.start.x = this.style.zAxis ? obj.start.x + d : obj.start.x;
            obj.y = obj.y + d;
            this.setPoints([{x:obj.start.x, y:obj.start.y}, {x:obj.x, y:obj.y}]);
            this.render();
        }
        if (this.getRadius() < this.minimumSize) {
            var p = this.points;
            this.setPoints([{x:p[0].x, y:p[0].y}, {x:p[0].x, y:p[0].y}]);
        } else {
            var p = this.points;
            var pt = this.style.zAxis ? this.zPoint(obj) : this.util.snapAngle(obj, this.angleSnap / 180);
            this.setPoints([{x:p[0].x, y:p[0].y}, {x:pt.x, y:pt.y}]);
        }
        this.renderedOnce = true;
        this.onRender(this);
    }});
    dojo.setObject("dojox.drawing.tools.custom.Vector", Vector);
    Vector.setup = {name:"dojox.drawing.tools.custom.Vector", tooltip:"Vector Tool", iconClass:"iconVector"};
    if (0 && dojox.drawing.defaults.zAxisEnabled) {
        dojox.drawing.tools.custom.Vector.setup.secondary = {name:"vectorSecondary", label:"z-axis", funct:function (button) {
            button.selected ? this.zDeselect(button) : this.zSelect(button);
            var stencils = this.drawing.stencils.selectedStencils;
            for (var nm in stencils) {
                if (stencils[nm].shortType == "vector" && (stencils[nm].style.zAxis != dojox.drawing.defaults.zAxis)) {
                    var s = stencils[nm];
                    s.changeAxis();
                    if (s.style.zAxis) {
                        s.deselect();
                        s.select();
                    }
                }
            }
        }, setup:function () {
            var zAxis = dojox.drawing.defaults.zAxis;
            this.zSelect = function (button) {
                if (!button.enabled) {
                    return;
                }
                zAxis = true;
                dojox.drawing.defaults.zAxis = true;
                button.select();
                this.vectorTest();
                this.zSelected = button;
            };
            this.zDeselect = function (button) {
                if (!button.enabled) {
                    return;
                }
                zAxis = false;
                dojox.drawing.defaults.zAxis = false;
                button.deselect();
                this.vectorTest();
                this.zSelected = null;
            };
            this.vectorTest = function () {
                dojo.forEach(this.buttons, function (b) {
                    if (b.toolType == "vector" && b.selected) {
                        this.drawing.currentStencil.style.zAxis = zAxis;
                    }
                }, this);
            };
            dojo.connect(this, "onRenderStencil", this, function () {
                if (this.zSelected) {
                    this.zDeselect(this.zSelected);
                }
            });
            var c = dojo.connect(this.drawing, "onSurfaceReady", this, function () {
                dojo.disconnect(c);
                dojo.connect(this.drawing.stencils, "onSelect", this, function (stencil) {
                    if (stencil.shortType == "vector") {
                        if (stencil.style.zAxis) {
                            dojo.forEach(this.buttons, function (b) {
                                if (b.toolType == "vectorSecondary") {
                                    this.zSelect(b);
                                }
                            }, this);
                        } else {
                            dojo.forEach(this.buttons, function (b) {
                                if (b.toolType == "vectorSecondary") {
                                    this.zDeselect(b);
                                }
                            }, this);
                        }
                    }
                });
            });
        }, postSetup:function (btn) {
            dojo.connect(btn, "enable", function () {
                dojox.drawing.defaults.zAxisEnabled = true;
            });
            dojo.connect(btn, "disable", function () {
                dojox.drawing.defaults.zAxisEnabled = false;
            });
        }};
    }
    registry.register(Vector.setup, "tool");
    return Vector;
});

