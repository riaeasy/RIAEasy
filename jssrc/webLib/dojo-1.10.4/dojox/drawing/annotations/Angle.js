//>>built

define("dojox/drawing/annotations/Angle", ["dojo", "../util/oo", "../util/positioning"], function (dojo, oo, positioning) {
    return oo.declare(function (options) {
        this.stencil = options.stencil;
        this.util = options.stencil.util;
        this.mouse = options.stencil.mouse;
        this.stencil.connectMult([["onDrag", this, "showAngle"], ["onUp", this, "hideAngle"], ["onTransformBegin", this, "showAngle"], ["onTransform", this, "showAngle"], ["onTransformEnd", this, "hideAngle"]]);
    }, {type:"dojox.drawing.tools.custom", angle:0, showAngle:function () {
        if (!this.stencil.selected && this.stencil.created) {
            return;
        }
        if (this.stencil.getRadius() < this.stencil.minimumSize) {
            this.hideAngle();
            return;
        }
        var node = this.getAngleNode();
        var d = this.stencil.pointsToData();
        var pt = positioning.angle({x:d.x1, y:d.y1}, {x:d.x2, y:d.y2});
        var sc = this.mouse.scrollOffset();
        var mx = this.stencil.getTransform();
        var dx = mx.dx / this.mouse.zoom;
        var dy = mx.dy / this.mouse.zoom;
        pt.x /= this.mouse.zoom;
        pt.y /= this.mouse.zoom;
        var x = this.stencil._offX + pt.x - sc.left + dx;
        var y = this.stencil._offY + pt.y - sc.top + dy;
        dojo.style(node, {left:x + "px", top:y + "px", align:pt.align});
        var angle = this.stencil.getAngle();
        if (this.stencil.style.zAxis && this.stencil.shortType == "vector") {
            node.innerHTML = this.stencil.data.cosphi > 0 ? "out of" : "into";
        } else {
            if (this.stencil.shortType == "line") {
                node.innerHTML = this.stencil.style.zAxis ? "out of" : Math.ceil(angle % 180);
            } else {
                node.innerHTML = Math.ceil(angle);
            }
        }
    }, getAngleNode:function () {
        if (!this._angleNode) {
            this._angleNode = dojo.create("span", null, dojo.body());
            dojo.addClass(this._angleNode, "textAnnotation");
            dojo.style(this._angleNode, "opacity", 1);
        }
        return this._angleNode;
    }, hideAngle:function () {
        if (this._angleNode && dojo.style(this._angleNode, "opacity") > 0.9) {
            dojo.fadeOut({node:this._angleNode, duration:500, onEnd:function (node) {
                dojo.destroy(node);
            }}).play();
            this._angleNode = null;
        }
    }});
});

