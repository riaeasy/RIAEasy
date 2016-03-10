//>>built

define("dojox/gfx3d/matrix", ["dojo/_base/lang", "./_base"], function (lang, gfx3d) {
    gfx3d.matrix = {_degToRad:function (degree) {
        return Math.PI * degree / 180;
    }, _radToDeg:function (radian) {
        return radian / Math.PI * 180;
    }};
    gfx3d.matrix.Matrix3D = function (arg) {
        if (arg) {
            if (typeof arg == "number") {
                this.xx = this.yy = this.zz = arg;
            } else {
                if (arg instanceof Array) {
                    if (arg.length > 0) {
                        var m = gfx3d.matrix.normalize(arg[0]);
                        for (var i = 1; i < arg.length; ++i) {
                            var l = m;
                            var r = gfx3d.matrix.normalize(arg[i]);
                            m = new gfx3d.matrix.Matrix3D();
                            m.xx = l.xx * r.xx + l.xy * r.yx + l.xz * r.zx;
                            m.xy = l.xx * r.xy + l.xy * r.yy + l.xz * r.zy;
                            m.xz = l.xx * r.xz + l.xy * r.yz + l.xz * r.zz;
                            m.yx = l.yx * r.xx + l.yy * r.yx + l.yz * r.zx;
                            m.yy = l.yx * r.xy + l.yy * r.yy + l.yz * r.zy;
                            m.yz = l.yx * r.xz + l.yy * r.yz + l.yz * r.zz;
                            m.zx = l.zx * r.xx + l.zy * r.yx + l.zz * r.zx;
                            m.zy = l.zx * r.xy + l.zy * r.yy + l.zz * r.zy;
                            m.zz = l.zx * r.xz + l.zy * r.yz + l.zz * r.zz;
                            m.dx = l.xx * r.dx + l.xy * r.dy + l.xz * r.dz + l.dx;
                            m.dy = l.yx * r.dx + l.yy * r.dy + l.yz * r.dz + l.dy;
                            m.dz = l.zx * r.dx + l.zy * r.dy + l.zz * r.dz + l.dz;
                        }
                        lang.mixin(this, m);
                    }
                } else {
                    lang.mixin(this, arg);
                }
            }
        }
    };
    lang.extend(gfx3d.matrix.Matrix3D, {xx:1, xy:0, xz:0, yx:0, yy:1, yz:0, zx:0, zy:0, zz:1, dx:0, dy:0, dz:0});
    lang.mixin(gfx3d.matrix, {identity:new gfx3d.matrix.Matrix3D(), translate:function (a, b, c) {
        if (arguments.length > 1) {
            return new gfx3d.matrix.Matrix3D({dx:a, dy:b, dz:c});
        }
        return new gfx3d.matrix.Matrix3D({dx:a.x, dy:a.y, dz:a.z});
    }, scale:function (a, b, c) {
        if (arguments.length > 1) {
            return new gfx3d.matrix.Matrix3D({xx:a, yy:b, zz:c});
        }
        if (typeof a == "number") {
            return new gfx3d.matrix.Matrix3D({xx:a, yy:a, zz:a});
        }
        return new gfx3d.matrix.Matrix3D({xx:a.x, yy:a.y, zz:a.z});
    }, rotateX:function (angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        return new gfx3d.matrix.Matrix3D({yy:c, yz:-s, zy:s, zz:c});
    }, rotateXg:function (degree) {
        return gfx3d.matrix.rotateX(gfx3d.matrix._degToRad(degree));
    }, rotateY:function (angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        return new gfx3d.matrix.Matrix3D({xx:c, xz:s, zx:-s, zz:c});
    }, rotateYg:function (degree) {
        return gfx3d.matrix.rotateY(gfx3d.matrix._degToRad(degree));
    }, rotateZ:function (angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        return new gfx3d.matrix.Matrix3D({xx:c, xy:-s, yx:s, yy:c});
    }, rotateZg:function (degree) {
        return gfx3d.matrix.rotateZ(gfx3d.matrix._degToRad(degree));
    }, cameraTranslate:function (a, b, c) {
        if (arguments.length > 1) {
            return new gfx3d.matrix.Matrix3D({dx:-a, dy:-b, dz:-c});
        }
        return new gfx3d.matrix.Matrix3D({dx:-a.x, dy:-a.y, dz:-a.z});
    }, cameraRotateX:function (angle) {
        var c = Math.cos(-angle);
        var s = Math.sin(-angle);
        return new gfx3d.matrix.Matrix3D({yy:c, yz:-s, zy:s, zz:c});
    }, cameraRotateXg:function (degree) {
        return gfx3d.matrix.rotateX(gfx3d.matrix._degToRad(degree));
    }, cameraRotateY:function (angle) {
        var c = Math.cos(-angle);
        var s = Math.sin(-angle);
        return new gfx3d.matrix.Matrix3D({xx:c, xz:s, zx:-s, zz:c});
    }, cameraRotateYg:function (degree) {
        return gfx3d.matrix.rotateY(dojox.gfx3d.matrix._degToRad(degree));
    }, cameraRotateZ:function (angle) {
        var c = Math.cos(-angle);
        var s = Math.sin(-angle);
        return new gfx3d.matrix.Matrix3D({xx:c, xy:-s, yx:s, yy:c});
    }, cameraRotateZg:function (degree) {
        return gfx3d.matrix.rotateZ(gfx3d.matrix._degToRad(degree));
    }, normalize:function (matrix) {
        return (matrix instanceof gfx3d.matrix.Matrix3D) ? matrix : new gfx3d.matrix.Matrix3D(matrix);
    }, clone:function (matrix) {
        var obj = new gfx3d.matrix.Matrix3D();
        for (var i in matrix) {
            if (typeof (matrix[i]) == "number" && typeof (obj[i]) == "number" && obj[i] != matrix[i]) {
                obj[i] = matrix[i];
            }
        }
        return obj;
    }, invert:function (matrix) {
        var m = gfx3d.matrix.normalize(matrix);
        var D = m.xx * m.yy * m.zz + m.xy * m.yz * m.zx + m.xz * m.yx * m.zy - m.xx * m.yz * m.zy - m.xy * m.yx * m.zz - m.xz * m.yy * m.zx;
        var M = new gfx3d.matrix.Matrix3D({xx:(m.yy * m.zz - m.yz * m.zy) / D, xy:(m.xz * m.zy - m.xy * m.zz) / D, xz:(m.xy * m.yz - m.xz * m.yy) / D, yx:(m.yz * m.zx - m.yx * m.zz) / D, yy:(m.xx * m.zz - m.xz * m.zx) / D, yz:(m.xz * m.yx - m.xx * m.yz) / D, zx:(m.yx * m.zy - m.yy * m.zx) / D, zy:(m.xy * m.zx - m.xx * m.zy) / D, zz:(m.xx * m.yy - m.xy * m.yx) / D, dx:-1 * (m.xy * m.yz * m.dz + m.xz * m.dy * m.zy + m.dx * m.yy * m.zz - m.xy * m.dy * m.zz - m.xz * m.yy * m.dz - m.dx * m.yz * m.zy) / D, dy:(m.xx * m.yz * m.dz + m.xz * m.dy * m.zx + m.dx * m.yx * m.zz - m.xx * m.dy * m.zz - m.xz * m.yx * m.dz - m.dx * m.yz * m.zx) / D, dz:-1 * (m.xx * m.yy * m.dz + m.xy * m.dy * m.zx + m.dx * m.yx * m.zy - m.xx * m.dy * m.zy - m.xy * m.yx * m.dz - m.dx * m.yy * m.zx) / D});
        return M;
    }, _multiplyPoint:function (m, x, y, z) {
        return {x:m.xx * x + m.xy * y + m.xz * z + m.dx, y:m.yx * x + m.yy * y + m.yz * z + m.dy, z:m.zx * x + m.zy * y + m.zz * z + m.dz};
    }, multiplyPoint:function (matrix, a, b, c) {
        var m = gfx3d.matrix.normalize(matrix);
        if (typeof a == "number" && typeof b == "number" && typeof c == "number") {
            return gfx3d.matrix._multiplyPoint(m, a, b, c);
        }
        return gfx3d.matrix._multiplyPoint(m, a.x, a.y, a.z);
    }, multiply:function (matrix) {
        var m = gfx3d.matrix.normalize(matrix);
        for (var i = 1; i < arguments.length; ++i) {
            var l = m;
            var r = gfx3d.matrix.normalize(arguments[i]);
            m = new gfx3d.matrix.Matrix3D();
            m.xx = l.xx * r.xx + l.xy * r.yx + l.xz * r.zx;
            m.xy = l.xx * r.xy + l.xy * r.yy + l.xz * r.zy;
            m.xz = l.xx * r.xz + l.xy * r.yz + l.xz * r.zz;
            m.yx = l.yx * r.xx + l.yy * r.yx + l.yz * r.zx;
            m.yy = l.yx * r.xy + l.yy * r.yy + l.yz * r.zy;
            m.yz = l.yx * r.xz + l.yy * r.yz + l.yz * r.zz;
            m.zx = l.zx * r.xx + l.zy * r.yx + l.zz * r.zx;
            m.zy = l.zx * r.xy + l.zy * r.yy + l.zz * r.zy;
            m.zz = l.zx * r.xz + l.zy * r.yz + l.zz * r.zz;
            m.dx = l.xx * r.dx + l.xy * r.dy + l.xz * r.dz + l.dx;
            m.dy = l.yx * r.dx + l.yy * r.dy + l.yz * r.dz + l.dy;
            m.dz = l.zx * r.dx + l.zy * r.dy + l.zz * r.dz + l.dz;
        }
        return m;
    }, _project:function (m, x, y, z) {
        return {x:m.xx * x + m.xy * y + m.xz * z + m.dx, y:m.yx * x + m.yy * y + m.yz * z + m.dy, z:m.zx * x + m.zy * y + m.zz * z + m.dz};
    }, project:function (matrix, a, b, c) {
        var m = gfx3d.matrix.normalize(matrix);
        if (typeof a == "number" && typeof b == "number" && typeof c == "number") {
            return gfx3d.matrix._project(m, a, b, c);
        }
        return gfx3d.matrix._project(m, a.x, a.y, a.z);
    }});
    gfx3d.Matrix3D = gfx3d.matrix.Matrix3D;
    return gfx3d.matrix;
});

