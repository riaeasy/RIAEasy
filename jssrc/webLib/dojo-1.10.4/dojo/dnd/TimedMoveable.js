//>>built

define("dojo/dnd/TimedMoveable", ["../_base/declare", "./Moveable"], function (declare, Moveable) {
    var oldOnMove = Moveable.prototype.onMove;
    return declare("dojo.dnd.TimedMoveable", Moveable, {timeout:40, constructor:function (node, params) {
        if (!params) {
            params = {};
        }
        if (params.timeout && typeof params.timeout == "number" && params.timeout >= 0) {
            this.timeout = params.timeout;
        }
    }, onMoveStop:function (mover) {
        if (mover._timer) {
            clearTimeout(mover._timer);
            oldOnMove.call(this, mover, mover._leftTop);
        }
        Moveable.prototype.onMoveStop.apply(this, arguments);
    }, onMove:function (mover, leftTop) {
        mover._leftTop = leftTop;
        if (!mover._timer) {
            var _t = this;
            mover._timer = setTimeout(function () {
                mover._timer = null;
                oldOnMove.call(_t, mover, mover._leftTop);
            }, this.timeout);
        }
    }});
});

