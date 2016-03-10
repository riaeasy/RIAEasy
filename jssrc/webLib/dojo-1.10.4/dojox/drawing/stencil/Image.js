//>>built

define("dojox/drawing/stencil/Image", ["dojo", "../util/oo", "./_Base", "../manager/_registry"], function (dojo, oo, Base, registry) {
    var Image = oo.declare(Base, function (options) {
    }, {type:"dojox.drawing.stencil.Image", anchorType:"group", baseRender:true, dataToPoints:function (o) {
        o = o || this.data;
        this.points = [{x:o.x, y:o.y}, {x:o.x + o.width, y:o.y}, {x:o.x + o.width, y:o.y + o.height}, {x:o.x, y:o.y + o.height}];
        return this.points;
    }, pointsToData:function (p) {
        p = p || this.points;
        var s = p[0];
        var e = p[2];
        this.data = {x:s.x, y:s.y, width:e.x - s.x, height:e.y - s.y, src:this.src || this.data.src};
        return this.data;
    }, _createHilite:function () {
        this.remove(this.hit);
        this.hit = this.container.createRect(this.data).setStroke(this.style.current).setFill(this.style.current.fill);
        this._setNodeAtts(this.hit);
    }, _create:function (shp, d, sty) {
        this.remove(this[shp]);
        var s = this.container.getParent();
        this[shp] = s.createImage(d);
        this.container.add(this[shp]);
        this._setNodeAtts(this[shp]);
    }, render:function (dbg) {
        if (this.data.width == "auto" || isNaN(this.data.width)) {
            this.getImageSize(true);
            console.warn("Image size not provided. Acquiring...");
            return;
        }
        this.onBeforeRender(this);
        this.renderHit && this._createHilite();
        this._create("shape", this.data, this.style.current);
    }, getImageSize:function (render) {
        if (this._gettingSize) {
            return;
        }
        this._gettingSize = true;
        var img = dojo.create("img", {src:this.data.src}, dojo.body());
        var err = dojo.connect(img, "error", this, function () {
            dojo.disconnect(c);
            dojo.disconnect(err);
            console.error("Error loading image:", this.data.src);
            console.warn("Error image:", this.data);
        });
        var c = dojo.connect(img, "load", this, function () {
            var dim = dojo.marginBox(img);
            this.setData({x:this.data.x, y:this.data.y, src:this.data.src, width:dim.w, height:dim.h});
            dojo.disconnect(c);
            dojo.destroy(img);
            render && this.render(true);
        });
    }});
    dojo.setObject("dojox.drawing.stencil.Image", Image);
    registry.register({name:"dojox.drawing.stencil.Image"}, "stencil");
    return Image;
});

