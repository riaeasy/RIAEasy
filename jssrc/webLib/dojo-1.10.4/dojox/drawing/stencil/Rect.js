//>>built

define("dojox/drawing/stencil/Rect", ["dojo/_base/lang", "../util/oo", "./_Base", "../manager/_registry"], function (lang, oo, Base, registry) {
    var Rect = oo.declare(Base, function (options) {
        if (this.points.length) {
        }
    }, {type:"dojox.drawing.stencil.Rect", anchorType:"group", baseRender:true, dataToPoints:function (d) {
        d = d || this.data;
        this.points = [{x:d.x, y:d.y}, {x:d.x + d.width, y:d.y}, {x:d.x + d.width, y:d.y + d.height}, {x:d.x, y:d.y + d.height}];
        return this.points;
    }, pointsToData:function (p) {
        p = p || this.points;
        var s = p[0];
        var e = p[2];
        this.data = {x:s.x, y:s.y, width:e.x - s.x, height:e.y - s.y, r:this.data.r || 0};
        return this.data;
    }, _create:function (shp, d, sty) {
        this.remove(this[shp]);
        this[shp] = this.container.createRect(d).setStroke(sty).setFill(sty.fill);
        this._setNodeAtts(this[shp]);
    }, render:function () {
        this.onBeforeRender(this);
        this.renderHit && this._create("hit", this.data, this.style.currentHit);
        this._create("shape", this.data, this.style.current);
    }});
    lang.setObject("dojox.drawing.stencil.Rect", Rect);
    registry.register({name:"dojox.drawing.stencil.Rect"}, "stencil");
    return Rect;
});

