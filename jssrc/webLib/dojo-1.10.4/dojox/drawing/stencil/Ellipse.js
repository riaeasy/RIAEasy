//>>built

define("dojox/drawing/stencil/Ellipse", ["dojo/_base/lang", "../util/oo", "./_Base", "../manager/_registry"], function (lang, oo, Base, registry) {
    var Ellipse = oo.declare(Base, function (options) {
    }, {type:"dojox.drawing.stencil.Ellipse", anchorType:"group", baseRender:true, dataToPoints:function (o) {
        o = o || this.data;
        var x = o.cx - o.rx, y = o.cy - o.ry, w = o.rx * 2, h = o.ry * 2;
        this.points = [{x:x, y:y}, {x:x + w, y:y}, {x:x + w, y:y + h}, {x:x, y:y + h}];
        return this.points;
    }, pointsToData:function (p) {
        p = p || this.points;
        var s = p[0];
        var e = p[2];
        this.data = {cx:s.x + (e.x - s.x) / 2, cy:s.y + (e.y - s.y) / 2, rx:(e.x - s.x) * 0.5, ry:(e.y - s.y) * 0.5};
        return this.data;
    }, _create:function (shp, d, sty) {
        this.remove(this[shp]);
        this[shp] = this.container.createEllipse(d).setStroke(sty).setFill(sty.fill);
        this._setNodeAtts(this[shp]);
    }, render:function () {
        this.onBeforeRender(this);
        this.renderHit && this._create("hit", this.data, this.style.currentHit);
        this._create("shape", this.data, this.style.current);
    }});
    lang.setObject("dojox.drawing.stencil.Ellipse", Ellipse);
    registry.register({name:"dojox.drawing.stencil.Ellipse"}, "stencil");
    return Ellipse;
});

