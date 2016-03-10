//>>built

define("dojox/geo/openlayers/WidgetFeature", ["dojo/_base/declare", "dojo/dom-style", "dojo/_base/lang", "dijit/registry", "./Feature"], function (declare, style, lang, registry, Feature) {
    return declare("dojox.geo.openlayers.WidgetFeature", Feature, {_widget:null, _bbox:null, constructor:function (params) {
        this._params = params;
    }, setParameters:function (params) {
        this._params = params;
    }, getParameters:function () {
        return this._params;
    }, _getWidget:function () {
        var params = this._params;
        if ((this._widget == null) && (params != null)) {
            var w = null;
            if (typeof (params.createWidget) == "function") {
                w = params.createWidget.call(this);
            } else {
                if (params.dojoType) {
                    dojo["require"](params.dojoType);
                    var c = lang.getObject(params.dojoType);
                    w = new c(params);
                } else {
                    if (params.dijitId) {
                        w = registry.byId(params.dijitId);
                    } else {
                        if (params.widget) {
                            w = params.widget;
                        }
                    }
                }
            }
            if (w != null) {
                this._widget = w;
                if (typeof (w.startup) == "function") {
                    w.startup();
                }
                var n = w.domNode;
                if (n != null) {
                    style.set(n, {position:"absolute"});
                }
            }
            this._widget = w;
        }
        return this._widget;
    }, _getWidgetWidth:function () {
        var p = this._params;
        if (p.width) {
            return p.width;
        }
        var w = this._getWidget();
        if (w) {
            return style.get(w.domNode, "width");
        }
        return 10;
    }, _getWidgetHeight:function () {
        var p = this._params;
        if (p.height) {
            return p.height;
        }
        var w = this._getWidget();
        if (w) {
            return style.get(w.domNode, "height");
        }
        return 10;
    }, render:function () {
        var layer = this.getLayer();
        var widget = this._getWidget();
        if (widget == null) {
            return;
        }
        var params = this._params;
        var lon = params.longitude;
        var lat = params.latitude;
        var from = this.getCoordinateSystem();
        var map = layer.getDojoMap();
        var p = map.transformXY(lon, lat, from);
        var a = this._getLocalXY(p);
        var width = this._getWidgetWidth();
        var height = this._getWidgetHeight();
        var x = a[0] - width / 2;
        var y = a[1] - height / 2;
        var dom = widget.domNode;
        var pa = layer.olLayer.div;
        if (dom.parentNode != pa) {
            if (dom.parentNode) {
                dom.parentNode.removeChild(dom);
            }
            pa.appendChild(dom);
        }
        this._updateWidgetPosition({x:x, y:y, width:width, height:height});
    }, _updateWidgetPosition:function (box) {
        var w = this._widget;
        var dom = w.domNode;
        style.set(dom, {position:"absolute", left:box.x + "px", top:box.y + "px", width:box.width + "px", height:box.height + "px"});
        if (w.srcNodeRef) {
            style.set(w.srcNodeRef, {position:"absolute", left:box.x + "px", top:box.y + "px", width:box.width + "px", height:box.height + "px"});
        }
        if (lang.isFunction(w.resize)) {
            w.resize({w:box.width, h:box.height});
        }
    }, remove:function () {
        var w = this._getWidget();
        if (!w) {
            return;
        }
        var dom = w.domNode;
        if (dom.parentNode) {
            dom.parentNode.removeChild(dom);
        }
    }});
});

