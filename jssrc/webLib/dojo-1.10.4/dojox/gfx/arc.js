//>>built

define("dojox/gfx/arc", ["./_base", "dojo/_base/lang", "./matrix"], function (g, lang, m) {
    var twoPI = 2 * Math.PI, pi4 = Math.PI / 4, pi8 = Math.PI / 8, pi48 = pi4 + pi8, curvePI4 = unitArcAsBezier(pi8);
    function unitArcAsBezier(alpha) {
        var cosa = Math.cos(alpha), sina = Math.sin(alpha), p2 = {x:cosa + (4 / 3) * (1 - cosa), y:sina - (4 / 3) * cosa * (1 - cosa) / sina};
        return {s:{x:cosa, y:-sina}, c1:{x:p2.x, y:-p2.y}, c2:p2, e:{x:cosa, y:sina}};
    }
    var arc = g.arc = {unitArcAsBezier:unitArcAsBezier, curvePI4:curvePI4, arcAsBezier:function (last, rx, ry, xRotg, large, sweep, x, y) {
        large = Boolean(large);
        sweep = Boolean(sweep);
        var xRot = m._degToRad(xRotg), rx2 = rx * rx, ry2 = ry * ry, pa = m.multiplyPoint(m.rotate(-xRot), {x:(last.x - x) / 2, y:(last.y - y) / 2}), pax2 = pa.x * pa.x, pay2 = pa.y * pa.y, c1 = Math.sqrt((rx2 * ry2 - rx2 * pay2 - ry2 * pax2) / (rx2 * pay2 + ry2 * pax2));
        if (isNaN(c1)) {
            c1 = 0;
        }
        var ca = {x:c1 * rx * pa.y / ry, y:-c1 * ry * pa.x / rx};
        if (large == sweep) {
            ca = {x:-ca.x, y:-ca.y};
        }
        var c = m.multiplyPoint([m.translate((last.x + x) / 2, (last.y + y) / 2), m.rotate(xRot)], ca);
        var elliptic_transform = m.normalize([m.translate(c.x, c.y), m.rotate(xRot), m.scale(rx, ry)]);
        var inversed = m.invert(elliptic_transform), sp = m.multiplyPoint(inversed, last), ep = m.multiplyPoint(inversed, x, y), startAngle = Math.atan2(sp.y, sp.x), endAngle = Math.atan2(ep.y, ep.x), theta = startAngle - endAngle;
        if (sweep) {
            theta = -theta;
        }
        if (theta < 0) {
            theta += twoPI;
        } else {
            if (theta > twoPI) {
                theta -= twoPI;
            }
        }
        var alpha = pi8, curve = curvePI4, step = sweep ? alpha : -alpha, result = [];
        for (var angle = theta; angle > 0; angle -= pi4) {
            if (angle < pi48) {
                alpha = angle / 2;
                curve = unitArcAsBezier(alpha);
                step = sweep ? alpha : -alpha;
                angle = 0;
            }
            var c2, e, M = m.normalize([elliptic_transform, m.rotate(startAngle + step)]);
            if (sweep) {
                c1 = m.multiplyPoint(M, curve.c1);
                c2 = m.multiplyPoint(M, curve.c2);
                e = m.multiplyPoint(M, curve.e);
            } else {
                c1 = m.multiplyPoint(M, curve.c2);
                c2 = m.multiplyPoint(M, curve.c1);
                e = m.multiplyPoint(M, curve.s);
            }
            result.push([c1.x, c1.y, c2.x, c2.y, e.x, e.y]);
            startAngle += 2 * step;
        }
        return result;
    }};
    return arc;
});

