//>>built

define("dojox/gauges/GlossyCircularGaugeBase", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/connect", "dojox/gfx", "./AnalogGauge", "./AnalogCircleIndicator", "./TextIndicator", "./GlossyCircularGaugeNeedle"], function (declare, lang, connect, gfx, AnalogGauge, AnalogCircleIndicator, TextIndicator, GlossyCircularGaugeNeedle) {
    return declare("dojox.gauges.GlossyCircularGaugeBase", [AnalogGauge], {_defaultIndicator:AnalogCircleIndicator, _needle:null, _textIndicator:null, _textIndicatorAdded:false, _range:null, value:0, color:"black", needleColor:"#c4c4c4", textIndicatorFont:"normal normal normal 20pt serif", textIndicatorVisible:true, textIndicatorColor:"#c4c4c4", _majorTicksOffset:130, majorTicksInterval:10, _majorTicksLength:5, majorTicksColor:"#c4c4c4", majorTicksLabelPlacement:"inside", _minorTicksOffset:130, minorTicksInterval:5, _minorTicksLength:3, minorTicksColor:"#c4c4c4", noChange:false, title:"", font:"normal normal normal 10pt serif", scalePrecision:0, textIndicatorPrecision:0, _font:null, constructor:function () {
        this.startAngle = -135;
        this.endAngle = 135;
        this.min = 0;
        this.max = 100;
    }, startup:function () {
        this.inherited(arguments);
        if (this._needle) {
            return;
        }
        var scale = Math.min((this.width / this._designWidth), (this.height / this._designHeight));
        this.cx = scale * this._designCx + (this.width - scale * this._designWidth) / 2;
        this.cy = scale * this._designCy + (this.height - scale * this._designHeight) / 2;
        this._range = {low:this.min ? this.min : 0, high:this.max ? this.max : 100, color:[255, 255, 255, 0]};
        this.addRange(this._range);
        this._majorTicksOffset = this._minorTicksOffset = scale * this._majorTicksOffset;
        this._majorTicksLength = scale * this._majorTicksLength;
        this._minorTicksLength = scale * this._minorTicksLength;
        this.setMajorTicks({fixedPrecision:true, precision:this.scalePrecision, font:this._font, offset:this._majorTicksOffset, interval:this.majorTicksInterval, length:this._majorTicksLength, color:this.majorTicksColor, labelPlacement:this.majorTicksLabelPlacement});
        this.setMinorTicks({offset:this._minorTicksOffset, interval:this.minorTicksInterval, length:this._minorTicksLength, color:this.minorTicksColor});
        this._needle = new GlossyCircularGaugeNeedle({hideValue:true, title:this.title, noChange:this.noChange, color:this.needleColor, value:this.value});
        this.addIndicator(this._needle);
        this._textIndicator = new TextIndicator({x:scale * this._designTextIndicatorX + (this.width - scale * this._designWidth) / 2, y:scale * this._designTextIndicatorY + (this.height - scale * this._designHeight) / 2, fixedPrecision:true, precision:this.textIndicatorPrecision, color:this.textIndicatorColor, value:this.value ? this.value : this.min, align:"middle", font:this._textIndicatorFont});
        if (this.textIndicatorVisible) {
            this.addIndicator(this._textIndicator);
            this._textIndicatorAdded = true;
        }
        connect.connect(this._needle, "valueChanged", lang.hitch(this, function () {
            this.value = this._needle.value;
            this._textIndicator.update(this._needle.value);
            this.onValueChanged();
        }));
    }, onValueChanged:function () {
    }, _setColorAttr:function (color) {
        this.color = color ? color : "black";
        if (this._gaugeBackground && this._gaugeBackground.parent) {
            this._gaugeBackground.parent.remove(this._gaugeBackground);
        }
        if (this._foreground && this._foreground.parent) {
            this._foreground.parent.remove(this._foreground);
        }
        this._gaugeBackground = null;
        this._foreground = null;
        this.draw();
    }, _setNeedleColorAttr:function (color) {
        this.needleColor = color;
        if (this._needle) {
            this.removeIndicator(this._needle);
            this._needle.color = this.needleColor;
            this._needle.shape = null;
            this.addIndicator(this._needle);
        }
    }, _setTextIndicatorColorAttr:function (color) {
        this.textIndicatorColor = color;
        if (this._textIndicator) {
            this._textIndicator.color = this.textIndicatorColor;
            this.draw();
        }
    }, _setTextIndicatorFontAttr:function (font) {
        this.textIndicatorFont = font;
        this._textIndicatorFont = gfx.splitFontString(font);
        if (this._textIndicator) {
            this._textIndicator.font = this._textIndicatorFont;
            this.draw();
        }
    }, setMajorTicksOffset:function (offset) {
        this._majorTicksOffset = offset;
        this._setMajorTicksProperty({"offset":this._majorTicksOffset});
        return this;
    }, getMajorTicksOffset:function () {
        return this._majorTicksOffset;
    }, _setMajorTicksIntervalAttr:function (interval) {
        this.majorTicksInterval = interval;
        this._setMajorTicksProperty({"interval":this.majorTicksInterval});
    }, setMajorTicksLength:function (length) {
        this._majorTicksLength = length;
        this._setMajorTicksProperty({"length":this._majorTicksLength});
        return this;
    }, getMajorTicksLength:function () {
        return this._majorTicksLength;
    }, _setMajorTicksColorAttr:function (color) {
        this.majorTicksColor = color;
        this._setMajorTicksProperty({"color":this.majorTicksColor});
    }, _setMajorTicksLabelPlacementAttr:function (placement) {
        this.majorTicksLabelPlacement = placement;
        this._setMajorTicksProperty({"labelPlacement":this.majorTicksLabelPlacement});
    }, _setMajorTicksProperty:function (prop) {
        if (this.majorTicks) {
            lang.mixin(this.majorTicks, prop);
            this.setMajorTicks(this.majorTicks);
        }
    }, setMinorTicksOffset:function (offset) {
        this._minorTicksOffset = offset;
        this._setMinorTicksProperty({"offset":this._minorTicksOffset});
        return this;
    }, getMinorTicksOffset:function () {
        return this._minorTicksOffset;
    }, _setMinorTicksIntervalAttr:function (interval) {
        this.minorTicksInterval = interval;
        this._setMinorTicksProperty({"interval":this.minorTicksInterval});
    }, setMinorTicksLength:function (length) {
        this._minorTicksLength = length;
        this._setMinorTicksProperty({"length":this._minorTicksLength});
        return this;
    }, getMinorTicksLength:function () {
        return this._minorTicksLength;
    }, _setMinorTicksColorAttr:function (color) {
        this.minorTicksColor = color;
        this._setMinorTicksProperty({"color":this.minorTicksColor});
    }, _setMinorTicksProperty:function (prop) {
        if (this.minorTicks) {
            lang.mixin(this.minorTicks, prop);
            this.setMinorTicks(this.minorTicks);
        }
    }, _setMinAttr:function (min) {
        this.min = min;
        if (this.majorTicks != null) {
            this.setMajorTicks(this.majorTicks);
        }
        if (this.minorTicks != null) {
            this.setMinorTicks(this.minorTicks);
        }
        this.draw();
        this._updateNeedle();
    }, _setMaxAttr:function (max) {
        this.max = max;
        if (this.majorTicks != null) {
            this.setMajorTicks(this.majorTicks);
        }
        if (this.minorTicks != null) {
            this.setMinorTicks(this.minorTicks);
        }
        this.draw();
        this._updateNeedle();
    }, _setScalePrecisionAttr:function (value) {
        this.scalePrecision = value;
        this._setMajorTicksProperty({"precision":value});
    }, _setTextIndicatorPrecisionAttr:function (value) {
        this.textIndicatorPrecision = value;
        this._setMajorTicksProperty({"precision":value});
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
    }, _setNoChangeAttr:function (value) {
        this.noChange = value;
        if (this._needle) {
            this._needle.noChange = this.noChange;
        }
    }, _setTextIndicatorVisibleAttr:function (value) {
        this.textIndicatorVisible = value;
        if (this._textIndicator && this._needle) {
            if (this.textIndicatorVisible && !this._textIndicatorAdded) {
                this.addIndicator(this._textIndicator);
                this._textIndicatorAdded = true;
                this.moveIndicatorToFront(this._needle);
            } else {
                if (!this.textIndicatorVisible && this._textIndicatorAdded) {
                    this.removeIndicator(this._textIndicator);
                    this._textIndicatorAdded = false;
                }
            }
        }
    }, _setTitleAttr:function (value) {
        this.title = value;
        if (this._needle) {
            this._needle.title = this.title;
        }
    }, _setOrientationAttr:function (orientation) {
        this.orientation = orientation;
        if (this.majorTicks != null) {
            this.setMajorTicks(this.majorTicks);
        }
        if (this.minorTicks != null) {
            this.setMinorTicks(this.minorTicks);
        }
        this.draw();
        this._updateNeedle();
    }, _updateNeedle:function () {
        this.value = Math.max(this.min, this.value);
        this.value = Math.min(this.max, this.value);
        if (this._needle) {
            var noChange = this._needle.noChange;
            this._needle.noChange = false;
            this._needle.update(this.value, false);
            this._needle.noChange = noChange;
        }
    }, _setFontAttr:function (font) {
        this.font = font;
        this._font = gfx.splitFontString(font);
        this._setMajorTicksProperty({"font":this._font});
    }});
});

