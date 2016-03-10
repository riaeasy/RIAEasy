//>>built

define("dojox/gfx/Moveable", ["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/array", "dojo/_base/event", "dojo/topic", "dojo/touch", "dojo/dom-class", "dojo/_base/window", "./Mover"], function (lang, declare, arr, event, topic, touch, domClass, win, Mover) {
    return declare("dojox.gfx.Moveable", null, {constructor:function (shape, params) {
        this.shape = shape;
        this.delay = (params && params.delay > 0) ? params.delay : 0;
        this.mover = (params && params.mover) ? params.mover : Mover;
        this.events = [this.shape.on(touch.press, lang.hitch(this, "onMouseDown"))];
    }, destroy:function () {
        arr.forEach(this.events, function (handle) {
            handle.remove();
        });
        this.events = this.shape = null;
    }, onMouseDown:function (e) {
        if (this.delay) {
            this.events.push(this.shape.on(touch.move, lang.hitch(this, "onMouseMove")), this.shape.on(touch.release, lang.hitch(this, "onMouseUp")));
            this._lastX = e.clientX;
            this._lastY = e.clientY;
        } else {
            new this.mover(this.shape, e, this);
        }
        event.stop(e);
    }, onMouseMove:function (e) {
        var clientX = e.clientX, clientY = e.clientY;
        if (Math.abs(clientX - this._lastX) > this.delay || Math.abs(clientY - this._lastY) > this.delay) {
            this.onMouseUp(e);
            new this.mover(this.shape, e, this);
        }
        event.stop(e);
    }, onMouseUp:function (e) {
        this.events.pop().remove();
    }, onMoveStart:function (mover) {
        topic.publish("/gfx/move/start", mover);
        domClass.add(win.body(), "dojoMove");
    }, onMoveStop:function (mover) {
        topic.publish("/gfx/move/stop", mover);
        domClass.remove(win.body(), "dojoMove");
    }, onFirstMove:function (mover) {
    }, onMove:function (mover, shift) {
        this.onMoving(mover, shift);
        this.shape.applyLeftTransform(shift);
        this.onMoved(mover, shift);
    }, onMoving:function (mover, shift) {
    }, onMoved:function (mover, shift) {
    }});
});

