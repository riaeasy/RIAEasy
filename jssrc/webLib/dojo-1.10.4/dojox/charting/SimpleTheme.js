//>>built

define("dojox/charting/SimpleTheme", ["dojo/_base/lang", "dojo/_base/array", "dojo/_base/declare", "dojo/_base/Color", "dojox/lang/utils", "dojox/gfx/gradutils"], function (lang, arr, declare, Color, dlu, dgg) {
    var SimpleTheme = declare("dojox.charting.SimpleTheme", null, {shapeSpaces:{shape:1, shapeX:1, shapeY:1}, constructor:function (kwArgs) {
        kwArgs = kwArgs || {};
        var def = SimpleTheme.defaultTheme;
        arr.forEach(["chart", "plotarea", "axis", "grid", "series", "marker", "indicator"], function (name) {
            this[name] = lang.delegate(def[name], kwArgs[name]);
        }, this);
        if (kwArgs.seriesThemes && kwArgs.seriesThemes.length) {
            this.colors = null;
            this.seriesThemes = kwArgs.seriesThemes.slice(0);
        } else {
            this.seriesThemes = null;
            this.colors = (kwArgs.colors || SimpleTheme.defaultColors).slice(0);
        }
        this.markerThemes = null;
        if (kwArgs.markerThemes && kwArgs.markerThemes.length) {
            this.markerThemes = kwArgs.markerThemes.slice(0);
        }
        this.markers = kwArgs.markers ? lang.clone(kwArgs.markers) : lang.delegate(SimpleTheme.defaultMarkers);
        this.noGradConv = kwArgs.noGradConv;
        this.noRadialConv = kwArgs.noRadialConv;
        if (kwArgs.reverseFills) {
            this.reverseFills();
        }
        this._current = 0;
        this._buildMarkerArray();
    }, clone:function () {
        var theme = new this.constructor({chart:this.chart, plotarea:this.plotarea, axis:this.axis, grid:this.grid, series:this.series, marker:this.marker, colors:this.colors, markers:this.markers, indicator:this.indicator, seriesThemes:this.seriesThemes, markerThemes:this.markerThemes, noGradConv:this.noGradConv, noRadialConv:this.noRadialConv});
        arr.forEach(["clone", "clear", "next", "skip", "addMixin", "post", "getTick"], function (name) {
            if (this.hasOwnProperty(name)) {
                theme[name] = this[name];
            }
        }, this);
        return theme;
    }, clear:function () {
        this._current = 0;
    }, next:function (elementType, mixin, doPost) {
        var merge = dlu.merge, series, marker;
        if (this.colors) {
            series = lang.delegate(this.series);
            marker = lang.delegate(this.marker);
            var color = new Color(this.colors[this._current % this.colors.length]), old;
            if (series.stroke && series.stroke.color) {
                series.stroke = lang.delegate(series.stroke);
                old = new Color(series.stroke.color);
                series.stroke.color = new Color(color);
                series.stroke.color.a = old.a;
            } else {
                series.stroke = {color:color};
            }
            if (marker.stroke && marker.stroke.color) {
                marker.stroke = lang.delegate(marker.stroke);
                old = new Color(marker.stroke.color);
                marker.stroke.color = new Color(color);
                marker.stroke.color.a = old.a;
            } else {
                marker.stroke = {color:color};
            }
            if (!series.fill || series.fill.type) {
                series.fill = color;
            } else {
                old = new Color(series.fill);
                series.fill = new Color(color);
                series.fill.a = old.a;
            }
            if (!marker.fill || marker.fill.type) {
                marker.fill = color;
            } else {
                old = new Color(marker.fill);
                marker.fill = new Color(color);
                marker.fill.a = old.a;
            }
        } else {
            series = this.seriesThemes ? merge(this.series, this.seriesThemes[this._current % this.seriesThemes.length]) : this.series;
            marker = this.markerThemes ? merge(this.marker, this.markerThemes[this._current % this.markerThemes.length]) : series;
        }
        var symbol = marker && marker.symbol || this._markers[this._current % this._markers.length];
        var theme = {series:series, marker:marker, symbol:symbol};
        ++this._current;
        if (mixin) {
            theme = this.addMixin(theme, elementType, mixin);
        }
        if (doPost) {
            theme = this.post(theme, elementType);
        }
        return theme;
    }, skip:function () {
        ++this._current;
    }, addMixin:function (theme, elementType, mixin, doPost) {
        if (lang.isArray(mixin)) {
            arr.forEach(mixin, function (m) {
                theme = this.addMixin(theme, elementType, m);
            }, this);
        } else {
            var t = {};
            if ("color" in mixin) {
                if (elementType == "line" || elementType == "area") {
                    lang.setObject("series.stroke.color", mixin.color, t);
                    lang.setObject("marker.stroke.color", mixin.color, t);
                } else {
                    lang.setObject("series.fill", mixin.color, t);
                }
            }
            arr.forEach(["stroke", "outline", "shadow", "fill", "filter", "font", "fontColor", "labelWiring"], function (name) {
                var markerName = "marker" + name.charAt(0).toUpperCase() + name.substr(1), b = markerName in mixin;
                if (name in mixin) {
                    lang.setObject("series." + name, mixin[name], t);
                    if (!b) {
                        lang.setObject("marker." + name, mixin[name], t);
                    }
                }
                if (b) {
                    lang.setObject("marker." + name, mixin[markerName], t);
                }
            });
            if ("marker" in mixin) {
                t.symbol = mixin.marker;
                t.symbol = mixin.marker;
            }
            theme = dlu.merge(theme, t);
        }
        if (doPost) {
            theme = this.post(theme, elementType);
        }
        return theme;
    }, post:function (theme, elementType) {
        var fill = theme.series.fill, t;
        if (!this.noGradConv && this.shapeSpaces[fill.space] && fill.type == "linear") {
            if (elementType == "bar") {
                t = {x1:fill.y1, y1:fill.x1, x2:fill.y2, y2:fill.x2};
            } else {
                if (!this.noRadialConv && fill.space == "shape" && (elementType == "slice" || elementType == "circle")) {
                    t = {type:"radial", cx:0, cy:0, r:100};
                }
            }
            if (t) {
                return dlu.merge(theme, {series:{fill:t}});
            }
        }
        return theme;
    }, getTick:function (name, mixin) {
        var tick = this.axis.tick, tickName = name + "Tick", merge = dlu.merge;
        if (tick) {
            if (this.axis[tickName]) {
                tick = merge(tick, this.axis[tickName]);
            }
        } else {
            tick = this.axis[tickName];
        }
        if (mixin) {
            if (tick) {
                if (mixin[tickName]) {
                    tick = merge(tick, mixin[tickName]);
                }
            } else {
                tick = mixin[tickName];
            }
        }
        return tick;
    }, inspectObjects:function (f) {
        arr.forEach(["chart", "plotarea", "axis", "grid", "series", "marker", "indicator"], function (name) {
            f(this[name]);
        }, this);
        if (this.seriesThemes) {
            arr.forEach(this.seriesThemes, f);
        }
        if (this.markerThemes) {
            arr.forEach(this.markerThemes, f);
        }
    }, reverseFills:function () {
        this.inspectObjects(function (o) {
            if (o && o.fill) {
                o.fill = dgg.reverse(o.fill);
            }
        });
    }, addMarker:function (name, segment) {
        this.markers[name] = segment;
        this._buildMarkerArray();
    }, setMarkers:function (obj) {
        this.markers = obj;
        this._buildMarkerArray();
    }, _buildMarkerArray:function () {
        this._markers = [];
        for (var p in this.markers) {
            this._markers.push(this.markers[p]);
        }
    }});
    lang.mixin(SimpleTheme, {defaultMarkers:{CIRCLE:"m-3,0 c0,-4 6,-4 6,0 m-6,0 c0,4 6,4 6,0", SQUARE:"m-3,-3 l0,6 6,0 0,-6 z", DIAMOND:"m0,-3 l3,3 -3,3 -3,-3 z", CROSS:"m0,-3 l0,6 m-3,-3 l6,0", X:"m-3,-3 l6,6 m0,-6 l-6,6", TRIANGLE:"m-3,3 l3,-6 3,6 z", TRIANGLE_INVERTED:"m-3,-3 l3,6 3,-6 z"}, defaultColors:["#54544c", "#858e94", "#6e767a", "#948585", "#474747"], defaultTheme:{chart:{stroke:null, fill:"white", pageStyle:null, titleGap:20, titlePos:"top", titleFont:"normal normal bold 14pt Tahoma", titleFontColor:"#333"}, plotarea:{stroke:null, fill:"white"}, axis:{stroke:{color:"#333", width:1}, tick:{color:"#666", position:"center", font:"normal normal normal 7pt Tahoma", fontColor:"#333", labelGap:4}, majorTick:{width:1, length:6}, minorTick:{width:0.8, length:3}, microTick:{width:0.5, length:1}, title:{gap:15, font:"normal normal normal 11pt Tahoma", fontColor:"#333", orientation:"axis"}}, series:{stroke:{width:1.5, color:"#333"}, outline:{width:0.1, color:"#ccc"}, shadow:null, fill:"#ccc", font:"normal normal normal 8pt Tahoma", fontColor:"#000", labelWiring:{width:1, color:"#ccc"}}, marker:{stroke:{width:1.5, color:"#333"}, outline:{width:0.1, color:"#ccc"}, shadow:null, fill:"#ccc", font:"normal normal normal 8pt Tahoma", fontColor:"#000"}, indicator:{lineStroke:{width:1.5, color:"#333"}, lineOutline:{width:0.1, color:"#ccc"}, lineShadow:null, lineFill:null, stroke:{width:1.5, color:"#333"}, outline:{width:0.1, color:"#ccc"}, shadow:null, fill:"#ccc", radius:3, font:"normal normal normal 10pt Tahoma", fontColor:"#000", markerFill:"#ccc", markerSymbol:"m-3,0 c0,-4 6,-4 6,0 m-6,0 c0,4 6,4 6,0", markerStroke:{width:1.5, color:"#333"}, markerOutline:{width:0.1, color:"#ccc"}, markerShadow:null}}});
    return SimpleTheme;
});

