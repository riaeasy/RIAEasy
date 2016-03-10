//>>built

define("dojox/geo/openlayers/GfxLayer", ["dojo/_base/declare", "dojo/_base/connect", "dojo/dom-style", "dojox/gfx", "dojox/gfx/matrix", "./Feature", "./Layer"], function (declare, connect, style, gfx, matrix, Feature, Layer) {
    return declare("dojox.geo.openlayers.GfxLayer", Layer, {_viewport:null, constructor:function (name, options) {
        var s = gfx.createSurface(this.olLayer.div, 100, 100);
        this._surface = s;
        var vp;
        if (options && options.viewport) {
            vp = options.viewport;
        } else {
            vp = s.createGroup();
        }
        this.setViewport(vp);
        connect.connect(this.olLayer, "onMapResize", this, "onMapResize");
        this.olLayer.getDataExtent = this.getDataExtent;
    }, getViewport:function () {
        return this._viewport;
    }, setViewport:function (g) {
        if (this._viewport) {
            this._viewport.removeShape();
        }
        this._viewport = g;
        this._surface.add(g);
    }, onMapResize:function () {
        this._surfaceSize();
    }, setMap:function (map) {
        this.inherited(arguments);
        this._surfaceSize();
    }, getDataExtent:function () {
        var ret = this._surface.getDimensions();
        return ret;
    }, getSurface:function () {
        return this._surface;
    }, _surfaceSize:function () {
        var s = this.olLayer.map.getSize();
        this._surface.setDimensions(s.w, s.h);
    }, moveTo:function (event) {
        var s = style.get(this.olLayer.map.layerContainerDiv);
        var left = parseInt(s.left);
        var top = parseInt(s.top);
        if (event.zoomChanged || left || top) {
            var d = this.olLayer.div;
            style.set(d, {left:-left + "px", top:-top + "px"});
            if (this._features == null) {
                return;
            }
            var vp = this.getViewport();
            vp.setTransform(matrix.translate(left, top));
            this.inherited(arguments);
        }
    }, added:function () {
        this.inherited(arguments);
        this._surfaceSize();
    }});
});

