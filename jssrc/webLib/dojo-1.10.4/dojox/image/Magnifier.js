//>>built

define("dojox/image/Magnifier", ["dojo/_base/declare", "dojo/dom-construct", "dojo/_base/window", "dojox/gfx", "dojox/gfx/canvas", "./MagnifierLite"], function (declare, construct, window, gfx, canvas, MagnifierLite) {
    return declare("dojox.image.Magnifier", MagnifierLite, {_createGlass:function () {
        this.glassNode = construct.create("div", {style:{height:this.glassSize + "px", width:this.glassSize + "px"}, className:"glassNode"}, window.body());
        this.surfaceNode = construct.create("div", null, this.glassNode);
        gfx.switchTo("canvas");
        this.surface = canvas.createSurface(this.surfaceNode, this.glassSize, this.glassSize);
        this.img = this.surface.createImage({src:this.domNode.src, width:this._zoomSize.w, height:this._zoomSize.h});
    }, _placeGlass:function (e) {
        var x = e.pageX - 2, y = e.pageY - 2, xMax = this.offset.x + this.offset.w + 2, yMax = this.offset.y + this.offset.h + 2;
        if (x < this.offset.x || y < this.offset.y || x > xMax || y > yMax) {
            this._hideGlass();
        } else {
            this.inherited(arguments);
        }
    }, _setImage:function (e) {
        var xOff = (e.pageX - this.offset.x) / this.offset.w, yOff = (e.pageY - this.offset.y) / this.offset.h, x = (this._zoomSize.w * xOff * -1) + (this.glassSize * xOff), y = (this._zoomSize.h * yOff * -1) + (this.glassSize * yOff);
        this.img.setShape({x:x, y:y});
    }});
});

