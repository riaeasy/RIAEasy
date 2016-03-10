//>>built

define("dojox/dgauges/components/default/CircularLinearGauge", ["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/Color", "../utils", "../../CircularGauge", "../../LinearScaler", "../../CircularScale", "../../CircularValueIndicator", "../../TextIndicator", "../DefaultPropertiesMixin"], function (lang, declare, Color, utils, CircularGauge, LinearScaler, CircularScale, CircularValueIndicator, TextIndicator, DefaultPropertiesMixin) {
    return declare("dojox.dgauges.components.default.CircularLinearGauge", [CircularGauge, DefaultPropertiesMixin], {_radius:100, borderColor:"#C9DFF2", fillColor:"#FCFCFF", indicatorColor:"#F01E28", constructor:function () {
        this.borderColor = new Color(this.borderColor);
        this.fillColor = new Color(this.fillColor);
        this.indicatorColor = new Color(this.indicatorColor);
        this.addElement("background", lang.hitch(this, this.drawBackground));
        var scaler = new LinearScaler();
        var scale = new CircularScale();
        scale.set("scaler", scaler);
        this.addElement("scale", scale);
        var indicator = new CircularValueIndicator();
        scale.addIndicator("indicator", indicator);
        this.addElement("foreground", lang.hitch(this, this.drawForeground));
        var indicatorText = new TextIndicator();
        indicatorText.set("indicator", indicator);
        indicatorText.set("x", 100);
        indicatorText.set("y", 150);
        this.addElement("indicatorText", indicatorText);
        utils.genericCircularGauge(scale, indicator, this._radius, this._radius, 0.65 * this._radius, 130, 50, null, null, "outside");
    }, drawBackground:function (g) {
        var r = this._radius;
        var w = 2 * r;
        var h = w;
        var entries = utils.createGradient([0, utils.brightness(this.borderColor, 70), 1, utils.brightness(this.borderColor, -40)]);
        g.createEllipse({cx:r, cy:r, rx:r, ry:r}).setFill(lang.mixin({type:"linear", x1:w, y1:0, x2:0, y2:h}, entries)).setStroke({color:"#A5A5A5", width:0.2});
        entries = utils.createGradient([0, utils.brightness(this.borderColor, 70), 1, utils.brightness(this.borderColor, -50)]);
        g.createEllipse({cx:r, cy:r, rx:r * 0.99, ry:r * 0.99}).setFill(lang.mixin({type:"linear", x1:0, y1:0, x2:w, y2:h}, entries));
        entries = utils.createGradient([0, utils.brightness(this.borderColor, 60), 1, utils.brightness(this.borderColor, -40)]);
        g.createEllipse({cx:r, cy:r, rx:r * 0.92, ry:r * 0.92}).setFill(lang.mixin({type:"linear", x1:0, y1:0, x2:w, y2:h}, entries));
        entries = utils.createGradient([0, utils.brightness(this.borderColor, 70), 1, utils.brightness(this.borderColor, -40)]);
        g.createEllipse({cx:r, cy:r, rx:r * 0.9, ry:r * 0.9}).setFill(lang.mixin({type:"linear", x1:w, y1:0, x2:0, y2:h}, entries));
        entries = utils.createGradient([0, [255, 255, 255, 220], 0.8, utils.brightness(this.fillColor, -5), 1, utils.brightness(this.fillColor, -30)]);
        g.createEllipse({cx:r, cy:r, rx:r * 0.9, ry:r * 0.9}).setFill(lang.mixin({type:"radial", cx:r, cy:r, r:r}, entries)).setStroke({color:utils.brightness(this.fillColor, -40), width:0.4});
    }, drawForeground:function (g) {
        var r = 0.07 * this._radius;
        var entries = utils.createGradient([0, this.borderColor, 1, utils.brightness(this.borderColor, -20)]);
        g.createEllipse({cx:this._radius, cy:this._radius, rx:r, ry:r}).setFill(lang.mixin({type:"radial", cx:0.96 * this._radius, cy:0.96 * this._radius, r:r}, entries)).setStroke({color:utils.brightness(this.fillColor, -50), width:0.4});
    }});
});

