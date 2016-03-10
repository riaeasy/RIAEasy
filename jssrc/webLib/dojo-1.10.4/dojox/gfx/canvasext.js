//>>built

define("dojox/gfx/canvasext", ["./_base", "./canvas"], function (gfx, canvas) {
    var ext = gfx.canvasext = {};
    canvas.Surface.extend({getImageData:function (rect) {
        if ("pendingRender" in this) {
            this._render(true);
        }
        return this.rawNode.getContext("2d").getImageData(rect.x, rect.y, rect.width, rect.height);
    }, getContext:function () {
        return this.rawNode.getContext("2d");
    }});
    return ext;
});

