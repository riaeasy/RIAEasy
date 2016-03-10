//>>built

define("dojox/dgauges/ScaleBase", ["dojo/_base/lang", "dojo/_base/declare", "dojox/gfx", "dojo/_base/array", "dojox/widget/_Invalidating", "dojo/_base/sniff"], function (lang, declare, gfx, array, _Invalidating, has) {
    return declare("dojox.dgauges.ScaleBase", _Invalidating, {scaler:null, font:null, labelPosition:null, labelGap:1, tickStroke:null, _gauge:null, _gfxGroup:null, _bgGroup:null, _fgGroup:null, _indicators:null, _indicatorsIndex:null, _indicatorsRenderers:null, constructor:function () {
        this._indicators = [];
        this._indicatorsIndex = {};
        this._indicatorsRenderers = {};
        this._gauge = null;
        this._gfxGroup = null;
        this.tickStroke = {color:"black", width:has("ie") <= 8 ? 1 : 0.5};
        this.addInvalidatingProperties(["scaler", "font", "labelGap", "labelPosition", "tickShapeFunc", "tickLabelFunc", "tickStroke"]);
        this.watch("scaler", lang.hitch(this, this._watchScaler));
    }, postscript:function (mixin) {
        this.inherited(arguments);
        if (mixin && mixin.scaler) {
            this._watchScaler("scaler", null, mixin.scaler);
        }
    }, _watchers:null, _watchScaler:function (name, oldValue, newValue) {
        array.forEach(this._watchers, lang.hitch(this, function (entry) {
            entry.unwatch();
        }));
        var props = newValue.watchedProperties;
        this._watchers = [];
        array.forEach(props, lang.hitch(this, function (entry) {
            this._watchers.push(newValue.watch(entry, lang.hitch(this, this.invalidateRendering)));
        }));
    }, _getFont:function () {
        var font = this.font;
        if (!font) {
            font = this._gauge.font;
        }
        if (!font) {
            font = gfx.defaultFont;
        }
        return font;
    }, positionForValue:function (value) {
        return 0;
    }, valueForPosition:function (position) {
    }, tickLabelFunc:function (tickItem) {
        if (tickItem.isMinor) {
            return null;
        } else {
            return String(tickItem.value);
        }
    }, tickShapeFunc:function (group, scale, tickItem) {
        return group.createLine({x1:0, y1:0, x2:tickItem.isMinor ? 6 : 10, y2:0}).setStroke(this.tickStroke);
    }, getIndicatorRenderer:function (name) {
        return this._indicatorsRenderers[name];
    }, removeIndicator:function (name) {
        var indicator = this._indicatorsIndex[name];
        if (indicator) {
            indicator._gfxGroup.removeShape();
            var idx = this._indicators.indexOf(indicator);
            this._indicators.splice(idx, 1);
            indicator._disconnectListeners();
            delete this._indicatorsIndex[name];
            delete this._indicatorsRenderers[name];
        }
        if (this._gauge) {
            this._gauge._resetMainIndicator();
        }
        this.invalidateRendering();
        return indicator;
    }, getIndicator:function (name) {
        return this._indicatorsIndex[name];
    }, addIndicator:function (name, indicator, behindScale) {
        if (this._indicatorsIndex[name] && this._indicatorsIndex[name] != indicator) {
            this.removeIndicator(name);
        }
        this._indicators.push(indicator);
        this._indicatorsIndex[name] = indicator;
        if (!this._ticksGroup) {
            this._createSubGroups();
        }
        var group = behindScale ? this._bgGroup : this._fgGroup;
        indicator._gfxGroup = group.createGroup();
        indicator.scale = this;
        return this.invalidateRendering();
    }, _createSubGroups:function () {
        if (!this._gfxGroup || this._ticksGroup) {
            return;
        }
        this._bgGroup = this._gfxGroup.createGroup();
        this._ticksGroup = this._gfxGroup.createGroup();
        this._fgGroup = this._gfxGroup.createGroup();
    }, refreshRendering:function () {
        if (!this._ticksGroup) {
            this._createSubGroups();
        }
    }});
});

