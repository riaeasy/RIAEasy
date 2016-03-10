//>>built

define("dojox/image/MagnifierLite", ["dojo/_base/kernel", "dojo/_base/declare", "dijit/_Widget", "dojo/dom-construct", "dojo/dom-style", "dojo/dom-geometry", "dojo/_base/window", "dojo/_base/lang"], function (kernel, declare, _Widget, construct, style, geometry, window, lang) {
    kernel.experimental("dojox.image.MagnifierLite");
    return declare("dojox.image.MagnifierLite", _Widget, {glassSize:125, scale:6, postCreate:function () {
        this.inherited(arguments);
        this._adjustScale();
        this._createGlass();
        this.connect(this.domNode, "onmouseenter", "_showGlass");
        this.connect(this.glassNode, "onmousemove", "_placeGlass");
        this.connect(this.img, "onmouseout", "_hideGlass");
        this.connect(window, "onresize", "_adjustScale");
    }, _createGlass:function () {
        var node = this.glassNode = construct.create("div", {style:{height:this.glassSize + "px", width:this.glassSize + "px"}, className:"glassNode"}, window.body());
        this.surfaceNode = node.appendChild(construct.create("div"));
        this.img = construct.place(lang.clone(this.domNode), node);
        style.set(this.img, {position:"relative", top:0, left:0, width:this._zoomSize.w + "px", height:this._zoomSize.h + "px"});
    }, _adjustScale:function () {
        this.offset = geometry.position(this.domNode, true);
        console.dir(this.offset);
        this._imageSize = {w:this.offset.w, h:this.offset.h};
        this._zoomSize = {w:this._imageSize.w * this.scale, h:this._imageSize.h * this.scale};
    }, _showGlass:function (e) {
        this._placeGlass(e);
        style.set(this.glassNode, {visibility:"visible", display:""});
    }, _hideGlass:function (e) {
        style.set(this.glassNode, {visibility:"hidden", display:"none"});
    }, _placeGlass:function (e) {
        this._setImage(e);
        var sub = Math.floor(this.glassSize / 2);
        style.set(this.glassNode, {top:Math.floor(e.pageY - sub) + "px", left:Math.floor(e.pageX - sub) + "px"});
    }, _setImage:function (e) {
        var xOff = (e.pageX - this.offset.x) / this.offset.w, yOff = (e.pageY - this.offset.y) / this.offset.h, x = (this._zoomSize.w * xOff * -1) + (this.glassSize * xOff), y = (this._zoomSize.h * yOff * -1) + (this.glassSize * yOff);
        style.set(this.img, {top:y + "px", left:x + "px"});
    }, destroy:function (finalize) {
        construct.destroy(this.glassNode);
        this.inherited(arguments);
    }});
});

