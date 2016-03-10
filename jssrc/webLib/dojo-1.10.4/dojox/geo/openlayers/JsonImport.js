//>>built

define("dojox/geo/openlayers/JsonImport", ["dojo/_base/declare", "dojo/_base/xhr", "dojo/_base/lang", "dojo/_base/array", "./LineString", "./Collection", "./GeometryFeature"], function (declare, xhr, lang, array, LineString, Collection, GeometryFeature) {
    return declare("dojox.geo.openlayers.JsonImport", null, {constructor:function (params) {
        this._params = params;
    }, loadData:function () {
        var p = this._params;
        xhr.get({url:p.url, handleAs:"json", sync:true, load:lang.hitch(this, this._gotData), error:lang.hitch(this, this._loadError)});
    }, _gotData:function (items) {
        var nf = this._params.nextFeature;
        if (!lang.isFunction(nf)) {
            return;
        }
        var extent = items.layerExtent;
        var ulx = extent[0];
        var uly = extent[1];
        var lrx = ulx + extent[2];
        var lry = uly + extent[3];
        var extentLL = items.layerExtentLL;
        var x1 = extentLL[0];
        var y1 = extentLL[1];
        var x2 = x1 + extentLL[2];
        var y2 = y1 + extentLL[3];
        var ulxLL = x1;
        var ulyLL = y2;
        var lrxLL = x2;
        var lryLL = y1;
        var features = items.features;
        for (var f in features) {
            var o = features[f];
            var s = o["shape"];
            var gf = null;
            if (lang.isArray(s[0])) {
                var a = new Array();
                array.forEach(s, function (item) {
                    var ls = this._makeGeometry(item, ulx, uly, lrx, lry, ulxLL, ulyLL, lrxLL, lryLL);
                    a.push(ls);
                }, this);
                var g = new Collection(a);
                gf = new GeometryFeature(g);
                nf.call(this, gf);
            } else {
                gf = this._makeFeature(s, ulx, uly, lrx, lry, ulxLL, ulyLL, lrxLL, lryLL);
                nf.call(this, gf);
            }
        }
        var complete = this._params.complete;
        if (lang.isFunction(complete)) {
            complete.call(this, complete);
        }
    }, _makeGeometry:function (s, ulx, uly, lrx, lry, ulxLL, ulyLL, lrxLL, lryLL) {
        var a = [];
        var k = 0;
        for (var i = 0; i < s.length - 1; i += 2) {
            var x = s[i];
            var y = s[i + 1];
            k = (x - ulx) / (lrx - ulx);
            var px = k * (lrxLL - ulxLL) + ulxLL;
            k = (y - uly) / (lry - uly);
            var py = k * (lryLL - ulyLL) + ulyLL;
            a.push({x:px, y:py});
        }
        var ls = new LineString(a);
        return ls;
    }, _makeFeature:function (s, ulx, uly, lrx, lry, ulxLL, ulyLL, lrxLL, lryLL) {
        var ls = this._makeGeometry(s, ulx, uly, lrx, lry, ulxLL, ulyLL, lrxLL, lryLL);
        var gf = new GeometryFeature(ls);
        return gf;
    }, _loadError:function () {
        var f = this._params.error;
        if (lang.isFunction(f)) {
            f.apply(this, parameters);
        }
    }});
});

