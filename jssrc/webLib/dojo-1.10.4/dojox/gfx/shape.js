//>>built

define("dojox/gfx/shape", ["./_base", "dojo/_base/lang", "dojo/_base/declare", "dojo/_base/kernel", "dojo/_base/sniff", "dojo/on", "dojo/_base/array", "dojo/dom-construct", "dojo/_base/Color", "./matrix"], function (g, lang, declare, kernel, has, on, arr, domConstruct, Color, matrixLib) {
    var shape = g.shape = {};
    shape.Shape = declare("dojox.gfx.shape.Shape", null, {constructor:function () {
        this.rawNode = null;
        this.shape = null;
        this.matrix = null;
        this.fillStyle = null;
        this.strokeStyle = null;
        this.bbox = null;
        this.parent = null;
        this.parentMatrix = null;
        if (has("gfxRegistry")) {
            var uid = shape.register(this);
            this.getUID = function () {
                return uid;
            };
        }
    }, destroy:function () {
        if (has("gfxRegistry")) {
            shape.dispose(this);
        }
        if (this.rawNode && "__gfxObject__" in this.rawNode) {
            this.rawNode.__gfxObject__ = null;
        }
        this.rawNode = null;
    }, getNode:function () {
        return this.rawNode;
    }, getShape:function () {
        return this.shape;
    }, getTransform:function () {
        return this.matrix;
    }, getFill:function () {
        return this.fillStyle;
    }, getStroke:function () {
        return this.strokeStyle;
    }, getParent:function () {
        return this.parent;
    }, getBoundingBox:function () {
        return this.bbox;
    }, getTransformedBoundingBox:function () {
        var b = this.getBoundingBox();
        if (!b) {
            return null;
        }
        var m = this._getRealMatrix(), gm = matrixLib;
        return [gm.multiplyPoint(m, b.x, b.y), gm.multiplyPoint(m, b.x + b.width, b.y), gm.multiplyPoint(m, b.x + b.width, b.y + b.height), gm.multiplyPoint(m, b.x, b.y + b.height)];
    }, getEventSource:function () {
        return this.rawNode;
    }, setClip:function (clip) {
        this.clip = clip;
    }, getClip:function () {
        return this.clip;
    }, setShape:function (shape) {
        this.shape = g.makeParameters(this.shape, shape);
        this.bbox = null;
        return this;
    }, setFill:function (fill) {
        if (!fill) {
            this.fillStyle = null;
            return this;
        }
        var f = null;
        if (typeof (fill) == "object" && "type" in fill) {
            switch (fill.type) {
              case "linear":
                f = g.makeParameters(g.defaultLinearGradient, fill);
                break;
              case "radial":
                f = g.makeParameters(g.defaultRadialGradient, fill);
                break;
              case "pattern":
                f = g.makeParameters(g.defaultPattern, fill);
                break;
            }
        } else {
            f = g.normalizeColor(fill);
        }
        this.fillStyle = f;
        return this;
    }, setStroke:function (stroke) {
        if (!stroke) {
            this.strokeStyle = null;
            return this;
        }
        if (typeof stroke == "string" || lang.isArray(stroke) || stroke instanceof Color) {
            stroke = {color:stroke};
        }
        var s = this.strokeStyle = g.makeParameters(g.defaultStroke, stroke);
        s.color = g.normalizeColor(s.color);
        return this;
    }, setTransform:function (matrix) {
        this.matrix = matrixLib.clone(matrix ? matrixLib.normalize(matrix) : matrixLib.identity);
        return this._applyTransform();
    }, _applyTransform:function () {
        return this;
    }, moveToFront:function () {
        var p = this.getParent();
        if (p) {
            p._moveChildToFront(this);
            this._moveToFront();
        }
        return this;
    }, moveToBack:function () {
        var p = this.getParent();
        if (p) {
            p._moveChildToBack(this);
            this._moveToBack();
        }
        return this;
    }, _moveToFront:function () {
    }, _moveToBack:function () {
    }, applyRightTransform:function (matrix) {
        return matrix ? this.setTransform([this.matrix, matrix]) : this;
    }, applyLeftTransform:function (matrix) {
        return matrix ? this.setTransform([matrix, this.matrix]) : this;
    }, applyTransform:function (matrix) {
        return matrix ? this.setTransform([this.matrix, matrix]) : this;
    }, removeShape:function (silently) {
        if (this.parent) {
            this.parent.remove(this, silently);
        }
        return this;
    }, _setParent:function (parent, matrix) {
        this.parent = parent;
        return this._updateParentMatrix(matrix);
    }, _updateParentMatrix:function (matrix) {
        this.parentMatrix = matrix ? matrixLib.clone(matrix) : null;
        return this._applyTransform();
    }, _getRealMatrix:function () {
        var m = this.matrix;
        var p = this.parent;
        while (p) {
            if (p.matrix) {
                m = matrixLib.multiply(p.matrix, m);
            }
            p = p.parent;
        }
        return m;
    }});
    shape._eventsProcessing = {on:function (type, listener) {
        return on(this.getEventSource(), type, shape.fixCallback(this, g.fixTarget, listener));
    }, connect:function (name, object, method) {
        if (name.substring(0, 2) == "on") {
            name = name.substring(2);
        }
        return this.on(name, method ? lang.hitch(object, method) : object);
    }, disconnect:function (token) {
        return token.remove();
    }};
    shape.fixCallback = function (gfxElement, fixFunction, scope, method) {
        if (!method) {
            method = scope;
            scope = null;
        }
        if (lang.isString(method)) {
            scope = scope || kernel.global;
            if (!scope[method]) {
                throw (["dojox.gfx.shape.fixCallback: scope[\"", method, "\"] is null (scope=\"", scope, "\")"].join(""));
            }
            return function (e) {
                return fixFunction(e, gfxElement) ? scope[method].apply(scope, arguments || []) : undefined;
            };
        }
        return !scope ? function (e) {
            return fixFunction(e, gfxElement) ? method.apply(scope, arguments) : undefined;
        } : function (e) {
            return fixFunction(e, gfxElement) ? method.apply(scope, arguments || []) : undefined;
        };
    };
    lang.extend(shape.Shape, shape._eventsProcessing);
    shape.Container = {_init:function () {
        this.children = [];
        this._batch = 0;
    }, openBatch:function () {
        return this;
    }, closeBatch:function () {
        return this;
    }, add:function (shape) {
        var oldParent = shape.getParent();
        if (oldParent) {
            oldParent.remove(shape, true);
        }
        this.children.push(shape);
        return shape._setParent(this, this._getRealMatrix());
    }, remove:function (shape, silently) {
        for (var i = 0; i < this.children.length; ++i) {
            if (this.children[i] == shape) {
                if (silently) {
                } else {
                    shape.parent = null;
                    shape.parentMatrix = null;
                }
                this.children.splice(i, 1);
                break;
            }
        }
        return this;
    }, clear:function (destroy) {
        var shape;
        for (var i = 0; i < this.children.length; ++i) {
            shape = this.children[i];
            shape.parent = null;
            shape.parentMatrix = null;
            if (destroy) {
                shape.destroy();
            }
        }
        this.children = [];
        return this;
    }, getBoundingBox:function () {
        if (this.children) {
            var result = null;
            arr.forEach(this.children, function (shape) {
                var bb = shape.getBoundingBox();
                if (bb) {
                    var ct = shape.getTransform();
                    if (ct) {
                        bb = matrixLib.multiplyRectangle(ct, bb);
                    }
                    if (result) {
                        result.x = Math.min(result.x, bb.x);
                        result.y = Math.min(result.y, bb.y);
                        result.endX = Math.max(result.endX, bb.x + bb.width);
                        result.endY = Math.max(result.endY, bb.y + bb.height);
                    } else {
                        result = {x:bb.x, y:bb.y, endX:bb.x + bb.width, endY:bb.y + bb.height};
                    }
                }
            });
            if (result) {
                result.width = result.endX - result.x;
                result.height = result.endY - result.y;
            }
            return result;
        }
        return null;
    }, _moveChildToFront:function (shape) {
        for (var i = 0; i < this.children.length; ++i) {
            if (this.children[i] == shape) {
                this.children.splice(i, 1);
                this.children.push(shape);
                break;
            }
        }
        return this;
    }, _moveChildToBack:function (shape) {
        for (var i = 0; i < this.children.length; ++i) {
            if (this.children[i] == shape) {
                this.children.splice(i, 1);
                this.children.unshift(shape);
                break;
            }
        }
        return this;
    }};
    shape.Surface = declare("dojox.gfx.shape.Surface", null, {constructor:function () {
        this.rawNode = null;
        this._parent = null;
        this._nodes = [];
        this._events = [];
    }, destroy:function () {
        arr.forEach(this._nodes, domConstruct.destroy);
        this._nodes = [];
        arr.forEach(this._events, function (h) {
            if (h) {
                h.remove();
            }
        });
        this._events = [];
        this.rawNode = null;
        if (has("ie")) {
            while (this._parent.lastChild) {
                domConstruct.destroy(this._parent.lastChild);
            }
        } else {
            this._parent.innerHTML = "";
        }
        this._parent = null;
    }, getEventSource:function () {
        return this.rawNode;
    }, _getRealMatrix:function () {
        return null;
    }, isLoaded:true, onLoad:function (surface) {
    }, whenLoaded:function (context, method) {
        var f = lang.hitch(context, method);
        if (this.isLoaded) {
            f(this);
        } else {
            on.once(this, "load", function (surface) {
                f(surface);
            });
        }
    }});
    lang.extend(shape.Surface, shape._eventsProcessing);
    shape.Rect = declare("dojox.gfx.shape.Rect", shape.Shape, {constructor:function (rawNode) {
        this.shape = g.getDefault("Rect");
        this.rawNode = rawNode;
    }, getBoundingBox:function () {
        return this.shape;
    }});
    shape.Ellipse = declare("dojox.gfx.shape.Ellipse", shape.Shape, {constructor:function (rawNode) {
        this.shape = g.getDefault("Ellipse");
        this.rawNode = rawNode;
    }, getBoundingBox:function () {
        if (!this.bbox) {
            var shape = this.shape;
            this.bbox = {x:shape.cx - shape.rx, y:shape.cy - shape.ry, width:2 * shape.rx, height:2 * shape.ry};
        }
        return this.bbox;
    }});
    shape.Circle = declare("dojox.gfx.shape.Circle", shape.Shape, {constructor:function (rawNode) {
        this.shape = g.getDefault("Circle");
        this.rawNode = rawNode;
    }, getBoundingBox:function () {
        if (!this.bbox) {
            var shape = this.shape;
            this.bbox = {x:shape.cx - shape.r, y:shape.cy - shape.r, width:2 * shape.r, height:2 * shape.r};
        }
        return this.bbox;
    }});
    shape.Line = declare("dojox.gfx.shape.Line", shape.Shape, {constructor:function (rawNode) {
        this.shape = g.getDefault("Line");
        this.rawNode = rawNode;
    }, getBoundingBox:function () {
        if (!this.bbox) {
            var shape = this.shape;
            this.bbox = {x:Math.min(shape.x1, shape.x2), y:Math.min(shape.y1, shape.y2), width:Math.abs(shape.x2 - shape.x1), height:Math.abs(shape.y2 - shape.y1)};
        }
        return this.bbox;
    }});
    shape.Polyline = declare("dojox.gfx.shape.Polyline", shape.Shape, {constructor:function (rawNode) {
        this.shape = g.getDefault("Polyline");
        this.rawNode = rawNode;
    }, setShape:function (points, closed) {
        if (points && points instanceof Array) {
            this.inherited(arguments, [{points:points}]);
            if (closed && this.shape.points.length) {
                this.shape.points.push(this.shape.points[0]);
            }
        } else {
            this.inherited(arguments, [points]);
        }
        return this;
    }, _normalizePoints:function () {
        var p = this.shape.points, l = p && p.length;
        if (l && typeof p[0] == "number") {
            var points = [];
            for (var i = 0; i < l; i += 2) {
                points.push({x:p[i], y:p[i + 1]});
            }
            this.shape.points = points;
        }
    }, getBoundingBox:function () {
        if (!this.bbox && this.shape.points.length) {
            var p = this.shape.points;
            var l = p.length;
            var t = p[0];
            var bbox = {l:t.x, t:t.y, r:t.x, b:t.y};
            for (var i = 1; i < l; ++i) {
                t = p[i];
                if (bbox.l > t.x) {
                    bbox.l = t.x;
                }
                if (bbox.r < t.x) {
                    bbox.r = t.x;
                }
                if (bbox.t > t.y) {
                    bbox.t = t.y;
                }
                if (bbox.b < t.y) {
                    bbox.b = t.y;
                }
            }
            this.bbox = {x:bbox.l, y:bbox.t, width:bbox.r - bbox.l, height:bbox.b - bbox.t};
        }
        return this.bbox;
    }});
    shape.Image = declare("dojox.gfx.shape.Image", shape.Shape, {constructor:function (rawNode) {
        this.shape = g.getDefault("Image");
        this.rawNode = rawNode;
    }, getBoundingBox:function () {
        return this.shape;
    }, setStroke:function () {
        return this;
    }, setFill:function () {
        return this;
    }});
    shape.Text = declare(shape.Shape, {constructor:function (rawNode) {
        this.fontStyle = null;
        this.shape = g.getDefault("Text");
        this.rawNode = rawNode;
    }, getFont:function () {
        return this.fontStyle;
    }, setFont:function (newFont) {
        this.fontStyle = typeof newFont == "string" ? g.splitFontString(newFont) : g.makeParameters(g.defaultFont, newFont);
        this._setFont();
        return this;
    }, getBoundingBox:function () {
        var bbox = null, s = this.getShape();
        if (s.text) {
            bbox = g._base._computeTextBoundingBox(this);
        }
        return bbox;
    }});
    shape.Creator = {createShape:function (shape) {
        switch (shape.type) {
          case g.defaultPath.type:
            return this.createPath(shape);
          case g.defaultRect.type:
            return this.createRect(shape);
          case g.defaultCircle.type:
            return this.createCircle(shape);
          case g.defaultEllipse.type:
            return this.createEllipse(shape);
          case g.defaultLine.type:
            return this.createLine(shape);
          case g.defaultPolyline.type:
            return this.createPolyline(shape);
          case g.defaultImage.type:
            return this.createImage(shape);
          case g.defaultText.type:
            return this.createText(shape);
          case g.defaultTextPath.type:
            return this.createTextPath(shape);
        }
        return null;
    }, createGroup:function () {
        return this.createObject(g.Group);
    }, createRect:function (rect) {
        return this.createObject(g.Rect, rect);
    }, createEllipse:function (ellipse) {
        return this.createObject(g.Ellipse, ellipse);
    }, createCircle:function (circle) {
        return this.createObject(g.Circle, circle);
    }, createLine:function (line) {
        return this.createObject(g.Line, line);
    }, createPolyline:function (points) {
        return this.createObject(g.Polyline, points);
    }, createImage:function (image) {
        return this.createObject(g.Image, image);
    }, createText:function (text) {
        return this.createObject(g.Text, text);
    }, createPath:function (path) {
        return this.createObject(g.Path, path);
    }, createTextPath:function (text) {
        return this.createObject(g.TextPath, {}).setText(text);
    }, createObject:function (shapeType, rawShape) {
        return null;
    }};
    return shape;
});

