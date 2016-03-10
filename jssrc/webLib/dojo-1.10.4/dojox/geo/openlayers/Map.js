//>>built

define("dojox/geo/openlayers/Map", ["dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/json", "dojo/dom", "dojo/dom-style", "./_base", "./TouchInteractionSupport", "./Layer", "./Patch"], function (kernel, declare, lang, array, json, dom, style, openlayers, TouchInteractionSupport, Layer, Patch) {
    kernel.experimental("dojox.geo.openlayers.Map");
    Patch.patchGFX();
    return declare("dojox.geo.openlayers.Map", null, {olMap:null, _tp:null, constructor:function (div, options) {
        if (!options) {
            options = {};
        }
        div = dom.byId(div);
        this._tp = {x:0, y:0};
        var opts = options.openLayersMapOptions;
        if (!opts) {
            opts = {controls:[new OpenLayers.Control.ScaleLine({maxWidth:200}), new OpenLayers.Control.Navigation()]};
        }
        if (options.accessible) {
            var kbd = new OpenLayers.Control.KeyboardDefaults();
            if (!opts.controls) {
                opts.controls = [];
            }
            opts.controls.push(kbd);
        }
        var baseLayerType = options.baseLayerType;
        if (!baseLayerType) {
            baseLayerType = openlayers.BaseLayerType.OSM;
        }
        var map = new OpenLayers.Map(div, opts);
        this.olMap = map;
        this._layerDictionary = {olLayers:[], layers:[]};
        if (options.touchHandler) {
            this._touchControl = new TouchInteractionSupport(map);
        }
        var base = this._createBaseLayer(options);
        this.addLayer(base);
        this.initialFit(options);
    }, initialFit:function (params) {
        var o = params.initialLocation;
        if (!o) {
            o = [-160, 70, 160, -70];
        }
        this.fitTo(o);
    }, setBaseLayerType:function (type) {
        if (type == this.baseLayerType) {
            return null;
        }
        var o = null;
        if (typeof type == "string") {
            o = {baseLayerName:type, baseLayerType:type};
            this.baseLayerType = type;
        } else {
            if (typeof type == "object") {
                o = type;
                this.baseLayerType = o.baseLayerType;
            }
        }
        var bl = null;
        if (o != null) {
            bl = this._createBaseLayer(o);
            if (bl != null) {
                var olm = this.olMap;
                var ob = olm.getZoom();
                var oc = olm.getCenter();
                var recenter = !!oc && !!olm.baseLayer && !!olm.baseLayer.map;
                if (recenter) {
                    var proj = olm.getProjectionObject();
                    if (proj != null) {
                        oc = oc.transform(proj, openlayers.EPSG4326);
                    }
                }
                var old = olm.baseLayer;
                if (old != null) {
                    var l = this._getLayer(old);
                    this.removeLayer(l);
                }
                if (bl != null) {
                    this.addLayer(bl);
                }
                if (recenter) {
                    proj = olm.getProjectionObject();
                    if (proj != null) {
                        oc = oc.transform(openlayers.EPSG4326, proj);
                    }
                    olm.setCenter(oc, ob);
                }
            }
        }
        return bl;
    }, getBaseLayerType:function () {
        return this.baseLayerType;
    }, getScale:function (geodesic) {
        var scale = null;
        var om = this.olMap;
        if (geodesic) {
            var units = om.getUnits();
            if (!units) {
                return null;
            }
            var inches = OpenLayers.INCHES_PER_UNIT;
            scale = (om.getGeodesicPixelSize().w || 0.000001) * inches["km"] * OpenLayers.DOTS_PER_INCH;
        } else {
            scale = om.getScale();
        }
        return scale;
    }, getOLMap:function () {
        return this.olMap;
    }, _createBaseLayer:function (params) {
        var base = null;
        var type = params.baseLayerType;
        var url = params.baseLayerUrl;
        var name = params.baseLayerName;
        var options = params.baseLayerOptions;
        if (!name) {
            name = type;
        }
        if (!options) {
            options = {};
        }
        switch (type) {
          case openlayers.BaseLayerType.OSM:
            options.transitionEffect = "resize";
            base = new Layer(name, {olLayer:new OpenLayers.Layer.OSM(name, url, options)});
            break;
          case openlayers.BaseLayerType.Transport:
            options.transitionEffect = "resize";
            base = new Layer(name, {olLayer:new OpenLayers.Layer.OSM.TransportMap(name, url, options)});
            break;
          case openlayers.BaseLayerType.WMS:
            if (!url) {
                url = "http://labs.metacarta.com/wms/vmap0";
                if (!options.layers) {
                    options.layers = "basic";
                }
            }
            base = new Layer(name, {olLayer:new OpenLayers.Layer.WMS(name, url, options, {transitionEffect:"resize"})});
            break;
          case openlayers.BaseLayerType.GOOGLE:
            base = new Layer(name, {olLayer:new OpenLayers.Layer.Google(name, options)});
            break;
          case openlayers.BaseLayerType.VIRTUAL_EARTH:
            base = new Layer(name, {olLayer:new OpenLayers.Layer.VirtualEarth(name, options)});
            break;
          case openlayers.BaseLayerType.YAHOO:
            base = new Layer(name, {olLayer:new OpenLayers.Layer.Yahoo(name, options)});
            break;
          case openlayers.BaseLayerType.ARCGIS:
            if (!url) {
                url = "http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_StreetMap_World_2D/MapServer/export";
            }
            base = new Layer(name, {olLayer:new OpenLayers.Layer.ArcGIS93Rest(name, url, options, {})});
            break;
        }
        if (base == null) {
            if (type instanceof OpenLayers.Layer) {
                base = type;
            } else {
                options.transitionEffect = "resize";
                base = new Layer(name, {olLayer:new OpenLayers.Layer.OSM(name, url, options)});
                this.baseLayerType = openlayers.BaseLayerType.OSM;
            }
        }
        return base;
    }, removeLayer:function (layer) {
        var om = this.olMap;
        var i = array.indexOf(this._layerDictionary.layers, layer);
        if (i > 0) {
            this._layerDictionary.layers.splice(i, 1);
        }
        var oll = layer.olLayer;
        var j = array.indexOf(this._layerDictionary.olLayers, oll);
        if (j > 0) {
            this._layerDictionary.olLayers.splice(i, j);
        }
        om.removeLayer(oll, false);
    }, layerIndex:function (layer, index) {
        var olm = this.olMap;
        if (!index) {
            return olm.getLayerIndex(layer.olLayer);
        }
        olm.setLayerIndex(layer.olLayer, index);
        this._layerDictionary.layers.sort(function (l1, l2) {
            return olm.getLayerIndex(l1.olLayer) - olm.getLayerIndex(l2.olLayer);
        });
        this._layerDictionary.olLayers.sort(function (l1, l2) {
            return olm.getLayerIndex(l1) - olm.getLayerIndex(l2);
        });
        return index;
    }, addLayer:function (layer) {
        layer.dojoMap = this;
        var om = this.olMap;
        var ol = layer.olLayer;
        this._layerDictionary.olLayers.push(ol);
        this._layerDictionary.layers.push(layer);
        om.addLayer(ol);
        layer.added();
    }, _getLayer:function (ol) {
        var i = array.indexOf(this._layerDictionary.olLayers, ol);
        if (i != -1) {
            return this._layerDictionary.layers[i];
        }
        return null;
    }, getLayer:function (property, value) {
        var om = this.olMap;
        var ols = om.getBy("layers", property, value);
        var ret = new Array();
        array.forEach(ols, function (ol) {
            ret.push(this._getLayer(ol));
        }, this);
        return ret;
    }, getLayerCount:function () {
        var om = this.olMap;
        if (om.layers == null) {
            return 0;
        }
        return om.layers.length;
    }, fitTo:function (o) {
        var map = this.olMap;
        var from = openlayers.EPSG4326;
        if (o == null) {
            var c = this.transformXY(0, 0, from);
            map.setCenter(new OpenLayers.LonLat(c.x, c.y));
            return;
        }
        var b = null;
        if (typeof o == "string") {
            var j = json.fromJson(o);
        } else {
            j = o;
        }
        var ul;
        var lr;
        if (j.hasOwnProperty("bounds")) {
            var a = j.bounds;
            b = new OpenLayers.Bounds();
            ul = this.transformXY(a[0], a[1], from);
            b.left = ul.x;
            b.top = ul.y;
            lr = this.transformXY(a[2], a[3], from);
            b.right = lr.x;
            b.bottom = lr.y;
        }
        if (b == null) {
            if (j.hasOwnProperty("position")) {
                var p = j.position;
                var e = j.hasOwnProperty("extent") ? j.extent : 1;
                if (typeof e == "string") {
                    e = parseFloat(e);
                }
                b = new OpenLayers.Bounds();
                ul = this.transformXY(p[0] - e, p[1] + e, from);
                b.left = ul.x;
                b.top = ul.y;
                lr = this.transformXY(p[0] + e, p[1] - e, from);
                b.right = lr.x;
                b.bottom = lr.y;
            }
        }
        if (b == null) {
            if (o.length == 4) {
                b = new OpenLayers.Bounds();
                if (false) {
                    b.left = o[0];
                    b.top = o[1];
                    b.right = o[2];
                    b.bottom = o[3];
                } else {
                    ul = this.transformXY(o[0], o[1], from);
                    b.left = ul.x;
                    b.top = ul.y;
                    lr = this.transformXY(o[2], o[3], from);
                    b.right = lr.x;
                    b.bottom = lr.y;
                }
            }
        }
        if (b != null) {
            map.zoomToExtent(b, true);
        }
    }, transform:function (p, from, to) {
        return this.transformXY(p.x, p.y, from, to);
    }, transformXY:function (x, y, from, to) {
        var tp = this._tp;
        tp.x = x;
        tp.y = y;
        if (!from) {
            from = openlayers.EPSG4326;
        }
        if (!to) {
            to = this.olMap.getProjectionObject();
        }
        tp = OpenLayers.Projection.transform(tp, from, to);
        return tp;
    }});
});

