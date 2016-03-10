//>>built

define("dojox/charting/widget/Chart", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/array", "dojo/dom-attr", "dojo/_base/declare", "dojo/query", "dijit/_WidgetBase", "../Chart", "dojo/has", "require", "dojox/lang/utils", "dojox/lang/functional", "dojox/lang/functional/lambda"], function (kernel, lang, arr, domAttr, declare, query, _WidgetBase, ChartBase, has, BidiChart, du, df, dfl) {
    var collectParams, collectAxisParams, collectPlotParams, collectActionParams, collectDataParams, notNull = function (o) {
        return o;
    }, dc = lang.getObject("dojox.charting");
    collectParams = function (node, type, kw) {
        var dp = eval("(" + type + ".prototype.defaultParams)");
        var x, attr;
        for (x in dp) {
            if (x in kw) {
                continue;
            }
            attr = node.getAttribute(x);
            kw[x] = du.coerceType(dp[x], attr == null || typeof attr == "undefined" ? dp[x] : attr);
        }
        var op = eval("(" + type + ".prototype.optionalParams)");
        for (x in op) {
            if (x in kw) {
                continue;
            }
            attr = node.getAttribute(x);
            if (attr != null) {
                kw[x] = du.coerceType(op[x], attr);
            }
        }
    };
    collectAxisParams = function (node) {
        var name = node.getAttribute("name"), type = node.getAttribute("type");
        if (!name) {
            return null;
        }
        var o = {name:name, kwArgs:{}}, kw = o.kwArgs;
        if (type) {
            if (dc.axis2d[type]) {
                type = kernel._scopeName + "x.charting.axis2d." + type;
            }
            var axis = eval("(" + type + ")");
            if (axis) {
                kw.type = axis;
            }
        } else {
            type = kernel._scopeName + "x.charting.axis2d.Default";
        }
        collectParams(node, type, kw);
        if (kw.font || kw.fontColor) {
            if (!kw.tick) {
                kw.tick = {};
            }
            if (kw.font) {
                kw.tick.font = kw.font;
            }
            if (kw.fontColor) {
                kw.tick.fontColor = kw.fontColor;
            }
        }
        return o;
    };
    collectPlotParams = function (node) {
        var name = node.getAttribute("name"), type = node.getAttribute("type");
        if (!name) {
            return null;
        }
        var o = {name:name, kwArgs:{}}, kw = o.kwArgs;
        if (type) {
            if (dc.plot2d && dc.plot2d[type]) {
                type = kernel._scopeName + "x.charting.plot2d." + type;
            }
            var plot = eval("(" + type + ")");
            if (plot) {
                kw.type = plot;
            }
        } else {
            type = kernel._scopeName + "x.charting.plot2d.Default";
        }
        collectParams(node, type, kw);
        var dp = eval("(" + type + ".prototype.baseParams)");
        var x, attr;
        for (x in dp) {
            if (x in kw) {
                continue;
            }
            attr = node.getAttribute(x);
            kw[x] = du.coerceType(dp[x], attr == null || typeof attr == "undefined" ? dp[x] : attr);
        }
        return o;
    };
    collectActionParams = function (node) {
        var plot = node.getAttribute("plot"), type = node.getAttribute("type");
        if (!plot) {
            plot = "default";
        }
        var o = {plot:plot, kwArgs:{}}, kw = o.kwArgs;
        if (type) {
            if (dc.action2d[type]) {
                type = kernel._scopeName + "x.charting.action2d." + type;
            }
            var action = eval("(" + type + ")");
            if (!action) {
                return null;
            }
            o.action = action;
        } else {
            return null;
        }
        collectParams(node, type, kw);
        return o;
    };
    collectDataParams = function (node) {
        var ga = lang.partial(domAttr.get, node);
        var name = ga("name");
        if (!name) {
            return null;
        }
        var o = {name:name, kwArgs:{}}, kw = o.kwArgs, t;
        t = ga("plot");
        if (t != null) {
            kw.plot = t;
        }
        t = ga("marker");
        if (t != null) {
            kw.marker = t;
        }
        t = ga("stroke");
        if (t != null) {
            kw.stroke = eval("(" + t + ")");
        }
        t = ga("outline");
        if (t != null) {
            kw.outline = eval("(" + t + ")");
        }
        t = ga("shadow");
        if (t != null) {
            kw.shadow = eval("(" + t + ")");
        }
        t = ga("fill");
        if (t != null) {
            kw.fill = eval("(" + t + ")");
        }
        t = ga("font");
        if (t != null) {
            kw.font = t;
        }
        t = ga("fontColor");
        if (t != null) {
            kw.fontColor = eval("(" + t + ")");
        }
        t = ga("legend");
        if (t != null) {
            kw.legend = t;
        }
        t = ga("data");
        if (t != null) {
            o.type = "data";
            o.data = t ? arr.map(String(t).split(","), Number) : [];
            return o;
        }
        t = ga("array");
        if (t != null) {
            o.type = "data";
            o.data = eval("(" + t + ")");
            return o;
        }
        t = ga("store");
        if (t != null) {
            o.type = "store";
            o.data = eval("(" + t + ")");
            t = ga("field");
            o.field = t != null ? t : "value";
            t = ga("query");
            if (!!t) {
                kw.query = t;
            }
            t = ga("queryOptions");
            if (!!t) {
                kw.queryOptions = eval("(" + t + ")");
            }
            t = ga("start");
            if (!!t) {
                kw.start = Number(t);
            }
            t = ga("count");
            if (!!t) {
                kw.count = Number(t);
            }
            t = ga("sort");
            if (!!t) {
                kw.sort = eval("(" + t + ")");
            }
            t = ga("valueFn");
            if (!!t) {
                kw.valueFn = dfl.lambda(t);
            }
            return o;
        }
        return null;
    };
    var Chart = declare(0 ? "dojox.charting.widget.NonBidiChart" : "dojox.charting.widget.Chart", _WidgetBase, {theme:null, margins:null, stroke:undefined, fill:undefined, buildRendering:function () {
        this.inherited(arguments);
        var n = this.domNode;
        var axes = query("> .axis", n).map(collectAxisParams).filter(notNull), plots = query("> .plot", n).map(collectPlotParams).filter(notNull), actions = query("> .action", n).map(collectActionParams).filter(notNull), series = query("> .series", n).map(collectDataParams).filter(notNull);
        n.innerHTML = "";
        var c = this.chart = new ChartBase(n, {margins:this.margins, stroke:this.stroke, fill:this.fill, textDir:this.textDir});
        if (this.theme) {
            c.setTheme(this.theme);
        }
        axes.forEach(function (axis) {
            c.addAxis(axis.name, axis.kwArgs);
        });
        plots.forEach(function (plot) {
            c.addPlot(plot.name, plot.kwArgs);
        });
        this.actions = actions.map(function (action) {
            return new action.action(c, action.plot, action.kwArgs);
        });
        var render = df.foldl(series, function (render, series) {
            if (series.type == "data") {
                c.addSeries(series.name, series.data, series.kwArgs);
                render = true;
            } else {
                c.addSeries(series.name, [0], series.kwArgs);
                var kw = {};
                du.updateWithPattern(kw, series.kwArgs, {"query":"", "queryOptions":null, "start":0, "count":1}, true);
                if (series.kwArgs.sort) {
                    kw.sort = lang.clone(series.kwArgs.sort);
                }
                lang.mixin(kw, {onComplete:function (data) {
                    var values;
                    if ("valueFn" in series.kwArgs) {
                        var fn = series.kwArgs.valueFn;
                        values = arr.map(data, function (x) {
                            return fn(series.data.getValue(x, series.field, 0));
                        });
                    } else {
                        values = arr.map(data, function (x) {
                            return series.data.getValue(x, series.field, 0);
                        });
                    }
                    c.addSeries(series.name, values, series.kwArgs).render();
                }});
                series.data.fetch(kw);
            }
            return render;
        }, false);
        if (render) {
            c.render();
        }
    }, destroy:function () {
        this.chart.destroy();
        this.inherited(arguments);
    }, resize:function (box) {
        this.chart.resize.apply(this.chart, arguments);
    }});
    return 0 ? declare("dojox.charting.widget.Chart", [Chart, BidiChart]) : Chart;
});

