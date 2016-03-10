//>>built

define("dojox/dgauges/RectangularGauge", ["dojo/_base/declare", "./GaugeBase", "dojox/gfx/matrix"], function (declare, GaugeBase, matrix) {
    return declare("dojox.dgauges.RectangularGauge", GaugeBase, {orientation:"horizontal", _middleParts:null, _leadingParts:null, _trailingParts:null, _baseParts:null, _classParts:null, _layoutInfos:{}, constructor:function () {
        this.orientation = "horizontal";
        this._middleParts = [];
        this._leadingParts = [];
        this._trailingParts = [];
        this._baseParts = [];
        this._classParts = [];
        this._layoutInfos = {leading:{x:0, y:0, w:0, h:0}, middle:{x:0, y:0, w:0, h:0}, trailing:{x:0, y:0, w:0, h:0}};
        this.addInvalidatingProperties(["orientation"]);
    }, addElement:function (name, element, location) {
        this.inherited(arguments);
        var obj = this._elements[this._elements.length - 1];
        if (location == "middle") {
            this._middleParts.push(obj);
        } else {
            if (location == "leading") {
                this._leadingParts.push(obj);
            } else {
                if (location == "trailing") {
                    this._trailingParts.push(obj);
                } else {
                    if (obj._isGFX) {
                        this._baseParts.push(obj);
                    } else {
                        this._classParts.push(obj);
                    }
                }
            }
        }
    }, removeElement:function (name) {
        var obj = this.getElement(name);
        if (obj) {
            if (this._middleParts && this._middleParts.indexOf(obj) >= 0) {
                this._middleParts.splice(this._middleParts.indexOf(obj), 1);
            } else {
                if (this._leadingParts && this._leadingParts.indexOf(obj) >= 0) {
                    this._leadingParts.splice(this._leadingParts.indexOf(obj), 1);
                } else {
                    if (this._trailingParts && this._trailingParts.indexOf(obj) >= 0) {
                        this._trailingParts.splice(this._trailingParts.indexOf(obj), 1);
                    } else {
                        if (this._baseParts && this._baseParts.indexOf(obj) >= 0) {
                            this._baseParts.splice(this._baseParts.indexOf(obj), 1);
                        } else {
                            if (this._classParts && this._classParts.indexOf(obj) >= 0) {
                                this._classParts.splice(this._classParts.indexOf(obj), 1);
                            }
                        }
                    }
                }
            }
        }
        this.inherited(arguments);
    }, _computeArrayBoundingBox:function (elements) {
        if (elements.length == 0) {
            return {x:0, y:0, w:0, h:0};
        }
        var bbox = null;
        var minX, minY, maxX, maxY;
        minX = minY = +Infinity;
        maxX = maxY = -Infinity;
        for (var i = 0; i < elements.length; i++) {
            bbox = this._computeBoundingBox(elements[i]._gfxGroup);
            if (minX > bbox.x) {
                minX = bbox.x;
            }
            if (minY > bbox.y) {
                minY = bbox.y;
            }
            if (maxX < bbox.x + bbox.width) {
                maxX = bbox.x + bbox.width;
            }
            if (maxY < bbox.y + bbox.height) {
                maxY = bbox.y + bbox.height;
            }
        }
        return {x:minX, y:minY, w:maxX - minX, h:maxY - minY};
    }, refreshRendering:function () {
        if (this._widgetBox.w <= 0 || this._widgetBox.h <= 0) {
            return;
        }
        var i;
        if (this._baseParts) {
            for (i = 0; i < this._baseParts.length; i++) {
                this._baseParts[i].width = this._widgetBox.w;
                this._baseParts[i].height = this._widgetBox.h;
                this._elementsRenderers[this._baseParts[i]._name] = this._baseParts[i].refreshRendering();
            }
        }
        if (this._leadingParts) {
            for (i = 0; i < this._leadingParts.length; i++) {
                this._elementsRenderers[this._leadingParts[i]._name] = this._leadingParts[i].refreshRendering();
            }
        }
        if (this._trailingParts) {
            for (i = 0; i < this._trailingParts.length; i++) {
                this._elementsRenderers[this._trailingParts[i]._name] = this._trailingParts[i].refreshRendering();
            }
        }
        var leadingBoundingBox = this._computeArrayBoundingBox(this._leadingParts);
        var trailingBoundingBox = this._computeArrayBoundingBox(this._trailingParts);
        var middleBoundingBox = {};
        if (this.orientation == "horizontal") {
            middleBoundingBox.x = leadingBoundingBox.x + leadingBoundingBox.w;
            middleBoundingBox.y = 0;
            middleBoundingBox.w = this._widgetBox.w - leadingBoundingBox.w - trailingBoundingBox.w;
            middleBoundingBox.h = this._widgetBox.h;
        } else {
            middleBoundingBox.x = 0;
            middleBoundingBox.y = leadingBoundingBox.y + leadingBoundingBox.h;
            middleBoundingBox.w = this._widgetBox.w;
            middleBoundingBox.h = this._widgetBox.h - leadingBoundingBox.h - trailingBoundingBox.h;
        }
        this._layoutInfos = {leading:leadingBoundingBox, middle:middleBoundingBox, trailing:trailingBoundingBox};
        for (i = 0; i < this._middleParts.length; i++) {
            this._middleParts[i]._gfxGroup.setTransform([matrix.translate(middleBoundingBox.x, middleBoundingBox.y)]);
        }
        if (this._trailingParts) {
            for (i = 0; i < this._trailingParts.length; i++) {
                this._trailingParts[i]._gfxGroup.setTransform(matrix.translate(this._widgetBox.w - trailingBoundingBox.w, 0));
            }
        }
        for (i = 0; i < this._classParts.length; i++) {
            this._elementsRenderers[this._classParts[i]._name] = this._classParts[i].refreshRendering();
        }
    }});
});

