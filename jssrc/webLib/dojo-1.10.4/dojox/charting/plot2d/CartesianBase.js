//>>built

define("dojox/charting/plot2d/CartesianBase", ["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/connect", "dojo/has", "./Base", "../scaler/primitive", "dojox/gfx", "dojox/gfx/fx", "dojox/lang/utils"], function (lang, declare, hub, has, Base, primitive, gfx, fx, du) {
    return declare("dojox.charting.plot2d.CartesianBase", Base, {baseParams:{hAxis:"x", vAxis:"y", labels:false, labelOffset:10, fixed:true, precision:1, labelStyle:"inside", htmlLabels:true, omitLabels:true, labelFunc:null}, constructor:function (chart, kwArgs) {
        this.axes = ["hAxis", "vAxis"];
        this.zoom = null;
        this.zoomQueue = [];
        this.lastWindow = {vscale:1, hscale:1, xoffset:0, yoffset:0};
        this.hAxis = (kwArgs && kwArgs.hAxis) || "x";
        this.vAxis = (kwArgs && kwArgs.vAxis) || "y";
        this.series = [];
        this.opt = lang.clone(this.baseParams);
        du.updateWithObject(this.opt, kwArgs);
    }, clear:function () {
        this.inherited(arguments);
        this._hAxis = null;
        this._vAxis = null;
        return this;
    }, cleanGroup:function (creator, noClip) {
        this.inherited(arguments);
        if (!noClip && this.chart._nativeClip) {
            var offsets = this.chart.offsets, dim = this.chart.dim;
            var w = Math.max(0, dim.width - offsets.l - offsets.r), h = Math.max(0, dim.height - offsets.t - offsets.b);
            this.group.setClip({x:offsets.l, y:offsets.t, width:w, height:h});
            if (!this._clippedGroup) {
                this._clippedGroup = this.group.createGroup();
            }
        }
    }, purgeGroup:function () {
        this.inherited(arguments);
        this._clippedGroup = null;
    }, getGroup:function () {
        return this._clippedGroup || this.group;
    }, setAxis:function (axis) {
        if (axis) {
            this[axis.vertical ? "_vAxis" : "_hAxis"] = axis;
        }
        return this;
    }, toPage:function (coord) {
        var ah = this._hAxis, av = this._vAxis, sh = ah.getScaler(), sv = av.getScaler(), th = sh.scaler.getTransformerFromModel(sh), tv = sv.scaler.getTransformerFromModel(sv), c = this.chart.getCoords(), o = this.chart.offsets, dim = this.chart.dim;
        var t = function (coord) {
            var r = {};
            r.x = th(coord[ah.name]) + c.x + o.l;
            r.y = c.y + dim.height - o.b - tv(coord[av.name]);
            return r;
        };
        return coord ? t(coord) : t;
    }, toData:function (coord) {
        var ah = this._hAxis, av = this._vAxis, sh = ah.getScaler(), sv = av.getScaler(), th = sh.scaler.getTransformerFromPlot(sh), tv = sv.scaler.getTransformerFromPlot(sv), c = this.chart.getCoords(), o = this.chart.offsets, dim = this.chart.dim;
        var t = function (coord) {
            var r = {};
            r[ah.name] = th(coord.x - c.x - o.l);
            r[av.name] = tv(c.y + dim.height - coord.y - o.b);
            return r;
        };
        return coord ? t(coord) : t;
    }, isDirty:function () {
        return this.dirty || this._hAxis && this._hAxis.dirty || this._vAxis && this._vAxis.dirty;
    }, createLabel:function (group, value, bbox, theme) {
        if (this.opt.labels) {
            var x, y, label = this.opt.labelFunc ? this.opt.labelFunc.apply(this, [value, this.opt.fixed, this.opt.precision]) : this._getLabel(isNaN(value.y) ? value : value.y);
            if (this.opt.labelStyle == "inside") {
                var lbox = gfx._base._getTextBox(label, {font:theme.series.font});
                x = bbox.x + bbox.width / 2;
                y = bbox.y + bbox.height / 2 + lbox.h / 4;
                if (lbox.w > bbox.width || lbox.h > bbox.height) {
                    return;
                }
            } else {
                x = bbox.x + bbox.width / 2;
                y = bbox.y - this.opt.labelOffset;
            }
            this.renderLabel(group, x, y, label, theme, this.opt.labelStyle == "inside");
        }
    }, performZoom:function (dim, offsets) {
        var vs = this._vAxis.scale || 1, hs = this._hAxis.scale || 1, vOffset = dim.height - offsets.b, hBounds = this._hScaler.bounds, xOffset = (hBounds.from - hBounds.lower) * hBounds.scale, vBounds = this._vScaler.bounds, yOffset = (vBounds.from - vBounds.lower) * vBounds.scale, rVScale = vs / this.lastWindow.vscale, rHScale = hs / this.lastWindow.hscale, rXOffset = (this.lastWindow.xoffset - xOffset) / ((this.lastWindow.hscale == 1) ? hs : this.lastWindow.hscale), rYOffset = (yOffset - this.lastWindow.yoffset) / ((this.lastWindow.vscale == 1) ? vs : this.lastWindow.vscale), shape = this.getGroup(), anim = fx.animateTransform(lang.delegate({shape:shape, duration:1200, transform:[{name:"translate", start:[0, 0], end:[offsets.l * (1 - rHScale), vOffset * (1 - rVScale)]}, {name:"scale", start:[1, 1], end:[rHScale, rVScale]}, {name:"original"}, {name:"translate", start:[0, 0], end:[rXOffset, rYOffset]}]}, this.zoom));
        lang.mixin(this.lastWindow, {vscale:vs, hscale:hs, xoffset:xOffset, yoffset:yOffset});
        this.zoomQueue.push(anim);
        hub.connect(anim, "onEnd", this, function () {
            this.zoom = null;
            this.zoomQueue.shift();
            if (this.zoomQueue.length > 0) {
                this.zoomQueue[0].play();
            }
        });
        if (this.zoomQueue.length == 1) {
            this.zoomQueue[0].play();
        }
        return this;
    }, initializeScalers:function (dim, stats) {
        if (this._hAxis) {
            if (!this._hAxis.initialized()) {
                this._hAxis.calculate(stats.hmin, stats.hmax, dim.width);
            }
            this._hScaler = this._hAxis.getScaler();
        } else {
            this._hScaler = primitive.buildScaler(stats.hmin, stats.hmax, dim.width);
        }
        if (this._vAxis) {
            if (!this._vAxis.initialized()) {
                this._vAxis.calculate(stats.vmin, stats.vmax, dim.height);
            }
            this._vScaler = this._vAxis.getScaler();
        } else {
            this._vScaler = primitive.buildScaler(stats.vmin, stats.vmax, dim.height);
        }
        return this;
    }});
});

