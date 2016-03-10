//>>built

define("dojox/widget/DataPresentation", ["dijit", "dojo", "dojox", "dojo/require!dojox/grid/DataGrid,dojox/charting/Chart2D,dojox/charting/widget/Legend,dojox/charting/action2d/Tooltip,dojox/charting/action2d/Highlight,dojo/colors,dojo/data/ItemFileWriteStore"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.widget.DataPresentation");
    dojo.experimental("dojox.widget.DataPresentation");
    dojo.require("dojox.grid.DataGrid");
    dojo.require("dojox.charting.Chart2D");
    dojo.require("dojox.charting.widget.Legend");
    dojo.require("dojox.charting.action2d.Tooltip");
    dojo.require("dojox.charting.action2d.Highlight");
    dojo.require("dojo.colors");
    dojo.require("dojo.data.ItemFileWriteStore");
    (function () {
        var getLabels = function (range, labelMod, charttype, domNode) {
            var labels = [];
            labels[0] = {value:0, text:""};
            var nlabels = range.length;
            if ((charttype !== "ClusteredBars") && (charttype !== "StackedBars")) {
                var cwid = domNode.offsetWidth;
                var tmp = ("" + range[0]).length * range.length * 7;
                if (labelMod == 1) {
                    for (var z = 1; z < 500; ++z) {
                        if ((tmp / z) < cwid) {
                            break;
                        }
                        ++labelMod;
                    }
                }
            }
            for (var i = 0; i < nlabels; i++) {
                labels.push({value:i + 1, text:(!labelMod || i % labelMod) ? "" : range[i]});
            }
            labels.push({value:nlabels + 1, text:""});
            return labels;
        };
        var getIndependentAxisArgs = function (charttype, labels) {
            var args = {vertical:false, labels:labels, min:0, max:labels.length - 1, majorTickStep:1, minorTickStep:1};
            if ((charttype === "ClusteredBars") || (charttype === "StackedBars")) {
                args.vertical = true;
            }
            if ((charttype === "Lines") || (charttype === "Areas") || (charttype === "StackedAreas")) {
                args.min++;
                args.max--;
            }
            return args;
        };
        var getDependentAxisArgs = function (charttype, axistype, minval, maxval) {
            var args = {vertical:true, fixLower:"major", fixUpper:"major", natural:true};
            if (axistype === "secondary") {
                args.leftBottom = false;
            }
            if ((charttype === "ClusteredBars") || (charttype === "StackedBars")) {
                args.vertical = false;
            }
            if (minval == maxval) {
                args.min = minval - 1;
                args.max = maxval + 1;
            }
            return args;
        };
        var getPlotArgs = function (charttype, axistype, animate) {
            var args = {type:charttype, hAxis:"independent", vAxis:"dependent-" + axistype, gap:4, lines:false, areas:false, markers:false};
            if ((charttype === "ClusteredBars") || (charttype === "StackedBars")) {
                args.hAxis = args.vAxis;
                args.vAxis = "independent";
            }
            if ((charttype === "Lines") || (charttype === "Hybrid-Lines") || (charttype === "Areas") || (charttype === "StackedAreas")) {
                args.lines = true;
            }
            if ((charttype === "Areas") || (charttype === "StackedAreas")) {
                args.areas = true;
            }
            if (charttype === "Lines") {
                args.markers = true;
            }
            if (charttype === "Hybrid-Lines") {
                args.shadows = {dx:2, dy:2, dw:2};
                args.type = "Lines";
            }
            if (charttype === "Hybrid-ClusteredColumns") {
                args.type = "ClusteredColumns";
            }
            if (animate) {
                args.animate = animate;
            }
            return args;
        };
        var setupChart = function (domNode, chart, type, reverse, animate, labelMod, theme, tooltip, store, query, queryOptions) {
            var _chart = chart;
            if (!_chart) {
                domNode.innerHTML = "";
                _chart = new dojox.charting.Chart2D(domNode);
            }
            if (theme) {
                theme._clone = function () {
                    var result = new dojox.charting.Theme({chart:this.chart, plotarea:this.plotarea, axis:this.axis, series:this.series, marker:this.marker, antiAlias:this.antiAlias, assignColors:this.assignColors, assignMarkers:this.assigneMarkers, colors:dojo.delegate(this.colors)});
                    result.markers = this.markers;
                    result._buildMarkerArray();
                    return result;
                };
                _chart.setTheme(theme);
            }
            var range = store.series_data[0].slice(0);
            if (reverse) {
                range.reverse();
            }
            var labels = getLabels(range, labelMod, type, domNode);
            var plots = {};
            var maxval = null;
            var minval = null;
            var seriestoremove = {};
            for (var sname in _chart.runs) {
                seriestoremove[sname] = true;
            }
            var nseries = store.series_name.length;
            for (var i = 0; i < nseries; i++) {
                if (store.series_chart[i] && (store.series_data[i].length > 0)) {
                    var charttype = type;
                    var axistype = store.series_axis[i];
                    if (charttype == "Hybrid") {
                        if (store.series_charttype[i] == "line") {
                            charttype = "Hybrid-Lines";
                        } else {
                            charttype = "Hybrid-ClusteredColumns";
                        }
                    }
                    if (!plots[axistype]) {
                        plots[axistype] = {};
                    }
                    if (!plots[axistype][charttype]) {
                        var axisname = axistype + "-" + charttype;
                        _chart.addPlot(axisname, getPlotArgs(charttype, axistype, animate));
                        var tooltipArgs = {};
                        if (typeof tooltip == "string") {
                            tooltipArgs.text = function (o) {
                                var substitutions = [o.element, o.run.name, range[o.index], ((charttype === "ClusteredBars") || (charttype === "StackedBars")) ? o.x : o.y];
                                return dojo.replace(tooltip, substitutions);
                            };
                        } else {
                            if (typeof tooltip == "function") {
                                tooltipArgs.text = tooltip;
                            }
                        }
                        new dojox.charting.action2d.Tooltip(_chart, axisname, tooltipArgs);
                        if (charttype !== "Lines" && charttype !== "Hybrid-Lines") {
                            new dojox.charting.action2d.Highlight(_chart, axisname);
                        }
                        plots[axistype][charttype] = true;
                    }
                    var xvals = [];
                    var valen = store.series_data[i].length;
                    for (var j = 0; j < valen; j++) {
                        var val = store.series_data[i][j];
                        xvals.push(val);
                        if (maxval === null || val > maxval) {
                            maxval = val;
                        }
                        if (minval === null || val < minval) {
                            minval = val;
                        }
                    }
                    if (reverse) {
                        xvals.reverse();
                    }
                    var seriesargs = {plot:axistype + "-" + charttype};
                    if (store.series_linestyle[i]) {
                        seriesargs.stroke = {style:store.series_linestyle[i]};
                    }
                    _chart.addSeries(store.series_name[i], xvals, seriesargs);
                    delete seriestoremove[store.series_name[i]];
                }
            }
            for (sname in seriestoremove) {
                _chart.removeSeries(sname);
            }
            _chart.addAxis("independent", getIndependentAxisArgs(type, labels));
            _chart.addAxis("dependent-primary", getDependentAxisArgs(type, "primary", minval, maxval));
            _chart.addAxis("dependent-secondary", getDependentAxisArgs(type, "secondary", minval, maxval));
            return _chart;
        };
        var setupLegend = function (domNode, legend, chart, horizontal) {
            var _legend = legend;
            if (!_legend) {
                _legend = new dojox.charting.widget.Legend({chart:chart, horizontal:horizontal}, domNode);
            } else {
                _legend.refresh();
            }
            return _legend;
        };
        var setupGrid = function (domNode, grid, store, query, queryOptions) {
            var _grid = grid || new dojox.grid.DataGrid({}, domNode);
            _grid.startup();
            _grid.setStore(store, query, queryOptions);
            var structure = [];
            for (var ser = 0; ser < store.series_name.length; ser++) {
                if (store.series_grid[ser] && (store.series_data[ser].length > 0)) {
                    structure.push({field:"data." + ser, name:store.series_name[ser], width:"auto", formatter:store.series_gridformatter[ser]});
                }
            }
            _grid.setStructure(structure);
            return _grid;
        };
        var setupTitle = function (domNode, store) {
            if (store.title) {
                domNode.innerHTML = store.title;
            }
        };
        var setupFooter = function (domNode, store) {
            if (store.footer) {
                domNode.innerHTML = store.footer;
            }
        };
        var getSubfield = function (object, field) {
            var result = object;
            if (field) {
                var fragments = field.split(/[.\[\]]+/);
                for (var frag = 0, l = fragments.length; frag < l; frag++) {
                    if (result) {
                        result = result[fragments[frag]];
                    }
                }
            }
            return result;
        };
        dojo.declare("dojox.widget.DataPresentation", null, {type:"chart", chartType:"clusteredBars", reverse:false, animate:null, labelMod:1, legendHorizontal:true, constructor:function (node, args) {
            dojo.mixin(this, args);
            this.domNode = dojo.byId(node);
            this[this.type + "Node"] = this.domNode;
            if (typeof this.theme == "string") {
                this.theme = dojo.getObject(this.theme);
            }
            this.chartNode = dojo.byId(this.chartNode);
            this.legendNode = dojo.byId(this.legendNode);
            this.gridNode = dojo.byId(this.gridNode);
            this.titleNode = dojo.byId(this.titleNode);
            this.footerNode = dojo.byId(this.footerNode);
            if (this.legendVertical) {
                this.legendHorizontal = !this.legendVertical;
            }
            if (this.url) {
                this.setURL(null, null, this.refreshInterval);
            } else {
                if (this.data) {
                    this.setData(null, this.refreshInterval);
                } else {
                    this.setStore();
                }
            }
        }, setURL:function (url, urlContent, refreshInterval) {
            if (refreshInterval) {
                this.cancelRefresh();
            }
            this.url = url || this.url;
            this.urlContent = urlContent || this.urlContent;
            this.refreshInterval = refreshInterval || this.refreshInterval;
            var me = this;
            dojo.xhrGet({url:this.url, content:this.urlContent, handleAs:"json-comment-optional", load:function (response, ioArgs) {
                me.setData(response);
            }, error:function (xhr, ioArgs) {
                if (me.urlError && (typeof me.urlError == "function")) {
                    me.urlError(xhr, ioArgs);
                }
            }});
            if (refreshInterval && (this.refreshInterval > 0)) {
                this.refreshIntervalPending = setInterval(function () {
                    me.setURL();
                }, this.refreshInterval);
            }
        }, setData:function (data, refreshInterval) {
            if (refreshInterval) {
                this.cancelRefresh();
            }
            this.data = data || this.data;
            this.refreshInterval = refreshInterval || this.refreshInterval;
            var _series = (typeof this.series == "function") ? this.series(this.data) : this.series;
            var datasets = [], series_data = [], series_name = [], series_chart = [], series_charttype = [], series_linestyle = [], series_axis = [], series_grid = [], series_gridformatter = [], maxlen = 0;
            for (var ser = 0; ser < _series.length; ser++) {
                datasets[ser] = getSubfield(this.data, _series[ser].datapoints);
                if (datasets[ser] && (datasets[ser].length > maxlen)) {
                    maxlen = datasets[ser].length;
                }
                series_data[ser] = [];
                series_name[ser] = _series[ser].name || (_series[ser].namefield ? getSubfield(this.data, _series[ser].namefield) : null) || ("series " + ser);
                series_chart[ser] = (_series[ser].chart !== false);
                series_charttype[ser] = _series[ser].charttype || "bar";
                series_linestyle[ser] = _series[ser].linestyle;
                series_axis[ser] = _series[ser].axis || "primary";
                series_grid[ser] = (_series[ser].grid !== false);
                series_gridformatter[ser] = _series[ser].gridformatter;
            }
            var point, datapoint, datavalue, fdatavalue;
            var datapoints = [];
            for (point = 0; point < maxlen; point++) {
                datapoint = {index:point};
                for (ser = 0; ser < _series.length; ser++) {
                    if (datasets[ser] && (datasets[ser].length > point)) {
                        datavalue = getSubfield(datasets[ser][point], _series[ser].field);
                        if (series_chart[ser]) {
                            fdatavalue = parseFloat(datavalue);
                            if (!isNaN(fdatavalue)) {
                                datavalue = fdatavalue;
                            }
                        }
                        datapoint["data." + ser] = datavalue;
                        series_data[ser].push(datavalue);
                    }
                }
                datapoints.push(datapoint);
            }
            if (maxlen <= 0) {
                datapoints.push({index:0});
            }
            var store = new dojo.data.ItemFileWriteStore({data:{identifier:"index", items:datapoints}});
            if (this.data.title) {
                store.title = this.data.title;
            }
            if (this.data.footer) {
                store.footer = this.data.footer;
            }
            store.series_data = series_data;
            store.series_name = series_name;
            store.series_chart = series_chart;
            store.series_charttype = series_charttype;
            store.series_linestyle = series_linestyle;
            store.series_axis = series_axis;
            store.series_grid = series_grid;
            store.series_gridformatter = series_gridformatter;
            this.setPreparedStore(store);
            if (refreshInterval && (this.refreshInterval > 0)) {
                var me = this;
                this.refreshIntervalPending = setInterval(function () {
                    me.setData();
                }, this.refreshInterval);
            }
        }, refresh:function () {
            if (this.url) {
                this.setURL(this.url, this.urlContent, this.refreshInterval);
            } else {
                if (this.data) {
                    this.setData(this.data, this.refreshInterval);
                }
            }
        }, cancelRefresh:function () {
            if (this.refreshIntervalPending) {
                clearInterval(this.refreshIntervalPending);
                this.refreshIntervalPending = undefined;
            }
        }, setStore:function (store, query, queryOptions) {
            this.setPreparedStore(store, query, queryOptions);
        }, setPreparedStore:function (store, query, queryOptions) {
            this.preparedstore = store || this.store;
            this.query = query || this.query;
            this.queryOptions = queryOptions || this.queryOptions;
            if (this.preparedstore) {
                if (this.chartNode) {
                    this.chartWidget = setupChart(this.chartNode, this.chartWidget, this.chartType, this.reverse, this.animate, this.labelMod, this.theme, this.tooltip, this.preparedstore, this.query, this.queryOptions);
                    this.renderChartWidget();
                }
                if (this.legendNode) {
                    this.legendWidget = setupLegend(this.legendNode, this.legendWidget, this.chartWidget, this.legendHorizontal);
                }
                if (this.gridNode) {
                    this.gridWidget = setupGrid(this.gridNode, this.gridWidget, this.preparedstore, this.query, this.queryOptions);
                    this.renderGridWidget();
                }
                if (this.titleNode) {
                    setupTitle(this.titleNode, this.preparedstore);
                }
                if (this.footerNode) {
                    setupFooter(this.footerNode, this.preparedstore);
                }
            }
        }, renderChartWidget:function () {
            if (this.chartWidget) {
                this.chartWidget.render();
            }
        }, renderGridWidget:function () {
            if (this.gridWidget) {
                this.gridWidget.render();
            }
        }, getChartWidget:function () {
            return this.chartWidget;
        }, getGridWidget:function () {
            return this.gridWidget;
        }, destroy:function () {
            this.cancelRefresh();
            if (this.chartWidget) {
                this.chartWidget.destroy();
                delete this.chartWidget;
            }
            if (this.legendWidget) {
                delete this.legendWidget;
            }
            if (this.gridWidget) {
                delete this.gridWidget;
            }
            if (this.chartNode) {
                this.chartNode.innerHTML = "";
            }
            if (this.legendNode) {
                this.legendNode.innerHTML = "";
            }
            if (this.gridNode) {
                this.gridNode.innerHTML = "";
            }
            if (this.titleNode) {
                this.titleNode.innerHTML = "";
            }
            if (this.footerNode) {
                this.footerNode.innerHTML = "";
            }
        }});
    })();
});

