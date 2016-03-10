//>>built

define("dojox/charting/themes/gradientGenerator", ["dojo/_base/lang", "dojo/_base/array", "dojo/_base/Color", "../Theme", "dojox/color/_base", "./common"], function (lang, arr, Color, Theme, dxcolor, themes) {
    var gg = lang.getObject("gradientGenerator", true, themes);
    gg.generateFills = function (colors, fillPattern, lumFrom, lumTo) {
        return arr.map(colors, function (c) {
            return Theme.generateHslGradient(c, fillPattern, lumFrom, lumTo);
        });
    };
    gg.updateFills = function (themes, fillPattern, lumFrom, lumTo) {
        arr.forEach(themes, function (t) {
            if (t.fill && !t.fill.type) {
                t.fill = Theme.generateHslGradient(t.fill, fillPattern, lumFrom, lumTo);
            }
        });
    };
    gg.generateMiniTheme = function (colors, fillPattern, lumFrom, lumTo, lumStroke) {
        return arr.map(colors, function (c) {
            c = new dxcolor.Color(c);
            return {fill:Theme.generateHslGradient(c, fillPattern, lumFrom, lumTo), stroke:{color:Theme.generateHslColor(c, lumStroke)}};
        });
    };
    gg.generateGradientByIntensity = function (color, intensityMap) {
        color = new Color(color);
        return arr.map(intensityMap, function (stop) {
            var s = stop.i / 255;
            return {offset:stop.o, color:new Color([color.r * s, color.g * s, color.b * s, color.a])};
        });
    };
    return gg;
});

