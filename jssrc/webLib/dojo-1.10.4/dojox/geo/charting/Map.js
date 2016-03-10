//>>built

define("dojox/geo/charting/Map", ["dojo/_base/lang", "dojo/_base/array", "dojo/_base/declare", "dojo/_base/html", "dojo/dom", "dojo/dom-geometry", "dojo/dom-class", "dojo/_base/xhr", "dojo/_base/connect", "dojo/_base/window", "dojox/gfx", "./_base", "./Feature", "./_Marker", "dojo/number", "dojo/_base/sniff"], function (lang, arr, declare, html, dom, domGeom, domClass, xhr, connect, win, gfx, base, Feature, Marker, number, has) {
    return declare("dojox.geo.charting.Map", null, {defaultColor:"#B7B7B7", highlightColor:"#D5D5D5", series:[], dataBindingAttribute:null, dataBindingValueFunction:null, dataStore:null, showTooltips:true, enableFeatureZoom:true, colorAnimationDuration:0, _idAttributes:null, _onSetListener:null, _onNewListener:null, _onDeleteListener:null, constructor:function (container, shapeData) {
        html.style(container, "display", "block");
        this.container = container;
        var containerBounds = this._getContainerBounds();
        this.surface = gfx.createSurface(container, containerBounds.w, containerBounds.h);
        this._createZoomingCursor();
        this.mapBackground = this.surface.createRect({x:0, y:0, width:containerBounds.w, height:containerBounds.w}).setFill("rgba(0,0,0,0)");
        this.mapObj = this.surface.createGroup();
        this.mapObj.features = {};
        if (typeof shapeData == "object") {
            this._init(shapeData);
        } else {
            if (typeof shapeData == "string" && shapeData.length > 0) {
                xhr.get({url:shapeData, handleAs:"json", sync:true, load:lang.hitch(this, "_init")});
            }
        }
    }, _getContainerBounds:function () {
        var position = domGeom.position(this.container, true);
        var marginBox = domGeom.getMarginBox(this.container);
        var contentBox = domGeom.getContentBox(this.container);
        this._storedContainerBounds = {x:position.x, y:position.y, w:contentBox.w || 100, h:contentBox.h || 100};
        return this._storedContainerBounds;
    }, resize:function (adjustMapCenter, adjustMapScale, animate) {
        var oldBounds = this._storedContainerBounds;
        var newBounds = this._getContainerBounds();
        if ((oldBounds.w == newBounds.w) && (oldBounds.h == newBounds.h)) {
            return;
        }
        this.mapBackground.setShape({width:newBounds.w, height:newBounds.h});
        this.surface.setDimensions(newBounds.w, newBounds.h);
        this.mapObj.marker.hide();
        this.mapObj.marker._needTooltipRefresh = true;
        if (adjustMapCenter) {
            var mapScale = this.getMapScale();
            var newScale = mapScale;
            if (adjustMapScale) {
                var bbox = this.mapObj.boundBox;
                var widthFactor = newBounds.w / oldBounds.w;
                var heightFactor = newBounds.h / oldBounds.h;
                newScale = mapScale * Math.sqrt(widthFactor * heightFactor);
            }
            var invariantMapPoint = this.screenCoordsToMapCoords(oldBounds.w / 2, oldBounds.h / 2);
            this.setMapCenterAndScale(invariantMapPoint.x, invariantMapPoint.y, newScale, animate);
        }
    }, _isMobileDevice:function () {
        return (has("safari") && (navigator.userAgent.indexOf("iPhone") > -1 || navigator.userAgent.indexOf("iPod") > -1 || navigator.userAgent.indexOf("iPad") > -1)) || (navigator.userAgent.toLowerCase().indexOf("android") > -1);
    }, setMarkerData:function (markerFile) {
        xhr.get({url:markerFile, handleAs:"json", handle:lang.hitch(this, "_appendMarker")});
    }, setDataBindingAttribute:function (prop) {
        this.dataBindingAttribute = prop;
        if (this.dataStore) {
            this._queryDataStore();
        }
    }, setDataBindingValueFunction:function (valueFunction) {
        this.dataBindingValueFunction = valueFunction;
        if (this.dataStore) {
            this._queryDataStore();
        }
    }, _queryDataStore:function () {
        if (!this.dataBindingAttribute || (this.dataBindingAttribute.length == 0)) {
            return;
        }
        var mapInstance = this;
        this.dataStore.fetch({scope:this, onComplete:function (items) {
            this._idAttributes = mapInstance.dataStore.getIdentityAttributes({});
            arr.forEach(items, function (item) {
                var id = mapInstance.dataStore.getValue(item, this._idAttributes[0]);
                if (mapInstance.mapObj.features[id]) {
                    var val = null;
                    var itemVal = mapInstance.dataStore.getValue(item, mapInstance.dataBindingAttribute);
                    if (itemVal) {
                        if (this.dataBindingValueFunction) {
                            val = this.dataBindingValueFunction(itemVal);
                        } else {
                            if (isNaN(val)) {
                                val = number.parse(itemVal);
                            } else {
                                val = itemVal;
                            }
                        }
                    }
                    if (val) {
                        mapInstance.mapObj.features[id].setValue(val);
                    }
                }
            }, this);
        }});
    }, _onSet:function (item, attribute, oldValue, newValue) {
        var id = this.dataStore.getValue(item, this._idAttributes[0]);
        var feature = this.mapObj.features[id];
        if (feature && (attribute == this.dataBindingAttribute)) {
            if (newValue) {
                feature.setValue(newValue);
            } else {
                feature.unsetValue();
            }
        }
    }, _onNew:function (newItem, parentItem) {
        var id = this.dataStore.getValue(item, this._idAttributes[0]);
        var feature = this.mapObj.features[id];
        if (feature && (attribute == this.dataBindingAttribute)) {
            feature.setValue(newValue);
        }
    }, _onDelete:function (item) {
        var id = item[this._idAttributes[0]];
        var feature = this.mapObj.features[id];
        if (feature) {
            feature.unsetValue();
        }
    }, setDataStore:function (dataStore, dataBindingProp) {
        if (this.dataStore != dataStore) {
            if (this._onSetListener) {
                connect.disconnect(this._onSetListener);
                connect.disconnect(this._onNewListener);
                connect.disconnect(this._onDeleteListener);
            }
            this.dataStore = dataStore;
            if (dataStore) {
                _onSetListener = connect.connect(this.dataStore, "onSet", this, this._onSet);
                _onNewListener = connect.connect(this.dataStore, "onNew", this, this._onNew);
                _onDeleteListener = connect.connect(this.dataStore, "onDelete", this, this._onDelete);
            }
        }
        if (dataBindingProp) {
            this.setDataBindingAttribute(dataBindingProp);
        }
    }, addSeries:function (series) {
        if (typeof series == "object") {
            this._addSeriesImpl(series);
        } else {
            if (typeof series == "string" && series.length > 0) {
                xhr.get({url:series, handleAs:"json", sync:true, load:lang.hitch(this, function (content) {
                    this._addSeriesImpl(content.series);
                })});
            }
        }
    }, _addSeriesImpl:function (series) {
        this.series = series;
        for (var item in this.mapObj.features) {
            var feature = this.mapObj.features[item];
            feature.setValue(feature.value);
        }
    }, fitToMapArea:function (mapArea, pixelMargin, animate, onAnimationEnd) {
        if (!pixelMargin) {
            pixelMargin = 0;
        }
        var width = mapArea.w, height = mapArea.h, containerBounds = this._getContainerBounds(), scale = Math.min((containerBounds.w - 2 * pixelMargin) / width, (containerBounds.h - 2 * pixelMargin) / height);
        this.setMapCenterAndScale(mapArea.x + mapArea.w / 2, mapArea.y + mapArea.h / 2, scale, animate, onAnimationEnd);
    }, fitToMapContents:function (pixelMargin, animate, onAnimationEnd) {
        var bbox = this.mapObj.boundBox;
        this.fitToMapArea(bbox, pixelMargin, animate, onAnimationEnd);
    }, setMapCenter:function (centerX, centerY, animate, onAnimationEnd) {
        var currentScale = this.getMapScale();
        this.setMapCenterAndScale(centerX, centerY, currentScale, animate, onAnimationEnd);
    }, _createAnimation:function (onShape, fromTransform, toTransform, onAnimationEnd) {
        var fromDx = fromTransform.dx ? fromTransform.dx : 0;
        var fromDy = fromTransform.dy ? fromTransform.dy : 0;
        var toDx = toTransform.dx ? toTransform.dx : 0;
        var toDy = toTransform.dy ? toTransform.dy : 0;
        var fromScale = fromTransform.xx ? fromTransform.xx : 1;
        var toScale = toTransform.xx ? toTransform.xx : 1;
        var anim = gfx.fx.animateTransform({duration:1000, shape:onShape, transform:[{name:"translate", start:[fromDx, fromDy], end:[toDx, toDy]}, {name:"scale", start:[fromScale], end:[toScale]}]});
        if (onAnimationEnd) {
            var listener = connect.connect(anim, "onEnd", this, function (event) {
                onAnimationEnd(event);
                connect.disconnect(listener);
            });
        }
        return anim;
    }, setMapCenterAndScale:function (centerX, centerY, scale, animate, onAnimationEnd) {
        var bbox = this.mapObj.boundBox;
        var containerBounds = this._getContainerBounds();
        var offsetX = containerBounds.w / 2 - scale * (centerX - bbox.x);
        var offsetY = containerBounds.h / 2 - scale * (centerY - bbox.y);
        var newTransform = new gfx.matrix.Matrix2D({xx:scale, yy:scale, dx:offsetX, dy:offsetY});
        var currentTransform = this.mapObj.getTransform();
        if (!animate || !currentTransform) {
            this.mapObj.setTransform(newTransform);
        } else {
            var anim = this._createAnimation(this.mapObj, currentTransform, newTransform, onAnimationEnd);
            anim.play();
        }
    }, getMapCenter:function () {
        var containerBounds = this._getContainerBounds();
        return this.screenCoordsToMapCoords(containerBounds.w / 2, containerBounds.h / 2);
    }, setMapScale:function (scale, animate, onAnimationEnd) {
        var containerBounds = this._getContainerBounds();
        var invariantMapPoint = this.screenCoordsToMapCoords(containerBounds.w / 2, containerBounds.h / 2);
        this.setMapScaleAt(scale, invariantMapPoint.x, invariantMapPoint.y, animate, onAnimationEnd);
    }, setMapScaleAt:function (scale, fixedMapX, fixedMapY, animate, onAnimationEnd) {
        var invariantMapPoint = null;
        var invariantScreenPoint = null;
        invariantMapPoint = {x:fixedMapX, y:fixedMapY};
        invariantScreenPoint = this.mapCoordsToScreenCoords(invariantMapPoint.x, invariantMapPoint.y);
        var bbox = this.mapObj.boundBox;
        var offsetX = invariantScreenPoint.x - scale * (invariantMapPoint.x - bbox.x);
        var offsetY = invariantScreenPoint.y - scale * (invariantMapPoint.y - bbox.y);
        var newTransform = new gfx.matrix.Matrix2D({xx:scale, yy:scale, dx:offsetX, dy:offsetY});
        var currentTransform = this.mapObj.getTransform();
        if (!animate || !currentTransform) {
            this.mapObj.setTransform(newTransform);
        } else {
            var anim = this._createAnimation(this.mapObj, currentTransform, newTransform, onAnimationEnd);
            anim.play();
        }
    }, getMapScale:function () {
        var mat = this.mapObj.getTransform();
        var scale = mat ? mat.xx : 1;
        return scale;
    }, mapCoordsToScreenCoords:function (mapX, mapY) {
        var matrix = this.mapObj.getTransform();
        var screenPoint = gfx.matrix.multiplyPoint(matrix, mapX, mapY);
        return screenPoint;
    }, screenCoordsToMapCoords:function (screenX, screenY) {
        var invMatrix = gfx.matrix.invert(this.mapObj.getTransform());
        var mapPoint = gfx.matrix.multiplyPoint(invMatrix, screenX, screenY);
        return mapPoint;
    }, deselectAll:function () {
        for (var name in this.mapObj.features) {
            this.mapObj.features[name].select(false);
        }
        this.selectedFeature = null;
        this.focused = false;
    }, _init:function (shapeData) {
        this.mapObj.boundBox = {x:shapeData.layerExtent[0], y:shapeData.layerExtent[1], w:(shapeData.layerExtent[2] - shapeData.layerExtent[0]), h:shapeData.layerExtent[3] - shapeData.layerExtent[1]};
        this.fitToMapContents(3);
        arr.forEach(shapeData.featureNames, function (item) {
            var featureShape = shapeData.features[item];
            featureShape.bbox.x = featureShape.bbox[0];
            featureShape.bbox.y = featureShape.bbox[1];
            featureShape.bbox.w = featureShape.bbox[2];
            featureShape.bbox.h = featureShape.bbox[3];
            var feature = new Feature(this, item, featureShape);
            feature.init();
            this.mapObj.features[item] = feature;
        }, this);
        this.mapObj.marker = new Marker({}, this);
    }, _appendMarker:function (markerData) {
        this.mapObj.marker = new Marker(markerData, this);
    }, _createZoomingCursor:function () {
        if (!dom.byId("mapZoomCursor")) {
            var mapZoomCursor = win.doc.createElement("div");
            html.attr(mapZoomCursor, "id", "mapZoomCursor");
            domClass.add(mapZoomCursor, "mapZoomIn");
            html.style(mapZoomCursor, "display", "none");
            win.body().appendChild(mapZoomCursor);
        }
    }, onFeatureClick:function (feature) {
    }, onFeatureOver:function (feature) {
    }, onZoomEnd:function (feature) {
    }});
});

