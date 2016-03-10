//>>built

define("dojox/gfx/Mover", ["dojo/_base/lang", "dojo/_base/array", "dojo/_base/declare", "dojo/on", "dojo/touch", "dojo/_base/event"], function (lang, arr, declare, on, touch, event) {
    return declare("dojox.gfx.Mover", null, {constructor:function (shape, e, host) {
        this.shape = shape;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        var h = this.host = host, d = document, firstEvent = on(d, touch.move, lang.hitch(this, "onFirstMove"));
        this.events = [on(d, touch.move, lang.hitch(this, "onMouseMove")), on(d, touch.release, lang.hitch(this, "destroy")), on(d, "dragstart", lang.hitch(event, "stop")), on(d, "selectstart", lang.hitch(event, "stop")), firstEvent];
        if (h && h.onMoveStart) {
            h.onMoveStart(this);
        }
    }, onMouseMove:function (e) {
        var x = e.clientX;
        var y = e.clientY;
        this.host.onMove(this, {dx:x - this.lastX, dy:y - this.lastY});
        this.lastX = x;
        this.lastY = y;
        event.stop(e);
    }, onFirstMove:function () {
        this.host.onFirstMove(this);
        this.events.pop().remove();
    }, destroy:function () {
        arr.forEach(this.events, function (handle) {
            handle.remove();
        });
        var h = this.host;
        if (h && h.onMoveStop) {
            h.onMoveStop(this);
        }
        this.events = this.shape = null;
    }});
});

