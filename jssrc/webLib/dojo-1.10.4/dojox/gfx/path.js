//>>built

define("dojox/gfx/path", ["./_base", "dojo/_base/lang", "dojo/_base/declare", "./matrix", "./shape"], function (g, lang, declare, matrix, shapeLib) {
    var Path = declare("dojox.gfx.path.Path", shapeLib.Shape, {constructor:function (rawNode) {
        this.shape = lang.clone(g.defaultPath);
        this.segments = [];
        this.tbbox = null;
        this.absolute = true;
        this.last = {};
        this.rawNode = rawNode;
        this.segmented = false;
    }, setAbsoluteMode:function (mode) {
        this._confirmSegmented();
        this.absolute = typeof mode == "string" ? (mode == "absolute") : mode;
        return this;
    }, getAbsoluteMode:function () {
        this._confirmSegmented();
        return this.absolute;
    }, getBoundingBox:function () {
        this._confirmSegmented();
        return (this.bbox && ("l" in this.bbox)) ? {x:this.bbox.l, y:this.bbox.t, width:this.bbox.r - this.bbox.l, height:this.bbox.b - this.bbox.t} : null;
    }, _getRealBBox:function () {
        this._confirmSegmented();
        if (this.tbbox) {
            return this.tbbox;
        }
        var bbox = this.bbox, matrix = this._getRealMatrix();
        this.bbox = null;
        for (var i = 0, len = this.segments.length; i < len; ++i) {
            this._updateWithSegment(this.segments[i], matrix);
        }
        var t = this.bbox;
        this.bbox = bbox;
        this.tbbox = t ? [{x:t.l, y:t.t}, {x:t.r, y:t.t}, {x:t.r, y:t.b}, {x:t.l, y:t.b}] : null;
        return this.tbbox;
    }, getLastPosition:function () {
        this._confirmSegmented();
        return "x" in this.last ? this.last : null;
    }, _applyTransform:function () {
        this.tbbox = null;
        return this.inherited(arguments);
    }, _updateBBox:function (x, y, m) {
        if (m) {
            var t = matrix.multiplyPoint(m, x, y);
            x = t.x;
            y = t.y;
        }
        if (this.bbox && ("l" in this.bbox)) {
            if (this.bbox.l > x) {
                this.bbox.l = x;
            }
            if (this.bbox.r < x) {
                this.bbox.r = x;
            }
            if (this.bbox.t > y) {
                this.bbox.t = y;
            }
            if (this.bbox.b < y) {
                this.bbox.b = y;
            }
        } else {
            this.bbox = {l:x, b:y, r:x, t:y};
        }
    }, _updateWithSegment:function (segment, matrix) {
        var n = segment.args, l = n.length, i;
        switch (segment.action) {
          case "M":
          case "L":
          case "C":
          case "S":
          case "Q":
          case "T":
            for (i = 0; i < l; i += 2) {
                this._updateBBox(n[i], n[i + 1], matrix);
            }
            this.last.x = n[l - 2];
            this.last.y = n[l - 1];
            this.absolute = true;
            break;
          case "H":
            for (i = 0; i < l; ++i) {
                this._updateBBox(n[i], this.last.y, matrix);
            }
            this.last.x = n[l - 1];
            this.absolute = true;
            break;
          case "V":
            for (i = 0; i < l; ++i) {
                this._updateBBox(this.last.x, n[i], matrix);
            }
            this.last.y = n[l - 1];
            this.absolute = true;
            break;
          case "m":
            var start = 0;
            if (!("x" in this.last)) {
                this._updateBBox(this.last.x = n[0], this.last.y = n[1], matrix);
                start = 2;
            }
            for (i = start; i < l; i += 2) {
                this._updateBBox(this.last.x += n[i], this.last.y += n[i + 1], matrix);
            }
            this.absolute = false;
            break;
          case "l":
          case "t":
            for (i = 0; i < l; i += 2) {
                this._updateBBox(this.last.x += n[i], this.last.y += n[i + 1], matrix);
            }
            this.absolute = false;
            break;
          case "h":
            for (i = 0; i < l; ++i) {
                this._updateBBox(this.last.x += n[i], this.last.y, matrix);
            }
            this.absolute = false;
            break;
          case "v":
            for (i = 0; i < l; ++i) {
                this._updateBBox(this.last.x, this.last.y += n[i], matrix);
            }
            this.absolute = false;
            break;
          case "c":
            for (i = 0; i < l; i += 6) {
                this._updateBBox(this.last.x + n[i], this.last.y + n[i + 1], matrix);
                this._updateBBox(this.last.x + n[i + 2], this.last.y + n[i + 3], matrix);
                this._updateBBox(this.last.x += n[i + 4], this.last.y += n[i + 5], matrix);
            }
            this.absolute = false;
            break;
          case "s":
          case "q":
            for (i = 0; i < l; i += 4) {
                this._updateBBox(this.last.x + n[i], this.last.y + n[i + 1], matrix);
                this._updateBBox(this.last.x += n[i + 2], this.last.y += n[i + 3], matrix);
            }
            this.absolute = false;
            break;
          case "A":
            for (i = 0; i < l; i += 7) {
                this._updateBBox(n[i + 5], n[i + 6], matrix);
            }
            this.last.x = n[l - 2];
            this.last.y = n[l - 1];
            this.absolute = true;
            break;
          case "a":
            for (i = 0; i < l; i += 7) {
                this._updateBBox(this.last.x += n[i + 5], this.last.y += n[i + 6], matrix);
            }
            this.absolute = false;
            break;
        }
        var path = [segment.action];
        for (i = 0; i < l; ++i) {
            path.push(g.formatNumber(n[i], true));
        }
        if (typeof this.shape.path == "string") {
            this.shape.path += path.join("");
        } else {
            for (i = 0, l = path.length; i < l; ++i) {
                this.shape.path.push(path[i]);
            }
        }
    }, _validSegments:{m:2, l:2, h:1, v:1, c:6, s:4, q:4, t:2, a:7, z:0}, _pushSegment:function (action, args) {
        this.tbbox = null;
        var group = this._validSegments[action.toLowerCase()], segment;
        if (typeof group == "number") {
            if (group) {
                if (args.length >= group) {
                    segment = {action:action, args:args.slice(0, args.length - args.length % group)};
                    this.segments.push(segment);
                    this._updateWithSegment(segment);
                }
            } else {
                segment = {action:action, args:[]};
                this.segments.push(segment);
                this._updateWithSegment(segment);
            }
        }
    }, _collectArgs:function (array, args) {
        for (var i = 0; i < args.length; ++i) {
            var t = args[i];
            if (typeof t == "boolean") {
                array.push(t ? 1 : 0);
            } else {
                if (typeof t == "number") {
                    array.push(t);
                } else {
                    if (t instanceof Array) {
                        this._collectArgs(array, t);
                    } else {
                        if ("x" in t && "y" in t) {
                            array.push(t.x, t.y);
                        }
                    }
                }
            }
        }
    }, moveTo:function () {
        this._confirmSegmented();
        var args = [];
        this._collectArgs(args, arguments);
        this._pushSegment(this.absolute ? "M" : "m", args);
        return this;
    }, lineTo:function () {
        this._confirmSegmented();
        var args = [];
        this._collectArgs(args, arguments);
        this._pushSegment(this.absolute ? "L" : "l", args);
        return this;
    }, hLineTo:function () {
        this._confirmSegmented();
        var args = [];
        this._collectArgs(args, arguments);
        this._pushSegment(this.absolute ? "H" : "h", args);
        return this;
    }, vLineTo:function () {
        this._confirmSegmented();
        var args = [];
        this._collectArgs(args, arguments);
        this._pushSegment(this.absolute ? "V" : "v", args);
        return this;
    }, curveTo:function () {
        this._confirmSegmented();
        var args = [];
        this._collectArgs(args, arguments);
        this._pushSegment(this.absolute ? "C" : "c", args);
        return this;
    }, smoothCurveTo:function () {
        this._confirmSegmented();
        var args = [];
        this._collectArgs(args, arguments);
        this._pushSegment(this.absolute ? "S" : "s", args);
        return this;
    }, qCurveTo:function () {
        this._confirmSegmented();
        var args = [];
        this._collectArgs(args, arguments);
        this._pushSegment(this.absolute ? "Q" : "q", args);
        return this;
    }, qSmoothCurveTo:function () {
        this._confirmSegmented();
        var args = [];
        this._collectArgs(args, arguments);
        this._pushSegment(this.absolute ? "T" : "t", args);
        return this;
    }, arcTo:function () {
        this._confirmSegmented();
        var args = [];
        this._collectArgs(args, arguments);
        this._pushSegment(this.absolute ? "A" : "a", args);
        return this;
    }, closePath:function () {
        this._confirmSegmented();
        this._pushSegment("Z", []);
        return this;
    }, _confirmSegmented:function () {
        if (!this.segmented) {
            var path = this.shape.path;
            this.shape.path = [];
            this._setPath(path);
            this.shape.path = this.shape.path.join("");
            this.segmented = true;
        }
    }, _setPath:function (path) {
        var p = lang.isArray(path) ? path : path.match(g.pathSvgRegExp);
        this.segments = [];
        this.absolute = true;
        this.bbox = {};
        this.last = {};
        if (!p) {
            return;
        }
        var action = "", args = [], l = p.length;
        for (var i = 0; i < l; ++i) {
            var t = p[i], x = parseFloat(t);
            if (isNaN(x)) {
                if (action) {
                    this._pushSegment(action, args);
                }
                args = [];
                action = t;
            } else {
                args.push(x);
            }
        }
        this._pushSegment(action, args);
    }, setShape:function (newShape) {
        this.inherited(arguments, [typeof newShape == "string" ? {path:newShape} : newShape]);
        this.segmented = false;
        this.segments = [];
        if (!g.lazyPathSegmentation) {
            this._confirmSegmented();
        }
        return this;
    }, _2PI:Math.PI * 2});
    var TextPath = declare("dojox.gfx.path.TextPath", Path, {constructor:function (rawNode) {
        if (!("text" in this)) {
            this.text = lang.clone(g.defaultTextPath);
        }
        if (!("fontStyle" in this)) {
            this.fontStyle = lang.clone(g.defaultFont);
        }
    }, getText:function () {
        return this.text;
    }, setText:function (newText) {
        this.text = g.makeParameters(this.text, typeof newText == "string" ? {text:newText} : newText);
        this._setText();
        return this;
    }, getFont:function () {
        return this.fontStyle;
    }, setFont:function (newFont) {
        this.fontStyle = typeof newFont == "string" ? g.splitFontString(newFont) : g.makeParameters(g.defaultFont, newFont);
        this._setFont();
        return this;
    }});
    return g.path = {Path:Path, TextPath:TextPath};
});

