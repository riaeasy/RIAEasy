//>>built

define("dojox/gfx3d/object", ["dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang", "dojox/gfx", "dojox/gfx/matrix", "./_base", "./scheduler", "./gradient", "./vector", "./matrix", "./lighting"], function (arrayUtil, declare, lang, gfx, matrixUtil2d, gfx3d, schedulerExtensions, Gradient, VectorUtil, matrixUtil, lightUtil) {
    var scheduler = schedulerExtensions.scheduler;
    var out = function (o, x) {
        if (arguments.length > 1) {
            o = x;
        }
        var e = {};
        for (var i in o) {
            if (i in e) {
                continue;
            }
        }
    };
    declare("dojox.gfx3d.Object", null, {constructor:function () {
        this.object = null;
        this.matrix = null;
        this.cache = null;
        this.renderer = null;
        this.parent = null;
        this.strokeStyle = null;
        this.fillStyle = null;
        this.shape = null;
    }, setObject:function (newObject) {
        this.object = gfx.makeParameters(this.object, newObject);
        return this;
    }, setTransform:function (matrix) {
        this.matrix = matrixUtil.clone(matrix ? matrixUtil.normalize(matrix) : gfx3d.identity, true);
        return this;
    }, applyRightTransform:function (matrix) {
        return matrix ? this.setTransform([this.matrix, matrix]) : this;
    }, applyLeftTransform:function (matrix) {
        return matrix ? this.setTransform([matrix, this.matrix]) : this;
    }, applyTransform:function (matrix) {
        return matrix ? this.setTransform([this.matrix, matrix]) : this;
    }, setFill:function (fill) {
        this.fillStyle = fill;
        return this;
    }, setStroke:function (stroke) {
        this.strokeStyle = stroke;
        return this;
    }, toStdFill:function (lighting, normal) {
        return (this.fillStyle && typeof this.fillStyle["type"] != "undefined") ? lighting[this.fillStyle.type](normal, this.fillStyle.finish, this.fillStyle.color) : this.fillStyle;
    }, invalidate:function () {
        this.renderer.addTodo(this);
    }, destroy:function () {
        if (this.shape) {
            var p = this.shape.getParent();
            if (p) {
                p.remove(this.shape);
            }
            this.shape = null;
        }
    }, render:function (camera) {
        throw "Pure virtual function, not implemented";
    }, draw:function (lighting) {
        throw "Pure virtual function, not implemented";
    }, getZOrder:function () {
        return 0;
    }, getOutline:function () {
        return null;
    }});
    declare("dojox.gfx3d.Scene", gfx3d.Object, {constructor:function () {
        this.objects = [];
        this.todos = [];
        this.schedule = scheduler.zOrder;
        this._draw = gfx3d.drawer.conservative;
    }, setFill:function (fill) {
        this.fillStyle = fill;
        arrayUtil.forEach(this.objects, function (item) {
            item.setFill(fill);
        });
        return this;
    }, setStroke:function (stroke) {
        this.strokeStyle = stroke;
        arrayUtil.forEach(this.objects, function (item) {
            item.setStroke(stroke);
        });
        return this;
    }, render:function (camera, deep) {
        var m = matrixUtil.multiply(camera, this.matrix);
        if (deep) {
            this.todos = this.objects;
        }
        arrayUtil.forEach(this.todos, function (item) {
            item.render(m, deep);
        });
    }, draw:function (lighting) {
        this.objects = this.schedule(this.objects);
        this._draw(this.todos, this.objects, this.renderer);
    }, addTodo:function (newObject) {
        if (arrayUtil.every(this.todos, function (item) {
            return item != newObject;
        })) {
            this.todos.push(newObject);
            this.invalidate();
        }
    }, invalidate:function () {
        this.parent.addTodo(this);
    }, getZOrder:function () {
        var zOrder = 0;
        arrayUtil.forEach(this.objects, function (item) {
            zOrder += item.getZOrder();
        });
        return (this.objects.length > 1) ? zOrder / this.objects.length : 0;
    }});
    declare("dojox.gfx3d.Edges", gfx3d.Object, {constructor:function () {
        this.object = lang.clone(gfx3d.defaultEdges);
    }, setObject:function (newObject, style) {
        this.object = gfx.makeParameters(this.object, (newObject instanceof Array) ? {points:newObject, style:style} : newObject);
        return this;
    }, getZOrder:function () {
        var zOrder = 0;
        arrayUtil.forEach(this.cache, function (item) {
            zOrder += item.z;
        });
        return (this.cache.length > 1) ? zOrder / this.cache.length : 0;
    }, render:function (camera) {
        var m = matrixUtil.multiply(camera, this.matrix);
        this.cache = arrayUtil.map(this.object.points, function (item) {
            return matrixUtil.multiplyPoint(m, item);
        });
    }, draw:function () {
        var c = this.cache;
        if (this.shape) {
            this.shape.setShape("");
        } else {
            this.shape = this.renderer.createPath();
        }
        var p = this.shape.setAbsoluteMode("absolute");
        if (this.object.style == "strip" || this.object.style == "loop") {
            p.moveTo(c[0].x, c[0].y);
            arrayUtil.forEach(c.slice(1), function (item) {
                p.lineTo(item.x, item.y);
            });
            if (this.object.style == "loop") {
                p.closePath();
            }
        } else {
            for (var i = 0; i < this.cache.length; ) {
                p.moveTo(c[i].x, c[i].y);
                i++;
                p.lineTo(c[i].x, c[i].y);
                i++;
            }
        }
        p.setStroke(this.strokeStyle);
    }});
    declare("dojox.gfx3d.Orbit", gfx3d.Object, {constructor:function () {
        this.object = lang.clone(gfx3d.defaultOrbit);
    }, render:function (camera) {
        var m = matrixUtil.multiply(camera, this.matrix);
        var angles = [0, Math.PI / 4, Math.PI / 3];
        var center = matrixUtil.multiplyPoint(m, this.object.center);
        var marks = arrayUtil.map(angles, function (item) {
            return {x:this.center.x + this.radius * Math.cos(item), y:this.center.y + this.radius * Math.sin(item), z:this.center.z};
        }, this.object);
        marks = arrayUtil.map(marks, function (item) {
            return matrixUtil.multiplyPoint(m, item);
        });
        var normal = VectorUtil.normalize(marks);
        marks = arrayUtil.map(marks, function (item) {
            return VectorUtil.substract(item, center);
        });
        var A = {xx:marks[0].x * marks[0].y, xy:marks[0].y * marks[0].y, xz:1, yx:marks[1].x * marks[1].y, yy:marks[1].y * marks[1].y, yz:1, zx:marks[2].x * marks[2].y, zy:marks[2].y * marks[2].y, zz:1, dx:0, dy:0, dz:0};
        var B = arrayUtil.map(marks, function (item) {
            return -Math.pow(item.x, 2);
        });
        var X = matrixUtil.multiplyPoint(matrixUtil.invert(A), B[0], B[1], B[2]);
        var theta = Math.atan2(X.x, 1 - X.y) / 2;
        var probes = arrayUtil.map(marks, function (item) {
            return matrixUtil2d.multiplyPoint(matrixUtil2d.rotate(-theta), item.x, item.y);
        });
        var a = Math.pow(probes[0].x, 2);
        var b = Math.pow(probes[0].y, 2);
        var c = Math.pow(probes[1].x, 2);
        var d = Math.pow(probes[1].y, 2);
        var rx = Math.sqrt((a * d - b * c) / (d - b));
        var ry = Math.sqrt((a * d - b * c) / (a - c));
        this.cache = {cx:center.x, cy:center.y, rx:rx, ry:ry, theta:theta, normal:normal};
    }, draw:function (lighting) {
        if (this.shape) {
            this.shape.setShape(this.cache);
        } else {
            this.shape = this.renderer.createEllipse(this.cache);
        }
        this.shape.applyTransform(matrixUtil2d.rotateAt(this.cache.theta, this.cache.cx, this.cache.cy)).setStroke(this.strokeStyle).setFill(this.toStdFill(lighting, this.cache.normal));
    }});
    declare("dojox.gfx3d.Path3d", gfx3d.Object, {constructor:function () {
        this.object = lang.clone(gfx3d.defaultPath3d);
        this.segments = [];
        this.absolute = true;
        this.last = {};
        this.path = "";
    }, _collectArgs:function (array, args) {
        for (var i = 0; i < args.length; ++i) {
            var t = args[i];
            if (typeof (t) == "boolean") {
                array.push(t ? 1 : 0);
            } else {
                if (typeof (t) == "number") {
                    array.push(t);
                } else {
                    if (t instanceof Array) {
                        this._collectArgs(array, t);
                    } else {
                        if ("x" in t && "y" in t) {
                            array.push(t.x);
                            array.push(t.y);
                        }
                    }
                }
            }
        }
    }, _validSegments:{m:3, l:3, z:0}, _pushSegment:function (action, args) {
        var group = this._validSegments[action.toLowerCase()], segment;
        if (typeof (group) == "number") {
            if (group) {
                if (args.length >= group) {
                    segment = {action:action, args:args.slice(0, args.length - args.length % group)};
                    this.segments.push(segment);
                }
            } else {
                segment = {action:action, args:[]};
                this.segments.push(segment);
            }
        }
    }, moveTo:function () {
        var args = [];
        this._collectArgs(args, arguments);
        this._pushSegment(this.absolute ? "M" : "m", args);
        return this;
    }, lineTo:function () {
        var args = [];
        this._collectArgs(args, arguments);
        this._pushSegment(this.absolute ? "L" : "l", args);
        return this;
    }, closePath:function () {
        this._pushSegment("Z", []);
        return this;
    }, render:function (camera) {
        var m = matrixUtil.multiply(camera, this.matrix);
        var path = "";
        var _validSegments = this._validSegments;
        arrayUtil.forEach(this.segments, function (item) {
            path += item.action;
            for (var i = 0; i < item.args.length; i += _validSegments[item.action.toLowerCase()]) {
                var pt = matrixUtil.multiplyPoint(m, item.args[i], item.args[i + 1], item.args[i + 2]);
                path += " " + pt.x + " " + pt.y;
            }
        });
        this.cache = path;
    }, _draw:function () {
        return this.parent.createPath(this.cache);
    }});
    declare("dojox.gfx3d.Triangles", gfx3d.Object, {constructor:function () {
        this.object = lang.clone(gfx3d.defaultTriangles);
    }, setObject:function (newObject, style) {
        if (newObject instanceof Array) {
            this.object = gfx.makeParameters(this.object, {points:newObject, style:style});
        } else {
            this.object = gfx.makeParameters(this.object, newObject);
        }
        return this;
    }, render:function (camera) {
        var m = matrixUtil.multiply(camera, this.matrix);
        var c = arrayUtil.map(this.object.points, function (item) {
            return matrixUtil.multiplyPoint(m, item);
        });
        this.cache = [];
        var pool = c.slice(0, 2);
        var center = c[0];
        if (this.object.style == "strip") {
            arrayUtil.forEach(c.slice(2), function (item) {
                pool.push(item);
                pool.push(pool[0]);
                this.cache.push(pool);
                pool = pool.slice(1, 3);
            }, this);
        } else {
            if (this.object.style == "fan") {
                arrayUtil.forEach(c.slice(2), function (item) {
                    pool.push(item);
                    pool.push(center);
                    this.cache.push(pool);
                    pool = [center, item];
                }, this);
            } else {
                for (var i = 0; i < c.length; ) {
                    this.cache.push([c[i], c[i + 1], c[i + 2], c[i]]);
                    i += 3;
                }
            }
        }
    }, draw:function (lighting) {
        this.cache = scheduler.bsp(this.cache, function (it) {
            return it;
        });
        if (this.shape) {
            this.shape.clear();
        } else {
            this.shape = this.renderer.createGroup();
        }
        arrayUtil.forEach(this.cache, function (item) {
            this.shape.createPolyline(item).setStroke(this.strokeStyle).setFill(this.toStdFill(lighting, VectorUtil.normalize(item)));
        }, this);
    }, getZOrder:function () {
        var zOrder = 0;
        arrayUtil.forEach(this.cache, function (item) {
            zOrder += (item[0].z + item[1].z + item[2].z) / 3;
        });
        return (this.cache.length > 1) ? zOrder / this.cache.length : 0;
    }});
    declare("dojox.gfx3d.Quads", gfx3d.Object, {constructor:function () {
        this.object = lang.clone(gfx3d.defaultQuads);
    }, setObject:function (newObject, style) {
        this.object = gfx.makeParameters(this.object, (newObject instanceof Array) ? {points:newObject, style:style} : newObject);
        return this;
    }, render:function (camera) {
        var m = matrixUtil.multiply(camera, this.matrix), i;
        var c = arrayUtil.map(this.object.points, function (item) {
            return matrixUtil.multiplyPoint(m, item);
        });
        this.cache = [];
        if (this.object.style == "strip") {
            var pool = c.slice(0, 2);
            for (i = 2; i < c.length; ) {
                pool = pool.concat([c[i], c[i + 1], pool[0]]);
                this.cache.push(pool);
                pool = pool.slice(2, 4);
                i += 2;
            }
        } else {
            for (i = 0; i < c.length; ) {
                this.cache.push([c[i], c[i + 1], c[i + 2], c[i + 3], c[i]]);
                i += 4;
            }
        }
    }, draw:function (lighting) {
        this.cache = gfx3d.scheduler.bsp(this.cache, function (it) {
            return it;
        });
        if (this.shape) {
            this.shape.clear();
        } else {
            this.shape = this.renderer.createGroup();
        }
        for (var x = 0; x < this.cache.length; x++) {
            this.shape.createPolyline(this.cache[x]).setStroke(this.strokeStyle).setFill(this.toStdFill(lighting, VectorUtil.normalize(this.cache[x])));
        }
    }, getZOrder:function () {
        var zOrder = 0;
        for (var x = 0; x < this.cache.length; x++) {
            var i = this.cache[x];
            zOrder += (i[0].z + i[1].z + i[2].z + i[3].z) / 4;
        }
        return (this.cache.length > 1) ? zOrder / this.cache.length : 0;
    }});
    declare("dojox.gfx3d.Polygon", gfx3d.Object, {constructor:function () {
        this.object = lang.clone(gfx3d.defaultPolygon);
    }, setObject:function (newObject) {
        this.object = gfx.makeParameters(this.object, (newObject instanceof Array) ? {path:newObject} : newObject);
        return this;
    }, render:function (camera) {
        var m = matrixUtil.multiply(camera, this.matrix);
        this.cache = arrayUtil.map(this.object.path, function (item) {
            return matrixUtil.multiplyPoint(m, item);
        });
        this.cache.push(this.cache[0]);
    }, draw:function (lighting) {
        if (this.shape) {
            this.shape.setShape({points:this.cache});
        } else {
            this.shape = this.renderer.createPolyline({points:this.cache});
        }
        this.shape.setStroke(this.strokeStyle).setFill(this.toStdFill(lighting, matrixUtil.normalize(this.cache)));
    }, getZOrder:function () {
        var zOrder = 0;
        for (var x = 0; x < this.cache.length; x++) {
            zOrder += this.cache[x].z;
        }
        return (this.cache.length > 1) ? zOrder / this.cache.length : 0;
    }, getOutline:function () {
        return this.cache.slice(0, 3);
    }});
    declare("dojox.gfx3d.Cube", gfx3d.Object, {constructor:function () {
        this.object = lang.clone(gfx3d.defaultCube);
        this.polygons = [];
    }, setObject:function (newObject) {
        this.object = gfx.makeParameters(this.object, newObject);
    }, render:function (camera) {
        var a = this.object.top;
        var g = this.object.bottom;
        var b = {x:g.x, y:a.y, z:a.z};
        var c = {x:g.x, y:g.y, z:a.z};
        var d = {x:a.x, y:g.y, z:a.z};
        var e = {x:a.x, y:a.y, z:g.z};
        var f = {x:g.x, y:a.y, z:g.z};
        var h = {x:a.x, y:g.y, z:g.z};
        var polygons = [a, b, c, d, e, f, g, h];
        var m = matrixUtil.multiply(camera, this.matrix);
        var p = arrayUtil.map(polygons, function (item) {
            return matrixUtil.multiplyPoint(m, item);
        });
        a = p[0];
        b = p[1];
        c = p[2];
        d = p[3];
        e = p[4];
        f = p[5];
        g = p[6];
        h = p[7];
        this.cache = [[a, b, c, d, a], [e, f, g, h, e], [a, d, h, e, a], [d, c, g, h, d], [c, b, f, g, c], [b, a, e, f, b]];
    }, draw:function (lighting) {
        this.cache = gfx3d.scheduler.bsp(this.cache, function (it) {
            return it;
        });
        var cache = this.cache.slice(3);
        if (this.shape) {
            this.shape.clear();
        } else {
            this.shape = this.renderer.createGroup();
        }
        for (var x = 0; x < cache.length; x++) {
            this.shape.createPolyline(cache[x]).setStroke(this.strokeStyle).setFill(this.toStdFill(lighting, VectorUtil.normalize(cache[x])));
        }
    }, getZOrder:function () {
        var top = this.cache[0][0];
        var bottom = this.cache[1][2];
        return (top.z + bottom.z) / 2;
    }});
    declare("dojox.gfx3d.Cylinder", gfx3d.Object, {constructor:function () {
        this.object = lang.clone(gfx3d.defaultCylinder);
    }, render:function (camera) {
        var m = matrixUtil.multiply(camera, this.matrix);
        var angles = [0, Math.PI / 4, Math.PI / 3];
        var center = matrixUtil.multiplyPoint(m, this.object.center);
        var marks = arrayUtil.map(angles, function (item) {
            return {x:this.center.x + this.radius * Math.cos(item), y:this.center.y + this.radius * Math.sin(item), z:this.center.z};
        }, this.object);
        marks = arrayUtil.map(marks, function (item) {
            return VectorUtil.substract(matrixUtil.multiplyPoint(m, item), center);
        });
        var A = {xx:marks[0].x * marks[0].y, xy:marks[0].y * marks[0].y, xz:1, yx:marks[1].x * marks[1].y, yy:marks[1].y * marks[1].y, yz:1, zx:marks[2].x * marks[2].y, zy:marks[2].y * marks[2].y, zz:1, dx:0, dy:0, dz:0};
        var B = arrayUtil.map(marks, function (item) {
            return -Math.pow(item.x, 2);
        });
        var X = matrixUtil.multiplyPoint(matrixUtil.invert(A), B[0], B[1], B[2]);
        var theta = Math.atan2(X.x, 1 - X.y) / 2;
        var probes = arrayUtil.map(marks, function (item) {
            return matrixUtil2d.multiplyPoint(matrixUtil2d.rotate(-theta), item.x, item.y);
        });
        var a = Math.pow(probes[0].x, 2);
        var b = Math.pow(probes[0].y, 2);
        var c = Math.pow(probes[1].x, 2);
        var d = Math.pow(probes[1].y, 2);
        var rx = Math.sqrt((a * d - b * c) / (d - b));
        var ry = Math.sqrt((a * d - b * c) / (a - c));
        if (rx < ry) {
            var t = rx;
            rx = ry;
            ry = t;
            theta -= Math.PI / 2;
        }
        var top = matrixUtil.multiplyPoint(m, VectorUtil.sum(this.object.center, {x:0, y:0, z:this.object.height}));
        var gradient = this.fillStyle.type == "constant" ? this.fillStyle.color : Gradient(this.renderer.lighting, this.fillStyle, this.object.center, this.object.radius, Math.PI, 2 * Math.PI, m);
        if (isNaN(rx) || isNaN(ry) || isNaN(theta)) {
            rx = this.object.radius, ry = 0, theta = 0;
        }
        this.cache = {center:center, top:top, rx:rx, ry:ry, theta:theta, gradient:gradient};
    }, draw:function () {
        var c = this.cache, v = VectorUtil, m = matrixUtil2d, centers = [c.center, c.top], normal = v.substract(c.top, c.center);
        if (v.dotProduct(normal, this.renderer.lighting.incident) > 0) {
            centers = [c.top, c.center];
            normal = v.substract(c.center, c.top);
        }
        var color = this.renderer.lighting[this.fillStyle.type](normal, this.fillStyle.finish, this.fillStyle.color), d = Math.sqrt(Math.pow(c.center.x - c.top.x, 2) + Math.pow(c.center.y - c.top.y, 2));
        if (this.shape) {
            this.shape.clear();
        } else {
            this.shape = this.renderer.createGroup();
        }
        this.shape.createPath("").moveTo(0, -c.rx).lineTo(d, -c.rx).lineTo(d, c.rx).lineTo(0, c.rx).arcTo(c.ry, c.rx, 0, true, true, 0, -c.rx).setFill(c.gradient).setStroke(this.strokeStyle).setTransform([m.translate(centers[0]), m.rotate(Math.atan2(centers[1].y - centers[0].y, centers[1].x - centers[0].x))]);
        if (c.rx > 0 && c.ry > 0) {
            this.shape.createEllipse({cx:centers[1].x, cy:centers[1].y, rx:c.rx, ry:c.ry}).setFill(color).setStroke(this.strokeStyle).applyTransform(m.rotateAt(c.theta, centers[1]));
        }
    }});
    declare("dojox.gfx3d.Viewport", gfx.Group, {constructor:function () {
        this.dimension = null;
        this.objects = [];
        this.todos = [];
        this.renderer = this;
        this.schedule = gfx3d.scheduler.zOrder;
        this.draw = gfx3d.drawer.conservative;
        this.deep = false;
        this.lights = [];
        this.lighting = null;
    }, setCameraTransform:function (matrix) {
        this.camera = matrixUtil.clone(matrix ? matrixUtil.normalize(matrix) : gfx3d.identity, true);
        this.invalidate();
        return this;
    }, applyCameraRightTransform:function (matrix) {
        return matrix ? this.setCameraTransform([this.camera, matrix]) : this;
    }, applyCameraLeftTransform:function (matrix) {
        return matrix ? this.setCameraTransform([matrix, this.camera]) : this;
    }, applyCameraTransform:function (matrix) {
        return this.applyCameraRightTransform(matrix);
    }, setLights:function (lights, ambient, specular) {
        this.lights = (lights instanceof Array) ? {sources:lights, ambient:ambient, specular:specular} : lights;
        var view = {x:0, y:0, z:1};
        this.lighting = new lightUtil.Model(view, this.lights.sources, this.lights.ambient, this.lights.specular);
        this.invalidate();
        return this;
    }, addLights:function (lights) {
        return this.setLights(this.lights.sources.concat(lights));
    }, addTodo:function (newObject) {
        if (arrayUtil.every(this.todos, function (item) {
            return item != newObject;
        })) {
            this.todos.push(newObject);
        }
    }, invalidate:function () {
        this.deep = true;
        this.todos = this.objects;
    }, setDimensions:function (dim) {
        if (dim) {
            var w = lang.isString(dim.width) ? parseInt(dim.width) : dim.width;
            var h = lang.isString(dim.height) ? parseInt(dim.height) : dim.height;
            if (this.rawNode) {
                var trs = this.rawNode.style;
                if (trs) {
                    trs.height = h;
                    trs.width = w;
                } else {
                    this.rawNode.width = w;
                    this.rawNode.height = h;
                }
            }
            this.dimension = {width:w, height:h};
        } else {
            this.dimension = null;
        }
    }, render:function () {
        if (!this.todos.length) {
            return;
        }
        var m = matrixUtil;
        for (var x = 0; x < this.todos.length; x++) {
            this.todos[x].render(matrixUtil.normalize([m.cameraRotateXg(180), m.cameraTranslate(0, this.dimension.height, 0), this.camera]), this.deep);
        }
        this.objects = this.schedule(this.objects);
        this.draw(this.todos, this.objects, this);
        this.todos = [];
        this.deep = false;
    }});
    gfx3d.Viewport.nodeType = gfx.Group.nodeType;
    gfx3d._creators = {createEdges:function (edges, style) {
        return this.create3DObject(gfx3d.Edges, edges, style);
    }, createTriangles:function (tris, style) {
        return this.create3DObject(gfx3d.Triangles, tris, style);
    }, createQuads:function (quads, style) {
        return this.create3DObject(gfx3d.Quads, quads, style);
    }, createPolygon:function (points) {
        return this.create3DObject(gfx3d.Polygon, points);
    }, createOrbit:function (orbit) {
        return this.create3DObject(gfx3d.Orbit, orbit);
    }, createCube:function (cube) {
        return this.create3DObject(gfx3d.Cube, cube);
    }, createCylinder:function (cylinder) {
        return this.create3DObject(gfx3d.Cylinder, cylinder);
    }, createPath3d:function (path) {
        return this.create3DObject(gfx3d.Path3d, path);
    }, createScene:function () {
        return this.create3DObject(gfx3d.Scene);
    }, create3DObject:function (objectType, rawObject, style) {
        var obj = new objectType();
        this.adopt(obj);
        if (rawObject) {
            obj.setObject(rawObject, style);
        }
        return obj;
    }, adopt:function (obj) {
        obj.renderer = this.renderer;
        obj.parent = this;
        this.objects.push(obj);
        this.addTodo(obj);
        return this;
    }, abandon:function (obj, silently) {
        for (var i = 0; i < this.objects.length; ++i) {
            if (this.objects[i] == obj) {
                this.objects.splice(i, 1);
            }
        }
        obj.parent = null;
        return this;
    }, setScheduler:function (scheduler) {
        this.schedule = scheduler;
    }, setDrawer:function (drawer) {
        this.draw = drawer;
    }};
    lang.extend(gfx3d.Viewport, gfx3d._creators);
    lang.extend(gfx3d.Scene, gfx3d._creators);
    delete gfx3d._creators;
    lang.extend(gfx.Surface, {createViewport:function () {
        var viewport = this.createObject(gfx3d.Viewport, null, true);
        viewport.setDimensions(this.getDimensions());
        return viewport;
    }});
    return gfx3d.Object;
});

