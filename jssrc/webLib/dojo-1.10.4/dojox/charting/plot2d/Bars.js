//>>built

define("dojox/charting/plot2d/Bars", ["dojo/_base/lang", "dojo/_base/array", "dojo/_base/declare", "dojo/has", "./CartesianBase", "./_PlotEvents", "./common", "dojox/gfx/fx", "dojox/lang/utils", "dojox/lang/functional", "dojox/lang/functional/reversed"], function (lang, arr, declare, has, CartesianBase, _PlotEvents, dc, fx, du, df, dfr) {
    var purgeGroup = dfr.lambda("item.purgeGroup()");
    return declare("dojox.charting.plot2d.Bars", [CartesianBase, _PlotEvents], {defaultParams:{gap:0, animate:null, enableCache:false}, optionalParams:{minBarSize:1, maxBarSize:1, stroke:{}, outline:{}, shadow:{}, fill:{}, filter:{}, styleFunc:null, font:"", fontColor:""}, constructor:function (chart, kwArgs) {
        this.opt = lang.clone(lang.mixin(this.opt, this.defaultParams));
        du.updateWithObject(this.opt, kwArgs);
        du.updateWithPattern(this.opt, kwArgs, this.optionalParams);
        this.animate = this.opt.animate;
        this.renderingOptions = {"shape-rendering":"crispEdges"};
    }, getSeriesStats:function () {
        var stats = dc.collectSimpleStats(this.series), t;
        stats.hmin -= 0.5;
        stats.hmax += 0.5;
        t = stats.hmin, stats.hmin = stats.vmin, stats.vmin = t;
        t = stats.hmax, stats.hmax = stats.vmax, stats.vmax = t;
        return stats;
    }, createRect:function (run, creator, params) {
        var rect;
        if (this.opt.enableCache && run._rectFreePool.length > 0) {
            rect = run._rectFreePool.pop();
            rect.setShape(params);
            creator.add(rect);
        } else {
            rect = creator.createRect(params);
        }
        if (this.opt.enableCache) {
            run._rectUsePool.push(rect);
        }
        return rect;
    }, createLabel:function (group, value, bbox, theme) {
        if (this.opt.labels && this.opt.labelStyle == "outside") {
            var y = bbox.y + bbox.height / 2;
            var x = bbox.x + bbox.width + this.opt.labelOffset;
            this.renderLabel(group, x, y, this._getLabel(isNaN(value.y) ? value : value.y), theme, "start");
        } else {
            this.inherited(arguments);
        }
    }, render:function (dim, offsets) {
        if (this.zoom && !this.isDataDirty()) {
            return this.performZoom(dim, offsets);
        }
        this.dirty = this.isDirty();
        this.resetEvents();
        var s;
        if (this.dirty) {
            arr.forEach(this.series, purgeGroup);
            this._eventSeries = {};
            this.cleanGroup();
            s = this.getGroup();
            df.forEachRev(this.series, function (item) {
                item.cleanGroup(s);
            });
        }
        var t = this.chart.theme, ht = this._hScaler.scaler.getTransformerFromModel(this._hScaler), vt = this._vScaler.scaler.getTransformerFromModel(this._vScaler), baseline = Math.max(0, this._hScaler.bounds.lower), baselineWidth = ht(baseline), events = this.events();
        var bar = this.getBarProperties();
        var actualLength = this.series.length;
        arr.forEach(this.series, function (serie) {
            if (serie.hidden) {
                actualLength--;
            }
        });
        var z = actualLength;
        for (var i = this.series.length - 1; i >= 0; --i) {
            var run = this.series[i];
            if (!this.dirty && !run.dirty) {
                t.skip();
                this._reconnectEvents(run.name);
                continue;
            }
            run.cleanGroup();
            if (this.opt.enableCache) {
                run._rectFreePool = (run._rectFreePool ? run._rectFreePool : []).concat(run._rectUsePool ? run._rectUsePool : []);
                run._rectUsePool = [];
            }
            var theme = t.next("bar", [this.opt, run]);
            if (run.hidden) {
                run.dyn.fill = theme.series.fill;
                run.dyn.stroke = theme.series.stroke;
                continue;
            }
            z--;
            var eventSeries = new Array(run.data.length);
            s = run.group;
            var indexed = arr.some(run.data, function (item) {
                return typeof item == "number" || (item && !item.hasOwnProperty("x"));
            });
            var min = indexed ? Math.max(0, Math.floor(this._vScaler.bounds.from - 1)) : 0;
            var max = indexed ? Math.min(run.data.length, Math.ceil(this._vScaler.bounds.to)) : run.data.length;
            for (var j = min; j < max; ++j) {
                var value = run.data[j];
                if (value != null) {
                    var val = this.getValue(value, j, i, indexed), hv = ht(val.y), w = Math.abs(hv - baselineWidth), finalTheme, sshape;
                    if (this.opt.styleFunc || typeof value != "number") {
                        var tMixin = typeof value != "number" ? [value] : [];
                        if (this.opt.styleFunc) {
                            tMixin.push(this.opt.styleFunc(value));
                        }
                        finalTheme = t.addMixin(theme, "bar", tMixin, true);
                    } else {
                        finalTheme = t.post(theme, "bar");
                    }
                    if (w >= 0 && bar.height >= 1) {
                        var rect = {x:offsets.l + (val.y < baseline ? hv : baselineWidth), y:dim.height - offsets.b - vt(val.x + 1.5) + bar.gap + bar.thickness * (actualLength - z - 1), width:w, height:bar.height};
                        if (finalTheme.series.shadow) {
                            var srect = lang.clone(rect);
                            srect.x += finalTheme.series.shadow.dx;
                            srect.y += finalTheme.series.shadow.dy;
                            sshape = this.createRect(run, s, srect).setFill(finalTheme.series.shadow.color).setStroke(finalTheme.series.shadow);
                            if (this.animate) {
                                this._animateBar(sshape, offsets.l + baselineWidth, -w);
                            }
                        }
                        var specialFill = this._plotFill(finalTheme.series.fill, dim, offsets);
                        specialFill = this._shapeFill(specialFill, rect);
                        var shape = this.createRect(run, s, rect).setFill(specialFill).setStroke(finalTheme.series.stroke);
                        if (shape.setFilter && finalTheme.series.filter) {
                            shape.setFilter(finalTheme.series.filter);
                        }
                        run.dyn.fill = shape.getFill();
                        run.dyn.stroke = shape.getStroke();
                        if (events) {
                            var o = {element:"bar", index:j, run:run, shape:shape, shadow:sshape, cx:val.y, cy:val.x + 1.5, x:indexed ? j : run.data[j].x, y:indexed ? run.data[j] : run.data[j].y};
                            this._connectEvents(o);
                            eventSeries[j] = o;
                        }
                        if (!isNaN(val.py) && val.py > baseline) {
                            rect.x += ht(val.py);
                            rect.width -= ht(val.py);
                        }
                        this.createLabel(s, value, rect, finalTheme);
                        if (this.animate) {
                            this._animateBar(shape, offsets.l + baselineWidth, -w);
                        }
                    }
                }
            }
            this._eventSeries[run.name] = eventSeries;
            run.dirty = false;
        }
        this.dirty = false;
        if (0) {
            this._checkOrientation(this.group, dim, offsets);
        }
        return this;
    }, getValue:function (value, j, seriesIndex, indexed) {
        var y, x;
        if (indexed) {
            if (typeof value == "number") {
                y = value;
            } else {
                y = value.y;
            }
            x = j;
        } else {
            y = value.y;
            x = value.x - 1;
        }
        return {y:y, x:x};
    }, getBarProperties:function () {
        var f = dc.calculateBarSize(this._vScaler.bounds.scale, this.opt);
        return {gap:f.gap, height:f.size, thickness:0};
    }, _animateBar:function (shape, hoffset, hsize) {
        if (hsize == 0) {
            hsize = 1;
        }
        fx.animateTransform(lang.delegate({shape:shape, duration:1200, transform:[{name:"translate", start:[hoffset - (hoffset / hsize), 0], end:[0, 0]}, {name:"scale", start:[1 / hsize, 1], end:[1, 1]}, {name:"original"}]}, this.animate)).play();
    }});
});

