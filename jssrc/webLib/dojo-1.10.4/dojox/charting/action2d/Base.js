//>>built

define("dojox/charting/action2d/Base", ["dojo/_base/lang", "dojo/_base/declare", "dojo/Evented"], function (lang, declare, Evented) {
    return declare("dojox.charting.action2d.Base", Evented, {constructor:function (chart, plot) {
        this.chart = chart;
        this.plot = plot ? (lang.isString(plot) ? this.chart.getPlot(plot) : plot) : this.chart.getPlot("default");
    }, connect:function () {
    }, disconnect:function () {
    }, destroy:function () {
        this.disconnect();
    }});
});

