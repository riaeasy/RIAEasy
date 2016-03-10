//>>built

define("dojox/gfx/gradient", ["dojo/_base/lang", "./matrix", "dojo/_base/Color"], function (lang, m, Color) {
    var grad = lang.getObject("dojox.gfx.gradient", true);
    var C = Color;
    grad.rescale = function (stops, from, to) {
        var len = stops.length, reverseFlag = (to < from), newStops;
        if (reverseFlag) {
            var tmp = from;
            from = to;
            to = tmp;
        }
        if (!len) {
            return [];
        }
        if (to <= stops[0].offset) {
            newStops = [{offset:0, color:stops[0].color}, {offset:1, color:stops[0].color}];
        } else {
            if (from >= stops[len - 1].offset) {
                newStops = [{offset:0, color:stops[len - 1].color}, {offset:1, color:stops[len - 1].color}];
            } else {
                var span = to - from, stop, prev, i;
                newStops = [];
                if (from < 0) {
                    newStops.push({offset:0, color:new C(stops[0].color)});
                }
                for (i = 0; i < len; ++i) {
                    stop = stops[i];
                    if (stop.offset >= from) {
                        break;
                    }
                }
                if (i) {
                    prev = stops[i - 1];
                    newStops.push({offset:0, color:Color.blendColors(new C(prev.color), new C(stop.color), (from - prev.offset) / (stop.offset - prev.offset))});
                } else {
                    newStops.push({offset:0, color:new C(stop.color)});
                }
                for (; i < len; ++i) {
                    stop = stops[i];
                    if (stop.offset >= to) {
                        break;
                    }
                    newStops.push({offset:(stop.offset - from) / span, color:new C(stop.color)});
                }
                if (i < len) {
                    prev = stops[i - 1];
                    newStops.push({offset:1, color:Color.blendColors(new C(prev.color), new C(stop.color), (to - prev.offset) / (stop.offset - prev.offset))});
                } else {
                    newStops.push({offset:1, color:new C(stops[len - 1].color)});
                }
            }
        }
        if (reverseFlag) {
            newStops.reverse();
            for (i = 0, len = newStops.length; i < len; ++i) {
                stop = newStops[i];
                stop.offset = 1 - stop.offset;
            }
        }
        return newStops;
    };
    function getPoint(x, y, matrix, project, shiftAndRotate, scale) {
        var r = m.multiplyPoint(matrix, x, y), p = m.multiplyPoint(project, r);
        return {r:r, p:p, o:m.multiplyPoint(shiftAndRotate, p).x / scale};
    }
    function sortPoints(a, b) {
        return a.o - b.o;
    }
    grad.project = function (matrix, gradient, tl, rb, ttl, trb) {
        matrix = matrix || m.identity;
        var f1 = m.multiplyPoint(matrix, gradient.x1, gradient.y1), f2 = m.multiplyPoint(matrix, gradient.x2, gradient.y2), angle = Math.atan2(f2.y - f1.y, f2.x - f1.x), project = m.project(f2.x - f1.x, f2.y - f1.y), pf1 = m.multiplyPoint(project, f1), pf2 = m.multiplyPoint(project, f2), shiftAndRotate = new m.Matrix2D([m.rotate(-angle), {dx:-pf1.x, dy:-pf1.y}]), scale = m.multiplyPoint(shiftAndRotate, pf2).x, points = [getPoint(tl.x, tl.y, matrix, project, shiftAndRotate, scale), getPoint(rb.x, rb.y, matrix, project, shiftAndRotate, scale), getPoint(tl.x, rb.y, matrix, project, shiftAndRotate, scale), getPoint(rb.x, tl.y, matrix, project, shiftAndRotate, scale)].sort(sortPoints), from = points[0].o, to = points[3].o, stops = grad.rescale(gradient.colors, from, to), angle2 = Math.atan2(points[3].r.y - points[0].r.y, points[3].r.x - points[0].r.x);
        return {type:"linear", x1:points[0].p.x, y1:points[0].p.y, x2:points[3].p.x, y2:points[3].p.y, colors:stops, angle:angle};
    };
    return grad;
});

