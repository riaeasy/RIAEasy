//>>built

define("dojox/widget/BarGauge", ["dijit", "dojo", "dojox", "dojo/require!dojox/widget/gauge/_Gauge,dojox/gauges/BarGauge"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.widget.BarGauge");
    dojo.require("dojox.widget.gauge._Gauge");
    dojo.require("dojox.gauges.BarGauge");
    dojox.widget.BarGauge = dojox.gauges.BarGauge;
    dojox.widget.gauge.BarLineIndicator = dojox.gauges.BarLineIndicator;
});

