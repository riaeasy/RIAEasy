//>>built

define("dojox/dgauges/components/utils", ["dojo/_base/lang", "dojo/_base/Color"], function (lang, Color) {
    var utils = {};
    lang.mixin(utils, {brightness:function (col, b) {
        var res = lang.mixin(null, col);
        res.r = Math.max(Math.min(res.r + b, 255), 0);
        res.g = Math.max(Math.min(res.g + b, 255), 0);
        res.b = Math.max(Math.min(res.b + b, 255), 0);
        return res;
    }, createGradient:function (entries) {
        var res = {colors:[]};
        var obj;
        for (var i = 0; i < entries.length; i++) {
            if (i % 2 == 0) {
                obj = {offset:entries[i]};
            } else {
                obj.color = entries[i];
                res.colors.push(obj);
            }
        }
        return res;
    }, _setter:function (obj, attributes, values) {
        for (var i = 0; i < attributes.length; i++) {
            obj[attributes[i]] = values[i];
        }
    }, genericCircularGauge:function (scale, indicator, originX, originY, radius, startAngle, endAngle, orientation, font, labelPosition, tickShapeFunc) {
        var attributes = ["originX", "originY", "radius", "startAngle", "endAngle", "orientation", "font", "labelPosition", "tickShapeFunc"];
        if (!orientation) {
            orientation = "clockwise";
        }
        if (!font) {
            font = {family:"Helvetica", style:"normal", size:"10pt", color:"#555555"};
        }
        if (!labelPosition) {
            labelPosition = "inside";
        }
        if (!tickShapeFunc) {
            tickShapeFunc = function (group, scale, tick) {
                var stroke = scale.tickStroke;
                var majorStroke;
                var minorStroke;
                if (stroke) {
                    majorStroke = {color:stroke.color ? stroke.color : "#000000", width:stroke.width ? stroke.width : 0.5};
                    var col = new Color(stroke.color).toRgb();
                    minorStroke = {color:stroke.color ? utils.brightness({r:col[0], g:col[1], b:col[2]}, 51) : "#000000", width:stroke.width ? stroke.width * 0.6 : 0.3};
                }
                return group.createLine({x1:tick.isMinor ? 2 : 0, y1:0, x2:tick.isMinor ? 8 : 10, y2:0}).setStroke(tick.isMinor ? minorStroke : majorStroke);
            };
        }
        this._setter(scale, attributes, [originX, originY, radius, startAngle, endAngle, orientation, font, labelPosition, tickShapeFunc]);
        indicator.set("interactionArea", "gauge");
        indicator.set("indicatorShapeFunc", function (group, indicator) {
            return group.createPolyline([0, -5, indicator.scale.radius - 6, 0, 0, 5, 0, -5]).setStroke({color:"#333333", width:0.25}).setFill(scale._gauge.indicatorColor);
        });
    }});
    return utils;
});

