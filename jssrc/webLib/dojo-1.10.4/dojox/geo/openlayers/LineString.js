//>>built

define("dojox/geo/openlayers/LineString", ["dojo/_base/declare", "./Geometry"], function (declare, Geometry) {
    return declare("dojox.geo.openlayers.LineString", Geometry, {setPoints:function (p) {
        this.coordinates = p;
    }, getPoints:function () {
        return this.coordinates;
    }});
});

