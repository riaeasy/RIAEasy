//>>built

define("dojox/dgauges/GaugeBase", ["dojo/_base/lang", "dojo/_base/declare", "dojo/dom-geometry", "dijit/registry", "dijit/_WidgetBase", "dojo/_base/html", "dojo/_base/event", "dojox/gfx", "dojox/widget/_Invalidating", "./ScaleBase", "dojox/gfx/matrix"], function (lang, declare, domGeom, WidgetRegistry, _WidgetBase, html, event, gfx, _Invalidating, ScaleBase, matrix) {
    return declare("dojox.dgauges.GaugeBase", [_WidgetBase, _Invalidating], {_elements:null, _scales:null, _elementsIndex:null, _elementsRenderers:null, _gfxGroup:null, _mouseShield:null, _widgetBox:null, _node:null, value:0, _mainIndicator:null, _getValueAttr:function () {
        if (this._mainIndicator) {
            return this._mainIndicator.get("value");
        } else {
            this._setMainIndicator();
            if (this._mainIndicator) {
                return this._mainIndicator.get("value");
            }
        }
        return this.value;
    }, _setValueAttr:function (value) {
        this._set("value", value);
        if (this._mainIndicator) {
            this._mainIndicator.set("value", value);
        } else {
            this._setMainIndicator();
            if (this._mainIndicator) {
                this._mainIndicator.set("value", value);
            }
        }
    }, _setMainIndicator:function () {
        var indicator;
        for (var i = 0; i < this._scales.length; i++) {
            indicator = this._scales[i].getIndicator("indicator");
            if (indicator) {
                this._mainIndicator = indicator;
            }
        }
    }, _resetMainIndicator:function () {
        this._mainIndicator = null;
    }, font:null, constructor:function (args, node) {
        this.font = {family:"Helvetica", style:"normal", variant:"small-caps", weight:"bold", size:"10pt", color:"black"};
        this._elements = [];
        this._scales = [];
        this._elementsIndex = {};
        this._elementsRenderers = {};
        this._node = WidgetRegistry.byId(node);
        var box = html.getMarginBox(node);
        this.surface = gfx.createSurface(this._node, box.w || 1, box.h || 1);
        this._widgetBox = box;
        this._baseGroup = this.surface.createGroup();
        this._mouseShield = this._baseGroup.createGroup();
        this._gfxGroup = this._baseGroup.createGroup();
    }, _setCursor:function (type) {
        if (this._node) {
            this._node.style.cursor = type;
        }
    }, _computeBoundingBox:function (element) {
        return element ? element.getBoundingBox() : {x:0, y:0, width:0, height:0};
    }, destroy:function () {
        this.surface.destroy();
        this.inherited(arguments);
    }, resize:function (width, height) {
        switch (arguments.length) {
          case 1:
            domGeom.setMarginBox(this._node, width);
            break;
          case 2:
            domGeom.setMarginBox(this._node, {w:width, h:height});
            break;
        }
        var box = domGeom.getMarginBox(this._node);
        this._widgetBox = box;
        var d = this.surface.getDimensions();
        if (d.width != box.w || d.height != box.h) {
            this.surface.setDimensions(box.w, box.h);
            this._mouseShield.clear();
            this._mouseShield.createRect({x:0, y:0, width:box.w, height:box.h}).setFill([0, 0, 0, 0]);
            return this.invalidateRendering();
        } else {
            return this;
        }
    }, addElement:function (name, element) {
        if (this._elementsIndex[name] && this._elementsIndex[name] != element) {
            this.removeElement(name);
        }
        if (lang.isFunction(element)) {
            var gfxHolder = {};
            lang.mixin(gfxHolder, new _Invalidating());
            gfxHolder._name = name;
            gfxHolder._gfxGroup = this._gfxGroup.createGroup();
            gfxHolder.width = 0;
            gfxHolder.height = 0;
            gfxHolder._isGFX = true;
            gfxHolder.refreshRendering = function () {
                gfxHolder._gfxGroup.clear();
                return element(gfxHolder._gfxGroup, gfxHolder.width, gfxHolder.height);
            };
            this._elements.push(gfxHolder);
            this._elementsIndex[name] = gfxHolder;
        } else {
            element._name = name;
            element._gfxGroup = this._gfxGroup.createGroup();
            element._gauge = this;
            this._elements.push(element);
            this._elementsIndex[name] = element;
            if (element instanceof ScaleBase) {
                this._scales.push(element);
            }
        }
        return this.invalidateRendering();
    }, removeElement:function (name) {
        var element = this._elementsIndex[name];
        if (element) {
            element._gfxGroup.removeShape();
            var idx = this._elements.indexOf(element);
            this._elements.splice(idx, 1);
            if (element instanceof ScaleBase) {
                var idxs = this._scales.indexOf(element);
                this._scales.splice(idxs, 1);
                this._resetMainIndicator();
            }
            delete this._elementsIndex[name];
            delete this._elementsRenderers[name];
        }
        this.invalidateRendering();
        return element;
    }, getElement:function (name) {
        return this._elementsIndex[name];
    }, getElementRenderer:function (name) {
        return this._elementsRenderers[name];
    }, onStartEditing:function (event) {
    }, onEndEditing:function (event) {
    }});
});

