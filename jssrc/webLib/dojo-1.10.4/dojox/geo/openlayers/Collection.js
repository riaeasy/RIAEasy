//>>built

define("dojox/geo/openlayers/Collection", ["dojo/_base/declare", "./Geometry"], function (declare, Geometry) {
    return declare("dojox.geo.openlayers.Collection", Geometry, {coordinates:null, setGeometries:function (g) {
        this.coordinates = g;
    }, getGeometries:function () {
        return this.coordinates;
    }});
});

