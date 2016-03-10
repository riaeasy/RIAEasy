//>>built

define("dojox/gauges/GlossyHorizontalGauge", ["dojo/_base/declare", "dojo/_base/connect", "dojo/_base/lang", "dojo/_base/Color", "dojox/gfx", "./BarGauge", "./BarCircleIndicator", "./GlossyHorizontalGaugeMarker"], function (declare, connect, lang, Color, gfx, BarGauge, BarCircleIndicator, GlossyHorizontalGaugeMarker) {
    return declare("dojox.gauges.GlossyHorizontalGauge", [BarGauge], {_defaultIndicator:BarCircleIndicator, color:"black", markerColor:"black", majorTicksInterval:10, _majorTicksLength:10, majorTicksColor:"#c4c4c4", minorTicksInterval:5, _minorTicksLength:6, minorTicksColor:"#c4c4c4", value:0, noChange:false, title:"", font:"normal normal normal 10pt serif", scalePrecision:0, _font:null, _margin:2, _minBorderWidth:2, _maxBorderWidth:6, _tickLabelOffset:5, _designHeight:100, constructor:function () {
        this.min = 0;
        this.max = 100;
    }, startup:function () {
        this.inherited(arguments);
        if (this._gaugeStarted) {
            return;
        }
        this._gaugeStarted = true;
        var scale = this.height / this._designHeight;
        this._minorTicksLength = this._minorTicksLength * scale;
        this._majorTicksLength = this._majorTicksLength * scale;
        var font = this._font;
        this._computeDataRectangle();
        var th = gfx.normalizedLength(font.size);
        var scaleHeight = th + this._tickLabelOffset + Math.max(this._majorTicksLength, this._minorTicksLength);
        var yOffset = Math.max(0, (this.height - scaleHeight) / 2);
        this.addRange({low:this.min ? this.min : 0, high:this.max ? this.max : 100, color:[0, 0, 0, 0]});
        this.setMajorTicks({fixedPrecision:true, precision:this.scalePrecision, font:font, labelPlacement:"inside", offset:yOffset - this._majorTicksLength / 2, interval:this.majorTicksInterval, length:this._majorTicksLength, color:this.majorTicksColor});
        this.setMinorTicks({labelPlacement:"inside", offset:yOffset - this._minorTicksLength / 2, interval:this.minorTicksInterval, length:this._minorTicksLength, color:this.minorTicksColor});
        this._needle = new GlossyHorizontalGaugeMarker({hideValue:true, title:this.title, noChange:this.noChange, offset:yOffset, color:this.markerColor, value:this.value});
        this.addIndicator(this._needle);
        connect.connect(this._needle, "valueChanged", lang.hitch(this, function () {
            this.value = this._needle.value;
            this.onValueChanged();
        }));
    }, _layoutGauge:function () {
        if (!this._gaugeStarted) {
            return;
        }
        var font = this._font;
        this._computeDataRectangle();
        var th = gfx.normalizedLength(font.size);
        var scaleHeight = th + this._tickLabelOffset + Math.max(this._majorTicksLength, this._minorTicksLength);
        var yOffset = Math.max(0, (this.height - scaleHeight) / 2);
        this._setMajorTicksProperty({fixedPrecision:true, precision:this.scalePrecision, font:font, offset:yOffset - this._majorTicksLength / 2, interval:this.majorTicksInterval, length:this._majorTicksLength});
        this._setMinorTicksProperty({offset:yOffset - this._minorTicksLength / 2, interval:this.minorTicksInterval, length:this._minorTicksLength});
        this.removeIndicator(this._needle);
        this._needle.offset = yOffset;
        this.addIndicator(this._needle);
    }, _formatNumber:function (val) {
        var NumberUtils = this._getNumberModule();
        if (NumberUtils) {
            return NumberUtils.format(val, {places:this.scalePrecision});
        } else {
            return val.toFixed(this.scalePrecision);
        }
    }, _computeDataRectangle:function () {
        if (!this._gaugeStarted) {
            return;
        }
        var font = this._font;
        var leftTextMargin = this._getTextWidth(this._formatNumber(this.min), font) / 2;
        var rightTextMargin = this._getTextWidth(this._formatNumber(this.max), font) / 2;
        var textMargin = Math.max(leftTextMargin, rightTextMargin);
        var margin = this._getBorderWidth() + Math.max(this._majorTicksLength, this._majorTicksLength) / 2 + textMargin;
        this.dataHeight = this.height;
        this.dataY = 0;
        this.dataX = margin + this._margin;
        this.dataWidth = Math.max(0, this.width - 2 * this.dataX);
    }, _getTextWidth:function (s, font) {
        return gfx._base._getTextBox(s, {font:gfx.makeFontString(gfx.makeParameters(gfx.defaultFont, font))}).w || 0;
    }, _getBorderWidth:function () {
        return Math.max(this._minBorderWidth, Math.min(this._maxBorderWidth, this._maxBorderWidth * this.height / this._designHeight));
    }, drawBackground:function (group) {
        if (this._gaugeBackground) {
            return;
        }
        var lighterColor = Color.blendColors(new Color(this.color), new Color("white"), 0.4);
        this._gaugeBackground = group.createGroup();
        var borderWidth = this._getBorderWidth();
        var margin = this._margin;
        var w = this.width;
        var h = this.height;
        var radius = Math.min(h / 4, 23);
        this._gaugeBackground.createRect({x:margin, y:margin, width:Math.max(0, w - 2 * margin), height:Math.max(0, h - 2 * margin), r:radius}).setFill(this.color);
        var left = margin + borderWidth;
        var right = w - borderWidth - margin;
        var top = margin + borderWidth;
        var w2 = w - 2 * borderWidth - 2 * margin;
        var h2 = h - 2 * borderWidth - 2 * margin;
        if (w2 <= 0 || h2 <= 0) {
            return;
        }
        radius = Math.min(radius, w2 / 2);
        radius = Math.min(radius, h2 / 2);
        this._gaugeBackground.createRect({x:left, y:top, width:w2, height:h2, r:radius}).setFill({type:"linear", x1:left, y1:0, x2:left, y2:h - borderWidth - margin, colors:[{offset:0, color:lighterColor}, {offset:0.2, color:this.color}, {offset:0.8, color:this.color}, {offset:1, color:lighterColor}]});
        var f = 4 * (Math.sqrt(2) - 1) / 3 * radius;
        this._gaugeBackground.createPath({path:"M" + left + " " + (top + radius) + "C" + left + " " + (top + radius - f) + " " + (left + radius - f) + " " + top + " " + (left + radius) + " " + top + "L" + (right - radius) + " " + top + "C" + (right - radius + f) + " " + top + " " + right + " " + (top + radius - f) + " " + right + " " + (top + radius) + "L" + right + " " + (top + h / 2) + "L" + left + " " + (top + h / 3) + "Z"}).setFill({type:"linear", x1:left, y1:top, x2:left, y2:top + this.height / 2, colors:[{offset:0, color:lighterColor}, {offset:1, color:Color.blendColors(new Color(this.color), new Color("white"), 0.2)}]});
    }, onValueChanged:function () {
    }, _setColorAttr:function (color) {
        this.color = color ? color : "black";
        if (this._gaugeBackground && this._gaugeBackground.parent) {
            this._gaugeBackground.parent.remove(this._gaugeBackground);
        }
        this._gaugeBackground = null;
        this.draw();
    }, _setMarkerColorAttr:function (color) {
        this.markerColor = color;
        if (this._needle) {
            this.removeIndicator(this._needle);
            this._needle.color = color;
            this._needle.shape = null;
            this.addIndicator(this._needle);
        }
    }, _setMajorTicksIntervalAttr:function (interval) {
        this.majorTicksInterval = interval;
        this._setMajorTicksProperty({"interval":this.majorTicksInterval});
    }, setMajorTicksLength:function (length) {
        this._majorTicksLength = length;
        this._layoutGauge();
        return this;
    }, getMajorTicksLength:function () {
        return this._majorTicksLength;
    }, _setMajorTicksColorAttr:function (color) {
        this.majorTicksColor = color;
        this._setMajorTicksProperty({"color":this.majorTicksColor});
    }, _setMajorTicksProperty:function (prop) {
        if (this.majorTicks == null) {
            return;
        }
        lang.mixin(this.majorTicks, prop);
        this.setMajorTicks(this.majorTicks);
    }, _setMinorTicksIntervalAttr:function (interval) {
        this.minorTicksInterval = interval;
        this._setMinorTicksProperty({"interval":this.minorTicksInterval});
    }, setMinorTicksLength:function (length) {
        this._minorTicksLength = length;
        this._layoutGauge();
        return this;
    }, getMinorTicksLength:function () {
        return this._minorTicksLength;
    }, _setMinorTicksColorAttr:function (color) {
        this.minorTicksColor = color;
        this._setMinorTicksProperty({"color":this.minorTicksColor});
    }, _setMinorTicksProperty:function (prop) {
        if (this.minorTicks == null) {
            return;
        }
        lang.mixin(this.minorTicks, prop);
        this.setMinorTicks(this.minorTicks);
    }, _setMinAttr:function (min) {
        this.min = min;
        this._computeDataRectangle();
        if (this.majorTicks != null) {
            this.setMajorTicks(this.majorTicks);
        }
        if (this.minorTicks != null) {
            this.setMinorTicks(this.minorTicks);
        }
        this.draw();
    }, _setMaxAttr:function (max) {
        this.max = max;
        this._computeDataRectangle();
        if (this.majorTicks != null) {
            this.setMajorTicks(this.majorTicks);
        }
        if (this.minorTicks != null) {
            this.setMinorTicks(this.minorTicks);
        }
        this.draw();
    }, _setValueAttr:function (value) {
        value = Math.min(this.max, value);
        value = Math.max(this.min, value);
        this.value = value;
        if (this._needle) {
            var noChange = this._needle.noChange;
            this._needle.noChange = false;
            this._needle.update(value);
            this._needle.noChange = noChange;
        }
    }, _setScalePrecisionAttr:function (value) {
        this.scalePrecision = value;
        this._layoutGauge();
    }, _setNoChangeAttr:function (value) {
        this.noChange = value;
        if (this._needle) {
            this._needle.noChange = this.noChange;
        }
    }, _setTitleAttr:function (value) {
        this.title = value;
        if (this._needle) {
            this._needle.title = this.title;
        }
    }, _setFontAttr:function (font) {
        this.font = font;
        this._font = gfx.splitFontString(font);
        this._layoutGauge();
    }});
});

