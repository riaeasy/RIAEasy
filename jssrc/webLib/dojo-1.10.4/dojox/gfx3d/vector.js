//>>built

define("dojox/gfx3d/vector", ["dojo/_base/lang", "dojo/_base/array", "./_base"], function (lang, arrayUtil, gfx3d) {
    gfx3d.vector = {sum:function () {
        var v = {x:0, y:0, z:0};
        arrayUtil.forEach(arguments, function (item) {
            v.x += item.x;
            v.y += item.y;
            v.z += item.z;
        });
        return v;
    }, center:function () {
        var l = arguments.length;
        if (l == 0) {
            return {x:0, y:0, z:0};
        }
        var v = gfx3d.vector.sum(arguments);
        return {x:v.x / l, y:v.y / l, z:v.z / l};
    }, substract:function (a, b) {
        return {x:a.x - b.x, y:a.y - b.y, z:a.z - b.z};
    }, _crossProduct:function (x, y, z, u, v, w) {
        return {x:y * w - z * v, y:z * u - x * w, z:x * v - y * u};
    }, crossProduct:function (a, b, c, d, e, f) {
        if (arguments.length == 6 && arrayUtil.every(arguments, function (item) {
            return typeof item == "number";
        })) {
            return gfx3d.vector._crossProduct(a, b, c, d, e, f);
        }
        return gfx3d.vector._crossProduct(a.x, a.y, a.z, b.x, b.y, b.z);
    }, _dotProduct:function (x, y, z, u, v, w) {
        return x * u + y * v + z * w;
    }, dotProduct:function (a, b, c, d, e, f) {
        if (arguments.length == 6 && arrayUtil.every(arguments, function (item) {
            return typeof item == "number";
        })) {
            return gfx3d.vector._dotProduct(a, b, c, d, e, f);
        }
        return gfx3d.vector._dotProduct(a.x, a.y, a.z, b.x, b.y, b.z);
    }, normalize:function (a, b, c) {
        var l, m, n;
        if (a instanceof Array) {
            l = a[0];
            m = a[1];
            n = a[2];
        } else {
            l = a;
            m = b;
            n = c;
        }
        var u = gfx3d.vector.substract(m, l);
        var v = gfx3d.vector.substract(n, l);
        return gfx3d.vector.crossProduct(u, v);
    }};
    return gfx3d.vector;
});

