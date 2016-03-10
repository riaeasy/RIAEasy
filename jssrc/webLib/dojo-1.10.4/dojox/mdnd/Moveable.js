//>>built

define("dojox/mdnd/Moveable", ["dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/array", "dojo/_base/connect", "dojo/_base/event", "dojo/_base/sniff", "dojo/dom", "dojo/dom-geometry", "dojo/dom-style", "dojo/_base/window"], function (dojo, declare, array, connect, event, sniff, dom, geom, domStyle) {
    return declare("dojox.mdnd.Moveable", null, {handle:null, skip:true, dragDistance:3, constructor:function (params, node) {
        this.node = dom.byId(node);
        this.d = this.node.ownerDocument;
        if (!params) {
            params = {};
        }
        this.handle = params.handle ? dom.byId(params.handle) : null;
        if (!this.handle) {
            this.handle = this.node;
        }
        this.skip = params.skip;
        this.events = [connect.connect(this.handle, "onmousedown", this, "onMouseDown")];
        if (dojox.mdnd.autoScroll) {
            this.autoScroll = dojox.mdnd.autoScroll;
        }
    }, isFormElement:function (e) {
        var t = e.target;
        if (t.nodeType == 3) {
            t = t.parentNode;
        }
        return " a button textarea input select option ".indexOf(" " + t.tagName.toLowerCase() + " ") >= 0;
    }, onMouseDown:function (e) {
        if (this._isDragging) {
            return;
        }
        var isLeftButton = (e.which || e.button) == 1;
        if (!isLeftButton) {
            return;
        }
        if (this.skip && this.isFormElement(e)) {
            return;
        }
        if (this.autoScroll) {
            this.autoScroll.setAutoScrollNode(this.node);
            this.autoScroll.setAutoScrollMaxPage();
        }
        this.events.push(connect.connect(this.d, "onmouseup", this, "onMouseUp"));
        this.events.push(connect.connect(this.d, "onmousemove", this, "onFirstMove"));
        this._selectStart = connect.connect(dojo.body(), "onselectstart", event.stop);
        this._firstX = e.clientX;
        this._firstY = e.clientY;
        event.stop(e);
    }, onFirstMove:function (e) {
        event.stop(e);
        var d = (this._firstX - e.clientX) * (this._firstX - e.clientX) + (this._firstY - e.clientY) * (this._firstY - e.clientY);
        if (d > this.dragDistance * this.dragDistance) {
            this._isDragging = true;
            connect.disconnect(this.events.pop());
            domStyle.set(this.node, "width", geom.getContentBox(this.node).w + "px");
            this.initOffsetDrag(e);
            this.events.push(connect.connect(this.d, "onmousemove", this, "onMove"));
        }
    }, initOffsetDrag:function (e) {
        this.offsetDrag = {"l":e.pageX, "t":e.pageY};
        var s = this.node.style;
        var position = geom.position(this.node, true);
        this.offsetDrag.l = position.x - this.offsetDrag.l;
        this.offsetDrag.t = position.y - this.offsetDrag.t;
        var coords = {"x":position.x, "y":position.y};
        this.size = {"w":position.w, "h":position.h};
        this.onDragStart(this.node, coords, this.size);
    }, onMove:function (e) {
        event.stop(e);
        if (sniff("ie") == 8 && new Date() - this.date < 20) {
            return;
        }
        if (this.autoScroll) {
            this.autoScroll.checkAutoScroll(e);
        }
        var coords = {"x":this.offsetDrag.l + e.pageX, "y":this.offsetDrag.t + e.pageY};
        var s = this.node.style;
        s.left = coords.x + "px";
        s.top = coords.y + "px";
        this.onDrag(this.node, coords, this.size, {"x":e.pageX, "y":e.pageY});
        if (sniff("ie") == 8) {
            this.date = new Date();
        }
    }, onMouseUp:function (e) {
        if (this._isDragging) {
            event.stop(e);
            this._isDragging = false;
            if (this.autoScroll) {
                this.autoScroll.stopAutoScroll();
            }
            delete this.onMove;
            this.onDragEnd(this.node);
            this.node.focus();
        }
        connect.disconnect(this.events.pop());
        connect.disconnect(this.events.pop());
    }, onDragStart:function (node, coords, size) {
    }, onDragEnd:function (node) {
    }, onDrag:function (node, coords, size, mousePosition) {
    }, destroy:function () {
        array.forEach(this.events, connect.disconnect);
        this.events = this.node = null;
    }});
});

