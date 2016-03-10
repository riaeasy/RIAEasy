//>>built

define("dojox/drawing/manager/Anchors", ["dojo", "../util/oo", "../defaults"], function (dojo, oo, defaults) {
    var Anchor = oo.declare(function (options) {
        this.defaults = defaults.copy();
        this.mouse = options.mouse;
        this.point = options.point;
        this.pointIdx = options.pointIdx;
        this.util = options.util;
        this.id = options.id || this.util.uid("anchor");
        this.org = dojo.mixin({}, this.point);
        this.stencil = options.stencil;
        if (this.stencil.anchorPositionCheck) {
            this.anchorPositionCheck = dojo.hitch(this.stencil, this.stencil.anchorPositionCheck);
        }
        if (this.stencil.anchorConstrain) {
            this.anchorConstrain = dojo.hitch(this.stencil, this.stencil.anchorConstrain);
        }
        this._zCon = dojo.connect(this.mouse, "setZoom", this, "render");
        this.render();
        this.connectMouse();
    }, {y_anchor:null, x_anchor:null, render:function () {
        this.shape && this.shape.removeShape();
        var d = this.defaults.anchors, z = this.mouse.zoom, b = d.width * z, s = d.size * z, p = s / 2, line = {width:b, style:d.style, color:d.color, cap:d.cap};
        var _r = {x:this.point.x - p, y:this.point.y - p, width:s, height:s};
        this.shape = this.stencil.container.createRect(_r).setStroke(line).setFill(d.fill);
        this.shape.setTransform({dx:0, dy:0});
        this.util.attr(this, "drawingType", "anchor");
        this.util.attr(this, "id", this.id);
    }, onRenderStencil:function (anchor) {
    }, onTransformPoint:function (anchor) {
    }, onAnchorDown:function (obj) {
        this.selected = obj.id == this.id;
    }, onAnchorUp:function (obj) {
        this.selected = false;
        this.stencil.onTransformEnd(this);
    }, onAnchorDrag:function (obj) {
        if (this.selected) {
            var mx = this.shape.getTransform();
            var pmx = this.shape.getParent().getParent().getTransform();
            var marginZero = this.defaults.anchors.marginZero;
            var orgx = pmx.dx + this.org.x, orgy = pmx.dy + this.org.y, x = obj.x - orgx, y = obj.y - orgy, s = this.defaults.anchors.minSize;
            var conL, conR, conT, conB;
            var chk = this.anchorPositionCheck(x, y, this);
            if (chk.x < 0) {
                console.warn("X<0 Shift");
                while (this.anchorPositionCheck(x, y, this).x < 0) {
                    this.shape.getParent().getParent().applyTransform({dx:2, dy:0});
                }
            }
            if (chk.y < 0) {
                console.warn("Y<0 Shift");
                while (this.anchorPositionCheck(x, y, this).y < 0) {
                    this.shape.getParent().getParent().applyTransform({dx:0, dy:2});
                }
            }
            if (this.y_anchor) {
                if (this.org.y > this.y_anchor.org.y) {
                    conT = this.y_anchor.point.y + s - this.org.y;
                    conB = Infinity;
                    if (y < conT) {
                        y = conT;
                    }
                } else {
                    conT = -orgy + marginZero;
                    conB = this.y_anchor.point.y - s - this.org.y;
                    if (y < conT) {
                        y = conT;
                    } else {
                        if (y > conB) {
                            y = conB;
                        }
                    }
                }
            } else {
                conT = -orgy + marginZero;
                if (y < conT) {
                    y = conT;
                }
            }
            if (this.x_anchor) {
                if (this.org.x > this.x_anchor.org.x) {
                    conL = this.x_anchor.point.x + s - this.org.x;
                    conR = Infinity;
                    if (x < conL) {
                        x = conL;
                    }
                } else {
                    conL = -orgx + marginZero;
                    conR = this.x_anchor.point.x - s - this.org.x;
                    if (x < conL) {
                        x = conL;
                    } else {
                        if (x > conR) {
                            x = conR;
                        }
                    }
                }
            } else {
                conL = -orgx + marginZero;
                if (x < conL) {
                    x = conL;
                }
            }
            var constrained = this.anchorConstrain(x, y);
            if (constrained != null) {
                x = constrained.x;
                y = constrained.y;
            }
            this.shape.setTransform({dx:x, dy:y});
            if (this.linkedAnchor) {
                this.linkedAnchor.shape.setTransform({dx:x, dy:y});
            }
            this.onTransformPoint(this);
        }
    }, anchorConstrain:function (x, y) {
        return null;
    }, anchorPositionCheck:function (x, y, anchor) {
        return {x:1, y:1};
    }, setPoint:function (mx) {
        this.shape.applyTransform(mx);
    }, connectMouse:function () {
        this._mouseHandle = this.mouse.register(this);
    }, disconnectMouse:function () {
        this.mouse.unregister(this._mouseHandle);
    }, reset:function (stencil) {
    }, destroy:function () {
        dojo.disconnect(this._zCon);
        this.disconnectMouse();
        this.shape.removeShape();
    }});
    return oo.declare(function (options) {
        this.mouse = options.mouse;
        this.undo = options.undo;
        this.util = options.util;
        this.drawing = options.drawing;
        this.items = {};
    }, {onAddAnchor:function (anchor) {
    }, onReset:function (stencil) {
        var st = this.util.byId("drawing").stencils;
        st.onDeselect(stencil);
        st.onSelect(stencil);
    }, onRenderStencil:function () {
        for (var nm in this.items) {
            dojo.forEach(this.items[nm].anchors, function (a) {
                a.shape.moveToFront();
            });
        }
    }, onTransformPoint:function (anchor) {
        var anchors = this.items[anchor.stencil.id].anchors;
        var item = this.items[anchor.stencil.id].item;
        var pts = [];
        dojo.forEach(anchors, function (a, i) {
            if (anchor.id == a.id || anchor.stencil.anchorType != "group") {
            } else {
                if (anchor.org.y == a.org.y) {
                    a.setPoint({dx:0, dy:anchor.shape.getTransform().dy - a.shape.getTransform().dy});
                } else {
                    if (anchor.org.x == a.org.x) {
                        a.setPoint({dx:anchor.shape.getTransform().dx - a.shape.getTransform().dx, dy:0});
                    }
                }
                a.shape.moveToFront();
            }
            var mx = a.shape.getTransform();
            pts.push({x:mx.dx + a.org.x, y:mx.dy + a.org.y});
            if (a.point.t) {
                pts[pts.length - 1].t = a.point.t;
            }
        }, this);
        item.setPoints(pts);
        item.onTransform(anchor);
        this.onRenderStencil();
    }, onAnchorUp:function (anchor) {
    }, onAnchorDown:function (anchor) {
    }, onAnchorDrag:function (anchor) {
    }, onChangeStyle:function (stencil) {
        for (var nm in this.items) {
            dojo.forEach(this.items[nm].anchors, function (a) {
                a.shape.moveToFront();
            });
        }
    }, add:function (item) {
        this.items[item.id] = {item:item, anchors:[]};
        if (item.anchorType == "none") {
            return;
        }
        var pts = item.points;
        dojo.forEach(pts, function (p, i) {
            if (p.noAnchor) {
                return;
            }
            if (i == 0 || i == item.points.length - 1) {
                console.log("ITEM TYPE:", item.type, item.shortType);
            }
            var a = new Anchor({stencil:item, point:p, pointIdx:i, mouse:this.mouse, util:this.util});
            this.items[item.id]._cons = [dojo.connect(a, "onRenderStencil", this, "onRenderStencil"), dojo.connect(a, "reset", this, "onReset"), dojo.connect(a, "onAnchorUp", this, "onAnchorUp"), dojo.connect(a, "onAnchorDown", this, "onAnchorDown"), dojo.connect(a, "onAnchorDrag", this, "onAnchorDrag"), dojo.connect(a, "onTransformPoint", this, "onTransformPoint"), dojo.connect(item, "onChangeStyle", this, "onChangeStyle")];
            this.items[item.id].anchors.push(a);
            this.onAddAnchor(a);
        }, this);
        if (item.shortType == "path") {
            var f = pts[0], l = pts[pts.length - 1], a = this.items[item.id].anchors;
            if (f.x == l.x && f.y == l.y) {
                console.warn("LINK ANVHROS", a[0], a[a.length - 1]);
                a[0].linkedAnchor = a[a.length - 1];
                a[a.length - 1].linkedAnchor = a[0];
            }
        }
        if (item.anchorType == "group") {
            dojo.forEach(this.items[item.id].anchors, function (anchor) {
                dojo.forEach(this.items[item.id].anchors, function (a) {
                    if (anchor.id != a.id) {
                        if (anchor.org.y == a.org.y) {
                            anchor.x_anchor = a;
                        } else {
                            if (anchor.org.x == a.org.x) {
                                anchor.y_anchor = a;
                            }
                        }
                    }
                }, this);
            }, this);
        }
    }, remove:function (item) {
        if (!this.items[item.id]) {
            return;
        }
        dojo.forEach(this.items[item.id].anchors, function (a) {
            a.destroy();
        });
        dojo.forEach(this.items[item.id]._cons, dojo.disconnect, dojo);
        this.items[item.id].anchors = null;
        delete this.items[item.id];
    }});
});

