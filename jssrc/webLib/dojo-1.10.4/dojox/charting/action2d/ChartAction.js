//>>built

define("dojox/charting/action2d/ChartAction", ["dojo/_base/connect", "dojo/_base/declare", "./Base"], function (hub, declare, Base) {
    return declare("dojox.charting.action2d.ChartAction", Base, {constructor:function (chart, plot) {
    }, connect:function () {
        for (var i = 0; i < this._listeners.length; ++i) {
            this._listeners[i].handle = hub.connect(this.chart.node, this._listeners[i].eventName, this, this._listeners[i].methodName);
        }
    }, disconnect:function () {
        for (var i = 0; i < this._listeners.length; ++i) {
            hub.disconnect(this._listeners[i].handle);
            delete this._listeners[i].handle;
        }
    }});
});

