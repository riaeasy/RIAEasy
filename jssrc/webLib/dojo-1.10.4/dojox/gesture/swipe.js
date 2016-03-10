//>>built

define("dojox/gesture/swipe", ["dojo/_base/kernel", "dojo/_base/declare", "./Base", "../main"], function (kernel, declare, Base, dojox) {
    kernel.experimental("dojox.gesture.swipe");
    var clz = declare(Base, {defaultEvent:"swipe", subEvents:["end"], press:function (data, e) {
        if (e.touches && e.touches.length >= 2) {
            delete data.context;
            return;
        }
        if (!data.context) {
            data.context = {x:0, y:0, t:0};
        }
        data.context.x = e.screenX;
        data.context.y = e.screenY;
        data.context.t = new Date().getTime();
        this.lock(e.currentTarget);
    }, move:function (data, e) {
        this._recognize(data, e, "swipe");
    }, release:function (data, e) {
        this._recognize(data, e, "swipe.end");
        delete data.context;
        this.unLock();
    }, cancel:function (data, e) {
        delete data.context;
        this.unLock();
    }, _recognize:function (data, e, type) {
        if (!data.context) {
            return;
        }
        var info = this._getSwipeInfo(data, e);
        if (!info) {
            return;
        }
        info.type = type;
        this.fire(e.target, info);
    }, _getSwipeInfo:function (data, e) {
        var dx, dy, info = {}, startData = data.context;
        info.time = new Date().getTime() - startData.t;
        dx = e.screenX - startData.x;
        dy = e.screenY - startData.y;
        if (dx === 0 && dy === 0) {
            return null;
        }
        info.dx = dx;
        info.dy = dy;
        return info;
    }});
    dojox.gesture.swipe = new clz();
    dojox.gesture.swipe.Swipe = clz;
    return dojox.gesture.swipe;
});

