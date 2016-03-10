//>>built

define("dojox/sketch/UnderlineAnnotation", ["./Annotation", "./Anchor"], function () {
    var ta = dojox.sketch;
    ta.UnderlineAnnotation = function (figure, id) {
        ta.Annotation.call(this, figure, id);
        this.transform = {dx:0, dy:0};
        this.start = {x:0, y:0};
        this.property("label", "#");
        this.labelShape = null;
        this.lineShape = null;
    };
    ta.UnderlineAnnotation.prototype = new ta.Annotation;
    var p = ta.UnderlineAnnotation.prototype;
    p.constructor = ta.UnderlineAnnotation;
    p.type = function () {
        return "Underline";
    };
    p.getType = function () {
        return ta.UnderlineAnnotation;
    };
    p.apply = function (obj) {
        if (!obj) {
            return;
        }
        if (obj.documentElement) {
            obj = obj.documentElement;
        }
        this.readCommonAttrs(obj);
        for (var i = 0; i < obj.childNodes.length; i++) {
            var c = obj.childNodes[i];
            if (c.localName == "text") {
                this.property("label", c.childNodes[0].nodeValue);
                var style = c.getAttribute("style");
                var m = style.match(/fill:([^;]+);/);
                if (m) {
                    var stroke = this.property("stroke");
                    stroke.collor = m[1];
                    this.property("stroke", stroke);
                    this.property("fill", stroke.collor);
                }
            }
        }
    };
    p.initialize = function (obj) {
        this.apply(obj);
        this.shape = this.figure.group.createGroup();
        this.shape.getEventSource().setAttribute("id", this.id);
        this.labelShape = this.shape.createText({x:0, y:0, text:this.property("label"), decoration:"underline", align:"start"});
        this.labelShape.getEventSource().setAttribute("id", this.id + "-labelShape");
        this.lineShape = this.shape.createLine({x1:1, x2:this.labelShape.getTextWidth(), y1:2, y2:2});
        this.lineShape.getEventSource().setAttribute("shape-rendering", "crispEdges");
        this.draw();
    };
    p.destroy = function () {
        if (!this.shape) {
            return;
        }
        this.shape.remove(this.labelShape);
        this.shape.remove(this.lineShape);
        this.figure.group.remove(this.shape);
        this.shape = this.lineShape = this.labelShape = null;
    };
    p.getBBox = function () {
        var b = this.getTextBox();
        var z = this.figure.zoomFactor;
        return {x:0, y:(b.h * -1 + 4) / z, width:(b.w + 2) / z, height:b.h / z};
    };
    p.draw = function (obj) {
        this.apply(obj);
        this.shape.setTransform(this.transform);
        this.labelShape.setShape({x:0, y:0, text:this.property("label")}).setFill(this.property("fill"));
        this.zoom();
    };
    p.zoom = function (pct) {
        if (this.labelShape) {
            pct = pct || this.figure.zoomFactor;
            var textwidthadj = dojox.gfx.renderer == "vml" ? 0 : 2 / pct;
            ta.Annotation.prototype.zoom.call(this, pct);
            pct = dojox.gfx.renderer == "vml" ? 1 : pct;
            this.lineShape.setShape({x1:0, x2:this.getBBox().width - textwidthadj, y1:2, y2:2}).setStroke({color:this.property("fill"), width:1 / pct});
            if (this.mode == ta.Annotation.Modes.Edit) {
                this.drawBBox();
            }
        }
    };
    p.serialize = function () {
        var s = this.property("stroke");
        return "<g " + this.writeCommonAttrs() + ">" + "<text style=\"fill:" + this.property("fill") + ";\" font-weight=\"bold\" text-decoration=\"underline\" " + "x=\"0\" y=\"0\">" + this.property("label") + "</text>" + "</g>";
    };
    dojo.declare("dojox.sketch.UnderlineAnnotationTool", ta.AnnotationTool, {onMouseDown:function () {
    }, onMouseUp:function () {
        var f = this.figure;
        if (!f._start) {
            return;
        }
        f._end = {x:0, y:0};
        this._create(f._start, {x:f._start.x + 10, y:f._start.y + 10});
    }, onMouseMove:function () {
    }});
    ta.Annotation.register("Underline", ta.UnderlineAnnotationTool);
    return dojox.sketch.UnderlineAnnotation;
});

