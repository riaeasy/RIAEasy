//>>built

define("dojox/geo/openlayers/Feature", ["dojo/_base/kernel", "dojo/_base/declare", "./_base"], function (dojo, declare, openlayers) {
    return declare("dojox.geo.openlayers.Feature", null, {constructor:function () {
        this._layer = null;
        this._coordSys = openlayers.EPSG4326;
    }, getCoordinateSystem:function () {
        return this._coordSys;
    }, setCoordinateSystem:function (cs) {
        this._coordSys = cs;
    }, getLayer:function () {
        return this._layer;
    }, _setLayer:function (l) {
        this._layer = l;
    }, render:function () {
    }, remove:function () {
    }, _getLocalXY:function (p) {
        var x = p.x;
        var y = p.y;
        var layer = this.getLayer();
        var resolution = layer.olLayer.map.getResolution();
        var extent = layer.olLayer.getExtent();
        var rx = (x / resolution + (-extent.left / resolution));
        var ry = ((extent.top / resolution) - y / resolution);
        return [rx, ry];
    }});
});

