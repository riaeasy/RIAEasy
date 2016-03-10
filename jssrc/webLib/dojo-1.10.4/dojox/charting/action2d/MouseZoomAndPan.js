//>>built

define("dojox/charting/action2d/MouseZoomAndPan", ["dojo/_base/declare", "dojo/_base/window", "dojo/_base/array", "dojo/_base/event", "dojo/_base/connect", "dojo/mouse", "./ChartAction", "dojo/sniff", "dojo/dom-prop", "dojo/keys", "require"], function (declare, win, arr, eventUtil, connect, mouse, ChartAction, has, domProp, keys, BidiMouseZoomAndPan) {
    var sUnit = has("mozilla") ? 3 : 120;
    var keyTests = {none:function (event) {
        return !event.ctrlKey && !event.altKey && !event.shiftKey;
    }, ctrl:function (event) {
        return event.ctrlKey && !event.altKey && !event.shiftKey;
    }, alt:function (event) {
        return !event.ctrlKey && event.altKey && !event.shiftKey;
    }, shift:function (event) {
        return !event.ctrlKey && !event.altKey && event.shiftKey;
    }};
    var MouseZoomAndPan = declare(0 ? "dojox.charting.action2d.NonBidiMouseZoomAndPan" : "dojox.charting.action2d.MouseZoomAndPan", ChartAction, {defaultParams:{axis:"x", scaleFactor:1.2, maxScale:100, enableScroll:true, enableDoubleClickZoom:true, enableKeyZoom:true, keyZoomModifier:"ctrl"}, optionalParams:{}, constructor:function (chart, plot, kwArgs) {
        this._listeners = [{eventName:mouse.wheel, methodName:"onMouseWheel"}];
        if (!kwArgs) {
            kwArgs = {};
        }
        this.axis = kwArgs.axis ? kwArgs.axis : "x";
        this.scaleFactor = kwArgs.scaleFactor ? kwArgs.scaleFactor : 1.2;
        this.maxScale = kwArgs.maxScale ? kwArgs.maxScale : 100;
        this.enableScroll = kwArgs.enableScroll != undefined ? kwArgs.enableScroll : true;
        this.enableDoubleClickZoom = kwArgs.enableDoubleClickZoom != undefined ? kwArgs.enableDoubleClickZoom : true;
        this.enableKeyZoom = kwArgs.enableKeyZoom != undefined ? kwArgs.enableKeyZoom : true;
        this.keyZoomModifier = kwArgs.keyZoomModifier ? kwArgs.keyZoomModifier : "ctrl";
        if (this.enableScroll) {
            this._listeners.push({eventName:"onmousedown", methodName:"onMouseDown"});
        }
        if (this.enableDoubleClickZoom) {
            this._listeners.push({eventName:"ondblclick", methodName:"onDoubleClick"});
        }
        if (this.enableKeyZoom) {
            this._listeners.push({eventName:"keypress", methodName:"onKeyPress"});
        }
        this._handles = [];
        this.connect();
    }, _disconnectHandles:function () {
        if (has("ie")) {
            this.chart.node.releaseCapture();
        }
        arr.forEach(this._handles, connect.disconnect);
        this._handles = [];
    }, connect:function () {
        this.inherited(arguments);
        if (this.enableKeyZoom) {
            domProp.set(this.chart.node, "tabindex", "0");
        }
    }, disconnect:function () {
        this.inherited(arguments);
        if (this.enableKeyZoom) {
            domProp.set(this.chart.node, "tabindex", "-1");
        }
        this._disconnectHandles();
    }, onMouseDown:function (event) {
        var chart = this.chart, axis = chart.getAxis(this.axis);
        if (!axis.vertical) {
            this._startCoord = event.pageX;
        } else {
            this._startCoord = event.pageY;
        }
        this._startOffset = axis.getWindowOffset();
        this._isPanning = true;
        if (has("ie")) {
            this._handles.push(connect.connect(this.chart.node, "onmousemove", this, "onMouseMove"));
            this._handles.push(connect.connect(this.chart.node, "onmouseup", this, "onMouseUp"));
            this.chart.node.setCapture();
        } else {
            this._handles.push(connect.connect(win.doc, "onmousemove", this, "onMouseMove"));
            this._handles.push(connect.connect(win.doc, "onmouseup", this, "onMouseUp"));
        }
        chart.node.focus();
        eventUtil.stop(event);
    }, onMouseMove:function (event) {
        if (this._isPanning) {
            var chart = this.chart, axis = chart.getAxis(this.axis);
            var delta = this._getDelta(event);
            var bounds = axis.getScaler().bounds, s = bounds.span / (bounds.upper - bounds.lower);
            var scale = axis.getWindowScale();
            chart.setAxisWindow(this.axis, scale, this._startOffset - delta / s / scale);
            chart.render();
        }
    }, onMouseUp:function (event) {
        this._isPanning = false;
        this._disconnectHandles();
    }, onMouseWheel:function (event) {
        var scroll = event.wheelDelta / sUnit;
        if (scroll > -1 && scroll < 0) {
            scroll = -1;
        } else {
            if (scroll > 0 && scroll < 1) {
                scroll = 1;
            }
        }
        this._onZoom(scroll, event);
    }, onKeyPress:function (event) {
        if (keyTests[this.keyZoomModifier](event)) {
            if (event.keyChar == "+" || event.keyCode == keys.NUMPAD_PLUS) {
                this._onZoom(1, event);
            } else {
                if (event.keyChar == "-" || event.keyCode == keys.NUMPAD_MINUS) {
                    this._onZoom(-1, event);
                }
            }
        }
    }, onDoubleClick:function (event) {
        var chart = this.chart, axis = chart.getAxis(this.axis);
        var scale = 1 / this.scaleFactor;
        if (axis.getWindowScale() == 1) {
            var scaler = axis.getScaler(), start = scaler.bounds.from, end = scaler.bounds.to, oldMiddle = (start + end) / 2, newMiddle = this.plot.toData({x:event.pageX, y:event.pageY})[this.axis], newStart = scale * (start - oldMiddle) + newMiddle, newEnd = scale * (end - oldMiddle) + newMiddle;
            chart.zoomIn(this.axis, [newStart, newEnd]);
        } else {
            chart.setAxisWindow(this.axis, 1, 0);
            chart.render();
        }
        eventUtil.stop(event);
    }, _onZoom:function (scroll, event) {
        var scale = (scroll < 0 ? Math.abs(scroll) * this.scaleFactor : 1 / (Math.abs(scroll) * this.scaleFactor));
        var chart = this.chart, axis = chart.getAxis(this.axis);
        var cscale = axis.getWindowScale();
        if (cscale / scale > this.maxScale) {
            return;
        }
        var scaler = axis.getScaler(), start = scaler.bounds.from, end = scaler.bounds.to;
        var middle = (event.type == "keypress") ? (start + end) / 2 : this.plot.toData({x:event.pageX, y:event.pageY})[this.axis];
        var newStart = scale * (start - middle) + middle, newEnd = scale * (end - middle) + middle;
        chart.zoomIn(this.axis, [newStart, newEnd]);
        eventUtil.stop(event);
    }, _getDelta:function (event) {
        return this.chart.getAxis(this.axis).vertical ? (this._startCoord - event.pageY) : (event.pageX - this._startCoord);
    }});
    return 0 ? declare("dojox.charting.action2d.MouseZoomAndPan", [MouseZoomAndPan, BidiMouseZoomAndPan]) : MouseZoomAndPan;
});

