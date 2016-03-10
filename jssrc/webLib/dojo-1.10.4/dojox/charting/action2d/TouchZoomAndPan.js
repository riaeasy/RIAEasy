//>>built

define("dojox/charting/action2d/TouchZoomAndPan", ["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/event", "dojo/sniff", "./ChartAction", "../Element", "dojo/touch", "../plot2d/common", "require"], function (lang, declare, eventUtil, has, ChartAction, Element, touch, common, BidiTouchZoomAndPan) {
    var GlassView = declare(Element, {constructor:function (chart) {
    }, render:function () {
        if (!this.isDirty()) {
            return;
        }
        this.cleanGroup();
        this.group.createRect({width:this.chart.dim.width, height:this.chart.dim.height}).setFill("rgba(0,0,0,0)");
    }, clear:function () {
        this.dirty = true;
        if (this.chart.stack[0] != this) {
            this.chart.movePlotToFront(this.name);
        }
        return this;
    }, getSeriesStats:function () {
        return lang.delegate(common.defaultStats);
    }, initializeScalers:function () {
        return this;
    }, isDirty:function () {
        return this.dirty;
    }});
    var TouchZoomAndPan = declare(0 ? "dojox.charting.action2d.NonBidiTouchZoomAndPan" : "dojox.charting.action2d.TouchZoomAndPan", ChartAction, {defaultParams:{axis:"x", scaleFactor:1.2, maxScale:100, enableScroll:true, enableZoom:true}, optionalParams:{}, constructor:function (chart, plot, kwArgs) {
        this._listeners = [{eventName:touch.press, methodName:"onTouchStart"}, {eventName:touch.move, methodName:"onTouchMove"}, {eventName:touch.release, methodName:"onTouchEnd"}];
        if (!kwArgs) {
            kwArgs = {};
        }
        this.axis = kwArgs.axis ? kwArgs.axis : "x";
        this.scaleFactor = kwArgs.scaleFactor ? kwArgs.scaleFactor : 1.2;
        this.maxScale = kwArgs.maxScale ? kwArgs.maxScale : 100;
        this.enableScroll = kwArgs.enableScroll != undefined ? kwArgs.enableScroll : true;
        this.enableZoom = kwArgs.enableScroll != undefined ? kwArgs.enableZoom : true;
        this._uName = "touchZoomPan" + this.axis;
        this.connect();
    }, connect:function () {
        this.inherited(arguments);
        if (this.chart.surface.declaredClass.indexOf("svg") != -1) {
            this.chart.addPlot(this._uName, {type:GlassView});
        }
    }, disconnect:function () {
        if (this.chart.surface.declaredClass.indexOf("svg") != -1) {
            this.chart.removePlot(this._uName);
        }
        this.inherited(arguments);
    }, onTouchStart:function (event) {
        var chart = this.chart, axis = chart.getAxis(this.axis);
        var length = event.touches ? event.touches.length : 1;
        var coord = event.touches ? event.touches[0] : event;
        var prevPageCoord = this._startPageCoord;
        this._startPageCoord = {x:coord.pageX, y:coord.pageY};
        if ((this.enableZoom || this.enableScroll) && chart._delayedRenderHandle) {
            chart.render();
        }
        if (this.enableZoom && length >= 2) {
            this._startTime = 0;
            this._endPageCoord = {x:event.touches[1].pageX, y:event.touches[1].pageY};
            var middlePageCoord = {x:(this._startPageCoord.x + this._endPageCoord.x) / 2, y:(this._startPageCoord.y + this._endPageCoord.y) / 2};
            var scaler = axis.getScaler();
            this._initScale = axis.getWindowScale();
            var t = this._initData = this.plot.toData();
            this._middleCoord = t(middlePageCoord)[this.axis];
            this._startCoord = scaler.bounds.from;
            this._endCoord = scaler.bounds.to;
        } else {
            if (!event.touches || event.touches.length == 1) {
                if (!this._startTime) {
                    this._startTime = new Date().getTime();
                } else {
                    if ((new Date().getTime() - this._startTime) < 250 && Math.abs(this._startPageCoord.x - prevPageCoord.x) < 30 && Math.abs(this._startPageCoord.y - prevPageCoord.y) < 30) {
                        this._startTime = 0;
                        this.onDoubleTap(event);
                    } else {
                        this._startTime = 0;
                    }
                }
            } else {
                this._startTime = 0;
            }
            if (this.enableScroll) {
                this._startScroll(axis);
                eventUtil.stop(event);
            }
        }
    }, onTouchMove:function (event) {
        var chart = this.chart, axis = chart.getAxis(this.axis);
        var length = event.touches ? event.touches.length : 1;
        var pAttr = axis.vertical ? "pageY" : "pageX", attr = axis.vertical ? "y" : "x";
        this._startTime = 0;
        if (this.enableZoom && length >= 2) {
            var newMiddlePageCoord = {x:(event.touches[1].pageX + event.touches[0].pageX) / 2, y:(event.touches[1].pageY + event.touches[0].pageY) / 2};
            var scale = (this._endPageCoord[attr] - this._startPageCoord[attr]) / (event.touches[1][pAttr] - event.touches[0][pAttr]);
            if (this._initScale / scale > this.maxScale) {
                return;
            }
            var newMiddleCoord = this._initData(newMiddlePageCoord)[this.axis];
            var newStart = scale * (this._startCoord - newMiddleCoord) + this._middleCoord, newEnd = scale * (this._endCoord - newMiddleCoord) + this._middleCoord;
            chart.zoomIn(this.axis, [newStart, newEnd]);
            eventUtil.stop(event);
        } else {
            if (this.enableScroll) {
                var delta = this._getDelta(event);
                chart.setAxisWindow(this.axis, this._lastScale, this._initOffset - delta / this._lastFactor / this._lastScale);
                chart.delayedRender();
                eventUtil.stop(event);
            }
        }
    }, onTouchEnd:function (event) {
        var chart = this.chart, axis = chart.getAxis(this.axis);
        if ((!event.touches || event.touches.length == 1) && this.enableScroll) {
            var coord = event.touches ? event.touches[0] : event;
            this._startPageCoord = {x:coord.pageX, y:coord.pageY};
            this._startScroll(axis);
        }
    }, _startScroll:function (axis) {
        var bounds = axis.getScaler().bounds;
        this._initOffset = axis.getWindowOffset();
        this._lastScale = axis.getWindowScale();
        this._lastFactor = bounds.span / (bounds.upper - bounds.lower);
    }, onDoubleTap:function (event) {
        var chart = this.chart, axis = chart.getAxis(this.axis);
        var scale = 1 / this.scaleFactor;
        if (axis.getWindowScale() == 1) {
            var scaler = axis.getScaler(), start = scaler.bounds.from, end = scaler.bounds.to, oldMiddle = (start + end) / 2, newMiddle = this.plot.toData(this._startPageCoord)[this.axis], newStart = scale * (start - oldMiddle) + newMiddle, newEnd = scale * (end - oldMiddle) + newMiddle;
            chart.zoomIn(this.axis, [newStart, newEnd]);
        } else {
            chart.setAxisWindow(this.axis, 1, 0);
            chart.render();
        }
        eventUtil.stop(event);
    }, _getDelta:function (event) {
        var axis = this.chart.getAxis(this.axis), pAttr = axis.vertical ? "pageY" : "pageX", attr = axis.vertical ? "y" : "x";
        var coord = event.touches ? event.touches[0] : event;
        return axis.vertical ? (this._startPageCoord[attr] - coord[pAttr]) : (coord[pAttr] - this._startPageCoord[attr]);
    }});
    return 0 ? declare("dojox.charting.action2d.TouchZoomAndPan", [TouchZoomAndPan, BidiTouchZoomAndPan]) : TouchZoomAndPan;
});

