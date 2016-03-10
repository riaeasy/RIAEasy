//>>built

define("dojox/drawing/tools/custom/Axes", ["dojo/_base/lang", "../../util/oo", "../../manager/_registry", "../../stencil/Path", "../../annotations/Arrow", "../../annotations/Label", "../../tools/custom/Vector"], function (lang, oo, registry, StencilPath, Arrow, Label, Vector) {
    var Axes = oo.declare(StencilPath, function (options) {
        this.closePath = false;
        this.xArrow = new Arrow({stencil:this, idx1:0, idx2:1});
        this.yArrow = new Arrow({stencil:this, idx1:2, idx2:1});
        if (options.data) {
            this.style.zAxisEnabled = options.data.cosphi == 1 ? true : false;
            this.setData(options.data);
        }
        if (this.style.zAxisEnabled) {
            this.data.cosphi = 1;
            var ops = {};
            lang.mixin(ops, options);
            lang.mixin(ops, {container:this.container.createGroup(), style:this.style, showAngle:false, label:null});
            if (options.data && (!ops.data.radius || !ops.data.angle)) {
                ops.data.x2 = ops.data.x4;
                ops.data.y2 = ops.data.y4;
            }
            ops.style.zAxis = true;
            this.zAxis = new Vector(ops);
            this.zAxis.minimumSize = 5;
            this.connectMult([[this, "onChangeStyle", this.zAxis, "onChangeStyle"], [this, "select", this.zAxis, "select"], [this, "deselect", this.zAxis, "deselect"], [this, "onDelete", this.zAxis, "destroy"], [this, "onDrag", this, "zSet"], [this, "onTransform", this, "zSet"], [this.zAxis, "onBeforeRender", this, "zSet"], [this, "_onPostRender", this.zAxis, "render"]]);
        }
        if (this.points && this.points.length) {
            this.setPoints = this._postSetPoints;
            this.render();
            options.label && this.setLabel(options.label);
            options.shadow && this.addShadow(options.shadow);
        }
    }, {draws:true, type:"dojox.drawing.tools.custom.Axes", minimumSize:30, showAngle:true, closePath:false, baseRender:false, zScale:0.5, zPoint:function (obj) {
        obj.radius = this.util.length(obj);
        var pt = this.util.pointOnCircle(obj.start.x, obj.start.y, obj.radius * this.zScale, this.style.zAngle);
        return {x:pt.x, y:pt.y, skip:true, noAnchor:true};
    }, zSet:function () {
        if (!this.zAxis) {
            return;
        }
        var c = this.points[1];
        var z = this.points[3];
        var p = [{x:c.x, y:c.y}, {x:z.x, y:z.y}];
        var len = this.util.length({start:{x:c.x, y:c.y}, x:z.x, y:z.y});
        len > this.zAxis.minimumSize ? this.zAxis.setPoints(p) : false;
        this.zAxis.cosphi = 1;
    }, createLabels:function () {
        var props = {align:"middle", valign:"middle", util:this.util, annotation:true, container:this.container, mouse:this.mouse, stencil:this};
        this.labelX = new Label(lang.mixin(props, {labelPosition:this.setLabelX}));
        this.labelY = new Label(lang.mixin(props, {labelPosition:this.setLabelY}));
        if (this.style.zAxisEnabled) {
            this.labelZ = new Label(lang.mixin(props, {labelPosition:this.setLabelZ}));
        }
    }, setLabelX:function () {
        var ax = this.points[0];
        var c = this.points[1];
        var dist = 40;
        var offdist = 20;
        var pt, px, py, pt2;
        pt = this.util.lineSub(c.x, c.y, ax.x, ax.y, dist);
        px = pt.x + (pt.y - ax.y);
        py = pt.y + (ax.x - pt.x);
        pt2 = this.util.lineSub(pt.x, pt.y, px, py, (dist - offdist));
        return {x:pt2.x, y:pt2.y, width:20};
    }, setLabelY:function () {
        var c = this.points[1];
        var ay = this.points[2];
        var dist = 40;
        var offdist = 20;
        var pt, px, py, pt2;
        pt = this.util.lineSub(c.x, c.y, ay.x, ay.y, dist);
        px = pt.x + (ay.y - pt.y);
        py = pt.y + (pt.x - ay.x);
        pt2 = this.util.lineSub(pt.x, pt.y, px, py, (dist - offdist));
        return {x:pt2.x, y:pt2.y, width:20};
    }, setLabelZ:function () {
        var c = this.points[1];
        var z = this.points[3];
        var dist = 40;
        var offdist = 20;
        var pt, px, py, pt2;
        pt = this.util.lineSub(c.x, c.y, z.x, z.y, dist);
        px = pt.x + (pt.y - z.y);
        py = pt.y + (z.x - pt.x);
        pt2 = this.util.lineSub(pt.x, pt.y, px, py, (dist - offdist));
        return {x:pt2.x, y:pt2.y, width:20};
    }, setLabel:function (value) {
        if (this._labelsCreated) {
            return;
        }
        !this.labelX && this.createLabels();
        var x = "x";
        var y = "y";
        var z = "z";
        if (value) {
            if (this.labelZ) {
                var lbls = value.match(/(.*?)(and|&)(.*?)(and|&)(.*)/i);
                if (lbls.length > 4) {
                    x = lbls[1].replace(/^\s+/, "").replace(/\s+$/, "");
                    y = lbls[3].replace(/^\s+/, "").replace(/\s+$/, "");
                    z = lbls[5].replace(/^\s+/, "").replace(/\s+$/, "");
                }
            } else {
                var lbls = value.match(/(.*?)(and|&)(.*)/i);
                if (lbls.length > 2) {
                    x = lbls[1].replace(/^\s+/, "").replace(/\s+$/, "");
                    y = lbls[3].replace(/^\s+/, "").replace(/\s+$/, "");
                }
            }
        }
        this.labelX.setLabel(x);
        this.labelY.setLabel(y);
        if (this.labelZ) {
            this.labelZ.setLabel(z);
        }
        this._labelsCreated = true;
    }, getLabel:function () {
        if (!this.labelX) {
            return null;
        }
        return {x:this.labelX.getText(), y:this.labelY.getText(), z:this.labelZ ? this.labelZ.getText() : null};
    }, anchorPositionCheck:function (x, y, anchor) {
        var pm = this.container.getParent().getTransform();
        var am = anchor.shape.getTransform();
        var p = this.points;
        var o = {x:am.dx + anchor.org.x + pm.dx, y:am.dy + anchor.org.y + pm.dy};
        var c = {x:p[1].x + pm.dx, y:p[1].y + pm.dy};
        var ox = c.x - (c.y - o.y);
        var oy = c.y - (o.x - c.x);
        return {x:ox, y:oy};
    }, onTransformBegin:function (anchor) {
        this._isBeingModified = true;
    }, onTransformEnd:function (anchor) {
        if (!anchor) {
            return;
        }
        this._isBeingModified = false;
        this._toggleSelected();
        console.log("before:", Math.ceil(this.points[1].x), " x ", Math.ceil(this.points[1].y));
        var o = this.points[0];
        var c = this.points[1];
        var obj = {start:{x:c.x, y:c.y}, x:o.x, y:o.y};
        var pt = this.util.constrainAngle(obj, 0, 89);
        var zpt = this.style.zAxisEnabled ? this.zPoint(obj) : null;
        if (pt.x == o.x && pt.y == o.y) {
            pt = this.util.snapAngle(obj, this.angleSnap / 180);
            obj.x = pt.x;
            obj.y = pt.y;
            var ox = obj.start.x - (obj.start.y - obj.y);
            var oy = obj.start.y - (obj.x - obj.start.x);
            if (ox < 0 || oy < 0) {
                console.warn("AXES ERROR LESS THAN ZERO - ABORT");
                return;
            }
            this.points = [{x:obj.x, y:obj.y}, {x:obj.start.x, y:obj.start.y, noAnchor:true}];
            this.points.push({x:ox, y:oy, noAnchor:true});
            if (zpt) {
                this.points.push(zpt);
            }
            this.setPoints(this.points);
            this.onModify(this);
            return;
        }
        this.points[0].x = pt.x;
        this.points[0].y = pt.y;
        o = this.points[0];
        var ox = c.x - (c.y - o.y);
        var oy = c.y - (o.x - c.x);
        this.points[2] = {x:ox, y:oy, noAnchor:true};
        if (zpt) {
            this.points.push(zpt);
        }
        this.setPoints(this.points);
        this.labelX.setLabel();
        this.labelY.setLabel();
        if (this.labelZ) {
            this.labelZ.setLabel();
        }
        this.onModify(this);
    }, getBounds:function (absolute) {
        var px = this.points[0], pc = this.points[1], py = this.points[2];
        if (this.style.zAxisEnabled) {
            var pz = this.points[3];
        }
        if (absolute) {
            var bounds = {x:pc.x, y:pc.y, x1:pc.x, y1:pc.y, x2:px.x, y2:px.y, x3:py.x, y3:py.y};
            if (this.style.zAxisEnabled) {
                bounds.x4 = pz.x;
                bounds.y4 = pz.y;
            }
            return bounds;
        }
        var x1 = this.style.zAxisEnabled ? (py.x < pz.x ? py.x : pz.x) : py.x;
        y1 = py.y < px.y ? py.y : px.y, x2 = px.x, y2 = this.style.zAxisEnabled ? pz.y : pc.y;
        return {x1:x1, y1:y1, x2:x2, y2:y2, x:x1, y:y1, w:x2 - x1, h:y2 - y1};
    }, _postSetPoints:function (pts) {
        this.points[0] = pts[0];
        if (this.pointsToData) {
            this.data = this.pointsToData();
        }
    }, onTransform:function (anchor) {
        var o = this.points[0];
        var c = this.points[1];
        var ox = c.x - (c.y - o.y);
        var oy = c.y - (o.x - c.x);
        this.points[2] = {x:ox, y:oy, noAnchor:true};
        if (this.style.zAxisEnabled) {
            this.points[3] = this.zPoint({start:{x:c.x, y:c.y}, x:o.x, y:o.y});
        }
        this.setPoints(this.points);
        if (!this._isBeingModified) {
            this.onTransformBegin();
        }
        this.render();
    }, pointsToData:function () {
        var p = this.points;
        var d = {x1:p[1].x, y1:p[1].y, x2:p[0].x, y2:p[0].y, x3:p[2].x, y3:p[2].y};
        if (this.style.zAxisEnabled) {
            d.x4 = p[3].x;
            d.y4 = p[3].y;
            d.cosphi = 1;
        }
        return d;
    }, getRadius:function () {
        var p = this.points;
        var line = {start:{x:p[1].x, y:p[1].y}, x:p[0].x, y:p[0].y};
        return this.util.length(line);
    }, dataToPoints:function (o) {
        o = o || this.data;
        if (o.radius || o.angle) {
            var pt = this.util.pointOnCircle(o.x, o.y, o.radius, o.angle), zpt;
            var ox = o.x - (o.y - pt.y);
            var oy = o.y - (pt.x - o.x);
            if ((o.cosphi && o.cosphi == 1) || this.style.zAxisEnabled) {
                this.style.zAxisEnabled = true;
                zpt = this.util.pointOnCircle(o.x, o.y, o.radius * this.zScale, this.style.zAngle);
            }
            this.data = o = {x1:o.x, y1:o.y, x2:pt.x, y2:pt.y, x3:ox, y3:oy};
            if (this.style.zAxisEnabled) {
                this.data.x4 = o.x4 = zpt.x;
                this.data.y4 = o.y4 = zpt.y;
                this.data.cosphi = 1;
            }
        }
        this.points = [{x:o.x2, y:o.y2}, {x:o.x1, y:o.y1, noAnchor:true}, {x:o.x3, y:o.y3, noAnchor:true}];
        if (this.style.zAxisEnabled) {
            this.points.push({x:o.x4, y:o.y4, skip:true, noAnchor:true});
        }
        return this.points;
    }, onDrag:function (obj) {
        var pt = this.util.constrainAngle(obj, 0, 89);
        obj.x = pt.x;
        obj.y = pt.y;
        var ox = obj.start.x - (obj.start.y - obj.y);
        var oy = obj.start.y - (obj.x - obj.start.x);
        if (ox < 0 || oy < 0) {
            return;
        }
        this.points = [{x:obj.x, y:obj.y}, {x:obj.start.x, y:obj.start.y, noAnchor:true}];
        this.points.push({x:ox, y:oy, noAnchor:true});
        if (this.style.zAxisEnabled) {
            var zpt = this.zPoint(obj);
            this.points.push(zpt);
        }
        this.render();
    }, onUp:function (obj) {
        if (!this._downOnCanvas) {
            return;
        }
        this._downOnCanvas = false;
        var p = this.points;
        if (!p.length) {
            var s = obj.start, d = 100;
            this.points = [{x:s.x + d, y:s.y + d}, {x:s.x, y:s.y + d, noAnchor:true}, {x:s.x, y:s.y, noAnchor:true}];
            if (this.style.zAxisEnabled) {
                var zpt = this.zPoint({start:{x:s.x, y:s.y + d}, x:s.x + d, y:s.y + d});
                this.points.push(zpt);
            }
            this.setPoints = this._postSetPoints;
            this.pointsToData();
            this.render();
            this.onRender(this);
            return;
        }
        var len = this.util.distance(p[1].x, p[1].y, p[0].x, p[0].y);
        if (!p || !p.length) {
            return;
        } else {
            if (len < this.minimumSize) {
                this.remove(this.shape, this.hit);
                this.xArrow.remove(this.xArrow.shape, this.xArrow.hit);
                this.yArrow.remove(this.yArrow.shape, this.yArrow.hit);
                if (this.zArrow) {
                    this.zArrow.remove(this.zArrow.shape, this.zArrow.hit);
                }
                return;
            }
        }
        var o = p[0];
        var c = p[1];
        obj = {start:{x:c.x, y:c.y}, x:o.x, y:o.y};
        var pt = this.util.snapAngle(obj, this.angleSnap / 180);
        obj.x = pt.x;
        obj.y = pt.y;
        var ox = obj.start.x - (obj.start.y - obj.y);
        var oy = obj.start.y - (obj.x - obj.start.x);
        if (ox < 0 || oy < 0) {
            return;
        }
        this.points = [{x:obj.x, y:obj.y}, {x:obj.start.x, y:obj.start.y, noAnchor:true}];
        this.points.push({x:ox, y:oy, noAnchor:true});
        if (this.style.zAxisEnabled) {
            this.points.push(this.zPoint(obj));
        }
        this.onRender(this);
        this.setPoints = this._postSetPoints;
    }});
    lang.setObject("dojox.drawing.tools.custom.Axes", Axes);
    Axes.setup = {name:"dojox.drawing.tools.custom.Axes", tooltip:"Axes Tool", iconClass:"iconAxes"};
    registry.register(Axes.setup, "tool");
    return Axes;
});

