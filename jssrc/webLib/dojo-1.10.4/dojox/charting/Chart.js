//>>built

define("dojox/charting/Chart", ["../main", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/declare", "dojo/dom-style", "dojo/dom", "dojo/dom-geometry", "dojo/dom-construct", "dojo/_base/Color", "dojo/sniff", "./Element", "./SimpleTheme", "./Series", "./axis2d/common", "dojox/gfx/shape", "dojox/gfx", "require", "dojox/lang/functional", "dojox/lang/functional/fold", "dojox/lang/functional/reversed"], function (dojox, lang, arr, declare, domStyle, dom, domGeom, domConstruct, Color, has, Element, SimpleTheme, Series, common, shape, g, BidiChart, func) {
    var dc = lang.getObject("charting", true, dojox), clear = func.lambda("item.clear()"), purge = func.lambda("item.purgeGroup()"), destroy = func.lambda("item.destroy()"), makeClean = func.lambda("item.dirty = false"), makeDirty = func.lambda("item.dirty = true"), getName = func.lambda("item.name");
    var Chart = declare(0 ? "dojox.charting.NonBidiChart" : "dojox.charting.Chart", null, {constructor:function (node, kwArgs) {
        if (!kwArgs) {
            kwArgs = {};
        }
        this.margins = kwArgs.margins ? kwArgs.margins : {l:10, t:10, r:10, b:10};
        this.stroke = kwArgs.stroke;
        this.fill = kwArgs.fill;
        this.delayInMs = kwArgs.delayInMs || 200;
        this.title = kwArgs.title;
        this.titleGap = kwArgs.titleGap;
        this.titlePos = kwArgs.titlePos;
        this.titleFont = kwArgs.titleFont;
        this.titleFontColor = kwArgs.titleFontColor;
        this.chartTitle = null;
        this.htmlLabels = true;
        if ("htmlLabels" in kwArgs) {
            this.htmlLabels = kwArgs.htmlLabels;
        }
        this.theme = null;
        this.axes = {};
        this.stack = [];
        this.plots = {};
        this.series = [];
        this.runs = {};
        this.dirty = true;
        this.node = dom.byId(node);
        var box = domGeom.getMarginBox(node);
        this.surface = g.createSurface(this.node, box.w || 400, box.h || 300);
        if (this.surface.declaredClass.indexOf("vml") == -1) {
            this._nativeClip = true;
        }
    }, destroy:function () {
        arr.forEach(this.series, destroy);
        arr.forEach(this.stack, destroy);
        func.forIn(this.axes, destroy);
        this.surface.destroy();
        if (this.chartTitle && this.chartTitle.tagName) {
            domConstruct.destroy(this.chartTitle);
        }
    }, getCoords:function () {
        var node = this.node;
        var s = domStyle.getComputedStyle(node), coords = domGeom.getMarginBox(node, s);
        var abs = domGeom.position(node, true);
        coords.x = abs.x;
        coords.y = abs.y;
        return coords;
    }, setTheme:function (theme) {
        this.theme = theme.clone();
        this.dirty = true;
        return this;
    }, addAxis:function (name, kwArgs) {
        var axis, axisType = kwArgs && kwArgs.type || "Default";
        if (typeof axisType == "string") {
            if (!dc.axis2d || !dc.axis2d[axisType]) {
                throw Error("Can't find axis: " + axisType + " - Check " + "require() dependencies.");
            }
            axis = new dc.axis2d[axisType](this, kwArgs);
        } else {
            axis = new axisType(this, kwArgs);
        }
        axis.name = name;
        axis.dirty = true;
        if (name in this.axes) {
            this.axes[name].destroy();
        }
        this.axes[name] = axis;
        this.dirty = true;
        return this;
    }, getAxis:function (name) {
        return this.axes[name];
    }, removeAxis:function (name) {
        if (name in this.axes) {
            this.axes[name].destroy();
            delete this.axes[name];
            this.dirty = true;
        }
        return this;
    }, addPlot:function (name, kwArgs) {
        var plot, plotType = kwArgs && kwArgs.type || "Default";
        if (typeof plotType == "string") {
            if (!dc.plot2d || !dc.plot2d[plotType]) {
                throw Error("Can't find plot: " + plotType + " - didn't you forget to dojo" + ".require() it?");
            }
            plot = new dc.plot2d[plotType](this, kwArgs);
        } else {
            plot = new plotType(this, kwArgs);
        }
        plot.name = name;
        plot.dirty = true;
        if (name in this.plots) {
            this.stack[this.plots[name]].destroy();
            this.stack[this.plots[name]] = plot;
        } else {
            this.plots[name] = this.stack.length;
            this.stack.push(plot);
        }
        this.dirty = true;
        return this;
    }, getPlot:function (name) {
        return this.stack[this.plots[name]];
    }, removePlot:function (name) {
        if (name in this.plots) {
            var index = this.plots[name];
            delete this.plots[name];
            this.stack[index].destroy();
            this.stack.splice(index, 1);
            func.forIn(this.plots, function (idx, name, plots) {
                if (idx > index) {
                    plots[name] = idx - 1;
                }
            });
            var ns = arr.filter(this.series, function (run) {
                return run.plot != name;
            });
            if (ns.length < this.series.length) {
                arr.forEach(this.series, function (run) {
                    if (run.plot == name) {
                        run.destroy();
                    }
                });
                this.runs = {};
                arr.forEach(ns, function (run, index) {
                    this.runs[run.plot] = index;
                }, this);
                this.series = ns;
            }
            this.dirty = true;
        }
        return this;
    }, getPlotOrder:function () {
        return func.map(this.stack, getName);
    }, setPlotOrder:function (newOrder) {
        var names = {}, order = func.filter(newOrder, function (name) {
            if (!(name in this.plots) || (name in names)) {
                return false;
            }
            names[name] = 1;
            return true;
        }, this);
        if (order.length < this.stack.length) {
            func.forEach(this.stack, function (plot) {
                var name = plot.name;
                if (!(name in names)) {
                    order.push(name);
                }
            });
        }
        var newStack = func.map(order, function (name) {
            return this.stack[this.plots[name]];
        }, this);
        func.forEach(newStack, function (plot, i) {
            this.plots[plot.name] = i;
        }, this);
        this.stack = newStack;
        this.dirty = true;
        return this;
    }, movePlotToFront:function (name) {
        if (name in this.plots) {
            var index = this.plots[name];
            if (index) {
                var newOrder = this.getPlotOrder();
                newOrder.splice(index, 1);
                newOrder.unshift(name);
                return this.setPlotOrder(newOrder);
            }
        }
        return this;
    }, movePlotToBack:function (name) {
        if (name in this.plots) {
            var index = this.plots[name];
            if (index < this.stack.length - 1) {
                var newOrder = this.getPlotOrder();
                newOrder.splice(index, 1);
                newOrder.push(name);
                return this.setPlotOrder(newOrder);
            }
        }
        return this;
    }, addSeries:function (name, data, kwArgs) {
        var run = new Series(this, data, kwArgs);
        run.name = name;
        if (name in this.runs) {
            this.series[this.runs[name]].destroy();
            this.series[this.runs[name]] = run;
        } else {
            this.runs[name] = this.series.length;
            this.series.push(run);
        }
        this.dirty = true;
        if (!("ymin" in run) && "min" in run) {
            run.ymin = run.min;
        }
        if (!("ymax" in run) && "max" in run) {
            run.ymax = run.max;
        }
        return this;
    }, getSeries:function (name) {
        return this.series[this.runs[name]];
    }, removeSeries:function (name) {
        if (name in this.runs) {
            var index = this.runs[name];
            delete this.runs[name];
            this.series[index].destroy();
            this.series.splice(index, 1);
            func.forIn(this.runs, function (idx, name, runs) {
                if (idx > index) {
                    runs[name] = idx - 1;
                }
            });
            this.dirty = true;
        }
        return this;
    }, updateSeries:function (name, data, offsets) {
        if (name in this.runs) {
            var run = this.series[this.runs[name]];
            run.update(data);
            if (offsets) {
                this.dirty = true;
            } else {
                this._invalidateDependentPlots(run.plot, false);
                this._invalidateDependentPlots(run.plot, true);
            }
        }
        return this;
    }, getSeriesOrder:function (plotName) {
        return func.map(func.filter(this.series, function (run) {
            return run.plot == plotName;
        }), getName);
    }, setSeriesOrder:function (newOrder) {
        var plotName, names = {}, order = func.filter(newOrder, function (name) {
            if (!(name in this.runs) || (name in names)) {
                return false;
            }
            var run = this.series[this.runs[name]];
            if (plotName) {
                if (run.plot != plotName) {
                    return false;
                }
            } else {
                plotName = run.plot;
            }
            names[name] = 1;
            return true;
        }, this);
        func.forEach(this.series, function (run) {
            var name = run.name;
            if (!(name in names) && run.plot == plotName) {
                order.push(name);
            }
        });
        var newSeries = func.map(order, function (name) {
            return this.series[this.runs[name]];
        }, this);
        this.series = newSeries.concat(func.filter(this.series, function (run) {
            return run.plot != plotName;
        }));
        func.forEach(this.series, function (run, i) {
            this.runs[run.name] = i;
        }, this);
        this.dirty = true;
        return this;
    }, moveSeriesToFront:function (name) {
        if (name in this.runs) {
            var index = this.runs[name], newOrder = this.getSeriesOrder(this.series[index].plot);
            if (name != newOrder[0]) {
                newOrder.splice(index, 1);
                newOrder.unshift(name);
                return this.setSeriesOrder(newOrder);
            }
        }
        return this;
    }, moveSeriesToBack:function (name) {
        if (name in this.runs) {
            var index = this.runs[name], newOrder = this.getSeriesOrder(this.series[index].plot);
            if (name != newOrder[newOrder.length - 1]) {
                newOrder.splice(index, 1);
                newOrder.push(name);
                return this.setSeriesOrder(newOrder);
            }
        }
        return this;
    }, resize:function (width, height) {
        switch (arguments.length) {
          case 1:
            domGeom.setMarginBox(this.node, width);
            break;
          case 2:
            domGeom.setMarginBox(this.node, {w:width, h:height});
            break;
        }
        var box = domGeom.getMarginBox(this.node);
        var d = this.surface.getDimensions();
        if (d.width != box.w || d.height != box.h) {
            this.surface.setDimensions(box.w, box.h);
            this.dirty = true;
            return this.render();
        } else {
            return this;
        }
    }, getGeometry:function () {
        var ret = {};
        func.forIn(this.axes, function (axis) {
            if (axis.initialized()) {
                ret[axis.name] = {name:axis.name, vertical:axis.vertical, scaler:axis.scaler, ticks:axis.ticks};
            }
        });
        return ret;
    }, setAxisWindow:function (name, scale, offset, zoom) {
        var axis = this.axes[name];
        if (axis) {
            axis.setWindow(scale, offset);
            arr.forEach(this.stack, function (plot) {
                if (plot.hAxis == name || plot.vAxis == name) {
                    plot.zoom = zoom;
                }
            });
        }
        return this;
    }, setWindow:function (sx, sy, dx, dy, zoom) {
        if (!("plotArea" in this)) {
            this.calculateGeometry();
        }
        func.forIn(this.axes, function (axis) {
            var scale, offset, bounds = axis.getScaler().bounds, s = bounds.span / (bounds.upper - bounds.lower);
            if (axis.vertical) {
                scale = sy;
                offset = dy / s / scale;
            } else {
                scale = sx;
                offset = dx / s / scale;
            }
            axis.setWindow(scale, offset);
        });
        arr.forEach(this.stack, function (plot) {
            plot.zoom = zoom;
        });
        return this;
    }, zoomIn:function (name, range, delayed) {
        var axis = this.axes[name];
        if (axis) {
            var scale, offset, bounds = axis.getScaler().bounds;
            var lower = Math.min(range[0], range[1]);
            var upper = Math.max(range[0], range[1]);
            lower = range[0] < bounds.lower ? bounds.lower : lower;
            upper = range[1] > bounds.upper ? bounds.upper : upper;
            scale = (bounds.upper - bounds.lower) / (upper - lower);
            offset = lower - bounds.lower;
            this.setAxisWindow(name, scale, offset);
            if (delayed) {
                this.delayedRender();
            } else {
                this.render();
            }
        }
    }, calculateGeometry:function () {
        if (this.dirty) {
            return this.fullGeometry();
        }
        var dirty = arr.filter(this.stack, function (plot) {
            return plot.dirty || (plot.hAxis && this.axes[plot.hAxis].dirty) || (plot.vAxis && this.axes[plot.vAxis].dirty);
        }, this);
        calculateAxes(dirty, this.plotArea);
        return this;
    }, fullGeometry:function () {
        this._makeDirty();
        arr.forEach(this.stack, clear);
        if (!this.theme) {
            this.setTheme(new SimpleTheme());
        }
        arr.forEach(this.series, function (run) {
            if (!(run.plot in this.plots)) {
                if (!dc.plot2d || !dc.plot2d.Default) {
                    throw Error("Can't find plot: Default - didn't you forget to dojo" + ".require() it?");
                }
                var plot = new dc.plot2d.Default(this, {});
                plot.name = run.plot;
                this.plots[run.plot] = this.stack.length;
                this.stack.push(plot);
            }
            this.stack[this.plots[run.plot]].addSeries(run);
        }, this);
        arr.forEach(this.stack, function (plot) {
            if (plot.assignAxes) {
                plot.assignAxes(this.axes);
            }
        }, this);
        var dim = this.dim = this.surface.getDimensions();
        dim.width = g.normalizedLength(dim.width);
        dim.height = g.normalizedLength(dim.height);
        func.forIn(this.axes, clear);
        calculateAxes(this.stack, dim);
        var offsets = this.offsets = {l:0, r:0, t:0, b:0};
        var self = this;
        func.forIn(this.axes, function (axis) {
            if (0) {
                self._resetLeftBottom(axis);
            }
            func.forIn(axis.getOffsets(), function (o, i) {
                offsets[i] = Math.max(o, offsets[i]);
            });
        });
        if (this.title) {
            this.titleGap = (this.titleGap == 0) ? 0 : this.titleGap || this.theme.chart.titleGap || 20;
            this.titlePos = this.titlePos || this.theme.chart.titlePos || "top";
            this.titleFont = this.titleFont || this.theme.chart.titleFont;
            this.titleFontColor = this.titleFontColor || this.theme.chart.titleFontColor || "black";
            var tsize = g.normalizedLength(g.splitFontString(this.titleFont).size);
            offsets[this.titlePos == "top" ? "t" : "b"] += (tsize + this.titleGap);
        }
        func.forIn(this.margins, function (o, i) {
            offsets[i] += o;
        });
        this.plotArea = {width:dim.width - offsets.l - offsets.r, height:dim.height - offsets.t - offsets.b};
        func.forIn(this.axes, clear);
        calculateAxes(this.stack, this.plotArea);
        return this;
    }, render:function () {
        if (this._delayedRenderHandle) {
            clearTimeout(this._delayedRenderHandle);
            this._delayedRenderHandle = null;
        }
        if (this.theme) {
            this.theme.clear();
        }
        if (this.dirty) {
            return this.fullRender();
        }
        this.calculateGeometry();
        func.forEachRev(this.stack, function (plot) {
            plot.render(this.dim, this.offsets);
        }, this);
        func.forIn(this.axes, function (axis) {
            axis.render(this.dim, this.offsets);
        }, this);
        this._makeClean();
        return this;
    }, fullRender:function () {
        this.fullGeometry();
        var offsets = this.offsets, dim = this.dim;
        var w = Math.max(0, dim.width - offsets.l - offsets.r), h = Math.max(0, dim.height - offsets.t - offsets.b);
        arr.forEach(this.series, purge);
        func.forIn(this.axes, purge);
        arr.forEach(this.stack, purge);
        var children = this.surface.children;
        if (shape.dispose) {
            for (var i = 0; i < children.length; ++i) {
                shape.dispose(children[i]);
            }
        }
        if (this.chartTitle && this.chartTitle.tagName) {
            domConstruct.destroy(this.chartTitle);
        }
        this.surface.clear();
        this.chartTitle = null;
        this._renderChartBackground(dim, offsets);
        if (this._nativeClip) {
            this._renderPlotBackground(dim, offsets, w, h);
        } else {
            this._renderPlotBackground(dim, offsets, w, h);
        }
        func.foldr(this.stack, function (z, plot) {
            return plot.render(dim, offsets), 0;
        }, 0);
        if (!this._nativeClip) {
            this._renderChartBackground(dim, offsets);
        }
        if (this.title) {
            var forceHtmlLabels = (g.renderer == "canvas") && this.htmlLabels, labelType = forceHtmlLabels || !has("ie") && !has("opera") && this.htmlLabels ? "html" : "gfx", tsize = g.normalizedLength(g.splitFontString(this.titleFont).size);
            this.chartTitle = common.createText[labelType](this, this.surface, dim.width / 2, this.titlePos == "top" ? tsize + this.margins.t : dim.height - this.margins.b, "middle", this.title, this.titleFont, this.titleFontColor);
        }
        func.forIn(this.axes, function (axis) {
            axis.render(dim, offsets);
        });
        this._makeClean();
        return this;
    }, _renderChartBackground:function (dim, offsets) {
        var t = this.theme, rect;
        var fill = this.fill !== undefined ? this.fill : (t.chart && t.chart.fill);
        var stroke = this.stroke !== undefined ? this.stroke : (t.chart && t.chart.stroke);
        if (fill == "inherit") {
            var node = this.node;
            fill = new Color(domStyle.get(node, "backgroundColor"));
            while (fill.a == 0 && node != document.documentElement) {
                fill = new Color(domStyle.get(node, "backgroundColor"));
                node = node.parentNode;
            }
        }
        if (fill) {
            if (this._nativeClip) {
                fill = Element.prototype._shapeFill(Element.prototype._plotFill(fill, dim), {x:0, y:0, width:dim.width + 1, height:dim.height + 1});
                this.surface.createRect({width:dim.width + 1, height:dim.height + 1}).setFill(fill);
            } else {
                fill = Element.prototype._plotFill(fill, dim, offsets);
                if (offsets.l) {
                    rect = {x:0, y:0, width:offsets.l, height:dim.height + 1};
                    this.surface.createRect(rect).setFill(Element.prototype._shapeFill(fill, rect));
                }
                if (offsets.r) {
                    rect = {x:dim.width - offsets.r, y:0, width:offsets.r + 1, height:dim.height + 2};
                    this.surface.createRect(rect).setFill(Element.prototype._shapeFill(fill, rect));
                }
                if (offsets.t) {
                    rect = {x:0, y:0, width:dim.width + 1, height:offsets.t};
                    this.surface.createRect(rect).setFill(Element.prototype._shapeFill(fill, rect));
                }
                if (offsets.b) {
                    rect = {x:0, y:dim.height - offsets.b, width:dim.width + 1, height:offsets.b + 2};
                    this.surface.createRect(rect).setFill(Element.prototype._shapeFill(fill, rect));
                }
            }
        }
        if (stroke) {
            this.surface.createRect({width:dim.width - 1, height:dim.height - 1}).setStroke(stroke);
        }
    }, _renderPlotBackground:function (dim, offsets, w, h) {
        var t = this.theme;
        var fill = t.plotarea && t.plotarea.fill;
        var stroke = t.plotarea && t.plotarea.stroke;
        var rect = {x:offsets.l - 1, y:offsets.t - 1, width:w + 2, height:h + 2};
        if (fill) {
            fill = Element.prototype._shapeFill(Element.prototype._plotFill(fill, dim, offsets), rect);
            this.surface.createRect(rect).setFill(fill);
        }
        if (stroke) {
            this.surface.createRect({x:offsets.l, y:offsets.t, width:w + 1, height:h + 1}).setStroke(stroke);
        }
    }, delayedRender:function () {
        if (!this._delayedRenderHandle) {
            this._delayedRenderHandle = setTimeout(lang.hitch(this, function () {
                this.render();
            }), this.delayInMs);
        }
        return this;
    }, connectToPlot:function (name, object, method) {
        return name in this.plots ? this.stack[this.plots[name]].connect(object, method) : null;
    }, fireEvent:function (seriesName, eventName, index) {
        if (seriesName in this.runs) {
            var plotName = this.series[this.runs[seriesName]].plot;
            if (plotName in this.plots) {
                var plot = this.stack[this.plots[plotName]];
                if (plot) {
                    plot.fireEvent(seriesName, eventName, index);
                }
            }
        }
        return this;
    }, _makeClean:function () {
        arr.forEach(this.axes, makeClean);
        arr.forEach(this.stack, makeClean);
        arr.forEach(this.series, makeClean);
        this.dirty = false;
    }, _makeDirty:function () {
        arr.forEach(this.axes, makeDirty);
        arr.forEach(this.stack, makeDirty);
        arr.forEach(this.series, makeDirty);
        this.dirty = true;
    }, _invalidateDependentPlots:function (plotName, verticalAxis) {
        if (plotName in this.plots) {
            var plot = this.stack[this.plots[plotName]], axis, axisName = verticalAxis ? "vAxis" : "hAxis";
            if (plot[axisName]) {
                axis = this.axes[plot[axisName]];
                if (axis && axis.dependOnData()) {
                    axis.dirty = true;
                    arr.forEach(this.stack, function (p) {
                        if (p[axisName] && p[axisName] == plot[axisName]) {
                            p.dirty = true;
                        }
                    });
                }
            } else {
                plot.dirty = true;
            }
        }
    }, setDir:function (dir) {
        return this;
    }, _resetLeftBottom:function (axis) {
    }, formatTruncatedLabel:function (element, label, labelType) {
    }});
    function hSection(stats) {
        return {min:stats.hmin, max:stats.hmax};
    }
    function vSection(stats) {
        return {min:stats.vmin, max:stats.vmax};
    }
    function hReplace(stats, h) {
        stats.hmin = h.min;
        stats.hmax = h.max;
    }
    function vReplace(stats, v) {
        stats.vmin = v.min;
        stats.vmax = v.max;
    }
    function combineStats(target, source) {
        if (target && source) {
            target.min = Math.min(target.min, source.min);
            target.max = Math.max(target.max, source.max);
        }
        return target || source;
    }
    function calculateAxes(stack, plotArea) {
        var plots = {}, axes = {};
        arr.forEach(stack, function (plot) {
            var stats = plots[plot.name] = plot.getSeriesStats();
            if (plot.hAxis) {
                axes[plot.hAxis] = combineStats(axes[plot.hAxis], hSection(stats));
            }
            if (plot.vAxis) {
                axes[plot.vAxis] = combineStats(axes[plot.vAxis], vSection(stats));
            }
        });
        arr.forEach(stack, function (plot) {
            var stats = plots[plot.name];
            if (plot.hAxis) {
                hReplace(stats, axes[plot.hAxis]);
            }
            if (plot.vAxis) {
                vReplace(stats, axes[plot.vAxis]);
            }
            plot.initializeScalers(plotArea, stats);
        });
    }
    return 0 ? declare("dojox.charting.Chart", [Chart, BidiChart]) : Chart;
});

