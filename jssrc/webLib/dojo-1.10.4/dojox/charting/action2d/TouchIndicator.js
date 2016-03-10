//>>built

define("dojox/charting/action2d/TouchIndicator", ["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/event", "dojo/has", "dojo/touch", "dojo/_base/connect", "./ChartAction", "./_IndicatorElement", "dojox/lang/utils"], function (lang, declare, eventUtil, has, touch, dconnect, ChartAction, IndicatorElement, du) {
    return declare("dojox.charting.action2d.TouchIndicator", ChartAction, {defaultParams:{series:"", dualIndicator:false, vertical:true, autoScroll:true, fixed:true, precision:0, lines:true, labels:true, markers:true}, optionalParams:{lineStroke:{}, outlineStroke:{}, shadowStroke:{}, lineFill:{}, stroke:{}, outline:{}, shadow:{}, fill:{}, fillFunc:null, labelFunc:null, font:"", fontColor:"", markerStroke:{}, markerOutline:{}, markerShadow:{}, markerFill:{}, markerSymbol:"", offset:{}, start:false}, constructor:function (chart, plot, kwArgs) {
        if (has("touch-events")) {
            this._listeners = [{eventName:"touchstart", methodName:"onTouchStart"}, {eventName:"touchmove", methodName:"onTouchMove"}, {eventName:"touchend", methodName:"onTouchEnd"}, {eventName:"touchcancel", methodName:"onTouchEnd"}];
        } else {
            this._listeners = [{eventName:touch.press, methodName:"onTouchStart"}, {eventName:touch.move, methodName:"onTouchMove"}, {eventName:touch.cancel, methodName:"onTouchEnd"}];
        }
        this.opt = lang.clone(this.defaultParams);
        du.updateWithObject(this.opt, kwArgs);
        du.updateWithPattern(this.opt, kwArgs, this.optionalParams);
        this._uName = "touchIndicator" + this.opt.series;
        this.connect();
    }, connect:function () {
        this.inherited(arguments);
        this.chart.addPlot(this._uName, {type:IndicatorElement, inter:this});
    }, disconnect:function () {
        var plot = this.chart.getPlot(this._uName);
        if (plot.pageCoord) {
            this.onTouchEnd();
        }
        this.chart.removePlot(this._uName);
        this.inherited(arguments);
    }, onChange:function (event) {
    }, onTouchStart:function (event) {
        if (!event.touches || event.touches.length == 1) {
            this._onTouchSingle(event, true);
        } else {
            if (this.opt.dualIndicator && event.touches.length == 2) {
                this._onTouchDual(event);
            }
        }
    }, onTouchMove:function (event) {
        if (!event.touches || event.touches.length == 1) {
            this._onTouchSingle(event);
        } else {
            if (this.opt.dualIndicator && event.touches.length == 2) {
                this._onTouchDual(event);
            }
        }
    }, _onTouchSingle:function (event, delayed) {
        if (!has("touch-events") && !this._onTouchEndHandler) {
            this._onTouchEndHandler = dconnect.connect(this.chart.node.ownerDocument, touch.release, this, "onTouchEnd");
        }
        if (this.chart._delayedRenderHandle && !delayed) {
            this.chart.render();
        }
        var plot = this.chart.getPlot(this._uName);
        plot.pageCoord = {x:event.touches ? event.touches[0].pageX : event.pageX, y:event.touches ? event.touches[0].pageY : event.pageY};
        plot.dirty = true;
        if (delayed) {
            this.chart.delayedRender();
        } else {
            this.chart.render();
        }
        eventUtil.stop(event);
    }, _onTouchDual:function (event) {
        if (!has("touch-events") && !this._onTouchEndHandler) {
            this._onTouchEndHandler = dconnect.connect(this.chart.node.ownerDocument, touch.release, this, "onTouchEnd");
        }
        if (this.chart._delayedRenderHandle) {
            this.chart.render();
        }
        var plot = this.chart.getPlot(this._uName);
        plot.pageCoord = {x:event.touches[0].pageX, y:event.touches[0].pageY};
        plot.secondCoord = {x:event.touches[1].pageX, y:event.touches[1].pageY};
        plot.dirty = true;
        this.chart.render();
        eventUtil.stop(event);
    }, onTouchEnd:function (event) {
        if (!has("touch-events") && this._onTouchEndHandler) {
            dconnect.disconnect(this._onTouchEndHandler);
            this._onTouchEndHandler = null;
        }
        var plot = this.chart.getPlot(this._uName);
        plot.stopTrack();
        plot.pageCoord = null;
        plot.secondCoord = null;
        plot.dirty = true;
        this.chart.delayedRender();
    }});
});

