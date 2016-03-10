//>>built

define("dojox/charting/Series", ["dojo/_base/lang", "dojo/_base/declare", "./Element"], function (lang, declare, Element) {
    return declare("dojox.charting.Series", Element, {constructor:function (chart, data, kwArgs) {
        lang.mixin(this, kwArgs);
        if (typeof this.plot != "string") {
            this.plot = "default";
        }
        this.update(data);
    }, clear:function () {
        this.dyn = {};
    }, update:function (data) {
        if (lang.isArray(data)) {
            this.data = data;
        } else {
            this.source = data;
            this.data = this.source.data;
            if (this.source.setSeriesObject) {
                this.source.setSeriesObject(this);
            }
        }
        this.dirty = true;
        this.clear();
    }});
});

