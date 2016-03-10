//>>built

define("dojox/gesture/tap", ["dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/lang", "./Base", "../main"], function (kernel, declare, lang, Base, dojox) {
    kernel.experimental("dojox.gesture.tap");
    var clz = declare(Base, {defaultEvent:"tap", subEvents:["hold", "doubletap"], holdThreshold:500, doubleTapTimeout:250, tapRadius:10, press:function (data, e) {
        if (e.touches && e.touches.length >= 2) {
            clearTimeout(data.tapTimeOut);
            delete data.context;
            return;
        }
        var target = e.target;
        this._initTap(data, e);
        data.tapTimeOut = setTimeout(lang.hitch(this, function () {
            if (this._isTap(data, e)) {
                this.fire(target, {type:"tap.hold"});
            }
            delete data.context;
        }), this.holdThreshold);
    }, release:function (data, e) {
        if (!data.context) {
            clearTimeout(data.tapTimeOut);
            return;
        }
        if (this._isTap(data, e)) {
            switch (data.context.c) {
              case 1:
                this.fire(e.target, {type:"tap"});
                break;
              case 2:
                this.fire(e.target, {type:"tap.doubletap"});
                break;
            }
        }
        clearTimeout(data.tapTimeOut);
    }, _initTap:function (data, e) {
        if (!data.context) {
            data.context = {x:0, y:0, t:0, c:0};
        }
        var ct = new Date().getTime();
        if (ct - data.context.t <= this.doubleTapTimeout) {
            data.context.c++;
        } else {
            data.context.c = 1;
            data.context.x = e.screenX;
            data.context.y = e.screenY;
        }
        data.context.t = ct;
    }, _isTap:function (data, e) {
        var dx = Math.abs(data.context.x - e.screenX);
        var dy = Math.abs(data.context.y - e.screenY);
        return dx <= this.tapRadius && dy <= this.tapRadius;
    }});
    dojox.gesture.tap = new clz();
    dojox.gesture.tap.Tap = clz;
    return dojox.gesture.tap;
});

