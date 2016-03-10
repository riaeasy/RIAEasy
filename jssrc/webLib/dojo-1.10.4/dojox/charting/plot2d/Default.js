//>>built

define("dojox/charting/plot2d/Default", ["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/array", "dojo/has", "./CartesianBase", "./_PlotEvents", "./common", "dojox/lang/functional", "dojox/lang/functional/reversed", "dojox/lang/utils", "dojox/gfx/fx"], function (lang, declare, arr, has, CartesianBase, _PlotEvents, dc, df, dfr, du, fx) {
    var purgeGroup = dfr.lambda("item.purgeGroup()");
    var DEFAULT_ANIMATION_LENGTH = 1200;
    return declare("dojox.charting.plot2d.Default", [CartesianBase, _PlotEvents], {defaultParams:{lines:true, areas:false, markers:false, tension:"", animate:false, enableCache:false, interpolate:false}, optionalParams:{stroke:{}, outline:{}, shadow:{}, fill:{}, filter:{}, styleFunc:null, font:"", fontColor:"", marker:"", markerStroke:{}, markerOutline:{}, markerShadow:{}, markerFill:{}, markerFont:"", markerFontColor:""}, constructor:function (chart, kwArgs) {
        this.opt = lang.clone(lang.mixin(this.opt, this.defaultParams));
        du.updateWithObject(this.opt, kwArgs);
        du.updateWithPattern(this.opt, kwArgs, this.optionalParams);
        this.animate = this.opt.animate;
    }, createPath:function (run, creator, params) {
        var path;
        if (this.opt.enableCache && run._pathFreePool.length > 0) {
            path = run._pathFreePool.pop();
            path.setShape(params);
            creator.add(path);
        } else {
            path = creator.createPath(params);
        }
        if (this.opt.enableCache) {
            run._pathUsePool.push(path);
        }
        return path;
    }, buildSegments:function (i, indexed) {
        var run = this.series[i], min = indexed ? Math.max(0, Math.floor(this._hScaler.bounds.from - 1)) : 0, max = indexed ? Math.min(run.data.length, Math.ceil(this._hScaler.bounds.to)) : run.data.length, rseg = null, segments = [];
        for (var j = min; j < max; j++) {
            if (run.data[j] != null && (indexed || run.data[j].y != null)) {
                if (!rseg) {
                    rseg = [];
                    segments.push({index:j, rseg:rseg});
                }
                rseg.push((indexed && run.data[j].hasOwnProperty("y")) ? run.data[j].y : run.data[j]);
            } else {
                if (!this.opt.interpolate || indexed) {
                    rseg = null;
                }
            }
        }
        return segments;
    }, render:function (dim, offsets) {
        if (this.zoom && !this.isDataDirty()) {
            return this.performZoom(dim, offsets);
        }
        this.resetEvents();
        this.dirty = this.isDirty();
        var s;
        if (this.dirty) {
            arr.forEach(this.series, purgeGroup);
            this._eventSeries = {};
            this.cleanGroup();
            this.getGroup().setTransform(null);
            s = this.getGroup();
            df.forEachRev(this.series, function (item) {
                item.cleanGroup(s);
            });
        }
        var t = this.chart.theme, stroke, outline, events = this.events();
        for (var i = this.series.length - 1; i >= 0; --i) {
            var run = this.series[i];
            if (!this.dirty && !run.dirty) {
                t.skip();
                this._reconnectEvents(run.name);
                continue;
            }
            run.cleanGroup();
            if (this.opt.enableCache) {
                run._pathFreePool = (run._pathFreePool ? run._pathFreePool : []).concat(run._pathUsePool ? run._pathUsePool : []);
                run._pathUsePool = [];
            }
            if (!run.data.length) {
                run.dirty = false;
                t.skip();
                continue;
            }
            var theme = t.next(this.opt.areas ? "area" : "line", [this.opt, run], true), lpoly, ht = this._hScaler.scaler.getTransformerFromModel(this._hScaler), vt = this._vScaler.scaler.getTransformerFromModel(this._vScaler), eventSeries = this._eventSeries[run.name] = new Array(run.data.length);
            s = run.group;
            if (run.hidden) {
                if (this.opt.lines) {
                    run.dyn.stroke = theme.series.stroke;
                }
                if (this.opt.markers) {
                    run.dyn.markerFill = theme.marker.fill;
                    run.dyn.markerStroke = theme.marker.stroke;
                    run.dyn.marker = theme.symbol;
                }
                if (this.opt.areas) {
                    run.dyn.fill = theme.series.fill;
                }
                continue;
            }
            var indexed = arr.some(run.data, function (item) {
                return typeof item == "number" || (item && !item.hasOwnProperty("x"));
            });
            var rsegments = this.buildSegments(i, indexed);
            for (var seg = 0; seg < rsegments.length; seg++) {
                var rsegment = rsegments[seg];
                if (indexed) {
                    lpoly = arr.map(rsegment.rseg, function (v, i) {
                        return {x:ht(i + rsegment.index + 1) + offsets.l, y:dim.height - offsets.b - vt(v), data:v};
                    }, this);
                } else {
                    lpoly = arr.map(rsegment.rseg, function (v) {
                        return {x:ht(v.x) + offsets.l, y:dim.height - offsets.b - vt(v.y), data:v};
                    }, this);
                }
                if (indexed && this.opt.interpolate) {
                    while (seg < rsegments.length) {
                        seg++;
                        rsegment = rsegments[seg];
                        if (rsegment) {
                            lpoly = lpoly.concat(arr.map(rsegment.rseg, function (v, i) {
                                return {x:ht(i + rsegment.index + 1) + offsets.l, y:dim.height - offsets.b - vt(v), data:v};
                            }, this));
                        }
                    }
                }
                var lpath = this.opt.tension ? dc.curve(lpoly, this.opt.tension) : "";
                if (this.opt.areas && lpoly.length > 1) {
                    var fill = this._plotFill(theme.series.fill, dim, offsets), apoly = lang.clone(lpoly);
                    if (this.opt.tension) {
                        var apath = "L" + apoly[apoly.length - 1].x + "," + (dim.height - offsets.b) + " L" + apoly[0].x + "," + (dim.height - offsets.b) + " L" + apoly[0].x + "," + apoly[0].y;
                        run.dyn.fill = s.createPath(lpath + " " + apath).setFill(fill).getFill();
                    } else {
                        apoly.push({x:lpoly[lpoly.length - 1].x, y:dim.height - offsets.b});
                        apoly.push({x:lpoly[0].x, y:dim.height - offsets.b});
                        apoly.push(lpoly[0]);
                        run.dyn.fill = s.createPolyline(apoly).setFill(fill).getFill();
                    }
                }
                if (this.opt.lines || this.opt.markers) {
                    stroke = theme.series.stroke;
                    if (theme.series.outline) {
                        outline = run.dyn.outline = dc.makeStroke(theme.series.outline);
                        outline.width = 2 * outline.width + stroke.width;
                    }
                }
                if (this.opt.markers) {
                    run.dyn.marker = theme.symbol;
                }
                var frontMarkers = null, outlineMarkers = null, shadowMarkers = null;
                if (stroke && theme.series.shadow && lpoly.length > 1) {
                    var shadow = theme.series.shadow, spoly = arr.map(lpoly, function (c) {
                        return {x:c.x + shadow.dx, y:c.y + shadow.dy};
                    });
                    if (this.opt.lines) {
                        if (this.opt.tension) {
                            run.dyn.shadow = s.createPath(dc.curve(spoly, this.opt.tension)).setStroke(shadow).getStroke();
                        } else {
                            run.dyn.shadow = s.createPolyline(spoly).setStroke(shadow).getStroke();
                        }
                    }
                    if (this.opt.markers && theme.marker.shadow) {
                        shadow = theme.marker.shadow;
                        shadowMarkers = arr.map(spoly, function (c) {
                            return this.createPath(run, s, "M" + c.x + " " + c.y + " " + theme.symbol).setStroke(shadow).setFill(shadow.color);
                        }, this);
                    }
                }
                if (this.opt.lines && lpoly.length > 1) {
                    var shape;
                    if (outline) {
                        if (this.opt.tension) {
                            run.dyn.outline = s.createPath(lpath).setStroke(outline).getStroke();
                        } else {
                            run.dyn.outline = s.createPolyline(lpoly).setStroke(outline).getStroke();
                        }
                    }
                    if (this.opt.tension) {
                        run.dyn.stroke = (shape = s.createPath(lpath)).setStroke(stroke).getStroke();
                    } else {
                        run.dyn.stroke = (shape = s.createPolyline(lpoly)).setStroke(stroke).getStroke();
                    }
                    if (shape.setFilter && theme.series.filter) {
                        shape.setFilter(theme.series.filter);
                    }
                }
                var markerBox = null;
                if (this.opt.markers) {
                    var markerTheme = theme;
                    frontMarkers = new Array(lpoly.length);
                    outlineMarkers = new Array(lpoly.length);
                    outline = null;
                    if (markerTheme.marker.outline) {
                        outline = dc.makeStroke(markerTheme.marker.outline);
                        outline.width = 2 * outline.width + (markerTheme.marker.stroke ? markerTheme.marker.stroke.width : 0);
                    }
                    arr.forEach(lpoly, function (c, i) {
                        if (this.opt.styleFunc || typeof c.data != "number") {
                            var tMixin = typeof c.data != "number" ? [c.data] : [];
                            if (this.opt.styleFunc) {
                                tMixin.push(this.opt.styleFunc(c.data));
                            }
                            markerTheme = t.addMixin(theme, "marker", tMixin, true);
                        } else {
                            markerTheme = t.post(theme, "marker");
                        }
                        var path = "M" + c.x + " " + c.y + " " + markerTheme.symbol;
                        if (outline) {
                            outlineMarkers[i] = this.createPath(run, s, path).setStroke(outline);
                        }
                        frontMarkers[i] = this.createPath(run, s, path).setStroke(markerTheme.marker.stroke).setFill(markerTheme.marker.fill);
                    }, this);
                    run.dyn.markerFill = markerTheme.marker.fill;
                    run.dyn.markerStroke = markerTheme.marker.stroke;
                    if (!markerBox && this.opt.labels) {
                        markerBox = frontMarkers[0].getBoundingBox();
                    }
                    if (events) {
                        arr.forEach(frontMarkers, function (s, i) {
                            var o = {element:"marker", index:i + rsegment.index, run:run, shape:s, outline:outlineMarkers[i] || null, shadow:shadowMarkers && shadowMarkers[i] || null, cx:lpoly[i].x, cy:lpoly[i].y};
                            if (indexed) {
                                o.x = i + rsegment.index + 1;
                                o.y = run.data[i + rsegment.index];
                            } else {
                                o.x = rsegment.rseg[i].x;
                                o.y = run.data[i + rsegment.index].y;
                            }
                            this._connectEvents(o);
                            eventSeries[i + rsegment.index] = o;
                        }, this);
                    } else {
                        delete this._eventSeries[run.name];
                    }
                }
                if (this.opt.labels) {
                    var labelBoxW = markerBox ? markerBox.width : 2;
                    var labelBoxH = markerBox ? markerBox.height : 2;
                    arr.forEach(lpoly, function (c, i) {
                        if (this.opt.styleFunc || typeof c.data != "number") {
                            var tMixin = typeof c.data != "number" ? [c.data] : [];
                            if (this.opt.styleFunc) {
                                tMixin.push(this.opt.styleFunc(c.data));
                            }
                            markerTheme = t.addMixin(theme, "marker", tMixin, true);
                        } else {
                            markerTheme = t.post(theme, "marker");
                        }
                        this.createLabel(s, rsegment.rseg[i], {x:c.x - labelBoxW / 2, y:c.y - labelBoxH / 2, width:labelBoxW, height:labelBoxH}, markerTheme);
                    }, this);
                }
            }
            run.dirty = false;
        }
        if (0) {
            this._checkOrientation(this.group, dim, offsets);
        }
        if (this.animate) {
            var plotGroup = this.getGroup();
            fx.animateTransform(lang.delegate({shape:plotGroup, duration:DEFAULT_ANIMATION_LENGTH, transform:[{name:"translate", start:[0, dim.height - offsets.b], end:[0, 0]}, {name:"scale", start:[1, 0], end:[1, 1]}, {name:"original"}]}, this.animate)).play();
        }
        this.dirty = false;
        return this;
    }});
});

