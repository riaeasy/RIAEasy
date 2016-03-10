//>>built

define("dojox/geo/openlayers/Layer", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/sniff", "./Feature"], function (declare, lang, array, sniff, Feature) {
    return declare("dojox.geo.openlayers.Layer", null, {constructor:function (name, options) {
        var ol = options ? options.olLayer : null;
        if (!ol) {
            ol = lang.delegate(new OpenLayers.Layer(name, options));
        }
        this.olLayer = ol;
        this._features = null;
        this.olLayer.events.register("moveend", this, lang.hitch(this, this.moveTo));
    }, renderFeature:function (f) {
        f.render();
    }, getDojoMap:function () {
        return this.dojoMap;
    }, addFeature:function (f) {
        if (lang.isArray(f)) {
            array.forEach(f, function (item) {
                this.addFeature(item);
            }, this);
            return;
        }
        if (this._features == null) {
            this._features = [];
        }
        this._features.push(f);
        f._setLayer(this);
    }, removeFeature:function (f) {
        var ft = this._features;
        if (ft == null) {
            return;
        }
        if (f instanceof Array) {
            f = f.slice(0);
            array.forEach(f, function (item) {
                this.removeFeature(item);
            }, this);
            return;
        }
        var i = array.indexOf(ft, f);
        if (i != -1) {
            ft.splice(i, 1);
        }
        f._setLayer(null);
        f.remove();
    }, removeFeatureAt:function (index) {
        var ft = this._features;
        var f = ft[index];
        if (!f) {
            return;
        }
        ft.splice(index, 1);
        f._setLayer(null);
        f.remove();
    }, getFeatures:function () {
        return this._features;
    }, getFeatureAt:function (i) {
        if (this._features == null) {
            return undefined;
        }
        return this._features[i];
    }, getFeatureCount:function () {
        if (this._features == null) {
            return 0;
        }
        return this._features.length;
    }, clear:function () {
        var fa = this.getFeatures();
        this.removeFeature(fa);
    }, moveTo:function (event) {
        if (event.zoomChanged) {
            if (this._features == null) {
                return;
            }
            array.forEach(this._features, function (f) {
                this.renderFeature(f);
            }, this);
        }
    }, redraw:function () {
        if (sniff.isIE) {
            setTimeout(lang.hitch(this, function () {
                this.olLayer.redraw();
            }, 0));
        } else {
            this.olLayer.redraw();
        }
    }, added:function () {
    }});
});

