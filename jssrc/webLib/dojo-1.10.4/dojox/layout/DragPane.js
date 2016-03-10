//>>built

define("dojox/layout/DragPane", ["dojo/_base/declare", "dijit/_Widget", "dojo/_base/html", "dojo/dom-style"], function (declare, Widget, htmlUtil, domStyle) {
    return declare("dojox.layout.DragPane", Widget, {invert:true, postCreate:function () {
        this.connect(this.domNode, "onmousedown", "_down");
        this.connect(this.domNode, "onmouseleave", "_up");
        this.connect(this.domNode, "onmouseup", "_up");
    }, _down:function (e) {
        var t = this.domNode;
        e.preventDefault();
        domStyle.set(t, "cursor", "move");
        this._x = e.pageX;
        this._y = e.pageY;
        if ((this._x < t.offsetLeft + t.clientWidth) && (this._y < t.offsetTop + t.clientHeight)) {
            htmlUtil.setSelectable(t, false);
            this._mover = this.connect(t, "onmousemove", "_move");
        }
    }, _up:function (e) {
        htmlUtil.setSelectable(this.domNode, true);
        domStyle.set(this.domNode, "cursor", "pointer");
        this._mover && this.disconnect(this._mover);
        delete this._mover;
    }, _move:function (e) {
        var mod = this.invert ? 1 : -1;
        this.domNode.scrollTop += (this._y - e.pageY) * mod;
        this.domNode.scrollLeft += (this._x - e.pageX) * mod;
        this._x = e.pageX;
        this._y = e.pageY;
    }});
});

