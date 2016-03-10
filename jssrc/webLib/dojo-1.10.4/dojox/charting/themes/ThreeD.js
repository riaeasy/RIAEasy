//>>built

define("dojox/charting/themes/ThreeD", ["dojo/_base/lang", "dojo/_base/array", "../Theme", "./gradientGenerator", "./PrimaryColors", "dojo/colors", "./common"], function (lang, ArrayUtil, Theme, gradientGenerator, PrimaryColors, themes) {
    var colors = ["#f00", "#0f0", "#00f", "#ff0", "#0ff", "#f0f", "./common"], defaultFill = {type:"linear", space:"shape", x1:0, y1:0, x2:100, y2:0}, cyl3dMap = [{o:0, i:174}, {o:0.08, i:231}, {o:0.18, i:237}, {o:0.3, i:231}, {o:0.39, i:221}, {o:0.49, i:206}, {o:0.58, i:187}, {o:0.68, i:165}, {o:0.8, i:128}, {o:0.9, i:102}, {o:1, i:174}], hiliteIndex = 2, hiliteIntensity = 100, cyl3dFills = ArrayUtil.map(colors, function (c) {
        var fill = lang.delegate(defaultFill), colors = fill.colors = gradientGenerator.generateGradientByIntensity(c, cyl3dMap), hilite = colors[hiliteIndex].color;
        hilite.r += hiliteIntensity;
        hilite.g += hiliteIntensity;
        hilite.b += hiliteIntensity;
        hilite.sanitize();
        return fill;
    });
    themes.ThreeD = PrimaryColors.clone();
    themes.ThreeD.series.shadow = {dx:1, dy:1, width:3, color:[0, 0, 0, 0.15]};
    themes.ThreeD.next = function (elementType, mixin, doPost) {
        if (elementType == "bar" || elementType == "column") {
            var index = this._current % this.seriesThemes.length, s = this.seriesThemes[index], old = s.fill;
            s.fill = cyl3dFills[index];
            var theme = Theme.prototype.next.apply(this, arguments);
            s.fill = old;
            return theme;
        }
        return Theme.prototype.next.apply(this, arguments);
    };
    return themes.ThreeD;
});

