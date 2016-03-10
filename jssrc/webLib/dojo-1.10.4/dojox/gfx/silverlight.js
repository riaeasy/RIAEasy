//>>built

define("dojox/gfx/silverlight", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/declare", "dojo/_base/Color", "dojo/on", "dojo/_base/array", "dojo/dom-geometry", "dojo/dom", "dojo/_base/sniff", "./_base", "./shape", "./path", "./registry"], function (kernel, lang, declare, color, on, arr, domGeom, dom, has, g, gs, pathLib) {
    var sl = g.silverlight = {};
    kernel.experimental("dojox.gfx.silverlight");
    var dasharray = {solid:"none", shortdash:[4, 1], shortdot:[1, 1], shortdashdot:[4, 1, 1, 1], shortdashdotdot:[4, 1, 1, 1, 1, 1], dot:[1, 3], dash:[4, 3], longdash:[8, 3], dashdot:[4, 3, 1, 3], longdashdot:[8, 3, 1, 3], longdashdotdot:[8, 3, 1, 3, 1, 3]}, fontweight = {normal:400, bold:700}, caps = {butt:"Flat", round:"Round", square:"Square"}, joins = {bevel:"Bevel", round:"Round"}, fonts = {serif:"Times New Roman", times:"Times New Roman", "sans-serif":"Arial", helvetica:"Arial", monotone:"Courier New", courier:"Courier New"};
    function hexColor(color) {
        var c = g.normalizeColor(color), t = c.toHex(), a = Math.round(c.a * 255);
        a = (a < 0 ? 0 : a > 255 ? 255 : a).toString(16);
        return "#" + (a.length < 2 ? "0" + a : a) + t.slice(1);
    }
    sl.Shape = declare("dojox.gfx.silverlight.Shape", gs.Shape, {destroy:function () {
        if (has("gfxRegistry")) {
            gs.dispose(this);
        }
        this.rawNode = null;
    }, setFill:function (fill) {
        var p = this.rawNode.getHost().content, r = this.rawNode, f;
        if (!fill) {
            this.fillStyle = null;
            this._setFillAttr(null);
            return this;
        }
        if (typeof (fill) == "object" && "type" in fill) {
            switch (fill.type) {
              case "linear":
                this.fillStyle = f = g.makeParameters(g.defaultLinearGradient, fill);
                var lgb = p.createFromXaml("<LinearGradientBrush/>");
                lgb.mappingMode = "Absolute";
                lgb.startPoint = f.x1 + "," + f.y1;
                lgb.endPoint = f.x2 + "," + f.y2;
                arr.forEach(f.colors, function (c) {
                    var t = p.createFromXaml("<GradientStop/>");
                    t.offset = c.offset;
                    t.color = hexColor(c.color);
                    lgb.gradientStops.add(t);
                });
                this._setFillAttr(lgb);
                break;
              case "radial":
                this.fillStyle = f = g.makeParameters(g.defaultRadialGradient, fill);
                var rgb = p.createFromXaml("<RadialGradientBrush/>"), c = g.matrix.multiplyPoint(g.matrix.invert(this._getAdjustedMatrix()), f.cx, f.cy), pt = c.x + "," + c.y;
                rgb.mappingMode = "Absolute";
                rgb.gradientOrigin = pt;
                rgb.center = pt;
                rgb.radiusX = rgb.radiusY = f.r;
                arr.forEach(f.colors, function (c) {
                    var t = p.createFromXaml("<GradientStop/>");
                    t.offset = c.offset;
                    t.color = hexColor(c.color);
                    rgb.gradientStops.add(t);
                });
                this._setFillAttr(rgb);
                break;
              case "pattern":
                this.fillStyle = null;
                this._setFillAttr(null);
                break;
            }
            return this;
        }
        this.fillStyle = f = g.normalizeColor(fill);
        var scb = p.createFromXaml("<SolidColorBrush/>");
        scb.color = f.toHex();
        scb.opacity = f.a;
        this._setFillAttr(scb);
        return this;
    }, _setFillAttr:function (f) {
        this.rawNode.fill = f;
    }, setStroke:function (stroke) {
        var p = this.rawNode.getHost().content, r = this.rawNode;
        if (!stroke) {
            this.strokeStyle = null;
            r.stroke = null;
            return this;
        }
        if (typeof stroke == "string" || lang.isArray(stroke) || stroke instanceof color) {
            stroke = {color:stroke};
        }
        var s = this.strokeStyle = g.makeParameters(g.defaultStroke, stroke);
        s.color = g.normalizeColor(s.color);
        if (s) {
            var scb = p.createFromXaml("<SolidColorBrush/>");
            scb.color = s.color.toHex();
            scb.opacity = s.color.a;
            r.stroke = scb;
            r.strokeThickness = s.width;
            r.strokeStartLineCap = r.strokeEndLineCap = r.strokeDashCap = caps[s.cap];
            if (typeof s.join == "number") {
                r.strokeLineJoin = "Miter";
                r.strokeMiterLimit = s.join;
            } else {
                r.strokeLineJoin = joins[s.join];
            }
            var da = s.style.toLowerCase();
            if (da in dasharray) {
                da = dasharray[da];
            }
            if (da instanceof Array) {
                da = lang.clone(da);
                var i;
                if (s.cap != "butt") {
                    for (i = 0; i < da.length; i += 2) {
                        --da[i];
                        if (da[i] < 1) {
                            da[i] = 1;
                        }
                    }
                    for (i = 1; i < da.length; i += 2) {
                        ++da[i];
                    }
                }
                r.strokeDashArray = da.join(",");
            } else {
                r.strokeDashArray = null;
            }
        }
        return this;
    }, _getParentSurface:function () {
        var surface = this.parent;
        for (; surface && !(surface instanceof g.Surface); surface = surface.parent) {
        }
        return surface;
    }, _applyTransform:function () {
        var tm = this._getAdjustedMatrix(), r = this.rawNode;
        if (tm) {
            var p = this.rawNode.getHost().content, mt = p.createFromXaml("<MatrixTransform/>"), mm = p.createFromXaml("<Matrix/>");
            mm.m11 = tm.xx;
            mm.m21 = tm.xy;
            mm.m12 = tm.yx;
            mm.m22 = tm.yy;
            mm.offsetX = tm.dx;
            mm.offsetY = tm.dy;
            mt.matrix = mm;
            r.renderTransform = mt;
        } else {
            r.renderTransform = null;
        }
        return this;
    }, setRawNode:function (rawNode) {
        rawNode.fill = null;
        rawNode.stroke = null;
        this.rawNode = rawNode;
        this.rawNode.tag = this.getUID();
    }, _moveToFront:function () {
        var c = this.parent.rawNode.children, r = this.rawNode;
        c.remove(r);
        c.add(r);
        return this;
    }, _moveToBack:function () {
        var c = this.parent.rawNode.children, r = this.rawNode;
        c.remove(r);
        c.insert(0, r);
        return this;
    }, _getAdjustedMatrix:function () {
        return this.matrix;
    }, setClip:function (clip) {
        this.inherited(arguments);
        var r = this.rawNode;
        if (clip) {
            var clipType = clip ? "width" in clip ? "rect" : "cx" in clip ? "ellipse" : "points" in clip ? "polyline" : "d" in clip ? "path" : null : null;
            if (clip && !clipType) {
                return this;
            }
            var bbox = this.getBoundingBox() || {x:0, y:0, width:0, height:0};
            var clipT = "1,0,0,1," + (-bbox.x) + "," + (-bbox.y);
            switch (clipType) {
              case "rect":
                r.clip = r.getHost().content.createFromXaml("<RectangleGeometry/>");
                r.clip.rect = clip.x + "," + clip.y + "," + clip.width + "," + clip.height;
                r.clip.transform = clipT;
                break;
              case "ellipse":
                r.clip = r.getHost().content.createFromXaml("<EllipseGeometry/>");
                r.clip.center = clip.cx + "," + clip.cy;
                r.clip.radiusX = clip.rx;
                r.clip.radiusY = clip.ry;
                r.clip.transform = "1,0,0,1," + (-bbox.x) + "," + (-bbox.y);
                break;
              case "polyline":
                if (clip.points.length > 2) {
                    var line, plinegroup = r.getHost().content.createFromXaml("<PathGeometry/>"), pfigure = r.getHost().content.createFromXaml("<PathFigure/>");
                    pfigure.StartPoint = clip.points[0] + "," + clip.points[1];
                    for (var i = 2; i <= clip.points.length - 2; i = i + 2) {
                        line = r.getHost().content.createFromXaml("<LineSegment/>");
                        line.Point = clip.points[i] + "," + clip.points[i + 1];
                        pfigure.segments.add(line);
                    }
                    plinegroup.figures.add(pfigure);
                    plinegroup.transform = "1,0,0,1," + (-bbox.x) + "," + (-bbox.y);
                    r.clip = plinegroup;
                }
                break;
              case "path":
                break;
            }
        } else {
            r.clip = null;
        }
        return this;
    }});
    sl.Group = declare("dojox.gfx.silverlight.Group", sl.Shape, {constructor:function () {
        gs.Container._init.call(this);
    }, setRawNode:function (rawNode) {
        this.rawNode = rawNode;
        this.rawNode.tag = this.getUID();
    }, destroy:function () {
        this.clear(true);
        sl.Shape.prototype.destroy.apply(this, arguments);
    }});
    sl.Group.nodeType = "Canvas";
    sl.Rect = declare("dojox.gfx.silverlight.Rect", [sl.Shape, gs.Rect], {setShape:function (newShape) {
        this.shape = g.makeParameters(this.shape, newShape);
        this.bbox = null;
        var r = this.rawNode, n = this.shape;
        r.width = n.width;
        r.height = n.height;
        r.radiusX = r.radiusY = n.r;
        return this._applyTransform();
    }, _getAdjustedMatrix:function () {
        var matrix = this.matrix, s = this.shape, delta = {dx:s.x, dy:s.y};
        return new g.Matrix2D(matrix ? [matrix, delta] : delta);
    }});
    sl.Rect.nodeType = "Rectangle";
    sl.Ellipse = declare("dojox.gfx.silverlight.Ellipse", [sl.Shape, gs.Ellipse], {setShape:function (newShape) {
        this.shape = g.makeParameters(this.shape, newShape);
        this.bbox = null;
        var r = this.rawNode, n = this.shape;
        r.width = 2 * n.rx;
        r.height = 2 * n.ry;
        return this._applyTransform();
    }, _getAdjustedMatrix:function () {
        var matrix = this.matrix, s = this.shape, delta = {dx:s.cx - s.rx, dy:s.cy - s.ry};
        return new g.Matrix2D(matrix ? [matrix, delta] : delta);
    }});
    sl.Ellipse.nodeType = "Ellipse";
    sl.Circle = declare("dojox.gfx.silverlight.Circle", [sl.Shape, gs.Circle], {setShape:function (newShape) {
        this.shape = g.makeParameters(this.shape, newShape);
        this.bbox = null;
        var r = this.rawNode, n = this.shape;
        r.width = r.height = 2 * n.r;
        return this._applyTransform();
    }, _getAdjustedMatrix:function () {
        var matrix = this.matrix, s = this.shape, delta = {dx:s.cx - s.r, dy:s.cy - s.r};
        return new g.Matrix2D(matrix ? [matrix, delta] : delta);
    }});
    sl.Circle.nodeType = "Ellipse";
    sl.Line = declare("dojox.gfx.silverlight.Line", [sl.Shape, gs.Line], {setShape:function (newShape) {
        this.shape = g.makeParameters(this.shape, newShape);
        this.bbox = null;
        var r = this.rawNode, n = this.shape;
        r.x1 = n.x1;
        r.y1 = n.y1;
        r.x2 = n.x2;
        r.y2 = n.y2;
        return this;
    }});
    sl.Line.nodeType = "Line";
    sl.Polyline = declare("dojox.gfx.silverlight.Polyline", [sl.Shape, gs.Polyline], {setShape:function (points, closed) {
        if (points && points instanceof Array) {
            this.shape = g.makeParameters(this.shape, {points:points});
            if (closed && this.shape.points.length) {
                this.shape.points.push(this.shape.points[0]);
            }
        } else {
            this.shape = g.makeParameters(this.shape, points);
        }
        this.bbox = null;
        this._normalizePoints();
        var p = this.shape.points, rp = [];
        for (var i = 0; i < p.length; ++i) {
            rp.push(p[i].x, p[i].y);
        }
        this.rawNode.points = rp.join(",");
        return this;
    }});
    sl.Polyline.nodeType = "Polyline";
    sl.Image = declare("dojox.gfx.silverlight.Image", [sl.Shape, gs.Image], {setShape:function (newShape) {
        this.shape = g.makeParameters(this.shape, newShape);
        this.bbox = null;
        var r = this.rawNode, n = this.shape;
        r.width = n.width;
        r.height = n.height;
        r.source = n.src;
        return this._applyTransform();
    }, _getAdjustedMatrix:function () {
        var matrix = this.matrix, s = this.shape, delta = {dx:s.x, dy:s.y};
        return new g.Matrix2D(matrix ? [matrix, delta] : delta);
    }, setRawNode:function (rawNode) {
        this.rawNode = rawNode;
        this.rawNode.tag = this.getUID();
    }});
    sl.Image.nodeType = "Image";
    sl.Text = declare("dojox.gfx.silverlight.Text", [sl.Shape, gs.Text], {setShape:function (newShape) {
        this.shape = g.makeParameters(this.shape, newShape);
        this.bbox = null;
        var r = this.rawNode, s = this.shape;
        r.text = "" + s.text;
        r.textDecorations = s.decoration === "underline" ? "Underline" : "None";
        r["Canvas.Left"] = -10000;
        r["Canvas.Top"] = -10000;
        if (!this._delay) {
            this._delay = window.setTimeout(lang.hitch(this, "_delayAlignment"), 10);
        }
        return this;
    }, _delayAlignment:function () {
        var r = this.rawNode, s = this.shape, w, h;
        try {
            w = r.actualWidth;
            h = r.actualHeight;
        }
        catch (e) {
            return;
        }
        var x = s.x, y = s.y - h * 0.75;
        switch (s.align) {
          case "middle":
            x -= w / 2;
            break;
          case "end":
            x -= w;
            break;
        }
        this._delta = {dx:x, dy:y};
        r["Canvas.Left"] = 0;
        r["Canvas.Top"] = 0;
        this._applyTransform();
        delete this._delay;
    }, _getAdjustedMatrix:function () {
        var matrix = this.matrix, delta = this._delta, x;
        if (matrix) {
            x = delta ? [matrix, delta] : matrix;
        } else {
            x = delta ? delta : {};
        }
        return new g.Matrix2D(x);
    }, setStroke:function () {
        return this;
    }, _setFillAttr:function (f) {
        this.rawNode.foreground = f;
    }, setRawNode:function (rawNode) {
        this.rawNode = rawNode;
        this.rawNode.tag = this.getUID();
    }, getTextWidth:function () {
        return this.rawNode.actualWidth;
    }, getBoundingBox:function () {
        var bbox = null, text = this.getShape().text, r = this.rawNode, w = 0, h = 0;
        if (!g._base._isRendered(this)) {
            return {x:0, y:0, width:0, height:0};
        }
        if (text) {
            try {
                w = r.actualWidth;
                h = r.actualHeight;
            }
            catch (e) {
                return null;
            }
            var loc = g._base._computeTextLocation(this.getShape(), w, h, true);
            bbox = {x:loc.x, y:loc.y, width:w, height:h};
        }
        return bbox;
    }});
    sl.Text.nodeType = "TextBlock";
    sl.Path = declare("dojox.gfx.silverlight.Path", [sl.Shape, pathLib.Path], {_updateWithSegment:function (segment) {
        this.inherited(arguments);
        var p = this.shape.path;
        if (typeof (p) == "string") {
            this.rawNode.data = p ? p : null;
        }
    }, setShape:function (newShape) {
        this.inherited(arguments);
        var p = this.shape.path;
        this.rawNode.data = p ? p : null;
        return this;
    }});
    sl.Path.nodeType = "Path";
    sl.TextPath = declare("dojox.gfx.silverlight.TextPath", [sl.Shape, pathLib.TextPath], {_updateWithSegment:function (segment) {
    }, setShape:function (newShape) {
    }, _setText:function () {
    }});
    sl.TextPath.nodeType = "text";
    var surfaces = {}, nullFunc = new Function;
    sl.Surface = declare("dojox.gfx.silverlight.Surface", gs.Surface, {constructor:function () {
        gs.Container._init.call(this);
    }, destroy:function () {
        this.clear(true);
        window[this._onLoadName] = nullFunc;
        delete surfaces[this._nodeName];
        this.inherited(arguments);
    }, setDimensions:function (width, height) {
        this.width = g.normalizedLength(width);
        this.height = g.normalizedLength(height);
        var p = this.rawNode && this.rawNode.getHost();
        if (p) {
            p.width = width;
            p.height = height;
        }
        return this;
    }, getDimensions:function () {
        var p = this.rawNode && this.rawNode.getHost();
        var t = p ? {width:p.content.actualWidth, height:p.content.actualHeight} : null;
        if (t.width <= 0) {
            t.width = this.width;
        }
        if (t.height <= 0) {
            t.height = this.height;
        }
        return t;
    }});
    sl.createSurface = function (parentNode, width, height) {
        if (!width && !height) {
            var pos = domGeom.position(parentNode);
            width = width || pos.w;
            height = height || pos.h;
        }
        if (typeof width == "number") {
            width = width + "px";
        }
        if (typeof height == "number") {
            height = height + "px";
        }
        var s = new sl.Surface();
        parentNode = dom.byId(parentNode);
        s._parent = parentNode;
        s._nodeName = g._base._getUniqueId();
        var t = parentNode.ownerDocument.createElement("script");
        t.type = "text/xaml";
        t.id = g._base._getUniqueId();
        t.text = "<?xml version='1.0'?><Canvas xmlns='http://schemas.microsoft.com/client/2007' Name='" + s._nodeName + "'/>";
        parentNode.parentNode.insertBefore(t, parentNode);
        s._nodes.push(t);
        var obj, pluginName = g._base._getUniqueId(), onLoadName = "__" + g._base._getUniqueId() + "_onLoad";
        s._onLoadName = onLoadName;
        window[onLoadName] = function (sender) {
            if (!s.rawNode) {
                s.rawNode = dom.byId(pluginName, parentNode.ownerDocument).content.root;
                surfaces[s._nodeName] = parentNode;
                s.onLoad(s);
            }
        };
        if (has("safari")) {
            obj = "<embed type='application/x-silverlight' id='" + pluginName + "' width='" + width + "' height='" + height + " background='transparent'" + " source='#" + t.id + "'" + " windowless='true'" + " maxFramerate='60'" + " onLoad='" + onLoadName + "'" + " onError='__dojoSilverlightError'" + " /><iframe style='visibility:hidden;height:0;width:0'/>";
        } else {
            obj = "<object type='application/x-silverlight' data='data:application/x-silverlight,' id='" + pluginName + "' width='" + width + "' height='" + height + "'>" + "<param name='background' value='transparent' />" + "<param name='source' value='#" + t.id + "' />" + "<param name='windowless' value='true' />" + "<param name='maxFramerate' value='60' />" + "<param name='onLoad' value='" + onLoadName + "' />" + "<param name='onError' value='__dojoSilverlightError' />" + "</object>";
        }
        parentNode.innerHTML = obj;
        var pluginNode = dom.byId(pluginName, parentNode.ownerDocument);
        if (pluginNode.content && pluginNode.content.root) {
            s.rawNode = pluginNode.content.root;
            surfaces[s._nodeName] = parentNode;
        } else {
            s.rawNode = null;
            s.isLoaded = false;
        }
        s._nodes.push(pluginNode);
        s.width = g.normalizedLength(width);
        s.height = g.normalizedLength(height);
        return s;
    };
    __dojoSilverlightError = function (sender, err) {
        var t = "Silverlight Error:\n" + "Code: " + err.ErrorCode + "\n" + "Type: " + err.ErrorType + "\n" + "Message: " + err.ErrorMessage + "\n";
        switch (err.ErrorType) {
          case "ParserError":
            t += "XamlFile: " + err.xamlFile + "\n" + "Line: " + err.lineNumber + "\n" + "Position: " + err.charPosition + "\n";
            break;
          case "RuntimeError":
            t += "MethodName: " + err.methodName + "\n";
            if (err.lineNumber != 0) {
                t += "Line: " + err.lineNumber + "\n" + "Position: " + err.charPosition + "\n";
            }
            break;
        }
    };
    var Font = {_setFont:function () {
        var f = this.fontStyle, r = this.rawNode, t = f.family.toLowerCase();
        r.fontStyle = f.style == "italic" ? "Italic" : "Normal";
        r.fontWeight = f.weight in fontweight ? fontweight[f.weight] : f.weight;
        r.fontSize = g.normalizedLength(f.size);
        r.fontFamily = t in fonts ? fonts[t] : f.family;
        if (!this._delay) {
            this._delay = window.setTimeout(lang.hitch(this, "_delayAlignment"), 10);
        }
    }};
    var C = gs.Container, Container = {add:function (shape) {
        if (this != shape.getParent()) {
            C.add.apply(this, arguments);
            this.rawNode.children.add(shape.rawNode);
        }
        return this;
    }, remove:function (shape, silently) {
        if (this == shape.getParent()) {
            var parent = shape.rawNode.getParent();
            if (parent) {
                parent.children.remove(shape.rawNode);
            }
            C.remove.apply(this, arguments);
        }
        return this;
    }, clear:function () {
        this.rawNode.children.clear();
        return C.clear.apply(this, arguments);
    }, getBoundingBox:C.getBoundingBox, _moveChildToFront:C._moveChildToFront, _moveChildToBack:C._moveChildToBack};
    var Creator = {createObject:function (shapeType, rawShape) {
        if (!this.rawNode) {
            return null;
        }
        var shape = new shapeType();
        var node = this.rawNode.getHost().content.createFromXaml("<" + shapeType.nodeType + "/>");
        shape.setRawNode(node);
        shape.setShape(rawShape);
        this.add(shape);
        return shape;
    }};
    lang.extend(sl.Text, Font);
    lang.extend(sl.Group, Container);
    lang.extend(sl.Group, gs.Creator);
    lang.extend(sl.Group, Creator);
    lang.extend(sl.Surface, Container);
    lang.extend(sl.Surface, gs.Creator);
    lang.extend(sl.Surface, Creator);
    function mouseFix(s, a) {
        var ev = {target:s, currentTarget:s, preventDefault:function () {
        }, stopPropagation:function () {
        }};
        try {
            if (a.source) {
                ev.target = a.source;
                var gfxId = ev.target.tag;
                ev.gfxTarget = gs.byId(gfxId);
            }
        }
        catch (e) {
        }
        if (a) {
            try {
                ev.ctrlKey = a.ctrl;
                ev.shiftKey = a.shift;
                var p = a.getPosition(null);
                ev.x = ev.offsetX = ev.layerX = p.x;
                ev.y = ev.offsetY = ev.layerY = p.y;
                var parent = surfaces[s.getHost().content.root.name];
                var t = domGeom.position(parent);
                ev.clientX = t.x + p.x;
                ev.clientY = t.y + p.y;
            }
            catch (e) {
            }
        }
        return ev;
    }
    function keyFix(s, a) {
        var ev = {keyCode:a.platformKeyCode, ctrlKey:a.ctrl, shiftKey:a.shift};
        try {
            if (a.source) {
                ev.target = a.source;
                ev.gfxTarget = gs.byId(ev.target.tag);
            }
        }
        catch (e) {
        }
        return ev;
    }
    var eventNames = {onclick:{name:"MouseLeftButtonUp", fix:mouseFix}, onmouseenter:{name:"MouseEnter", fix:mouseFix}, onmouseleave:{name:"MouseLeave", fix:mouseFix}, onmouseover:{name:"MouseEnter", fix:mouseFix}, onmouseout:{name:"MouseLeave", fix:mouseFix}, onmousedown:{name:"MouseLeftButtonDown", fix:mouseFix}, onmouseup:{name:"MouseLeftButtonUp", fix:mouseFix}, onmousemove:{name:"MouseMove", fix:mouseFix}, onkeydown:{name:"KeyDown", fix:keyFix}, onkeyup:{name:"KeyUp", fix:keyFix}};
    var eventsProcessing = {connect:function (name, object, method) {
        return this.on(name, method ? lang.hitch(object, method) : object);
    }, on:function (name, listener) {
        if (typeof name === "string") {
            if (name.indexOf("mouse") === 0) {
                name = "on" + name;
            }
            var token, n = name in eventNames ? eventNames[name] : {name:name, fix:function () {
                return {};
            }};
            token = this.getEventSource().addEventListener(n.name, function (s, a) {
                listener(n.fix(s, a));
            });
            return {name:n.name, token:token, remove:lang.hitch(this, function () {
                this.getEventSource().removeEventListener(n.name, token);
            })};
        } else {
            return on(this, name, listener);
        }
    }, disconnect:function (token) {
        return token.remove();
    }};
    lang.extend(sl.Shape, eventsProcessing);
    lang.extend(sl.Surface, eventsProcessing);
    g.equalSources = function (a, b) {
        return a && b && a.equals(b);
    };
    return sl;
});

