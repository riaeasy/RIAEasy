//>>built

define("dojox/geo/openlayers/GeometryFeature", ["dojo/_base/declare", "dojo/_base/array", "dojo/_base/lang", "dojox/gfx/matrix", "./Point", "./LineString", "./Collection", "./Feature"], function (declare, array, lang, matrix, Point, LineString, Collection, Feature) {
    return declare("dojox.geo.openlayers.GeometryFeature", Feature, {constructor:function (geometry) {
        this._geometry = geometry;
        this._shapeProperties = {};
        this._fill = null;
        this._stroke = null;
    }, _createCollection:function (g) {
        var layer = this.getLayer();
        var s = layer.getSurface();
        var c = this.createShape(s, g);
        var vp = layer.getViewport();
        vp.add(c);
        return c;
    }, _getCollectionShape:function (g) {
        var s = g.shape;
        if (s == null) {
            s = this._createCollection(g);
            g.shape = s;
        }
        return s;
    }, renderCollection:function (g) {
        if (g == undefined) {
            g = this._geometry;
        }
        s = this._getCollectionShape(g);
        var prop = this.getShapeProperties();
        s.setShape(prop);
        array.forEach(g.coordinates, function (item) {
            if (item instanceof Point) {
                this.renderPoint(item);
            } else {
                if (item instanceof LineString) {
                    this.renderLineString(item);
                } else {
                    if (item instanceof Collection) {
                        this.renderCollection(item);
                    } else {
                        throw new Error();
                    }
                }
            }
        }, this);
        this._applyStyle(g);
    }, render:function (g) {
        if (g == undefined) {
            g = this._geometry;
        }
        if (g instanceof Point) {
            this.renderPoint(g);
        } else {
            if (g instanceof LineString) {
                this.renderLineString(g);
            } else {
                if (g instanceof Collection) {
                    this.renderCollection(g);
                } else {
                    throw new Error();
                }
            }
        }
    }, getShapeProperties:function () {
        return this._shapeProperties;
    }, setShapeProperties:function (s) {
        this._shapeProperties = s;
        return this;
    }, createShape:function (s, g) {
        if (!g) {
            g = this._geometry;
        }
        var shape = null;
        if (g instanceof Point) {
            shape = s.createCircle();
        } else {
            if (g instanceof LineString) {
                shape = s.createPolyline();
            } else {
                if (g instanceof Collection) {
                    var grp = s.createGroup();
                    array.forEach(g.coordinates, function (item) {
                        var shp = this.createShape(s, item);
                        grp.add(shp);
                    }, this);
                    shape = grp;
                } else {
                    throw new Error();
                }
            }
        }
        return shape;
    }, getShape:function () {
        var g = this._geometry;
        if (!g) {
            return null;
        }
        if (g.shape) {
            return g.shape;
        }
        this.render();
        return g.shape;
    }, _createPoint:function (g) {
        var layer = this.getLayer();
        var s = layer.getSurface();
        var c = this.createShape(s, g);
        var vp = layer.getViewport();
        vp.add(c);
        return c;
    }, _getPointShape:function (g) {
        var s = g.shape;
        if (s == null) {
            s = this._createPoint(g);
            g.shape = s;
        }
        return s;
    }, renderPoint:function (g) {
        if (g == undefined) {
            g = this._geometry;
        }
        var layer = this.getLayer();
        var map = layer.getDojoMap();
        s = this._getPointShape(g);
        var prop = lang.mixin({}, this._defaults.pointShape);
        prop = lang.mixin(prop, this.getShapeProperties());
        s.setShape(prop);
        var from = this.getCoordinateSystem();
        var p = map.transform(g.coordinates, from);
        var a = this._getLocalXY(p);
        var cx = a[0];
        var cy = a[1];
        var tr = layer.getViewport().getTransform();
        if (tr) {
            s.setTransform(matrix.translate(cx - tr.dx, cy - tr.dy));
        }
        this._applyStyle(g);
    }, _createLineString:function (g) {
        var layer = this.getLayer();
        var s = layer._surface;
        var shape = this.createShape(s, g);
        var vp = layer.getViewport();
        vp.add(shape);
        g.shape = shape;
        return shape;
    }, _getLineStringShape:function (g) {
        var s = g.shape;
        if (s == null) {
            s = this._createLineString(g);
            g.shape = s;
        }
        return s;
    }, renderLineString:function (g) {
        if (g == undefined) {
            g = this._geometry;
        }
        var layer = this.getLayer();
        var map = layer.getDojoMap();
        var lss = this._getLineStringShape(g);
        var from = this.getCoordinateSystem();
        var points = new Array(g.coordinates.length);
        var tr = layer.getViewport().getTransform();
        array.forEach(g.coordinates, function (c, i, array) {
            var p = map.transform(c, from);
            var a = this._getLocalXY(p);
            if (tr) {
                a[0] -= tr.dx;
                a[1] -= tr.dy;
            }
            points[i] = {x:a[0], y:a[1]};
        }, this);
        var prop = lang.mixin({}, this._defaults.lineStringShape);
        prop = lang.mixin(prop, this.getShapeProperties());
        prop = lang.mixin(prop, {points:points});
        lss.setShape(prop);
        this._applyStyle(g);
    }, _applyStyle:function (g) {
        if (!g || !g.shape) {
            return;
        }
        var f = this.getFill();
        var fill;
        if (!f || lang.isString(f) || lang.isArray(f)) {
            fill = f;
        } else {
            fill = lang.mixin({}, this._defaults.fill);
            fill = lang.mixin(fill, f);
        }
        var s = this.getStroke();
        var stroke;
        if (!s || lang.isString(s) || lang.isArray(s)) {
            stroke = s;
        } else {
            stroke = lang.mixin({}, this._defaults.stroke);
            stroke = lang.mixin(stroke, s);
        }
        this._applyRecusiveStyle(g, stroke, fill);
    }, _applyRecusiveStyle:function (g, stroke, fill) {
        var shp = g.shape;
        if (shp.setFill) {
            shp.setFill(fill);
        }
        if (shp.setStroke) {
            shp.setStroke(stroke);
        }
        if (g instanceof Collection) {
            array.forEach(g.coordinates, function (i) {
                this._applyRecusiveStyle(i, stroke, fill);
            }, this);
        }
    }, setStroke:function (s) {
        this._stroke = s;
        return this;
    }, getStroke:function () {
        return this._stroke;
    }, setFill:function (f) {
        this._fill = f;
        return this;
    }, getFill:function () {
        return this._fill;
    }, remove:function () {
        var g = this._geometry;
        var shp = g.shape;
        g.shape = null;
        if (shp) {
            shp.removeShape();
        }
        if (g instanceof Collection) {
            array.forEach(g.coordinates, function (i) {
                this.remove(i);
            }, this);
        }
    }, _defaults:{fill:null, stroke:null, pointShape:{r:30}, lineStringShape:null}});
});

