//>>built

define("dojox/av/widget/VolumeButton", ["dojo", "dijit", "dijit/_Widget", "dijit/_TemplatedMixin", "dijit/form/Button"], function (dojo, dijit, _Widget, _TemplatedMixin, Button) {
    return dojo.declare("dojox.av.widget.VolumeButton", [_Widget, _TemplatedMixin], {templateString:dojo.cache("dojox.av.widget", "resources/VolumeButton.html"), postCreate:function () {
        this.handleWidth = dojo.marginBox(this.handle).w;
        this.width = dojo.marginBox(this.volumeSlider).w;
        this.slotWidth = 100;
        dojo.setSelectable(this.handle, false);
        this.volumeSlider = this.domNode.removeChild(this.volumeSlider);
    }, setMedia:function (med) {
        this.media = med;
        this.updateIcon();
    }, updateIcon:function (vol) {
        vol = (vol === undefined) ? this.media.volume() : vol;
        if (vol === 0) {
            dojo.attr(this.domNode, "class", "Volume mute");
        } else {
            if (vol < 0.334) {
                dojo.attr(this.domNode, "class", "Volume low");
            } else {
                if (vol < 0.667) {
                    dojo.attr(this.domNode, "class", "Volume med");
                } else {
                    dojo.attr(this.domNode, "class", "Volume high");
                }
            }
        }
    }, onShowVolume:function (evt) {
        if (this.showing == undefined) {
            dojo.body().appendChild(this.volumeSlider);
            this.showing = false;
        }
        if (!this.showing) {
            var TOPMARG = 2;
            var LEFTMARG = 7;
            var vol = this.media.volume();
            var dim = this._getVolumeDim();
            var hand = this._getHandleDim();
            this.x = dim.x - this.width;
            dojo.style(this.volumeSlider, "display", "");
            dojo.style(this.volumeSlider, "top", dim.y + "px");
            dojo.style(this.volumeSlider, "left", (this.x) + "px");
            var x = (this.slotWidth * vol);
            dojo.style(this.handle, "top", (TOPMARG + (hand.w / 2)) + "px");
            dojo.style(this.handle, "left", (x + LEFTMARG + (hand.h / 2)) + "px");
            this.showing = true;
            this.clickOff = dojo.connect(dojo.doc, "onmousedown", this, "onDocClick");
        } else {
            this.onHideVolume();
        }
    }, onDocClick:function (evt) {
        if (!dojo.isDescendant(evt.target, this.domNode) && !dojo.isDescendant(evt.target, this.volumeSlider)) {
            this.onHideVolume();
        }
    }, onHideVolume:function () {
        this.endDrag();
        dojo.style(this.volumeSlider, "display", "none");
        this.showing = false;
    }, onDrag:function (evt) {
        var beg = this.handleWidth / 2;
        var end = beg + this.slotWidth;
        var x = evt.clientX - this.x;
        if (x < beg) {
            x = beg;
        }
        if (x > end) {
            x = end;
        }
        dojo.style(this.handle, "left", (x) + "px");
        var p = (x - beg) / (end - beg);
        this.media.volume(p);
        this.updateIcon(p);
    }, startDrag:function () {
        this.isDragging = true;
        this.cmove = dojo.connect(dojo.doc, "mousemove", this, "onDrag");
        this.cup = dojo.connect(dojo.doc, "mouseup", this, "endDrag");
    }, endDrag:function () {
        this.isDragging = false;
        if (this.cmove) {
            dojo.disconnect(this.cmove);
        }
        if (this.cup) {
            dojo.disconnect(this.cup);
        }
        this.handleOut();
    }, handleOver:function () {
        dojo.addClass(this.handle, "over");
    }, handleOut:function () {
        if (!this.isDragging) {
            dojo.removeClass(this.handle, "over");
        }
    }, _getVolumeDim:function () {
        if (this._domCoords) {
            return this._domCoords;
        }
        this._domCoords = dojo.coords(this.domNode);
        return this._domCoords;
    }, _getHandleDim:function () {
        if (this._handleCoords) {
            return this._handleCoords;
        }
        this._handleCoords = dojo.marginBox(this.handle);
        return this._handleCoords;
    }, onResize:function (playerDimensions) {
        this.onHideVolume();
        this._domCoords = null;
    }});
});

