//>>built

define("dojox/dnd/BoundingBoxController", ["dojo", "dojox"], function (dojo, dojox) {
    return dojo.declare("dojox.dnd.BoundingBoxController", null, {_startX:null, _startY:null, _endX:null, _endY:null, constructor:function (sources, domNode) {
        this.events = [dojo.connect(dojo.doc, "onmousedown", this, "_onMouseDown"), dojo.connect(dojo.doc, "onmouseup", this, "_onMouseUp"), dojo.connect(dojo.doc, "onscroll", this, "_finishSelecting")];
        this.subscriptions = [dojo.subscribe("/dojox/bounding/cancel", this, "_finishSelecting")];
        dojo.forEach(sources, function (item) {
            if (item.selectByBBox) {
                this.subscriptions.push(dojo.subscribe("/dojox/dnd/bounding", item, "selectByBBox"));
            }
        }, this);
        this.domNode = dojo.byId(domNode);
        dojo.style(this.domNode, {position:"absolute", display:"none"});
    }, destroy:function () {
        dojo.forEach(this.events, dojo.disconnect);
        dojo.forEach(this.subscriptions, dojo.unsubscribe);
        this.domNode = null;
    }, shouldStartDrawingBox:function (evt) {
        return true;
    }, boundingBoxIsViable:function (evt) {
        return true;
    }, _onMouseDown:function (evt) {
        if (this.shouldStartDrawingBox(evt) && dojo.mouseButtons.isLeft(evt)) {
            if (this._startX == null) {
                this._startX = evt.clientX;
                this._startY = evt.clientY;
            }
            this.events.push(dojo.connect(dojo.doc, "onmousemove", this, "_onMouseMove"));
        }
    }, _onMouseMove:function (evt) {
        this._endX = evt.clientX;
        this._endY = evt.clientY;
        this._drawBoundingBox();
    }, _onMouseUp:function (evt) {
        if (this._endX !== null && this.boundingBoxIsViable(evt)) {
            dojo.publish("/dojox/dnd/bounding", [this._startX, this._startY, this._endX, this._endY]);
        }
        this._finishSelecting();
    }, _finishSelecting:function () {
        if (this._startX !== null) {
            dojo.disconnect(this.events.pop());
            dojo.style(this.domNode, "display", "none");
            this._startX = null;
            this._endX = null;
        }
    }, _drawBoundingBox:function () {
        dojo.style(this.domNode, {left:Math.min(this._startX, this._endX) + "px", top:Math.min(this._startY, this._endY) + "px", width:Math.abs(this._startX - this._endX) + "px", height:Math.abs(this._startY - this._endY) + "px", display:""});
    }});
});

