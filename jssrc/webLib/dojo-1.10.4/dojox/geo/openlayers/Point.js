//>>built

define("dojox/geo/openlayers/Point", ["dojo/_base/declare", "./Geometry"], function (declare, Geometry) {
    return declare("dojox.geo.openlayers.Point", Geometry, {setPoint:function (p) {
        this.coordinates = p;
    }, getPoint:function () {
        return this.coordinates;
    }});
});

