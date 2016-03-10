//>>built

define("dojox/geo/openlayers/widget/Map", ["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/array", "dojo/dom-geometry", "dojo/query", "dijit/_Widget", "../_base", "../Map", "../Layer", "../GfxLayer"], function (lang, declare, array, domgeo, query, Widget, openlayers, Map, Layer, GfxLayer) {
    return declare("dojox.geo.openlayers.widget.Map", Widget, {baseLayerType:openlayers.BaseLayerType.OSM, initialLocation:null, touchHandler:false, map:null, startup:function () {
        this.inherited(arguments);
        this.map.initialFit({initialLocation:this.initialLocation});
    }, buildRendering:function () {
        this.inherited(arguments);
        var div = this.domNode;
        var map = new Map(div, {baseLayerType:this.baseLayerType, touchHandler:this.touchHandler});
        this.map = map;
        this._makeLayers();
    }, _makeLayers:function () {
        var n = this.domNode;
        var layers = query("> .layer", n);
        array.forEach(layers, function (l) {
            var type = l.getAttribute("type");
            var name = l.getAttribute("name");
            var cls = "dojox.geo.openlayers." + type;
            var p = lang.getObject(cls);
            if (p) {
                var layer = new p(name, {});
                if (layer) {
                    this.map.addLayer(layer);
                }
            }
        }, this);
    }, resize:function (b, h) {
        var olm = this.map.getOLMap();
        var box;
        switch (arguments.length) {
          case 0:
            break;
          case 1:
            box = lang.mixin({}, b);
            domgeo.setMarginBox(olm.div, box);
            break;
          case 2:
            box = {w:arguments[0], h:arguments[1]};
            domgeo.setMarginBox(olm.div, box);
            break;
        }
        olm.updateSize();
    }});
});

