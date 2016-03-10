//>>built

define("dojox/dgauges/CircularGauge", ["dojo/_base/declare", "dojo/dom-geometry", "dojox/gfx", "./GaugeBase"], function (declare, domGeom, gfx, GaugeBase) {
    return declare("dojox.dgauges.CircularGauge", GaugeBase, {_transformProperties:null, refreshRendering:function () {
        if (this._widgetBox.w <= 0 || this._widgetBox.h <= 0) {
            return;
        }
        for (var key in this._elementsIndex) {
            this._elementsRenderers[key] = this._elementsIndex[key].refreshRendering();
        }
        var bb = this._computeBoundingBox(this._gfxGroup);
        var naturalRatio = (bb.x + bb.width) / (bb.y + bb.height);
        var widgetWidth = this._widgetBox.w;
        var widgetHeight = this._widgetBox.h;
        var widgetRatio = this._widgetBox.w / this._widgetBox.h;
        var xpos = 0;
        var ypos = 0;
        var h = 0;
        var w = 0;
        if (naturalRatio > widgetRatio) {
            w = widgetWidth;
            h = w / naturalRatio;
            ypos = (widgetHeight - h) / 2;
        } else {
            h = widgetHeight;
            w = h * naturalRatio;
            xpos = (widgetWidth - w) / 2;
        }
        var scaleFactor = Math.max(w / (bb.x + bb.width), h / (bb.y + bb.height));
        this._transformProperties = {scale:scaleFactor, tx:xpos, ty:ypos};
        this._gfxGroup.setTransform([gfx.matrix.scale(scaleFactor), gfx.matrix.translate(xpos / scaleFactor, ypos / scaleFactor)]);
    }, _gaugeToPage:function (px, py) {
        if (this._transformProperties) {
            var np = domGeom.position(this.domNode, true);
            return {x:np.x + px * this._transformProperties.scale + this._transformProperties.tx, y:np.y + py * this._transformProperties.scale + this._transformProperties.ty};
        } else {
            return null;
        }
    }});
});

