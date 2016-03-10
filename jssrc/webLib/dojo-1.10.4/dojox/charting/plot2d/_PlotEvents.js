//>>built

define("dojox/charting/plot2d/_PlotEvents", ["dojo/_base/lang", "dojo/_base/array", "dojo/_base/declare", "dojo/_base/connect"], function (lang, arr, declare, hub) {
    return declare("dojox.charting.plot2d._PlotEvents", null, {constructor:function () {
        this._shapeEvents = [];
        this._eventSeries = {};
    }, destroy:function () {
        this.resetEvents();
        this.inherited(arguments);
    }, plotEvent:function (o) {
    }, raiseEvent:function (o) {
        this.plotEvent(o);
        var t = lang.delegate(o);
        t.originalEvent = o.type;
        t.originalPlot = o.plot;
        t.type = "onindirect";
        arr.forEach(this.chart.stack, function (plot) {
            if (plot !== this && plot.plotEvent) {
                t.plot = plot;
                plot.plotEvent(t);
            }
        }, this);
    }, connect:function (object, method) {
        this.dirty = true;
        return hub.connect(this, "plotEvent", object, method);
    }, events:function () {
        return !!this.plotEvent.after;
    }, resetEvents:function () {
        if (this._shapeEvents.length) {
            arr.forEach(this._shapeEvents, function (item) {
                item.shape.disconnect(item.handle);
            });
            this._shapeEvents = [];
        }
        this.raiseEvent({type:"onplotreset", plot:this});
    }, _connectSingleEvent:function (o, eventName) {
        this._shapeEvents.push({shape:o.eventMask, handle:o.eventMask.connect(eventName, this, function (e) {
            o.type = eventName;
            o.event = e;
            this.raiseEvent(o);
            o.event = null;
        })});
    }, _connectEvents:function (o) {
        if (o) {
            o.chart = this.chart;
            o.plot = this;
            o.hAxis = this.hAxis || null;
            o.vAxis = this.vAxis || null;
            o.eventMask = o.eventMask || o.shape;
            this._connectSingleEvent(o, "onmouseover");
            this._connectSingleEvent(o, "onmouseout");
            this._connectSingleEvent(o, "onclick");
        }
    }, _reconnectEvents:function (seriesName) {
        var a = this._eventSeries[seriesName];
        if (a) {
            arr.forEach(a, this._connectEvents, this);
        }
    }, fireEvent:function (seriesName, eventName, index, eventObject) {
        var s = this._eventSeries[seriesName];
        if (s && s.length && index < s.length) {
            var o = s[index];
            o.type = eventName;
            o.event = eventObject || null;
            this.raiseEvent(o);
            o.event = null;
        }
    }});
});

