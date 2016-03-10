//>>built

define("dojox/charting/bidi/widget/Legend", ["dojo/_base/declare", "dojo/dom", "dijit/registry", "dojo/_base/connect", "dojo/_base/array", "dojo/query"], function (declare, dom, widgetManager, hub, arrayUtil, query) {
    function validateTextDir(textDir) {
        return /^(ltr|rtl|auto)$/.test(textDir) ? textDir : null;
    }
    return declare(null, {postMixInProperties:function () {
        if (!this.chart) {
            if (!this.chartRef) {
                return;
            }
            var chart = widgetManager.byId(this.chartRef);
            if (!chart) {
                var node = dom.byId(this.chartRef);
                if (node) {
                    chart = widgetManager.byNode(node);
                } else {
                    return;
                }
            }
            this.textDir = chart.chart.textDir;
            hub.connect(chart.chart, "setTextDir", this, "_setTextDirAttr");
        } else {
            this.textDir = this.chart.textDir;
            hub.connect(this.chart, "setTextDir", this, "_setTextDirAttr");
        }
    }, _setTextDirAttr:function (textDir) {
        if (validateTextDir(textDir) != null) {
            if (this.textDir != textDir) {
                this._set("textDir", textDir);
                var legendLabels = query(".dojoxLegendText", this._tr);
                arrayUtil.forEach(legendLabels, function (label) {
                    label.dir = this.getTextDir(label.innerHTML, label.dir);
                }, this);
            }
        }
    }});
});

