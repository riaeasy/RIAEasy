//>>built

define("dojox/charting/action2d/PlotAction", ["dojo/_base/connect", "dojo/_base/declare", "./Base", "dojo/fx/easing", "dojox/lang/functional"], function (hub, declare, Base, dfe, df) {
    var DEFAULT_DURATION = 400, DEFAULT_EASING = dfe.backOut;
    return declare("dojox.charting.action2d.PlotAction", Base, {overOutEvents:{onmouseover:1, onmouseout:1}, constructor:function (chart, plot, kwargs) {
        this.anim = {};
        if (!kwargs) {
            kwargs = {};
        }
        this.duration = kwargs.duration ? kwargs.duration : DEFAULT_DURATION;
        this.easing = kwargs.easing ? kwargs.easing : DEFAULT_EASING;
    }, connect:function () {
        this.handle = this.chart.connectToPlot(this.plot.name, this, "process");
    }, disconnect:function () {
        if (this.handle) {
            hub.disconnect(this.handle);
            this.handle = null;
        }
    }, reset:function () {
    }, destroy:function () {
        this.inherited(arguments);
        df.forIn(this.anim, function (o) {
            df.forIn(o, function (anim) {
                anim.action.stop(true);
            });
        });
        this.anim = {};
    }});
});

