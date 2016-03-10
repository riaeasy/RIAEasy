//>>built

define("dojox/charting/DataChart", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/declare", "dojo/_base/html", "dojo/_base/connect", "dojo/_base/array", "./Chart2D", "./themes/PlotKit/blue", "dojo/dom"], function (kernel, lang, declare, html, hub, arr, Chart, blue, dom) {
    kernel.experimental("dojox.charting.DataChart");
    var _yaxis = {vertical:true, min:0, max:10, majorTickStep:5, minorTickStep:1, natural:false, stroke:"black", majorTick:{stroke:"black", length:8}, minorTick:{stroke:"gray", length:2}, majorLabels:true};
    var _xaxis = {natural:true, majorLabels:true, includeZero:false, majorTickStep:1, majorTick:{stroke:"black", length:8}, fixUpper:"major", stroke:"black", htmlLabels:true, from:1};
    var chartPlot = {markers:true, tension:2, gap:2};
    return declare("dojox.charting.DataChart", Chart, {scroll:true, comparative:false, query:"*", queryOptions:"", fieldName:"value", chartTheme:blue, displayRange:0, stretchToFit:true, minWidth:200, minHeight:100, showing:true, label:"name", constructor:function (node, kwArgs) {
        this.domNode = dom.byId(node);
        lang.mixin(this, kwArgs);
        this.xaxis = lang.mixin(lang.mixin({}, _xaxis), kwArgs.xaxis);
        if (this.xaxis.labelFunc == "seriesLabels") {
            this.xaxis.labelFunc = lang.hitch(this, "seriesLabels");
        }
        this.yaxis = lang.mixin(lang.mixin({}, _yaxis), kwArgs.yaxis);
        if (this.yaxis.labelFunc == "seriesLabels") {
            this.yaxis.labelFunc = lang.hitch(this, "seriesLabels");
        }
        this._events = [];
        this.convertLabels(this.yaxis);
        this.convertLabels(this.xaxis);
        this.onSetItems = {};
        this.onSetInterval = 0;
        this.dataLength = 0;
        this.seriesData = {};
        this.seriesDataBk = {};
        this.firstRun = true;
        this.dataOffset = 0;
        this.chartTheme.plotarea.stroke = {color:"gray", width:3};
        this.setTheme(this.chartTheme);
        if (this.displayRange) {
            this.stretchToFit = false;
        }
        if (!this.stretchToFit) {
            this.xaxis.to = this.displayRange;
        }
        var cartesian = kwArgs.type && kwArgs.type != "Pie" && kwArgs.type.prototype.declaredClass != "dojox.charting.plot2d.Pie";
        if (cartesian) {
            this.addAxis("x", this.xaxis);
            this.addAxis("y", this.yaxis);
        }
        chartPlot.type = kwArgs.type || "Markers";
        this.addPlot("default", lang.mixin(chartPlot, kwArgs.chartPlot));
        if (cartesian) {
            this.addPlot("grid", lang.mixin(kwArgs.grid || {}, {type:"Grid", hMinorLines:true}));
        }
        if (this.showing) {
            this.render();
        }
        if (kwArgs.store) {
            this.setStore(kwArgs.store, kwArgs.query, kwArgs.fieldName, kwArgs.queryOptions);
        }
    }, destroy:function () {
        arr.forEach(this._events, hub.disconnect);
        this.inherited(arguments);
    }, setStore:function (store, query, fieldName, queryOptions) {
        this.firstRun = true;
        this.store = store || this.store;
        this.query = query || this.query;
        this.fieldName = fieldName || this.fieldName;
        this.label = this.store.getLabelAttributes();
        this.queryOptions = queryOptions || queryOptions;
        arr.forEach(this._events, hub.disconnect);
        this._events = [hub.connect(this.store, "onSet", this, "onSet"), hub.connect(this.store, "onError", this, "onError")];
        this.fetch();
    }, show:function () {
        if (!this.showing) {
            html.style(this.domNode, "display", "");
            this.showing = true;
            this.render();
        }
    }, hide:function () {
        if (this.showing) {
            html.style(this.domNode, "display", "none");
            this.showing = false;
        }
    }, onSet:function (item) {
        var nm = this.getProperty(item, this.label);
        if (nm in this.runs || this.comparative) {
            clearTimeout(this.onSetInterval);
            if (!this.onSetItems[nm]) {
                this.onSetItems[nm] = item;
            }
            this.onSetInterval = setTimeout(lang.hitch(this, function () {
                clearTimeout(this.onSetInterval);
                var items = [];
                for (var nm in this.onSetItems) {
                    items.push(this.onSetItems[nm]);
                }
                this.onData(items);
                this.onSetItems = {};
            }), 200);
        }
    }, onError:function (err) {
        console.error("DataChart Error:", err);
    }, onDataReceived:function (items) {
    }, getProperty:function (item, prop) {
        if (prop == this.label) {
            return this.store.getLabel(item);
        }
        if (prop == "id") {
            return this.store.getIdentity(item);
        }
        var value = this.store.getValues(item, prop);
        if (value.length < 2) {
            value = this.store.getValue(item, prop);
        }
        return value;
    }, onData:function (items) {
        if (!items || !items.length) {
            return;
        }
        if (this.items && this.items.length != items.length) {
            arr.forEach(items, function (m) {
                var id = this.getProperty(m, "id");
                arr.forEach(this.items, function (m2, i) {
                    if (this.getProperty(m2, "id") == id) {
                        this.items[i] = m2;
                    }
                }, this);
            }, this);
            items = this.items;
        }
        if (this.stretchToFit) {
            this.displayRange = items.length;
        }
        this.onDataReceived(items);
        this.items = items;
        if (this.comparative) {
            var nm = "default";
            this.seriesData[nm] = [];
            this.seriesDataBk[nm] = [];
            arr.forEach(items, function (m) {
                var field = this.getProperty(m, this.fieldName);
                this.seriesData[nm].push(field);
            }, this);
        } else {
            arr.forEach(items, function (m, i) {
                var nm = this.store.getLabel(m);
                if (!this.seriesData[nm]) {
                    this.seriesData[nm] = [];
                    this.seriesDataBk[nm] = [];
                }
                var field = this.getProperty(m, this.fieldName);
                if (lang.isArray(field)) {
                    this.seriesData[nm] = field;
                } else {
                    if (!this.scroll) {
                        var ar = arr.map(new Array(i + 1), function () {
                            return 0;
                        });
                        ar.push(Number(field));
                        this.seriesData[nm] = ar;
                    } else {
                        if (this.seriesDataBk[nm].length > this.seriesData[nm].length) {
                            this.seriesData[nm] = this.seriesDataBk[nm];
                        }
                        this.seriesData[nm].push(Number(field));
                    }
                    this.seriesDataBk[nm].push(Number(field));
                }
            }, this);
        }
        var displayData;
        if (this.firstRun) {
            this.firstRun = false;
            for (nm in this.seriesData) {
                this.addSeries(nm, this.seriesData[nm]);
                displayData = this.seriesData[nm];
            }
        } else {
            for (nm in this.seriesData) {
                displayData = this.seriesData[nm];
                if (this.scroll && displayData.length > this.displayRange) {
                    this.dataOffset = displayData.length - this.displayRange - 1;
                    displayData = displayData.slice(displayData.length - this.displayRange, displayData.length);
                }
                this.updateSeries(nm, displayData);
            }
        }
        this.dataLength = displayData.length;
        if (this.showing) {
            this.render();
        }
    }, fetch:function () {
        if (!this.store) {
            return;
        }
        this.store.fetch({query:this.query, queryOptions:this.queryOptions, start:this.start, count:this.count, sort:this.sort, onComplete:lang.hitch(this, function (data) {
            setTimeout(lang.hitch(this, function () {
                this.onData(data);
            }), 0);
        }), onError:lang.hitch(this, "onError")});
    }, convertLabels:function (axis) {
        if (!axis.labels || lang.isObject(axis.labels[0])) {
            return null;
        }
        axis.labels = arr.map(axis.labels, function (ele, i) {
            return {value:i, text:ele};
        });
        return null;
    }, seriesLabels:function (val) {
        val--;
        if (this.series.length < 1 || (!this.comparative && val > this.series.length)) {
            return "-";
        }
        if (this.comparative) {
            return this.store.getLabel(this.items[val]);
        } else {
            for (var i = 0; i < this.series.length; i++) {
                if (this.series[i].data[val] > 0) {
                    return this.series[i].name;
                }
            }
        }
        return "-";
    }, resizeChart:function (dim) {
        var w = Math.max(dim.w, this.minWidth);
        var h = Math.max(dim.h, this.minHeight);
        this.resize(w, h);
    }});
});

