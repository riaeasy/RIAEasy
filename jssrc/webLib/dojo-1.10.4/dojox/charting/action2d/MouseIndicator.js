//>>built

define("dojox/charting/action2d/MouseIndicator", ["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/connect", "dojo/_base/window", "dojo/sniff", "./ChartAction", "./_IndicatorElement", "dojox/lang/utils", "dojo/_base/event", "dojo/_base/array"], function (lang, declare, hub, win, has, ChartAction, IndicatorElement, du, eventUtil, arr) {
    return declare("dojox.charting.action2d.MouseIndicator", ChartAction, {defaultParams:{series:"", vertical:true, autoScroll:true, fixed:true, precision:0, lines:true, labels:true, markers:true}, optionalParams:{lineStroke:{}, outlineStroke:{}, shadowStroke:{}, lineFill:{}, stroke:{}, outline:{}, shadow:{}, fill:{}, fillFunc:null, labelFunc:null, font:"", fontColor:"", markerStroke:{}, markerOutline:{}, markerShadow:{}, markerFill:{}, markerSymbol:"", offset:{}, start:false, mouseOver:false}, constructor:function (chart, plot, kwArgs) {
        this.opt = lang.clone(this.defaultParams);
        du.updateWithObject(this.opt, kwArgs);
        du.updateWithPattern(this.opt, kwArgs, this.optionalParams);
        this._listeners = this.opt.mouseOver ? [{eventName:"onmousemove", methodName:"onMouseMove"}] : [{eventName:"onmousedown", methodName:"onMouseDown"}];
        this._uName = "mouseIndicator" + this.opt.series;
        this._handles = [];
        this.connect();
    }, _disconnectHandles:function () {
        if (has("ie")) {
            this.chart.node.releaseCapture();
        }
        arr.forEach(this._handles, hub.disconnect);
        this._handles = [];
    }, connect:function () {
        this.inherited(arguments);
        this.chart.addPlot(this._uName, {type:IndicatorElement, inter:this});
    }, disconnect:function () {
        if (this._isMouseDown) {
            this.onMouseUp();
        }
        this.chart.removePlot(this._uName);
        this.inherited(arguments);
        this._disconnectHandles();
    }, onChange:function (event) {
    }, onMouseDown:function (event) {
        this._isMouseDown = true;
        if (has("ie")) {
            this._handles.push(hub.connect(this.chart.node, "onmousemove", this, "onMouseMove"));
            this._handles.push(hub.connect(this.chart.node, "onmouseup", this, "onMouseUp"));
            this.chart.node.setCapture();
        } else {
            this._handles.push(hub.connect(win.doc, "onmousemove", this, "onMouseMove"));
            this._handles.push(hub.connect(win.doc, "onmouseup", this, "onMouseUp"));
        }
        this._onMouseSingle(event);
    }, onMouseMove:function (event) {
        if (this._isMouseDown || this.opt.mouseOver) {
            this._onMouseSingle(event);
        }
    }, _onMouseSingle:function (event) {
        var plot = this.chart.getPlot(this._uName);
        plot.pageCoord = {x:event.pageX, y:event.pageY};
        plot.dirty = true;
        this.chart.render();
        eventUtil.stop(event);
    }, onMouseUp:function (event) {
        var plot = this.chart.getPlot(this._uName);
        plot.stopTrack();
        this._isMouseDown = false;
        this._disconnectHandles();
        plot.pageCoord = null;
        plot.dirty = true;
        this.chart.render();
    }});
});

