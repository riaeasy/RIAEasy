//>>built

define("dojox/charting/plot2d/Pie", ["dojo/_base/lang", "dojo/_base/array", "dojo/_base/declare", "./Base", "./_PlotEvents", "./common", "dojox/gfx", "dojox/gfx/matrix", "dojox/lang/functional", "dojox/lang/utils", "dojo/has"], function (lang, arr, declare, Base, PlotEvents, dc, g, m, df, du, has) {
    var FUDGE_FACTOR = 0.2;
    return declare("dojox.charting.plot2d.Pie", [Base, PlotEvents], {defaultParams:{labels:true, ticks:false, fixed:true, precision:1, labelOffset:20, labelStyle:"default", htmlLabels:true, radGrad:"native", fanSize:5, startAngle:0}, optionalParams:{radius:0, omitLabels:false, stroke:{}, outline:{}, shadow:{}, fill:{}, filter:{}, styleFunc:null, font:"", fontColor:"", labelWiring:{}}, constructor:function (chart, kwArgs) {
        this.opt = lang.clone(this.defaultParams);
        du.updateWithObject(this.opt, kwArgs);
        du.updateWithPattern(this.opt, kwArgs, this.optionalParams);
        this.axes = [];
        this.run = null;
        this.dyn = [];
        this.runFilter = [];
    }, clear:function () {
        this.inherited(arguments);
        this.dyn = [];
        this.run = null;
        return this;
    }, setAxis:function (axis) {
        return this;
    }, addSeries:function (run) {
        this.run = run;
        return this;
    }, getSeriesStats:function () {
        return lang.delegate(dc.defaultStats);
    }, getRequiredColors:function () {
        return this.run ? this.run.data.length : 0;
    }, render:function (dim, offsets) {
        if (!this.dirty) {
            return this;
        }
        this.resetEvents();
        this.dirty = false;
        this._eventSeries = {};
        this.cleanGroup();
        var s = this.group, t = this.chart.theme;
        if (!this.run || !this.run.data.length) {
            return this;
        }
        var rx = (dim.width - offsets.l - offsets.r) / 2, ry = (dim.height - offsets.t - offsets.b) / 2, r = Math.min(rx, ry), labelFont = "font" in this.opt ? this.opt.font : t.series.font, size, startAngle = m._degToRad(this.opt.startAngle), start = startAngle, filteredRun, slices, labels, shift, labelR, events = this.events();
        var run = arr.map(this.run.data, function (item, i) {
            if (typeof item != "number" && item.hidden) {
                this.runFilter.push(i);
                item.hidden = false;
            }
            if (arr.some(this.runFilter, function (filter) {
                return filter == i;
            })) {
                if (typeof item == "number") {
                    return 0;
                } else {
                    return {y:0, text:item.text};
                }
            } else {
                return item;
            }
        }, this);
        this.dyn = [];
        if ("radius" in this.opt) {
            r = this.opt.radius;
            labelR = r - this.opt.labelOffset;
        }
        var circle = {cx:offsets.l + rx, cy:offsets.t + ry, r:r};
        if (this.opt.shadow || t.shadow) {
            var shadow = this.opt.shadow || t.shadow;
            var scircle = lang.clone(circle);
            scircle.cx += shadow.dx;
            scircle.cy += shadow.dy;
            s.createCircle(scircle).setFill(shadow.color).setStroke(shadow);
        }
        if (s.setFilter && (this.opt.filter || t.filter)) {
            s.createCircle(circle).setFill(t.series.stroke).setFilter(this.opt.filter || t.filter);
        }
        if (typeof run[0] == "number") {
            filteredRun = df.map(run, "x ? Math.max(x, 0) : 0");
            if (df.every(filteredRun, "<= 0")) {
                s.createCircle(circle).setStroke(t.series.stroke);
                this.dyn = arr.map(filteredRun, function () {
                    return {};
                });
                return this;
            } else {
                slices = df.map(filteredRun, "/this", df.foldl(filteredRun, "+", 0));
                if (this.opt.labels) {
                    labels = arr.map(slices, function (x) {
                        return x > 0 ? this._getLabel(x * 100) + "%" : "";
                    }, this);
                }
            }
        } else {
            filteredRun = df.map(run, "x ? Math.max(x.y, 0) : 0");
            if (df.every(filteredRun, "<= 0")) {
                s.createCircle(circle).setStroke(t.series.stroke);
                this.dyn = arr.map(filteredRun, function () {
                    return {};
                });
                return this;
            } else {
                slices = df.map(filteredRun, "/this", df.foldl(filteredRun, "+", 0));
                if (this.opt.labels) {
                    labels = arr.map(slices, function (x, i) {
                        if (x < 0) {
                            return "";
                        }
                        var v = run[i];
                        return "text" in v ? v.text : this._getLabel(x * 100) + "%";
                    }, this);
                }
            }
        }
        var themes = df.map(run, function (v, i) {
            var tMixin = [this.opt, this.run];
            if (v !== null && typeof v != "number") {
                tMixin.push(v);
            }
            if (this.opt.styleFunc) {
                tMixin.push(this.opt.styleFunc(v));
            }
            return t.next("slice", tMixin, true);
        }, this);
        if (this.opt.labels) {
            size = labelFont ? g.normalizedLength(g.splitFontString(labelFont).size) : 0;
            shift = df.foldl1(df.map(labels, function (label, i) {
                var font = themes[i].series.font;
                return g._base._getTextBox(label, {font:font}).w;
            }, this), "Math.max(a, b)") / 2;
            if (this.opt.labelOffset < 0) {
                r = Math.min(rx - 2 * shift, ry - size) + this.opt.labelOffset;
            }
            labelR = r - this.opt.labelOffset;
        }
        var eventSeries = new Array(slices.length);
        arr.some(slices, function (slice, i) {
            if (slice < 0) {
                return false;
            }
            var v = run[i], theme = themes[i], specialFill, o;
            if (slice == 0) {
                this.dyn.push({fill:theme.series.fill, stroke:theme.series.stroke});
                return false;
            }
            if (slice >= 1) {
                specialFill = this._plotFill(theme.series.fill, dim, offsets);
                specialFill = this._shapeFill(specialFill, {x:circle.cx - circle.r, y:circle.cy - circle.r, width:2 * circle.r, height:2 * circle.r});
                specialFill = this._pseudoRadialFill(specialFill, {x:circle.cx, y:circle.cy}, circle.r);
                var shape = s.createCircle(circle).setFill(specialFill).setStroke(theme.series.stroke);
                this.dyn.push({fill:specialFill, stroke:theme.series.stroke});
                if (events) {
                    o = {element:"slice", index:i, run:this.run, shape:shape, x:i, y:typeof v == "number" ? v : v.y, cx:circle.cx, cy:circle.cy, cr:r};
                    this._connectEvents(o);
                    eventSeries[i] = o;
                }
                return false;
            }
            var end = start + slice * 2 * Math.PI;
            if (i + 1 == slices.length) {
                end = startAngle + 2 * Math.PI;
            }
            var step = end - start, x1 = circle.cx + r * Math.cos(start), y1 = circle.cy + r * Math.sin(start), x2 = circle.cx + r * Math.cos(end), y2 = circle.cy + r * Math.sin(end);
            var fanSize = m._degToRad(this.opt.fanSize);
            if (theme.series.fill && theme.series.fill.type === "radial" && this.opt.radGrad === "fan" && step > fanSize) {
                var group = s.createGroup(), nfans = Math.ceil(step / fanSize), delta = step / nfans;
                specialFill = this._shapeFill(theme.series.fill, {x:circle.cx - circle.r, y:circle.cy - circle.r, width:2 * circle.r, height:2 * circle.r});
                for (var j = 0; j < nfans; ++j) {
                    var fansx = j == 0 ? x1 : circle.cx + r * Math.cos(start + (j - FUDGE_FACTOR) * delta), fansy = j == 0 ? y1 : circle.cy + r * Math.sin(start + (j - FUDGE_FACTOR) * delta), fanex = j == nfans - 1 ? x2 : circle.cx + r * Math.cos(start + (j + 1 + FUDGE_FACTOR) * delta), faney = j == nfans - 1 ? y2 : circle.cy + r * Math.sin(start + (j + 1 + FUDGE_FACTOR) * delta);
                    group.createPath().moveTo(circle.cx, circle.cy).lineTo(fansx, fansy).arcTo(r, r, 0, delta > Math.PI, true, fanex, faney).lineTo(circle.cx, circle.cy).closePath().setFill(this._pseudoRadialFill(specialFill, {x:circle.cx, y:circle.cy}, r, start + (j + 0.5) * delta, start + (j + 0.5) * delta));
                }
                group.createPath().moveTo(circle.cx, circle.cy).lineTo(x1, y1).arcTo(r, r, 0, step > Math.PI, true, x2, y2).lineTo(circle.cx, circle.cy).closePath().setStroke(theme.series.stroke);
                shape = group;
            } else {
                shape = s.createPath().moveTo(circle.cx, circle.cy).lineTo(x1, y1).arcTo(r, r, 0, step > Math.PI, true, x2, y2).lineTo(circle.cx, circle.cy).closePath().setStroke(theme.series.stroke);
                specialFill = theme.series.fill;
                if (specialFill && specialFill.type === "radial") {
                    specialFill = this._shapeFill(specialFill, {x:circle.cx - circle.r, y:circle.cy - circle.r, width:2 * circle.r, height:2 * circle.r});
                    if (this.opt.radGrad === "linear") {
                        specialFill = this._pseudoRadialFill(specialFill, {x:circle.cx, y:circle.cy}, r, start, end);
                    }
                } else {
                    if (specialFill && specialFill.type === "linear") {
                        specialFill = this._plotFill(specialFill, dim, offsets);
                        specialFill = this._shapeFill(specialFill, shape.getBoundingBox());
                    }
                }
                shape.setFill(specialFill);
            }
            this.dyn.push({fill:specialFill, stroke:theme.series.stroke});
            if (events) {
                o = {element:"slice", index:i, run:this.run, shape:shape, x:i, y:typeof v == "number" ? v : v.y, cx:circle.cx, cy:circle.cy, cr:r};
                this._connectEvents(o);
                eventSeries[i] = o;
            }
            start = end;
            return false;
        }, this);
        if (this.opt.labels) {
            var isRtl = 0 && this.chart.isRightToLeft();
            if (this.opt.labelStyle == "default") {
                start = startAngle;
                arr.some(slices, function (slice, i) {
                    if (slice <= 0) {
                        return false;
                    }
                    var theme = themes[i];
                    if (slice >= 1) {
                        this.renderLabel(s, circle.cx, circle.cy + size / 2, labels[i], theme, this.opt.labelOffset > 0);
                        return true;
                    }
                    var end = start + slice * 2 * Math.PI;
                    if (i + 1 == slices.length) {
                        end = startAngle + 2 * Math.PI;
                    }
                    if (this.opt.omitLabels && end - start < 0.001) {
                        return false;
                    }
                    var labelAngle = (start + end) / 2, x = circle.cx + labelR * Math.cos(labelAngle), y = circle.cy + labelR * Math.sin(labelAngle) + size / 2;
                    this.renderLabel(s, isRtl ? dim.width - x : x, y, labels[i], theme, this.opt.labelOffset > 0);
                    start = end;
                    return false;
                }, this);
            } else {
                if (this.opt.labelStyle == "columns") {
                    start = startAngle;
                    var omitLabels = this.opt.omitLabels;
                    var labeledSlices = [];
                    arr.forEach(slices, function (slice, i) {
                        var end = start + slice * 2 * Math.PI;
                        if (i + 1 == slices.length) {
                            end = startAngle + 2 * Math.PI;
                        }
                        var labelAngle = (start + end) / 2;
                        labeledSlices.push({angle:labelAngle, left:Math.cos(labelAngle) < 0, theme:themes[i], index:i, omit:omitLabels ? end - start < 0.001 : false});
                        start = end;
                    });
                    var labelHeight = g._base._getTextBox("a", {font:labelFont}).h;
                    this._getProperLabelRadius(labeledSlices, labelHeight, circle.r * 1.1);
                    arr.forEach(labeledSlices, function (slice, i) {
                        if (!slice.omit) {
                            var leftColumn = circle.cx - circle.r * 2, rightColumn = circle.cx + circle.r * 2, labelWidth = g._base._getTextBox(labels[i], {font:slice.theme.series.font}).w, x = circle.cx + slice.labelR * Math.cos(slice.angle), y = circle.cy + slice.labelR * Math.sin(slice.angle), jointX = (slice.left) ? (leftColumn + labelWidth) : (rightColumn - labelWidth), labelX = (slice.left) ? leftColumn : jointX;
                            var wiring = s.createPath().moveTo(circle.cx + circle.r * Math.cos(slice.angle), circle.cy + circle.r * Math.sin(slice.angle));
                            if (Math.abs(slice.labelR * Math.cos(slice.angle)) < circle.r * 2 - labelWidth) {
                                wiring.lineTo(x, y);
                            }
                            wiring.lineTo(jointX, y).setStroke(slice.theme.series.labelWiring);
                            this.renderLabel(s, isRtl ? dim.width - labelWidth - labelX : labelX, y, labels[i], slice.theme, false, "left");
                        }
                    }, this);
                }
            }
        }
        var esi = 0;
        this._eventSeries[this.run.name] = df.map(run, function (v) {
            return v <= 0 ? null : eventSeries[esi++];
        });
        if (0) {
            this._checkOrientation(this.group, dim, offsets);
        }
        return this;
    }, _getProperLabelRadius:function (slices, labelHeight, minRidius) {
        var leftCenterSlice, rightCenterSlice, leftMinSIN = 1, rightMinSIN = 1;
        if (slices.length == 1) {
            slices[0].labelR = minRidius;
            return;
        }
        for (var i = 0; i < slices.length; i++) {
            var tempSIN = Math.abs(Math.sin(slices[i].angle));
            if (slices[i].left) {
                if (leftMinSIN >= tempSIN) {
                    leftMinSIN = tempSIN;
                    leftCenterSlice = slices[i];
                }
            } else {
                if (rightMinSIN >= tempSIN) {
                    rightMinSIN = tempSIN;
                    rightCenterSlice = slices[i];
                }
            }
        }
        leftCenterSlice.labelR = rightCenterSlice.labelR = minRidius;
        this._calculateLabelR(leftCenterSlice, slices, labelHeight);
        this._calculateLabelR(rightCenterSlice, slices, labelHeight);
    }, _calculateLabelR:function (firstSlice, slices, labelHeight) {
        var i = firstSlice.index, length = slices.length, currentLabelR = firstSlice.labelR, nextLabelR;
        while (!(slices[i % length].left ^ slices[(i + 1) % length].left)) {
            if (!slices[(i + 1) % length].omit) {
                nextLabelR = (Math.sin(slices[i % length].angle) * currentLabelR + ((slices[i % length].left) ? (-labelHeight) : labelHeight)) / Math.sin(slices[(i + 1) % length].angle);
                currentLabelR = (nextLabelR < firstSlice.labelR) ? firstSlice.labelR : nextLabelR;
                slices[(i + 1) % length].labelR = currentLabelR;
            }
            i++;
        }
        i = firstSlice.index;
        var j = (i == 0) ? length - 1 : i - 1;
        while (!(slices[i].left ^ slices[j].left)) {
            if (!slices[j].omit) {
                nextLabelR = (Math.sin(slices[i].angle) * currentLabelR + ((slices[i].left) ? labelHeight : (-labelHeight))) / Math.sin(slices[j].angle);
                currentLabelR = (nextLabelR < firstSlice.labelR) ? firstSlice.labelR : nextLabelR;
                slices[j].labelR = currentLabelR;
            }
            i--;
            j--;
            i = (i < 0) ? i + slices.length : i;
            j = (j < 0) ? j + slices.length : j;
        }
    }});
});

