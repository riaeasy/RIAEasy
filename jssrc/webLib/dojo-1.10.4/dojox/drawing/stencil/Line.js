//>>built

define("dojox/drawing/stencil/Line", ["dojo/_base/lang", "../util/oo", "./_Base", "../manager/_registry"], function (lang, oo, Base, registry) {
    var Line = oo.declare(Base, function (options) {
    }, {type:"dojox.drawing.stencil.Line", anchorType:"single", baseRender:true, dataToPoints:function (o) {
        o = o || this.data;
        if (o.radius || o.angle) {
            var pt = this.util.pointOnCircle(o.x, o.y, o.radius, o.angle);
            this.data = o = {x1:o.x, y1:o.y, x2:pt.x, y2:pt.y};
        }
        this.points = [{x:o.x1, y:o.y1}, {x:o.x2, y:o.y2}];
        return this.points;
    }, pointsToData:function (p) {
        p = p || this.points;
        this.data = {x1:p[0].x, y1:p[0].y, x2:p[1].x, y2:p[1].y};
        return this.data;
    }, _create:function (shp, d, sty) {
        this.remove(this[shp]);
        this[shp] = this.container.createLine(d).setStroke(sty);
        this._setNodeAtts(this[shp]);
    }, render:function () {
        this.onBeforeRender(this);
        this.renderHit && this._create("hit", this.data, this.style.currentHit);
        this._create("shape", this.data, this.style.current);
    }});
    lang.setObject("dojox.drawing.stencil.Line", Line);
    registry.register({name:"dojox.drawing.stencil.Line"}, "stencil");
    return Line;
});

