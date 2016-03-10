//>>built

define("dojox/form/_RangeSliderMixin", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/fx", "dojo/_base/event", "dojo/_base/sniff", "dojo/dom-style", "dojo/dom-geometry", "dojo/keys", "dijit", "dojo/dnd/Mover", "dojo/dnd/Moveable", "dijit/form/_FormValueWidget", "dijit/focus", "dojo/fx", "dojox/fx"], function (declare, lang, array, fx, event, has, domStyle, domGeometry, keys, dijit, Mover, Moveable, FormValueWidget, FocusManager, fxUtils) {
    var sortReversed = function (a, b) {
        return b - a;
    }, sortForward = function (a, b) {
        return a - b;
    };
    var RangeSliderMixin = declare("dojox.form._RangeSliderMixin", null, {_setTabIndexAttr:["sliderHandle", "sliderHandleMax"], value:[0, 100], postMixInProperties:function () {
        this.inherited(arguments);
        this.value = array.map(this.value, function (i) {
            return parseInt(i, 10);
        });
    }, postCreate:function () {
        this.inherited(arguments);
        this.value.sort(this._isReversed() ? sortReversed : sortForward);
        var _self = this;
        var mover = declare(SliderMoverMax, {constructor:function () {
            this.widget = _self;
        }});
        this._movableMax = new Moveable(this.sliderHandleMax, {mover:mover});
        this.sliderHandle.setAttribute("aria-valuemin", this.minimum);
        this.sliderHandle.setAttribute("aria-valuemax", this.maximum);
        this.sliderHandleMax.setAttribute("aria-valuemin", this.minimum);
        this.sliderHandleMax.setAttribute("aria-valuemax", this.maximum);
        var barMover = declare(SliderBarMover, {constructor:function () {
            this.widget = _self;
        }});
        this._movableBar = new Moveable(this.progressBar, {mover:barMover});
        this.focusNode.removeAttribute("aria-valuemin");
        this.focusNode.removeAttribute("aria-valuemax");
        this.focusNode.removeAttribute("aria-valuenow");
    }, destroy:function () {
        this.inherited(arguments);
        this._movableMax.destroy();
        this._movableBar.destroy();
    }, _onKeyPress:function (e) {
        if (this.disabled || this.readOnly || e.altKey || e.ctrlKey) {
            return;
        }
        var useMaxValue = e.target === this.sliderHandleMax;
        var barFocus = e.target === this.progressBar;
        var k = lang.delegate(keys, this.isLeftToRight() ? {PREV_ARROW:keys.LEFT_ARROW, NEXT_ARROW:keys.RIGHT_ARROW} : {PREV_ARROW:keys.RIGHT_ARROW, NEXT_ARROW:keys.LEFT_ARROW});
        var delta = 0;
        var down = false;
        switch (e.keyCode) {
          case k.HOME:
            this._setValueAttr(this.minimum, true, useMaxValue);
            event.stop(e);
            return;
          case k.END:
            this._setValueAttr(this.maximum, true, useMaxValue);
            event.stop(e);
            return;
          case k.PREV_ARROW:
          case k.DOWN_ARROW:
            down = true;
          case k.NEXT_ARROW:
          case k.UP_ARROW:
            delta = 1;
            break;
          case k.PAGE_DOWN:
            down = true;
          case k.PAGE_UP:
            delta = this.pageIncrement;
            break;
          default:
            this.inherited(arguments);
            return;
        }
        if (down) {
            delta = -delta;
        }
        if (delta) {
            if (barFocus) {
                this._bumpValue([{change:delta, useMaxValue:false}, {change:delta, useMaxValue:true}]);
            } else {
                this._bumpValue(delta, useMaxValue);
            }
            event.stop(e);
        }
    }, _onHandleClickMax:function (e) {
        if (this.disabled || this.readOnly) {
            return;
        }
        if (!has("ie")) {
            FocusManager.focus(this.sliderHandleMax);
        }
        event.stop(e);
    }, _onClkIncBumper:function () {
        this._setValueAttr(this._descending === false ? this.minimum : this.maximum, true, true);
    }, _bumpValue:function (signedChange, useMaxValue) {
        var value = lang.isArray(signedChange) ? [this._getBumpValue(signedChange[0].change, signedChange[0].useMaxValue), this._getBumpValue(signedChange[1].change, signedChange[1].useMaxValue)] : this._getBumpValue(signedChange, useMaxValue);
        this._setValueAttr(value, true, useMaxValue);
    }, _getBumpValue:function (signedChange, useMaxValue) {
        var idx = useMaxValue ? 1 : 0;
        if (this._isReversed()) {
            idx = 1 - idx;
        }
        var s = domStyle.getComputedStyle(this.sliderBarContainer), c = domGeometry.getContentBox(this.sliderBarContainer, s), count = this.discreteValues, myValue = this.value[idx];
        if (count <= 1 || count == Infinity) {
            count = c[this._pixelCount];
        }
        count--;
        var value = this.maximum > this.minimum ? ((myValue - this.minimum) * count / (this.maximum - this.minimum) + signedChange) : 0;
        if (value < 0) {
            value = 0;
        }
        if (value > count) {
            value = count;
        }
        return value * (this.maximum - this.minimum) / count + this.minimum;
    }, _onBarClick:function (e) {
        if (this.disabled || this.readOnly) {
            return;
        }
        if (!has("ie")) {
            FocusManager.focus(this.progressBar);
        }
        event.stop(e);
    }, _onRemainingBarClick:function (e) {
        if (this.disabled || this.readOnly) {
            return;
        }
        if (!has("ie")) {
            FocusManager.focus(this.progressBar);
        }
        var abspos = domGeometry.position(this.sliderBarContainer, true), bar = domGeometry.position(this.progressBar, true), mousePos = e[this._mousePixelCoord], leftPos = bar[this._startingPixelCoord], rightPos = leftPos + bar[this._pixelCount], isMaxVal = this._isReversed() ? mousePos <= leftPos : mousePos >= rightPos, p = this._isReversed() ? (abspos[this._pixelCount] - mousePos + abspos[this._startingPixelCoord]) : (mousePos - abspos[this._startingPixelCoord]);
        this._setPixelValue(p, abspos[this._pixelCount], true, isMaxVal);
        event.stop(e);
    }, _setPixelValue:function (pixelValue, maxPixels, priorityChange, isMaxVal) {
        if (this.disabled || this.readOnly) {
            return;
        }
        var myValue = this._getValueByPixelValue(pixelValue, maxPixels);
        this._setValueAttr(myValue, priorityChange, isMaxVal);
    }, _getValueByPixelValue:function (pixelValue, maxPixels) {
        pixelValue = pixelValue < 0 ? 0 : maxPixels < pixelValue ? maxPixels : pixelValue;
        var count = this.discreteValues;
        if (count <= 1 || count == Infinity) {
            count = maxPixels;
        }
        count--;
        var pixelsPerValue = maxPixels / count;
        var wholeIncrements = Math.round(pixelValue / pixelsPerValue);
        return (this.maximum - this.minimum) * wholeIncrements / count + this.minimum;
    }, _setValueAttr:function (value, priorityChange, isMaxVal) {
        var actValue = this.value;
        if (!lang.isArray(value)) {
            if (isMaxVal) {
                if (this._isReversed()) {
                    actValue[0] = value;
                } else {
                    actValue[1] = value;
                }
            } else {
                if (this._isReversed()) {
                    actValue[1] = value;
                } else {
                    actValue[0] = value;
                }
            }
        } else {
            actValue = value;
        }
        this._lastValueReported = "";
        this.valueNode.value = this.value = value = actValue;
        this.value.sort(this._isReversed() ? sortReversed : sortForward);
        this.sliderHandle.setAttribute("aria-valuenow", actValue[0]);
        this.sliderHandleMax.setAttribute("aria-valuenow", actValue[1]);
        FormValueWidget.prototype._setValueAttr.apply(this, arguments);
        this._printSliderBar(priorityChange, isMaxVal);
    }, _printSliderBar:function (priorityChange, isMaxVal) {
        var percentMin = this.maximum > this.minimum ? ((this.value[0] - this.minimum) / (this.maximum - this.minimum)) : 0;
        var percentMax = this.maximum > this.minimum ? ((this.value[1] - this.minimum) / (this.maximum - this.minimum)) : 0;
        var percentMinSave = percentMin;
        if (percentMin > percentMax) {
            percentMin = percentMax;
            percentMax = percentMinSave;
        }
        var sliderHandleVal = this._isReversed() ? ((1 - percentMin) * 100) : (percentMin * 100);
        var sliderHandleMaxVal = this._isReversed() ? ((1 - percentMax) * 100) : (percentMax * 100);
        var progressBarVal = this._isReversed() ? ((1 - percentMax) * 100) : (percentMin * 100);
        if (priorityChange && this.slideDuration > 0 && this.progressBar.style[this._progressPixelSize]) {
            var percent = isMaxVal ? percentMax : percentMin;
            var _this = this;
            var props = {};
            var start = parseFloat(this.progressBar.style[this._handleOffsetCoord]);
            var duration = this.slideDuration / 10;
            if (duration === 0) {
                return;
            }
            if (duration < 0) {
                duration = 0 - duration;
            }
            var propsHandle = {};
            var propsHandleMax = {};
            var propsBar = {};
            propsHandle[this._handleOffsetCoord] = {start:this.sliderHandle.parentNode.style[this._handleOffsetCoord], end:sliderHandleVal, units:"%"};
            propsHandleMax[this._handleOffsetCoord] = {start:this.sliderHandleMax.parentNode.style[this._handleOffsetCoord], end:sliderHandleMaxVal, units:"%"};
            propsBar[this._handleOffsetCoord] = {start:this.progressBar.style[this._handleOffsetCoord], end:progressBarVal, units:"%"};
            propsBar[this._progressPixelSize] = {start:this.progressBar.style[this._progressPixelSize], end:(percentMax - percentMin) * 100, units:"%"};
            var animHandle = fx.animateProperty({node:this.sliderHandle.parentNode, duration:duration, properties:propsHandle});
            var animHandleMax = fx.animateProperty({node:this.sliderHandleMax.parentNode, duration:duration, properties:propsHandleMax});
            var animBar = fx.animateProperty({node:this.progressBar, duration:duration, properties:propsBar});
            var animCombine = fxUtils.combine([animHandle, animHandleMax, animBar]);
            animCombine.play();
        } else {
            this.sliderHandle.parentNode.style[this._handleOffsetCoord] = sliderHandleVal + "%";
            this.sliderHandleMax.parentNode.style[this._handleOffsetCoord] = sliderHandleMaxVal + "%";
            this.progressBar.style[this._handleOffsetCoord] = progressBarVal + "%";
            this.progressBar.style[this._progressPixelSize] = ((percentMax - percentMin) * 100) + "%";
        }
    }});
    var SliderMoverMax = declare("dijit.form._SliderMoverMax", Mover, {onMouseMove:function (e) {
        var widget = this.widget;
        var abspos = widget._abspos;
        if (!abspos) {
            abspos = widget._abspos = domGeometry.position(widget.sliderBarContainer, true);
            widget._setPixelValue_ = lang.hitch(widget, "_setPixelValue");
            widget._isReversed_ = widget._isReversed();
        }
        var pixelValue = e[widget._mousePixelCoord] - abspos[widget._startingPixelCoord];
        widget._setPixelValue_(widget._isReversed_ ? (abspos[widget._pixelCount] - pixelValue) : pixelValue, abspos[widget._pixelCount], false, true);
    }, destroy:function (e) {
        Mover.prototype.destroy.apply(this, arguments);
        var widget = this.widget;
        widget._abspos = null;
        widget._setValueAttr(widget.value, true);
    }});
    var SliderBarMover = declare("dijit.form._SliderBarMover", Mover, {onMouseMove:function (e) {
        var widget = this.widget;
        if (widget.disabled || widget.readOnly) {
            return;
        }
        var abspos = widget._abspos;
        var bar = widget._bar;
        var mouseOffset = widget._mouseOffset;
        if (!abspos) {
            abspos = widget._abspos = domGeometry.position(widget.sliderBarContainer, true);
            widget._setPixelValue_ = lang.hitch(widget, "_setPixelValue");
            widget._getValueByPixelValue_ = lang.hitch(widget, "_getValueByPixelValue");
            widget._isReversed_ = widget._isReversed();
        }
        if (!bar) {
            bar = widget._bar = domGeometry.position(widget.progressBar, true);
        }
        if (!mouseOffset) {
            mouseOffset = widget._mouseOffset = e[widget._mousePixelCoord] - bar[widget._startingPixelCoord];
        }
        var pixelValueMin = e[widget._mousePixelCoord] - abspos[widget._startingPixelCoord] - mouseOffset, pixelValueMax = pixelValueMin + bar[widget._pixelCount];
        pixelValues = [pixelValueMin, pixelValueMax];
        pixelValues.sort(sortForward);
        if (pixelValues[0] <= 0) {
            pixelValues[0] = 0;
            pixelValues[1] = bar[widget._pixelCount];
        }
        if (pixelValues[1] >= abspos[widget._pixelCount]) {
            pixelValues[1] = abspos[widget._pixelCount];
            pixelValues[0] = abspos[widget._pixelCount] - bar[widget._pixelCount];
        }
        var myValues = [widget._getValueByPixelValue(widget._isReversed_ ? (abspos[widget._pixelCount] - pixelValues[0]) : pixelValues[0], abspos[widget._pixelCount]), widget._getValueByPixelValue(widget._isReversed_ ? (abspos[widget._pixelCount] - pixelValues[1]) : pixelValues[1], abspos[widget._pixelCount])];
        widget._setValueAttr(myValues, false, false);
    }, destroy:function () {
        Mover.prototype.destroy.apply(this, arguments);
        var widget = this.widget;
        widget._abspos = null;
        widget._bar = null;
        widget._mouseOffset = null;
        widget._setValueAttr(widget.value, true);
    }});
    return RangeSliderMixin;
});

