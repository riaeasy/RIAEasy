//>>built

define("dojox/charting/plot2d/Grid", ["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/array", "dojo/sniff", "./CartesianBase", "./common", "dojox/lang/utils", "dojox/gfx/fx"], function (lang, declare, arr, has, CartesianBase, dc, du, fx) {
    var sortTicks = function (a, b) {
        return a.value - b.value;
    };
    return declare("dojox.charting.plot2d.Grid", CartesianBase, {defaultParams:{hMajorLines:true, hMinorLines:false, vMajorLines:true, vMinorLines:false, hStripes:false, vStripes:false, animate:null, enableCache:false, renderOnAxis:true}, optionalParams:{majorHLine:{}, minorHLine:{}, majorVLine:{}, minorVLine:{}, hFill:{}, vFill:{}, hAlternateFill:{}, vAlternateFill:{}}, constructor:function (chart, kwArgs) {
        this.opt = lang.clone(this.defaultParams);
        du.updateWithObject(this.opt, kwArgs);
        du.updateWithPattern(this.opt, kwArgs, this.optionalParams);
        this.animate = this.opt.animate;
        if (this.opt.enableCache) {
            this._lineFreePool = [];
            this._lineUsePool = [];
            this._rectFreePool = [];
            this._rectUsePool = [];
        }
    }, addSeries:function (run) {
        return this;
    }, getSeriesStats:function () {
        return lang.delegate(dc.defaultStats);
    }, cleanGroup:function () {
        this.inherited(arguments);
        if (this.opt.enableCache) {
            this._lineFreePool = this._lineFreePool.concat(this._lineUsePool);
            this._lineUsePool = [];
            this._rectFreePool = this._rectFreePool.concat(this._rectUsePool);
            this._rectUsePool = [];
        }
    }, createLine:function (creator, params) {
        var line;
        if (this.opt.enableCache && this._lineFreePool.length > 0) {
            line = this._lineFreePool.pop();
            line.setShape(params);
            creator.add(line);
        } else {
            line = creator.createLine(params);
        }
        if (this.opt.enableCache) {
            this._lineUsePool.push(line);
        }
        return line;
    }, createRect:function (creator, params) {
        var rect;
        if (this.opt.enableCache && this._rectFreePool.length > 0) {
            rect = this._rectFreePool.pop();
            rect.setShape(params);
            creator.add(rect);
        } else {
            rect = creator.createRect(params);
        }
        if (this.opt.enableCache) {
            this._rectUsePool.push(rect);
        }
        return rect;
    }, render:function (dim, offsets) {
        if (this.zoom) {
            return this.performZoom(dim, offsets);
        }
        this.dirty = this.isDirty();
        if (!this.dirty) {
            return this;
        }
        this.cleanGroup();
        var s = this.getGroup(), ta = this.chart.theme, lineStroke, ticks;
        if ((has("ios") && has("ios") < 6) || has("android") || (has("safari") && !has("ios"))) {
            var w = Math.max(0, dim.width - offsets.l - offsets.r), h = Math.max(0, dim.height - offsets.t - offsets.b);
            s.createRect({x:offsets.l, y:offsets.t, width:w, height:h});
        }
        if (this._vAxis) {
            ticks = this._vAxis.getTicks();
            var vScaler = this._vAxis.getScaler();
            if (ticks != null && vScaler != null) {
                var vt = vScaler.scaler.getTransformerFromModel(vScaler);
                if (this.opt.hStripes) {
                    this._renderHRect(ticks, ta.grid, dim, offsets, vScaler, vt);
                }
                if (this.opt.hMinorLines) {
                    lineStroke = this.opt.minorHLine || (ta.grid && ta.grid.minorLine) || ta.axis.minorTick;
                    this._renderHLines(ticks.minor, lineStroke, dim, offsets, vScaler, vt);
                }
                if (this.opt.hMajorLines) {
                    lineStroke = this.opt.majorHLine || (ta.grid && ta.grid.majorLine) || ta.axis.majorTick;
                    this._renderHLines(ticks.major, lineStroke, dim, offsets, vScaler, vt);
                }
            }
        }
        if (this._hAxis) {
            ticks = this._hAxis.getTicks();
            var hScaler = this._hAxis.getScaler();
            if (ticks != null && hScaler != null) {
                var ht = hScaler.scaler.getTransformerFromModel(hScaler);
                if (this.opt.vStripes) {
                    this._renderVRect(ticks, ta.grid, dim, offsets, hScaler, ht);
                }
                if (ticks && this.opt.vMinorLines) {
                    lineStroke = this.opt.minorVLine || (ta.grid && ta.grid.minorLine) || ta.axis.minorTick;
                    this._renderVLines(ticks.minor, lineStroke, dim, offsets, hScaler, ht);
                }
                if (ticks && this.opt.vMajorLines) {
                    lineStroke = this.opt.majorVLine || (ta.grid && ta.grid.majorLine) || ta.axis.majorTick;
                    this._renderVLines(ticks.major, lineStroke, dim, offsets, hScaler, ht);
                }
            }
        }
        this.dirty = false;
        return this;
    }, _renderHLines:function (ticks, lineStroke, dim, offsets, vScaler, vt) {
        var s = this.getGroup();
        arr.forEach(ticks, function (tick) {
            if (!this.opt.renderOnAxis && tick.value == (this._vAxis.opt.leftBottom ? vScaler.bounds.from : vScaler.bounds.to)) {
                return;
            }
            var y = dim.height - offsets.b - vt(tick.value);
            var hLine = this.createLine(s, {x1:offsets.l, y1:y, x2:dim.width - offsets.r, y2:y}).setStroke(lineStroke);
            if (this.animate) {
                this._animateGrid(hLine, "h", offsets.l, offsets.r + offsets.l - dim.width);
            }
        }, this);
    }, _renderVLines:function (ticks, lineStroke, dim, offsets, hScaler, ht) {
        var s = this.getGroup();
        arr.forEach(ticks, function (tick) {
            if (!this.opt.renderOnAxis && tick.value == (this._hAxis.opt.leftBottom ? hScaler.bounds.from : hScaler.bounds.to)) {
                return;
            }
            var x = offsets.l + ht(tick.value);
            var vLine = this.createLine(s, {x1:x, y1:offsets.t, x2:x, y2:dim.height - offsets.b}).setStroke(lineStroke);
            if (this.animate) {
                this._animateGrid(vLine, "v", dim.height - offsets.b, dim.height - offsets.b - offsets.t);
            }
        }, this);
    }, _renderHRect:function (ticks, theme, dim, offsets, vScaler, vt) {
        var fill, tick, y, y2, hStripe;
        var allTicks = ticks.major.concat(ticks.minor);
        allTicks.sort(sortTicks);
        if (allTicks[0].value > vScaler.bounds.from) {
            allTicks.splice(0, 0, {value:vScaler.bounds.from});
        }
        if (allTicks[allTicks.length - 1].value < vScaler.bounds.to) {
            allTicks.push({value:vScaler.bounds.to});
        }
        var s = this.getGroup();
        for (var j = 0; j < allTicks.length - 1; j++) {
            tick = allTicks[j];
            y = dim.height - offsets.b - vt(tick.value);
            y2 = dim.height - offsets.b - vt(allTicks[j + 1].value);
            fill = (j % 2 == 0) ? (this.opt.hAlternateFill || (theme && theme.alternateFill)) : (this.opt.hFill || (theme && theme.fill));
            if (fill) {
                hStripe = this.createRect(s, {x:offsets.l, y:y, width:dim.width - offsets.r, height:y - y2}).setFill(fill);
                if (this.animate) {
                    this._animateGrid(hStripe, "h", offsets.l, offsets.r + offsets.l - dim.width);
                }
            }
        }
    }, _renderVRect:function (ticks, theme, dim, offsets, hScaler, ht) {
        var fill, tick, x, x2, vStripe;
        var allTicks = ticks.major.concat(ticks.minor);
        allTicks.sort(sortTicks);
        if (allTicks[0].value > hScaler.bounds.from) {
            allTicks.splice(0, 0, {value:hScaler.bounds.from});
        }
        if (allTicks[allTicks.length - 1].value < hScaler.bounds.to) {
            allTicks.push({value:hScaler.bounds.to});
        }
        var s = this.getGroup();
        for (var j = 0; j < allTicks.length - 1; j++) {
            tick = allTicks[j];
            x = offsets.l + ht(tick.value);
            x2 = offsets.l + ht(allTicks[j + 1].value);
            fill = (j % 2 == 0) ? (this.opt.vAlternateFill || (theme && theme.alternateFill)) : (this.opt.vFill || (theme && theme.fill));
            if (fill) {
                vStripe = this.createRect(s, {x:x, y:offsets.t, width:x2 - x, height:dim.width - offsets.r}).setFill(fill);
                if (this.animate) {
                    this._animateGrid(vStripe, "v", dim.height - offsets.b, dim.height - offsets.b - offsets.t);
                }
            }
        }
    }, _animateGrid:function (shape, type, offset, size) {
        var transStart = type == "h" ? [offset, 0] : [0, offset];
        var scaleStart = type == "h" ? [1 / size, 1] : [1, 1 / size];
        fx.animateTransform(lang.delegate({shape:shape, duration:1200, transform:[{name:"translate", start:transStart, end:[0, 0]}, {name:"scale", start:scaleStart, end:[1, 1]}, {name:"original"}]}, this.animate)).play();
    }});
});

