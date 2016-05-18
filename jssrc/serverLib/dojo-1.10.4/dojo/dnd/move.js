//>>built

define("dojo/dnd/move", ["../_base/declare", "../dom-geometry", "../dom-style", "./common", "./Mover", "./Moveable"], function (declare, domGeom, domStyle, dnd, Mover, Moveable) {
    var constrainedMoveable = declare("dojo.dnd.move.constrainedMoveable", Moveable, {constraints:function () {
    }, within:false, constructor:function (node, params) {
        if (!params) {
            params = {};
        }
        this.constraints = params.constraints;
        this.within = params.within;
    }, onFirstMove:function (mover) {
        var c = this.constraintBox = this.constraints.call(this, mover);
        c.r = c.l + c.w;
        c.b = c.t + c.h;
        if (this.within) {
            var mb = domGeom.getMarginSize(mover.node);
            c.r -= mb.w;
            c.b -= mb.h;
        }
    }, onMove:function (mover, leftTop) {
        var c = this.constraintBox, s = mover.node.style;
        this.onMoving(mover, leftTop);
        leftTop.l = leftTop.l < c.l ? c.l : c.r < leftTop.l ? c.r : leftTop.l;
        leftTop.t = leftTop.t < c.t ? c.t : c.b < leftTop.t ? c.b : leftTop.t;
        s.left = leftTop.l + "px";
        s.top = leftTop.t + "px";
        this.onMoved(mover, leftTop);
    }});
    var boxConstrainedMoveable = declare("dojo.dnd.move.boxConstrainedMoveable", constrainedMoveable, {box:{}, constructor:function (node, params) {
        var box = params && params.box;
        this.constraints = function () {
            return box;
        };
    }});
    var parentConstrainedMoveable = declare("dojo.dnd.move.parentConstrainedMoveable", constrainedMoveable, {area:"content", constructor:function (node, params) {
        var area = params && params.area;
        this.constraints = function () {
            var n = this.node.parentNode, s = domStyle.getComputedStyle(n), mb = domGeom.getMarginBox(n, s);
            if (area == "margin") {
                return mb;
            }
            var t = domGeom.getMarginExtents(n, s);
            mb.l += t.l, mb.t += t.t, mb.w -= t.w, mb.h -= t.h;
            if (area == "border") {
                return mb;
            }
            t = domGeom.getBorderExtents(n, s);
            mb.l += t.l, mb.t += t.t, mb.w -= t.w, mb.h -= t.h;
            if (area == "padding") {
                return mb;
            }
            t = domGeom.getPadExtents(n, s);
            mb.l += t.l, mb.t += t.t, mb.w -= t.w, mb.h -= t.h;
            return mb;
        };
    }});
    return {constrainedMoveable:constrainedMoveable, boxConstrainedMoveable:boxConstrainedMoveable, parentConstrainedMoveable:parentConstrainedMoveable};
});

