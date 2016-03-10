//>>built

define("dojox/drawing/tools/Arrow", ["dojo/_base/lang", "../util/oo", "../manager/_registry", "./Line", "../annotations/Arrow", "../util/positioning"], function (lang, oo, registry, Line, AnnotationArrow, positioning) {
    var Arrow = oo.declare(Line, function (options) {
        if (this.arrowStart) {
            this.begArrow = new AnnotationArrow({stencil:this, idx1:0, idx2:1});
        }
        if (this.arrowEnd) {
            this.endArrow = new AnnotationArrow({stencil:this, idx1:1, idx2:0});
        }
        if (this.points.length) {
            this.render();
            options.label && this.setLabel(options.label);
        }
    }, {draws:true, type:"dojox.drawing.tools.Arrow", baseRender:false, arrowStart:false, arrowEnd:true, labelPosition:function () {
        var d = this.data;
        var pt = positioning.label({x:d.x1, y:d.y1}, {x:d.x2, y:d.y2});
        return {x:pt.x, y:pt.y};
    }, onUp:function (obj) {
        if (this.created || !this.shape) {
            return;
        }
        var p = this.points;
        var len = this.util.distance(p[0].x, p[0].y, p[1].x, p[1].y);
        if (len < this.minimumSize) {
            this.remove(this.shape, this.hit);
            return;
        }
        var pt = this.util.snapAngle(obj, this.angleSnap / 180);
        this.setPoints([{x:p[0].x, y:p[0].y}, {x:pt.x, y:pt.y}]);
        this.renderedOnce = true;
        this.onRender(this);
    }});
    lang.setObject("dojox.drawing.tools.Arrow", Arrow);
    Arrow.setup = {name:"dojox.drawing.tools.Arrow", tooltip:"Arrow Tool", iconClass:"iconArrow"};
    registry.register(Arrow.setup, "tool");
    return Arrow;
});

