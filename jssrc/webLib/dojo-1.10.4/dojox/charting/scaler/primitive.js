//>>built

define("dojox/charting/scaler/primitive", ["dojo/_base/lang"], function (lang) {
    var primitive = lang.getObject("dojox.charting.scaler.primitive", true);
    return lang.mixin(primitive, {buildScaler:function (min, max, span, kwArgs) {
        if (min == max) {
            min -= 0.5;
            max += 0.5;
        }
        return {bounds:{lower:min, upper:max, from:min, to:max, scale:span / (max - min), span:span}, scaler:primitive};
    }, buildTicks:function (scaler, kwArgs) {
        return {major:[], minor:[], micro:[]};
    }, getTransformerFromModel:function (scaler) {
        var offset = scaler.bounds.from, scale = scaler.bounds.scale;
        return function (x) {
            return (x - offset) * scale;
        };
    }, getTransformerFromPlot:function (scaler) {
        var offset = scaler.bounds.from, scale = scaler.bounds.scale;
        return function (x) {
            return x / scale + offset;
        };
    }});
});

