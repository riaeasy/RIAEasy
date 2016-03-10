//>>built

define("dojox/gfx/svg", ["dojo/_base/lang", "dojo/_base/sniff", "dojo/_base/window", "dojo/dom", "dojo/_base/declare", "dojo/_base/array", "dojo/dom-geometry", "dojo/dom-attr", "dojo/_base/Color", "./_base", "./shape", "./path"], function (lang, has, win, dom, declare, arr, domGeom, domAttr, Color, g, gs, pathLib) {
    var svg = g.svg = {};
    svg.useSvgWeb = (typeof window.svgweb != "undefined");
    var uagent = navigator.userAgent, safMobile = has("ios"), android = has("android"), textRenderingFix = has("chrome") || (android && android >= 4) ? "auto" : "optimizeLegibility";
    function _createElementNS(ns, nodeType) {
        if (win.doc.createElementNS) {
            return win.doc.createElementNS(ns, nodeType);
        } else {
            return win.doc.createElement(nodeType);
        }
    }
    function _setAttributeNS(node, ns, attr, value) {
        if (node.setAttributeNS) {
            return node.setAttributeNS(ns, attr, value);
        } else {
            return node.setAttribute(attr, value);
        }
    }
    function _createTextNode(text) {
        if (svg.useSvgWeb) {
            return win.doc.createTextNode(text, true);
        } else {
            return win.doc.createTextNode(text);
        }
    }
    function _createFragment() {
        if (svg.useSvgWeb) {
            return win.doc.createDocumentFragment(true);
        } else {
            return win.doc.createDocumentFragment();
        }
    }
    svg.xmlns = {xlink:"http://www.w3.org/1999/xlink", svg:"http://www.w3.org/2000/svg"};
    svg.getRef = function (name) {
        if (!name || name == "none") {
            return null;
        }
        if (name.match(/^url\(#.+\)$/)) {
            return dom.byId(name.slice(5, -1));
        }
        if (name.match(/^#dojoUnique\d+$/)) {
            return dom.byId(name.slice(1));
        }
        return null;
    };
    svg.dasharray = {solid:"none", shortdash:[4, 1], shortdot:[1, 1], shortdashdot:[4, 1, 1, 1], shortdashdotdot:[4, 1, 1, 1, 1, 1], dot:[1, 3], dash:[4, 3], longdash:[8, 3], dashdot:[4, 3, 1, 3], longdashdot:[8, 3, 1, 3], longdashdotdot:[8, 3, 1, 3, 1, 3]};
    var clipCount = 0;
    svg.Shape = declare("dojox.gfx.svg.Shape", gs.Shape, {destroy:function () {
        if (this.fillStyle && "type" in this.fillStyle) {
            var fill = this.rawNode.getAttribute("fill"), ref = svg.getRef(fill);
            if (ref) {
                ref.parentNode.removeChild(ref);
            }
        }
        if (this.clip) {
            var clipPathProp = this.rawNode.getAttribute("clip-path");
            if (clipPathProp) {
                var clipNode = dom.byId(clipPathProp.match(/gfx_clip[\d]+/)[0]);
                if (clipNode) {
                    clipNode.parentNode.removeChild(clipNode);
                }
            }
        }
        gs.Shape.prototype.destroy.apply(this, arguments);
    }, setFill:function (fill) {
        if (!fill) {
            this.fillStyle = null;
            this.rawNode.setAttribute("fill", "none");
            this.rawNode.setAttribute("fill-opacity", 0);
            return this;
        }
        var f;
        var setter = function (x) {
            this.setAttribute(x, f[x].toFixed(8));
        };
        if (typeof (fill) == "object" && "type" in fill) {
            switch (fill.type) {
              case "linear":
                f = g.makeParameters(g.defaultLinearGradient, fill);
                var gradient = this._setFillObject(f, "linearGradient");
                arr.forEach(["x1", "y1", "x2", "y2"], setter, gradient);
                break;
              case "radial":
                f = g.makeParameters(g.defaultRadialGradient, fill);
                var grad = this._setFillObject(f, "radialGradient");
                arr.forEach(["cx", "cy", "r"], setter, grad);
                break;
              case "pattern":
                f = g.makeParameters(g.defaultPattern, fill);
                var pattern = this._setFillObject(f, "pattern");
                arr.forEach(["x", "y", "width", "height"], setter, pattern);
                break;
            }
            this.fillStyle = f;
            return this;
        }
        f = g.normalizeColor(fill);
        this.fillStyle = f;
        this.rawNode.setAttribute("fill", f.toCss());
        this.rawNode.setAttribute("fill-opacity", f.a);
        this.rawNode.setAttribute("fill-rule", "evenodd");
        return this;
    }, setStroke:function (stroke) {
        var rn = this.rawNode;
        if (!stroke) {
            this.strokeStyle = null;
            rn.setAttribute("stroke", "none");
            rn.setAttribute("stroke-opacity", 0);
            return this;
        }
        if (typeof stroke == "string" || lang.isArray(stroke) || stroke instanceof Color) {
            stroke = {color:stroke};
        }
        var s = this.strokeStyle = g.makeParameters(g.defaultStroke, stroke);
        s.color = g.normalizeColor(s.color);
        if (s) {
            rn.setAttribute("stroke", s.color.toCss());
            rn.setAttribute("stroke-opacity", s.color.a);
            rn.setAttribute("stroke-width", s.width);
            rn.setAttribute("stroke-linecap", s.cap);
            if (typeof s.join == "number") {
                rn.setAttribute("stroke-linejoin", "miter");
                rn.setAttribute("stroke-miterlimit", s.join);
            } else {
                rn.setAttribute("stroke-linejoin", s.join);
            }
            var da = s.style.toLowerCase();
            if (da in svg.dasharray) {
                da = svg.dasharray[da];
            }
            if (da instanceof Array) {
                da = lang._toArray(da);
                var i;
                for (i = 0; i < da.length; ++i) {
                    da[i] *= s.width;
                }
                if (s.cap != "butt") {
                    for (i = 0; i < da.length; i += 2) {
                        da[i] -= s.width;
                        if (da[i] < 1) {
                            da[i] = 1;
                        }
                    }
                    for (i = 1; i < da.length; i += 2) {
                        da[i] += s.width;
                    }
                }
                da = da.join(",");
            }
            rn.setAttribute("stroke-dasharray", da);
            rn.setAttribute("dojoGfxStrokeStyle", s.style);
        }
        return this;
    }, _getParentSurface:function () {
        var surface = this.parent;
        for (; surface && !(surface instanceof g.Surface); surface = surface.parent) {
        }
        return surface;
    }, _setFillObject:function (f, nodeType) {
        var svgns = svg.xmlns.svg;
        this.fillStyle = f;
        var surface = this._getParentSurface(), defs = surface.defNode, fill = this.rawNode.getAttribute("fill"), ref = svg.getRef(fill);
        if (ref) {
            fill = ref;
            if (fill.tagName.toLowerCase() != nodeType.toLowerCase()) {
                var id = fill.id;
                fill.parentNode.removeChild(fill);
                fill = _createElementNS(svgns, nodeType);
                fill.setAttribute("id", id);
                defs.appendChild(fill);
            } else {
                while (fill.childNodes.length) {
                    fill.removeChild(fill.lastChild);
                }
            }
        } else {
            fill = _createElementNS(svgns, nodeType);
            fill.setAttribute("id", g._base._getUniqueId());
            defs.appendChild(fill);
        }
        if (nodeType == "pattern") {
            fill.setAttribute("patternUnits", "userSpaceOnUse");
            var img = _createElementNS(svgns, "image");
            img.setAttribute("x", 0);
            img.setAttribute("y", 0);
            img.setAttribute("width", f.width.toFixed(8));
            img.setAttribute("height", f.height.toFixed(8));
            _setAttributeNS(img, svg.xmlns.xlink, "xlink:href", f.src);
            fill.appendChild(img);
        } else {
            fill.setAttribute("gradientUnits", "userSpaceOnUse");
            for (var i = 0; i < f.colors.length; ++i) {
                var c = f.colors[i], t = _createElementNS(svgns, "stop"), cc = c.color = g.normalizeColor(c.color);
                t.setAttribute("offset", c.offset.toFixed(8));
                t.setAttribute("stop-color", cc.toCss());
                t.setAttribute("stop-opacity", cc.a);
                fill.appendChild(t);
            }
        }
        this.rawNode.setAttribute("fill", "url(#" + fill.getAttribute("id") + ")");
        this.rawNode.removeAttribute("fill-opacity");
        this.rawNode.setAttribute("fill-rule", "evenodd");
        return fill;
    }, _applyTransform:function () {
        var matrix = this.matrix;
        if (matrix) {
            var tm = this.matrix;
            this.rawNode.setAttribute("transform", "matrix(" + tm.xx.toFixed(8) + "," + tm.yx.toFixed(8) + "," + tm.xy.toFixed(8) + "," + tm.yy.toFixed(8) + "," + tm.dx.toFixed(8) + "," + tm.dy.toFixed(8) + ")");
        } else {
            this.rawNode.removeAttribute("transform");
        }
        return this;
    }, setRawNode:function (rawNode) {
        var r = this.rawNode = rawNode;
        if (this.shape.type != "image") {
            r.setAttribute("fill", "none");
        }
        r.setAttribute("fill-opacity", 0);
        r.setAttribute("stroke", "none");
        r.setAttribute("stroke-opacity", 0);
        r.setAttribute("stroke-width", 1);
        r.setAttribute("stroke-linecap", "butt");
        r.setAttribute("stroke-linejoin", "miter");
        r.setAttribute("stroke-miterlimit", 4);
        r.__gfxObject__ = this;
    }, setShape:function (newShape) {
        this.shape = g.makeParameters(this.shape, newShape);
        for (var i in this.shape) {
            if (i != "type") {
                this.rawNode.setAttribute(i, this.shape[i]);
            }
        }
        this.bbox = null;
        return this;
    }, _moveToFront:function () {
        this.rawNode.parentNode.appendChild(this.rawNode);
        return this;
    }, _moveToBack:function () {
        this.rawNode.parentNode.insertBefore(this.rawNode, this.rawNode.parentNode.firstChild);
        return this;
    }, setClip:function (clip) {
        this.inherited(arguments);
        var clipType = clip ? "width" in clip ? "rect" : "cx" in clip ? "ellipse" : "points" in clip ? "polyline" : "d" in clip ? "path" : null : null;
        if (clip && !clipType) {
            return this;
        }
        if (clipType === "polyline") {
            clip = lang.clone(clip);
            clip.points = clip.points.join(",");
        }
        var clipNode, clipShape, clipPathProp = domAttr.get(this.rawNode, "clip-path");
        if (clipPathProp) {
            clipNode = dom.byId(clipPathProp.match(/gfx_clip[\d]+/)[0]);
            if (clipNode) {
                clipNode.removeChild(clipNode.childNodes[0]);
            }
        }
        if (clip) {
            if (clipNode) {
                clipShape = _createElementNS(svg.xmlns.svg, clipType);
                clipNode.appendChild(clipShape);
            } else {
                var idIndex = ++clipCount;
                var clipId = "gfx_clip" + idIndex;
                var clipUrl = "url(#" + clipId + ")";
                this.rawNode.setAttribute("clip-path", clipUrl);
                clipNode = _createElementNS(svg.xmlns.svg, "clipPath");
                clipShape = _createElementNS(svg.xmlns.svg, clipType);
                clipNode.appendChild(clipShape);
                this.rawNode.parentNode.insertBefore(clipNode, this.rawNode);
                domAttr.set(clipNode, "id", clipId);
            }
            domAttr.set(clipShape, clip);
        } else {
            this.rawNode.removeAttribute("clip-path");
            if (clipNode) {
                clipNode.parentNode.removeChild(clipNode);
            }
        }
        return this;
    }, _removeClipNode:function () {
        var clipNode, clipPathProp = domAttr.get(this.rawNode, "clip-path");
        if (clipPathProp) {
            clipNode = dom.byId(clipPathProp.match(/gfx_clip[\d]+/)[0]);
            if (clipNode) {
                clipNode.parentNode.removeChild(clipNode);
            }
        }
        return clipNode;
    }});
    svg.Group = declare("dojox.gfx.svg.Group", svg.Shape, {constructor:function () {
        gs.Container._init.call(this);
    }, setRawNode:function (rawNode) {
        this.rawNode = rawNode;
        this.rawNode.__gfxObject__ = this;
    }, destroy:function () {
        this.clear(true);
        svg.Shape.prototype.destroy.apply(this, arguments);
    }});
    svg.Group.nodeType = "g";
    svg.Rect = declare("dojox.gfx.svg.Rect", [svg.Shape, gs.Rect], {setShape:function (newShape) {
        this.shape = g.makeParameters(this.shape, newShape);
        this.bbox = null;
        for (var i in this.shape) {
            if (i != "type" && i != "r") {
                this.rawNode.setAttribute(i, this.shape[i]);
            }
        }
        if (this.shape.r != null) {
            this.rawNode.setAttribute("ry", this.shape.r);
            this.rawNode.setAttribute("rx", this.shape.r);
        }
        return this;
    }});
    svg.Rect.nodeType = "rect";
    svg.Ellipse = declare("dojox.gfx.svg.Ellipse", [svg.Shape, gs.Ellipse], {});
    svg.Ellipse.nodeType = "ellipse";
    svg.Circle = declare("dojox.gfx.svg.Circle", [svg.Shape, gs.Circle], {});
    svg.Circle.nodeType = "circle";
    svg.Line = declare("dojox.gfx.svg.Line", [svg.Shape, gs.Line], {});
    svg.Line.nodeType = "line";
    svg.Polyline = declare("dojox.gfx.svg.Polyline", [svg.Shape, gs.Polyline], {setShape:function (points, closed) {
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
        var attr = [], p = this.shape.points;
        for (var i = 0; i < p.length; ++i) {
            attr.push(p[i].x.toFixed(8), p[i].y.toFixed(8));
        }
        this.rawNode.setAttribute("points", attr.join(" "));
        return this;
    }});
    svg.Polyline.nodeType = "polyline";
    svg.Image = declare("dojox.gfx.svg.Image", [svg.Shape, gs.Image], {setShape:function (newShape) {
        this.shape = g.makeParameters(this.shape, newShape);
        this.bbox = null;
        var rawNode = this.rawNode;
        for (var i in this.shape) {
            if (i != "type" && i != "src") {
                rawNode.setAttribute(i, this.shape[i]);
            }
        }
        rawNode.setAttribute("preserveAspectRatio", "none");
        _setAttributeNS(rawNode, svg.xmlns.xlink, "xlink:href", this.shape.src);
        rawNode.__gfxObject__ = this;
        return this;
    }});
    svg.Image.nodeType = "image";
    svg.Text = declare("dojox.gfx.svg.Text", [svg.Shape, gs.Text], {setShape:function (newShape) {
        this.shape = g.makeParameters(this.shape, newShape);
        this.bbox = null;
        var r = this.rawNode, s = this.shape;
        r.setAttribute("x", s.x);
        r.setAttribute("y", s.y);
        r.setAttribute("text-anchor", s.align);
        r.setAttribute("text-decoration", s.decoration);
        r.setAttribute("rotate", s.rotated ? 90 : 0);
        r.setAttribute("kerning", s.kerning ? "auto" : 0);
        r.setAttribute("text-rendering", textRenderingFix);
        if (r.firstChild) {
            r.firstChild.nodeValue = s.text;
        } else {
            r.appendChild(_createTextNode(s.text));
        }
        return this;
    }, getTextWidth:function () {
        var rawNode = this.rawNode, oldParent = rawNode.parentNode, _measurementNode = rawNode.cloneNode(true);
        _measurementNode.style.visibility = "hidden";
        var _width = 0, _text = _measurementNode.firstChild.nodeValue;
        oldParent.appendChild(_measurementNode);
        if (_text != "") {
            while (!_width) {
                if (_measurementNode.getBBox) {
                    _width = parseInt(_measurementNode.getBBox().width);
                } else {
                    _width = 68;
                }
            }
        }
        oldParent.removeChild(_measurementNode);
        return _width;
    }, getBoundingBox:function () {
        var s = this.getShape(), bbox = null;
        if (s.text) {
            try {
                bbox = this.rawNode.getBBox();
            }
            catch (e) {
                bbox = {x:0, y:0, width:0, height:0};
            }
        }
        return bbox;
    }});
    svg.Text.nodeType = "text";
    svg.Path = declare("dojox.gfx.svg.Path", [svg.Shape, pathLib.Path], {_updateWithSegment:function (segment) {
        this.inherited(arguments);
        if (typeof (this.shape.path) == "string") {
            this.rawNode.setAttribute("d", this.shape.path);
        }
    }, setShape:function (newShape) {
        this.inherited(arguments);
        if (this.shape.path) {
            this.rawNode.setAttribute("d", this.shape.path);
        } else {
            this.rawNode.removeAttribute("d");
        }
        return this;
    }});
    svg.Path.nodeType = "path";
    svg.TextPath = declare("dojox.gfx.svg.TextPath", [svg.Shape, pathLib.TextPath], {_updateWithSegment:function (segment) {
        this.inherited(arguments);
        this._setTextPath();
    }, setShape:function (newShape) {
        this.inherited(arguments);
        this._setTextPath();
        return this;
    }, _setTextPath:function () {
        if (typeof this.shape.path != "string") {
            return;
        }
        var r = this.rawNode;
        if (!r.firstChild) {
            var tp = _createElementNS(svg.xmlns.svg, "textPath"), tx = _createTextNode("");
            tp.appendChild(tx);
            r.appendChild(tp);
        }
        var ref = r.firstChild.getAttributeNS(svg.xmlns.xlink, "href"), path = ref && svg.getRef(ref);
        if (!path) {
            var surface = this._getParentSurface();
            if (surface) {
                var defs = surface.defNode;
                path = _createElementNS(svg.xmlns.svg, "path");
                var id = g._base._getUniqueId();
                path.setAttribute("id", id);
                defs.appendChild(path);
                _setAttributeNS(r.firstChild, svg.xmlns.xlink, "xlink:href", "#" + id);
            }
        }
        if (path) {
            path.setAttribute("d", this.shape.path);
        }
    }, _setText:function () {
        var r = this.rawNode;
        if (!r.firstChild) {
            var tp = _createElementNS(svg.xmlns.svg, "textPath"), tx = _createTextNode("");
            tp.appendChild(tx);
            r.appendChild(tp);
        }
        r = r.firstChild;
        var t = this.text;
        r.setAttribute("alignment-baseline", "middle");
        switch (t.align) {
          case "middle":
            r.setAttribute("text-anchor", "middle");
            r.setAttribute("startOffset", "50%");
            break;
          case "end":
            r.setAttribute("text-anchor", "end");
            r.setAttribute("startOffset", "100%");
            break;
          default:
            r.setAttribute("text-anchor", "start");
            r.setAttribute("startOffset", "0%");
            break;
        }
        r.setAttribute("baseline-shift", "0.5ex");
        r.setAttribute("text-decoration", t.decoration);
        r.setAttribute("rotate", t.rotated ? 90 : 0);
        r.setAttribute("kerning", t.kerning ? "auto" : 0);
        r.firstChild.data = t.text;
    }});
    svg.TextPath.nodeType = "text";
    var hasSvgSetAttributeBug = (function () {
        var matches = /WebKit\/(\d*)/.exec(uagent);
        return matches ? matches[1] : 0;
    })() > 534;
    svg.Surface = declare("dojox.gfx.svg.Surface", gs.Surface, {constructor:function () {
        gs.Container._init.call(this);
    }, destroy:function () {
        gs.Container.clear.call(this, true);
        this.defNode = null;
        this.inherited(arguments);
    }, setDimensions:function (width, height) {
        if (!this.rawNode) {
            return this;
        }
        this.rawNode.setAttribute("width", width);
        this.rawNode.setAttribute("height", height);
        if (hasSvgSetAttributeBug) {
            this.rawNode.style.width = width;
            this.rawNode.style.height = height;
        }
        return this;
    }, getDimensions:function () {
        var t = this.rawNode ? {width:g.normalizedLength(this.rawNode.getAttribute("width")), height:g.normalizedLength(this.rawNode.getAttribute("height"))} : null;
        return t;
    }});
    svg.createSurface = function (parentNode, width, height) {
        var s = new svg.Surface();
        s.rawNode = _createElementNS(svg.xmlns.svg, "svg");
        s.rawNode.setAttribute("overflow", "hidden");
        if (width) {
            s.rawNode.setAttribute("width", width);
        }
        if (height) {
            s.rawNode.setAttribute("height", height);
        }
        var defNode = _createElementNS(svg.xmlns.svg, "defs");
        s.rawNode.appendChild(defNode);
        s.defNode = defNode;
        s._parent = dom.byId(parentNode);
        s._parent.appendChild(s.rawNode);
        g._base._fixMsTouchAction(s);
        return s;
    };
    var Font = {_setFont:function () {
        var f = this.fontStyle;
        this.rawNode.setAttribute("font-style", f.style);
        this.rawNode.setAttribute("font-variant", f.variant);
        this.rawNode.setAttribute("font-weight", f.weight);
        this.rawNode.setAttribute("font-size", f.size);
        this.rawNode.setAttribute("font-family", f.family);
    }};
    var C = gs.Container;
    var Container = svg.Container = {openBatch:function () {
        if (!this._batch) {
            this.fragment = _createFragment();
        }
        ++this._batch;
        return this;
    }, closeBatch:function () {
        this._batch = this._batch > 0 ? --this._batch : 0;
        if (this.fragment && !this._batch) {
            this.rawNode.appendChild(this.fragment);
            delete this.fragment;
        }
        return this;
    }, add:function (shape) {
        if (this != shape.getParent()) {
            if (this.fragment) {
                this.fragment.appendChild(shape.rawNode);
            } else {
                this.rawNode.appendChild(shape.rawNode);
            }
            C.add.apply(this, arguments);
            shape.setClip(shape.clip);
        }
        return this;
    }, remove:function (shape, silently) {
        if (this == shape.getParent()) {
            if (this.rawNode == shape.rawNode.parentNode) {
                this.rawNode.removeChild(shape.rawNode);
            }
            if (this.fragment && this.fragment == shape.rawNode.parentNode) {
                this.fragment.removeChild(shape.rawNode);
            }
            shape._removeClipNode();
            C.remove.apply(this, arguments);
        }
        return this;
    }, clear:function () {
        var r = this.rawNode;
        while (r.lastChild) {
            r.removeChild(r.lastChild);
        }
        var defNode = this.defNode;
        if (defNode) {
            while (defNode.lastChild) {
                defNode.removeChild(defNode.lastChild);
            }
            r.appendChild(defNode);
        }
        return C.clear.apply(this, arguments);
    }, getBoundingBox:C.getBoundingBox, _moveChildToFront:C._moveChildToFront, _moveChildToBack:C._moveChildToBack};
    var Creator = svg.Creator = {createObject:function (shapeType, rawShape) {
        if (!this.rawNode) {
            return null;
        }
        var shape = new shapeType(), node = _createElementNS(svg.xmlns.svg, shapeType.nodeType);
        shape.setRawNode(node);
        shape.setShape(rawShape);
        this.add(shape);
        return shape;
    }};
    lang.extend(svg.Text, Font);
    lang.extend(svg.TextPath, Font);
    lang.extend(svg.Group, Container);
    lang.extend(svg.Group, gs.Creator);
    lang.extend(svg.Group, Creator);
    lang.extend(svg.Surface, Container);
    lang.extend(svg.Surface, gs.Creator);
    lang.extend(svg.Surface, Creator);
    svg.fixTarget = function (event, gfxElement) {
        if (!event.gfxTarget) {
            if (safMobile && event.target.wholeText) {
                event.gfxTarget = event.target.parentElement.__gfxObject__;
            } else {
                event.gfxTarget = event.target.__gfxObject__;
            }
        }
        return true;
    };
    if (svg.useSvgWeb) {
        svg.createSurface = function (parentNode, width, height) {
            var s = new svg.Surface();
            if (!width || !height) {
                var pos = domGeom.position(parentNode);
                width = width || pos.w;
                height = height || pos.h;
            }
            parentNode = dom.byId(parentNode);
            var id = parentNode.id ? parentNode.id + "_svgweb" : g._base._getUniqueId();
            var mockSvg = _createElementNS(svg.xmlns.svg, "svg");
            mockSvg.id = id;
            mockSvg.setAttribute("width", width);
            mockSvg.setAttribute("height", height);
            svgweb.appendChild(mockSvg, parentNode);
            mockSvg.addEventListener("SVGLoad", function () {
                s.rawNode = this;
                s.isLoaded = true;
                var defNode = _createElementNS(svg.xmlns.svg, "defs");
                s.rawNode.appendChild(defNode);
                s.defNode = defNode;
                if (s.onLoad) {
                    s.onLoad(s);
                }
            }, false);
            s.isLoaded = false;
            return s;
        };
        svg.Surface.extend({destroy:function () {
            var mockSvg = this.rawNode;
            svgweb.removeChild(mockSvg, mockSvg.parentNode);
        }});
        var _eventsProcessing = {connect:function (name, object, method) {
            if (name.substring(0, 2) === "on") {
                name = name.substring(2);
            }
            if (arguments.length == 2) {
                method = object;
            } else {
                method = lang.hitch(object, method);
            }
            this.getEventSource().addEventListener(name, method, false);
            return [this, name, method];
        }, disconnect:function (token) {
            this.getEventSource().removeEventListener(token[1], token[2], false);
            delete token[0];
        }};
        lang.extend(svg.Shape, _eventsProcessing);
        lang.extend(svg.Surface, _eventsProcessing);
    }
    return svg;
});

