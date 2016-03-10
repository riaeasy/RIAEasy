//>>built

define("dojox/charting/Theme", ["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/Color", "./SimpleTheme", "dojox/color/_base", "dojox/color/Palette", "dojox/gfx/gradutils"], function (lang, declare, Color, SimpleTheme, colorX, Palette) {
    var Theme = declare("dojox.charting.Theme", SimpleTheme, {});
    lang.mixin(Theme, {defineColors:function (kwArgs) {
        kwArgs = kwArgs || {};
        var l, c = [], n = kwArgs.num || 5;
        if (kwArgs.colors) {
            l = kwArgs.colors.length;
            for (var i = 0; i < n; i++) {
                c.push(kwArgs.colors[i % l]);
            }
            return c;
        }
        if (kwArgs.hue) {
            var s = kwArgs.saturation || 100, st = kwArgs.low || 30, end = kwArgs.high || 90;
            l = (end + st) / 2;
            return Palette.generate(colorX.fromHsv(kwArgs.hue, s, l), "monochromatic").colors;
        }
        if (kwArgs.generator) {
            return colorX.Palette.generate(kwArgs.base, kwArgs.generator).colors;
        }
        return c;
    }, generateGradient:function (fillPattern, colorFrom, colorTo) {
        var fill = lang.delegate(fillPattern);
        fill.colors = [{offset:0, color:colorFrom}, {offset:1, color:colorTo}];
        return fill;
    }, generateHslColor:function (color, luminance) {
        color = new Color(color);
        var hsl = color.toHsl(), result = colorX.fromHsl(hsl.h, hsl.s, luminance);
        result.a = color.a;
        return result;
    }, generateHslGradient:function (color, fillPattern, lumFrom, lumTo) {
        color = new Color(color);
        var hsl = color.toHsl(), colorFrom = colorX.fromHsl(hsl.h, hsl.s, lumFrom), colorTo = colorX.fromHsl(hsl.h, hsl.s, lumTo);
        colorFrom.a = colorTo.a = color.a;
        return Theme.generateGradient(fillPattern, colorFrom, colorTo);
    }});
    Theme.defaultMarkers = SimpleTheme.defaultMarkers;
    Theme.defaultColors = SimpleTheme.defaultColors;
    Theme.defaultTheme = SimpleTheme.defaultTheme;
    return Theme;
});

