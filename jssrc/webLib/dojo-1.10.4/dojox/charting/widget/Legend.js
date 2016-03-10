//>>built

define("dojox/charting/widget/Legend", ["dojo/_base/declare", "dijit/_WidgetBase", "dojox/gfx", "dojo/_base/array", "dojo/has", "require", "dojox/lang/functional", "dojo/dom", "dojo/dom-construct", "dojo/dom-class", "dijit/registry"], function (declare, _WidgetBase, gfx, arr, has, BidiLegend, df, dom, domConstruct, domClass, registry) {
    var Legend = declare(0 ? "dojox.charting.widget.NonBidiLegend" : "dojox.charting.widget.Legend", _WidgetBase, {chartRef:"", horizontal:true, swatchSize:18, legendBody:null, postCreate:function () {
        if (!this.chart && this.chartRef) {
            this.chart = registry.byId(this.chartRef) || registry.byNode(dom.byId(this.chartRef));
            if (!this.chart) {
                console.log("Could not find chart instance with id: " + this.chartRef);
            }
        }
        this.chart = this.chart.chart || this.chart;
        this.refresh();
    }, buildRendering:function () {
        this.domNode = domConstruct.create("table", {role:"group", "aria-label":"chart legend", "class":"dojoxLegendNode"});
        this.legendBody = domConstruct.create("tbody", null, this.domNode);
        this.inherited(arguments);
    }, destroy:function () {
        if (this._surfaces) {
            arr.forEach(this._surfaces, function (surface) {
                surface.destroy();
            });
        }
        this.inherited(arguments);
    }, refresh:function () {
        if (this._surfaces) {
            arr.forEach(this._surfaces, function (surface) {
                surface.destroy();
            });
        }
        this._surfaces = [];
        while (this.legendBody.lastChild) {
            domConstruct.destroy(this.legendBody.lastChild);
        }
        if (this.horizontal) {
            domClass.add(this.domNode, "dojoxLegendHorizontal");
            this._tr = domConstruct.create("tr", null, this.legendBody);
            this._inrow = 0;
        }
        var s = this.series || this.chart.series;
        if (s.length == 0) {
            return;
        }
        if (s[0].chart.stack[0].declaredClass == "dojox.charting.plot2d.Pie") {
            var t = s[0].chart.stack[0];
            if (typeof t.run.data[0] == "number") {
                var filteredRun = df.map(t.run.data, "Math.max(x, 0)");
                var slices = df.map(filteredRun, "/this", df.foldl(filteredRun, "+", 0));
                arr.forEach(slices, function (x, i) {
                    this._addLabel(t.dyn[i], t._getLabel(x * 100) + "%");
                }, this);
            } else {
                arr.forEach(t.run.data, function (x, i) {
                    this._addLabel(t.dyn[i], x.legend || x.text || x.y);
                }, this);
            }
        } else {
            arr.forEach(s, function (x) {
                this._addLabel(x.dyn, x.legend || x.name);
            }, this);
        }
    }, _addLabel:function (dyn, label) {
        var wrapper = domConstruct.create("td"), icon = domConstruct.create("div", null, wrapper), text = domConstruct.create("label", null, wrapper), div = domConstruct.create("div", {style:{"width":this.swatchSize + "px", "height":this.swatchSize + "px", "float":"left"}}, icon);
        domClass.add(icon, "dojoxLegendIcon dijitInline");
        domClass.add(text, "dojoxLegendText");
        if (this._tr) {
            this._tr.appendChild(wrapper);
            if (++this._inrow === this.horizontal) {
                this._tr = domConstruct.create("tr", null, this.legendBody);
                this._inrow = 0;
            }
        } else {
            var tr = domConstruct.create("tr", null, this.legendBody);
            tr.appendChild(wrapper);
        }
        this._makeIcon(div, dyn);
        text.innerHTML = String(label);
        if (0) {
            text.dir = this.getTextDir(label, text.dir);
        }
    }, _makeIcon:function (div, dyn) {
        var mb = {h:this.swatchSize, w:this.swatchSize};
        var surface = gfx.createSurface(div, mb.w, mb.h);
        this._surfaces.push(surface);
        if (dyn.fill) {
            surface.createRect({x:2, y:2, width:mb.w - 4, height:mb.h - 4}).setFill(dyn.fill).setStroke(dyn.stroke);
        } else {
            if (dyn.stroke || dyn.marker) {
                var line = {x1:0, y1:mb.h / 2, x2:mb.w, y2:mb.h / 2};
                if (dyn.stroke) {
                    surface.createLine(line).setStroke(dyn.stroke);
                }
                if (dyn.marker) {
                    var c = {x:mb.w / 2, y:mb.h / 2};
                    surface.createPath({path:"M" + c.x + " " + c.y + " " + dyn.marker}).setFill(dyn.markerFill).setStroke(dyn.markerStroke);
                }
            } else {
                surface.createRect({x:2, y:2, width:mb.w - 4, height:mb.h - 4}).setStroke("black");
                surface.createLine({x1:2, y1:2, x2:mb.w - 2, y2:mb.h - 2}).setStroke("black");
                surface.createLine({x1:2, y1:mb.h - 2, x2:mb.w - 2, y2:2}).setStroke("black");
            }
        }
    }});
    return 0 ? declare("dojox.charting.widget.Legend", [Legend, BidiLegend]) : Legend;
});

