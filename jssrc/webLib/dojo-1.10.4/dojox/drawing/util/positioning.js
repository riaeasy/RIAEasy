//>>built

define("dojox/drawing/util/positioning", ["./common"], function (common) {
    var textOffset = 4;
    var textYOffset = 20;
    var positioning = {};
    positioning.label = function (start, end) {
        var x = 0.5 * (start.x + end.x);
        var y = 0.5 * (start.y + end.y);
        var slope = common.slope(start, end);
        var deltay = textOffset / Math.sqrt(1 + slope * slope);
        if (end.y > start.y && end.x > start.x || end.y < start.y && end.x < start.x) {
            deltay = -deltay;
            y -= textYOffset;
        }
        x += -deltay * slope;
        y += deltay;
        var align = end.x < start.x ? "end" : "start";
        return {x:x, y:y, foo:"bar", align:align};
    };
    positioning.angle = function (start, end) {
        var x = 0.7 * start.x + 0.3 * end.x;
        var y = 0.7 * start.y + 0.3 * end.y;
        var slope = common.slope(start, end);
        var deltay = textOffset / Math.sqrt(1 + slope * slope);
        if (end.x < start.x) {
            deltay = -deltay;
        }
        x += -deltay * slope;
        y += deltay;
        var align = end.y > start.y ? "end" : "start";
        y += end.x > start.x ? 0.5 * textYOffset : -0.5 * textYOffset;
        return {x:x, y:y, align:align};
    };
    return positioning;
});

