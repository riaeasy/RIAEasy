//>>built

define("dojox/geo/openlayers/_base", ["dojo/_base/lang"], function (lang) {
    var openlayers = lang.getObject("dojox.geo.openlayers", true);
    openlayers.BaseLayerType = {OSM:"OSM", Transport:"OSM.Transport", WMS:"WMS", GOOGLE:"Google", VIRTUAL_EARTH:"VirtualEarth", BING:"VirtualEarth", YAHOO:"Yahoo", ARCGIS:"ArcGIS"};
    openlayers.EPSG4326 = new OpenLayers.Projection("EPSG:4326");
    var re = /^\s*(\d{1,3})[D°]\s*(\d{1,2})[M']\s*(\d{1,2}\.?\d*)\s*(S|"|'')\s*([NSEWnsew]{0,1})\s*$/i;
    openlayers.parseDMS = function (v, toDecimal) {
        var res = re.exec(v);
        if (res == null || res.length < 5) {
            return parseFloat(v);
        }
        var d = parseFloat(res[1]);
        var m = parseFloat(res[2]);
        var s = parseFloat(res[3]);
        var nsew = res[5];
        if (toDecimal) {
            var lc = nsew.toLowerCase();
            var dd = d + (m + s / 60) / 60;
            if (lc == "w" || lc == "s") {
                dd = -dd;
            }
            return dd;
        }
        return [d, m, s, nsew];
    };
    return openlayers;
});

