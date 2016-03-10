//>>built

define("dojox/drawing/stencil/_Base", ["dojo", "dojo/fx/easing", "../util/oo", "../annotations/BoxShadow", "../annotations/Angle", "../annotations/Label", "../defaults"], function (dojo, easing, oo, BoxShadow, Angle, LabelExports, defaults) {
    var Base = oo.declare(function (options) {
        dojo.mixin(this, options);
        this.style = options.style || defaults.copy();
        if (options.stencil) {
            this.stencil = options.stencil;
            this.util = options.stencil.util;
            this.mouse = options.stencil.mouse;
            this.container = options.stencil.container;
            this.style = options.stencil.style;
        }
        var lineTypes = /Line|Vector|Axes|Arrow/;
        var textTypes = /Text/;
        this.shortType = this.util.abbr(this.type);
        this.isText = textTypes.test(this.type);
        this.isLine = lineTypes.test(this.type);
        this.renderHit = this.style.renderHitLayer;
        if (!this.renderHit && this.style.renderHitLines && this.isLine) {
            this.renderHit = true;
        }
        if (!this.renderHit && this.style.useSelectedStyle) {
            this.useSelectedStyle = true;
            this.selCopy = dojo.clone(this.style.selected);
            for (var nm in this.style.norm) {
                if (this.style.selected[nm] === undefined) {
                    this.style.selected[nm] = this.style.norm[nm];
                }
            }
            this.textSelected = dojo.clone(this.style.text);
            this.textSelected.color = this.style.selected.fill;
        }
        this.angleSnap = this.style.angleSnap || 1;
        this.marginZero = options.marginZero || this.style.anchors.marginZero;
        this.id = options.id || this.util.uid(this.type);
        this._cons = [];
        if (!this.annotation && !this.subShape) {
            this.util.attr(this.container, "id", this.id);
        }
        this.connect(this, "onBeforeRender", "preventNegativePos");
        this._offX = this.mouse.origin.x;
        this._offY = this.mouse.origin.y;
        if (this.isText) {
            this.align = options.align || this.align;
            this.valign = options.valign || this.valign;
            if (options.data && options.data.makeFit) {
                var textObj = this.makeFit(options.data.text, options.data.width);
                this.textSize = this.style.text.size = textObj.size;
                this._lineHeight = textObj.box.h;
            } else {
                this.textSize = parseInt(this.style.text.size, 10);
                this._lineHeight = this.textSize * 1.4;
            }
            this.deleteEmptyCreate = options.deleteEmptyCreate !== undefined ? options.deleteEmptyCreate : this.style.text.deleteEmptyCreate;
            this.deleteEmptyModify = options.deleteEmptyModify !== undefined ? options.deleteEmptyModify : this.style.text.deleteEmptyModify;
        }
        this.attr(options.data);
        if (this.noBaseRender) {
            return;
        }
        if (options.points) {
            if (options.data && options.data.closePath === false) {
                this.closePath = false;
            }
            this.setPoints(options.points);
            this.connect(this, "render", this, "onRender", true);
            this.baseRender && this.enabled && this.render();
            options.label && this.setLabel(options.label);
            options.shadow && this.addShadow(options.shadow);
        } else {
            if (options.data) {
                options.data.width = options.data.width ? options.data.width : this.style.text.minWidth;
                options.data.height = options.data.height ? options.data.height : this._lineHeight;
                this.setData(options.data);
                this.connect(this, "render", this, "onRender", true);
                this.baseRender && this.enabled && this.render(options.data.text);
                this.baseRender && options.label && this.setLabel(options.label);
                this.baseRender && options.shadow && this.addShadow(options.shadow);
            } else {
                if (this.draws) {
                    this.points = [];
                    this.data = {};
                    this.connectMouse();
                    this._postRenderCon = dojo.connect(this, "render", this, "_onPostRender");
                }
            }
        }
        if (this.showAngle) {
            this.angleLabel = new Angle({stencil:this});
        }
        if (!this.enabled) {
            this.disable();
            this.moveToBack();
            this.render(options.data.text);
        }
    }, {type:"dojox.drawing.stencil", minimumSize:10, enabled:true, drawingType:"stencil", setData:function (data) {
        this.data = data;
        this.points = this.dataToPoints();
    }, setPoints:function (points) {
        this.points = points;
        if (this.pointsToData) {
            this.data = this.pointsToData();
        }
    }, onDelete:function (stencil) {
        console.info("onDelete", this.id);
    }, onBeforeRender:function (stencil) {
    }, onModify:function (stencil) {
    }, onChangeData:function (stencil) {
    }, onChangeText:function (value) {
    }, onRender:function (stencil) {
        this._postRenderCon = dojo.connect(this, "render", this, "_onPostRender");
        this.created = true;
        this.disconnectMouse();
        if (this.shape) {
            this.shape.superClass = this;
        } else {
            this.container.superClass = this;
        }
        this._setNodeAtts(this);
    }, onChangeStyle:function (stencil) {
        this._isBeingModified = true;
        if (!this.enabled) {
            this.style.current = this.style.disabled;
            this.style.currentText = this.style.textDisabled;
            this.style.currentHit = this.style.hitNorm;
        } else {
            this.style.current = this.style.norm;
            this.style.currentHit = this.style.hitNorm;
            this.style.currentText = this.style.text;
        }
        if (this.selected) {
            if (this.useSelectedStyle) {
                this.style.current = this.style.selected;
                this.style.currentText = this.textSelected;
            }
            this.style.currentHit = this.style.hitSelected;
        } else {
            if (this.highlighted) {
                this.style.currentHit = this.style.hitHighlighted;
            }
        }
        this.render();
    }, animate:function (options, create) {
        console.warn("ANIMATE..........................");
        var d = options.d || options.duration || 1000;
        var ms = options.ms || 20;
        var ease = options.ease || easing.linear;
        var steps = options.steps;
        var ts = new Date().getTime();
        var w = 100;
        var cnt = 0;
        var isArray = true;
        var sp, ep;
        if (dojo.isArray(options.start)) {
            sp = options.start;
            ep = options.end;
        } else {
            if (dojo.isObject(options.start)) {
                sp = options.start;
                ep = options.end;
                isArray = false;
            } else {
                console.warn("No data provided to animate");
            }
        }
        var v = setInterval(dojo.hitch(this, function () {
            var t = new Date().getTime() - ts;
            var p = ease(1 - t / d);
            if (t > d || cnt++ > 100) {
                clearInterval(v);
                return;
            }
            if (isArray) {
                var pnts = [];
                dojo.forEach(sp, function (pt, i) {
                    var o = {x:(ep[i].x - sp[i].x) * p + sp[i].x, y:(ep[i].y - sp[i].y) * p + sp[i].y};
                    pnts.push(o);
                });
                this.setPoints(pnts);
                this.render();
            } else {
                var o = {};
                for (var nm in sp) {
                    o[nm] = (ep[nm] - sp[nm]) * p + sp[nm];
                }
                this.attr(o);
            }
        }), ms);
    }, attr:function (key, value) {
        var n = this.enabled ? this.style.norm : this.style.disabled;
        var t = this.enabled ? this.style.text : this.style.textDisabled;
        var ts = this.textSelected || {}, o, nm, width, styleWas = dojo.toJson(n), textWas = dojo.toJson(t);
        var coords = {x:true, y:true, r:true, height:true, width:true, radius:true, angle:true};
        var propChange = false;
        if (typeof (key) != "object") {
            o = {};
            o[key] = value;
        } else {
            o = dojo.clone(key);
        }
        if (o.width) {
            width = o.width;
            delete o.width;
        }
        for (nm in o) {
            if (nm in n) {
                n[nm] = o[nm];
            }
            if (nm in t) {
                t[nm] = o[nm];
            }
            if (nm in ts) {
                ts[nm] = o[nm];
            }
            if (nm in coords) {
                coords[nm] = o[nm];
                propChange = true;
                if (nm == "radius" && o.angle === undefined) {
                    o.angle = coords.angle = this.getAngle();
                } else {
                    if (nm == "angle" && o.radius === undefined) {
                        o.radius = coords.radius = this.getRadius();
                    }
                }
            }
            if (nm == "text") {
                this.setText(o.text);
            }
            if (nm == "label") {
                this.setLabel(o.label);
            }
        }
        if (o.borderWidth !== undefined) {
            n.width = o.borderWidth;
        }
        if (this.useSelectedStyle) {
            for (nm in this.style.norm) {
                if (this.selCopy[nm] === undefined) {
                    this.style.selected[nm] = this.style.norm[nm];
                }
            }
            this.textSelected.color = this.style.selected.color;
        }
        if (!this.created) {
            return;
        }
        if (o.x !== undefined || o.y !== undefined) {
            var box = this.getBounds(true);
            var mx = {dx:0, dy:0};
            for (nm in o) {
                if (nm == "x" || nm == "y" || nm == "r") {
                    mx["d" + nm] = o[nm] - box[nm];
                }
            }
            this.transformPoints(mx);
        }
        var p = this.points;
        if (o.angle !== undefined) {
            this.dataToPoints({x:this.data.x1, y:this.data.y1, angle:o.angle, radius:o.radius});
        } else {
            if (width !== undefined) {
                p[1].x = p[2].x = p[0].x + width;
                this.pointsToData(p);
            }
        }
        if (o.height !== undefined && o.angle === undefined) {
            console.log("Doing P2D-2");
            p[2].y = p[3].y = p[0].y + o.height;
            this.pointsToData(p);
        }
        if (o.r !== undefined) {
            this.data.r = Math.max(0, o.r);
        }
        if (propChange || textWas != dojo.toJson(t) || styleWas != dojo.toJson(n)) {
            this.onChangeStyle(this);
        }
        o.width = width;
        if (o.cosphi != undefined) {
            !this.data ? this.data = {cosphi:o.cosphi} : this.data.cosphi = o.cosphi;
            this.style.zAxis = o.cosphi != 0 ? true : false;
        }
    }, exporter:function () {
        var type = this.type.substring(this.type.lastIndexOf(".") + 1).charAt(0).toLowerCase() + this.type.substring(this.type.lastIndexOf(".") + 2);
        var o = dojo.clone(this.style.norm);
        o.borderWidth = o.width;
        delete o.width;
        if (type == "path") {
            o.points = this.points;
        } else {
            o = dojo.mixin(o, this.data);
        }
        o.type = type;
        if (this.isText) {
            o.text = this.getText();
            o = dojo.mixin(o, this.style.text);
            delete o.minWidth;
            delete o.deleteEmptyCreate;
            delete o.deleteEmptyModify;
        }
        var lbl = this.getLabel();
        if (lbl) {
            o.label = lbl;
        }
        return o;
    }, disable:function () {
        this.enabled = false;
        this.renderHit = false;
        this.onChangeStyle(this);
    }, enable:function () {
        this.enabled = true;
        this.renderHit = true;
        this.onChangeStyle(this);
    }, select:function () {
        this.selected = true;
        this.onChangeStyle(this);
    }, deselect:function (useDelay) {
        if (useDelay) {
            setTimeout(dojo.hitch(this, function () {
                this.selected = false;
                this.onChangeStyle(this);
            }), 200);
        } else {
            this.selected = false;
            this.onChangeStyle(this);
        }
    }, _toggleSelected:function () {
        if (!this.selected) {
            return;
        }
        this.deselect();
        setTimeout(dojo.hitch(this, "select"), 0);
    }, highlight:function () {
        this.highlighted = true;
        this.onChangeStyle(this);
    }, unhighlight:function () {
        this.highlighted = false;
        this.onChangeStyle(this);
    }, moveToFront:function () {
        this.container && this.container.moveToFront();
    }, moveToBack:function () {
        this.container && this.container.moveToBack();
    }, onTransformBegin:function (anchor) {
        this._isBeingModified = true;
    }, onTransformEnd:function (anchor) {
        this._isBeingModified = false;
        this.onModify(this);
    }, onTransform:function (anchor) {
        if (!this._isBeingModified) {
            this.onTransformBegin();
        }
        this.setPoints(this.points);
        this.render();
    }, transformPoints:function (mx) {
        if (!mx.dx && !mx.dy) {
            return;
        }
        var backup = dojo.clone(this.points), abort = false;
        dojo.forEach(this.points, function (o) {
            o.x += mx.dx;
            o.y += mx.dy;
            if (o.x < this.marginZero || o.y < this.marginZero) {
                abort = true;
            }
        });
        if (abort) {
            this.points = backup;
            console.error("Attempt to set object '" + this.id + "' to less than zero.");
            return;
        }
        this.onTransform();
        this.onTransformEnd();
    }, applyTransform:function (mx) {
        this.transformPoints(mx);
    }, setTransform:function (mx) {
        this.attr({x:mx.dx, y:mx.dy});
    }, getTransform:function () {
        return this.selected ? this.container.getParent().getTransform() : {dx:0, dy:0};
    }, addShadow:function (args) {
        args = args === true ? {} : args;
        args.stencil = this;
        this.shadow = new BoxShadow(args);
    }, removeShadow:function () {
        this.shadow.destroy();
    }, setLabel:function (text) {
        if (!this._label) {
            this._label = new LabelExports.Label({text:text, util:this.util, mouse:this.mouse, stencil:this, annotation:true, container:this.container, labelPosition:this.labelPosition});
        } else {
            if (text != undefined) {
                this._label.setLabel(text);
            }
        }
    }, getLabel:function () {
        if (this._label) {
            return this._label.getText();
        }
        return null;
    }, getAngle:function () {
        var d = this.pointsToData();
        var obj = {start:{x:d.x1, y:d.y1}, x:d.x2, y:d.y2};
        var angle = this.util.angle(obj, this.angleSnap);
        angle < 0 ? angle = 360 + angle : angle;
        return angle;
    }, getRadius:function () {
        var box = this.getBounds(true);
        var line = {start:{x:box.x1, y:box.y1}, x:box.x2, y:box.y2};
        return this.util.length(line);
    }, getBounds:function (absolute) {
        var p = this.points, x1, y1, x2, y2;
        if (p.length == 2) {
            if (absolute) {
                x1 = p[0].x;
                y1 = p[0].y;
                x2 = p[1].x;
                y2 = p[1].y;
            } else {
                x1 = p[0].x < p[1].x ? p[0].x : p[1].x;
                y1 = p[0].y < p[1].y ? p[0].y : p[1].y;
                x2 = p[0].x < p[1].x ? p[1].x : p[0].x;
                y2 = p[0].y < p[1].y ? p[1].y : p[0].y;
            }
            return {x1:x1, y1:y1, x2:x2, y2:y2, x:x1, y:y1, w:x2 - x1, h:y2 - y1};
        } else {
            return {x1:p[0].x, y1:p[0].y, x2:p[2].x, y2:p[2].y, x:p[0].x, y:p[0].y, w:p[2].x - p[0].x, h:p[2].y - p[0].y};
        }
    }, preventNegativePos:function () {
        if (this._isBeingModified) {
            return;
        }
        if (!this.points || !this.points.length) {
            return;
        }
        if (this.type == "dojox.drawing.tools.custom.Axes") {
            var minY = this.marginZero, minX = this.marginZero;
            dojo.forEach(this.points, function (p) {
                minY = Math.min(p.y, minY);
            });
            dojo.forEach(this.points, function (p) {
                minX = Math.min(p.x, minX);
            });
            if (minY < this.marginZero) {
                dojo.forEach(this.points, function (p, i) {
                    p.y = p.y + (this.marginZero - minY);
                }, this);
            }
            if (minX < this.marginZero) {
                dojo.forEach(this.points, function (p) {
                    p.x += (this.marginZero - minX);
                }, this);
            }
        } else {
            dojo.forEach(this.points, function (p) {
                p.x = p.x < 0 ? this.marginZero : p.x;
                p.y = p.y < 0 ? this.marginZero : p.y;
            });
        }
        this.setPoints(this.points);
    }, _onPostRender:function (data) {
        if (this._isBeingModified) {
            this.onModify(this);
            this._isBeingModified = false;
        } else {
            if (!this.created) {
            }
        }
        if (!this.editMode && !this.selected && this._prevData && dojo.toJson(this._prevData) != dojo.toJson(this.data)) {
            this.onChangeData(this);
            this._prevData = dojo.clone(this.data);
        } else {
            if (!this._prevData && (!this.isText || this.getText())) {
                this._prevData = dojo.clone(this.data);
            }
        }
    }, _setNodeAtts:function (shape) {
        var att = this.enabled && (!this.annotation || this.drawingType == "label") ? this.drawingType : "";
        this.util.attr(shape, "drawingType", att);
    }, destroy:function () {
        if (this.destroyed) {
            return;
        }
        if (this.data || this.points && this.points.length) {
            this.onDelete(this);
        }
        this.disconnectMouse();
        this.disconnect(this._cons);
        dojo.disconnect(this._postRenderCon);
        this.remove(this.shape, this.hit);
        this.destroyed = true;
    }, remove:function () {
        var a = arguments;
        if (!a.length) {
            if (!this.shape) {
                return;
            }
            a = [this.shape];
        }
        for (var i = 0; i < a.length; i++) {
            if (a[i]) {
                a[i].removeShape();
            }
        }
    }, connectMult:function () {
        if (arguments.length > 1) {
            this._cons.push(this.connect.apply(this, arguments));
        } else {
            if (dojo.isArray(arguments[0][0])) {
                dojo.forEach(arguments[0], function (ar) {
                    this._cons.push(this.connect.apply(this, ar));
                }, this);
            } else {
                this._cons.push(this.connect.apply(this, arguments[0]));
            }
        }
    }, connect:function (o, e, s, m, once) {
        var c;
        if (typeof (o) != "object") {
            if (s) {
                m = s;
                s = e;
                e = o;
                o = this;
            } else {
                m = e;
                e = o;
                o = s = this;
            }
        } else {
            if (!m) {
                m = s;
                s = this;
            } else {
                if (once) {
                    c = dojo.connect(o, e, function (evt) {
                        dojo.hitch(s, m)(evt);
                        dojo.disconnect(c);
                    });
                    this._cons.push(c);
                    return c;
                } else {
                }
            }
        }
        c = dojo.connect(o, e, s, m);
        this._cons.push(c);
        return c;
    }, disconnect:function (handles) {
        if (!handles) {
            return;
        }
        if (!dojo.isArray(handles)) {
            handles = [handles];
        }
        dojo.forEach(handles, dojo.disconnect, dojo);
    }, connectMouse:function () {
        this._mouseHandle = this.mouse.register(this);
    }, disconnectMouse:function () {
        this.mouse.unregister(this._mouseHandle);
    }, render:function () {
    }, dataToPoints:function (data) {
    }, pointsToData:function (points) {
    }, onDown:function (obj) {
        this._downOnCanvas = true;
        dojo.disconnect(this._postRenderCon);
        this._postRenderCon = null;
    }, onMove:function (obj) {
    }, onDrag:function (obj) {
    }, onUp:function (obj) {
    }});
    dojo.setObject("dojox.drawing.stencil._Base", Base);
    return Base;
});

