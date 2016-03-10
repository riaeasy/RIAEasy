//>>built

require({cache:{"url:dijit/form/templates/HorizontalSlider.html":"<table class=\"dijit dijitReset dijitSlider dijitSliderH\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" rules=\"none\" data-dojo-attach-event=\"onkeydown:_onKeyDown, onkeyup:_onKeyUp\"\n\trole=\"presentation\"\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\n\t\t><td data-dojo-attach-point=\"topDecoration\" class=\"dijitReset dijitSliderDecoration dijitSliderDecorationT dijitSliderDecorationH\"></td\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerH\"\n\t\t\t><div class=\"dijitSliderDecrementIconH\" style=\"display:none\" data-dojo-attach-point=\"decrementButton\"><span class=\"dijitSliderButtonInner\">-</span></div\n\t\t></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperH dijitSliderLeftBumper\" data-dojo-attach-event=\"press:_onClkDecBumper\"></div\n\t\t></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><input data-dojo-attach-point=\"valueNode\" type=\"hidden\" ${!nameAttrSetting}\n\t\t\t/><div class=\"dijitReset dijitSliderBarContainerH\" role=\"presentation\" data-dojo-attach-point=\"sliderBarContainer\"\n\t\t\t\t><div role=\"presentation\" data-dojo-attach-point=\"progressBar\" class=\"dijitSliderBar dijitSliderBarH dijitSliderProgressBar dijitSliderProgressBarH\" data-dojo-attach-event=\"press:_onBarClick\"\n\t\t\t\t\t><div class=\"dijitSliderMoveable dijitSliderMoveableH\"\n\t\t\t\t\t\t><div data-dojo-attach-point=\"sliderHandle,focusNode\" class=\"dijitSliderImageHandle dijitSliderImageHandleH\" data-dojo-attach-event=\"press:_onHandleClick\" role=\"slider\"></div\n\t\t\t\t\t></div\n\t\t\t\t></div\n\t\t\t\t><div role=\"presentation\" data-dojo-attach-point=\"remainingBar\" class=\"dijitSliderBar dijitSliderBarH dijitSliderRemainingBar dijitSliderRemainingBarH\" data-dojo-attach-event=\"press:_onBarClick\"></div\n\t\t\t></div\n\t\t></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperH dijitSliderRightBumper\" data-dojo-attach-event=\"press:_onClkIncBumper\"></div\n\t\t></td\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerH\"\n\t\t\t><div class=\"dijitSliderIncrementIconH\" style=\"display:none\" data-dojo-attach-point=\"incrementButton\"><span class=\"dijitSliderButtonInner\">+</span></div\n\t\t></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\n\t\t><td data-dojo-attach-point=\"containerNode,bottomDecoration\" class=\"dijitReset dijitSliderDecoration dijitSliderDecorationB dijitSliderDecorationH\"></td\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\n\t></tr\n></table>\n"}});
define("dijit/form/HorizontalSlider", ["dojo/_base/array", "dojo/_base/declare", "dojo/dnd/move", "dojo/_base/fx", "dojo/dom-geometry", "dojo/dom-style", "dojo/keys", "dojo/_base/lang", "dojo/sniff", "dojo/dnd/Moveable", "dojo/dnd/Mover", "dojo/query", "dojo/mouse", "dojo/on", "../_base/manager", "../focus", "../typematic", "./Button", "./_FormValueWidget", "../_Container", "dojo/text!./templates/HorizontalSlider.html"], function (array, declare, move, fx, domGeometry, domStyle, keys, lang, has, Moveable, Mover, query, mouse, on, manager, focus, typematic, Button, _FormValueWidget, _Container, template) {
    var _SliderMover = declare("dijit.form._SliderMover", Mover, {onMouseMove:function (e) {
        var widget = this.widget;
        var abspos = widget._abspos;
        if (!abspos) {
            abspos = widget._abspos = domGeometry.position(widget.sliderBarContainer, true);
            widget._setPixelValue_ = lang.hitch(widget, "_setPixelValue");
            widget._isReversed_ = widget._isReversed();
        }
        var pixelValue = e[widget._mousePixelCoord] - abspos[widget._startingPixelCoord];
        widget._setPixelValue_(widget._isReversed_ ? (abspos[widget._pixelCount] - pixelValue) : pixelValue, abspos[widget._pixelCount], false);
    }, destroy:function (e) {
        Mover.prototype.destroy.apply(this, arguments);
        var widget = this.widget;
        widget._abspos = null;
        widget._setValueAttr(widget.value, true);
    }});
    var HorizontalSlider = declare("dijit.form.HorizontalSlider", [_FormValueWidget, _Container], {templateString:template, value:0, showButtons:true, minimum:0, maximum:100, discreteValues:Infinity, pageIncrement:2, clickSelect:true, slideDuration:manager.defaultDuration, _setIdAttr:"", _setNameAttr:"valueNode", baseClass:"dijitSlider", cssStateNodes:{incrementButton:"dijitSliderIncrementButton", decrementButton:"dijitSliderDecrementButton", focusNode:"dijitSliderThumb"}, _mousePixelCoord:"pageX", _pixelCount:"w", _startingPixelCoord:"x", _handleOffsetCoord:"left", _progressPixelSize:"width", _onKeyUp:function (e) {
        if (this.disabled || this.readOnly || e.altKey || e.ctrlKey || e.metaKey) {
            return;
        }
        this._setValueAttr(this.value, true);
    }, _onKeyDown:function (e) {
        if (this.disabled || this.readOnly || e.altKey || e.ctrlKey || e.metaKey) {
            return;
        }
        switch (e.keyCode) {
          case keys.HOME:
            this._setValueAttr(this.minimum, false);
            break;
          case keys.END:
            this._setValueAttr(this.maximum, false);
            break;
          case ((this._descending || this.isLeftToRight()) ? keys.RIGHT_ARROW : keys.LEFT_ARROW):
          case (this._descending === false ? keys.DOWN_ARROW : keys.UP_ARROW):
          case (this._descending === false ? keys.PAGE_DOWN : keys.PAGE_UP):
            this.increment(e);
            break;
          case ((this._descending || this.isLeftToRight()) ? keys.LEFT_ARROW : keys.RIGHT_ARROW):
          case (this._descending === false ? keys.UP_ARROW : keys.DOWN_ARROW):
          case (this._descending === false ? keys.PAGE_UP : keys.PAGE_DOWN):
            this.decrement(e);
            break;
          default:
            return;
        }
        e.stopPropagation();
        e.preventDefault();
    }, _onHandleClick:function (e) {
        if (this.disabled || this.readOnly) {
            return;
        }
        if (!has("ie")) {
            focus.focus(this.sliderHandle);
        }
        e.stopPropagation();
        e.preventDefault();
    }, _isReversed:function () {
        return !this.isLeftToRight();
    }, _onBarClick:function (e) {
        if (this.disabled || this.readOnly || !this.clickSelect) {
            return;
        }
        focus.focus(this.sliderHandle);
        e.stopPropagation();
        e.preventDefault();
        var abspos = domGeometry.position(this.sliderBarContainer, true);
        var pixelValue = e[this._mousePixelCoord] - abspos[this._startingPixelCoord];
        this._setPixelValue(this._isReversed() ? (abspos[this._pixelCount] - pixelValue) : pixelValue, abspos[this._pixelCount], true);
        this._movable.onMouseDown(e);
    }, _setPixelValue:function (pixelValue, maxPixels, priorityChange) {
        if (this.disabled || this.readOnly) {
            return;
        }
        var count = this.discreteValues;
        if (count <= 1 || count == Infinity) {
            count = maxPixels;
        }
        count--;
        var pixelsPerValue = maxPixels / count;
        var wholeIncrements = Math.round(pixelValue / pixelsPerValue);
        this._setValueAttr(Math.max(Math.min((this.maximum - this.minimum) * wholeIncrements / count + this.minimum, this.maximum), this.minimum), priorityChange);
    }, _setValueAttr:function (value, priorityChange) {
        this._set("value", value);
        this.valueNode.value = value;
        this.focusNode.setAttribute("aria-valuenow", value);
        this.inherited(arguments);
        var percent = this.maximum > this.minimum ? ((value - this.minimum) / (this.maximum - this.minimum)) : 0;
        var progressBar = (this._descending === false) ? this.remainingBar : this.progressBar;
        var remainingBar = (this._descending === false) ? this.progressBar : this.remainingBar;
        if (this._inProgressAnim && this._inProgressAnim.status != "stopped") {
            this._inProgressAnim.stop(true);
        }
        if (priorityChange && this.slideDuration > 0 && progressBar.style[this._progressPixelSize]) {
            var _this = this;
            var props = {};
            var start = parseFloat(progressBar.style[this._progressPixelSize]);
            var duration = this.slideDuration * (percent - start / 100);
            if (duration == 0) {
                return;
            }
            if (duration < 0) {
                duration = 0 - duration;
            }
            props[this._progressPixelSize] = {start:start, end:percent * 100, units:"%"};
            this._inProgressAnim = fx.animateProperty({node:progressBar, duration:duration, onAnimate:function (v) {
                remainingBar.style[_this._progressPixelSize] = (100 - parseFloat(v[_this._progressPixelSize])) + "%";
            }, onEnd:function () {
                delete _this._inProgressAnim;
            }, properties:props});
            this._inProgressAnim.play();
        } else {
            progressBar.style[this._progressPixelSize] = (percent * 100) + "%";
            remainingBar.style[this._progressPixelSize] = ((1 - percent) * 100) + "%";
        }
    }, _bumpValue:function (signedChange, priorityChange) {
        if (this.disabled || this.readOnly || (this.maximum <= this.minimum)) {
            return;
        }
        var s = domStyle.getComputedStyle(this.sliderBarContainer);
        var c = domGeometry.getContentBox(this.sliderBarContainer, s);
        var count = this.discreteValues;
        if (count <= 1 || count == Infinity) {
            count = c[this._pixelCount];
        }
        count--;
        var value = (this.value - this.minimum) * count / (this.maximum - this.minimum) + signedChange;
        if (value < 0) {
            value = 0;
        }
        if (value > count) {
            value = count;
        }
        value = value * (this.maximum - this.minimum) / count + this.minimum;
        this._setValueAttr(value, priorityChange);
    }, _onClkBumper:function (val) {
        if (this.disabled || this.readOnly || !this.clickSelect) {
            return;
        }
        this._setValueAttr(val, true);
    }, _onClkIncBumper:function () {
        this._onClkBumper(this._descending === false ? this.minimum : this.maximum);
    }, _onClkDecBumper:function () {
        this._onClkBumper(this._descending === false ? this.maximum : this.minimum);
    }, decrement:function (e) {
        this._bumpValue(e.keyCode == keys.PAGE_DOWN ? -this.pageIncrement : -1);
    }, increment:function (e) {
        this._bumpValue(e.keyCode == keys.PAGE_UP ? this.pageIncrement : 1);
    }, _mouseWheeled:function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        this._bumpValue(evt.wheelDelta < 0 ? -1 : 1, true);
    }, startup:function () {
        if (this._started) {
            return;
        }
        array.forEach(this.getChildren(), function (child) {
            if (this[child.container] != this.containerNode) {
                this[child.container].appendChild(child.domNode);
            }
        }, this);
        this.inherited(arguments);
    }, _typematicCallback:function (count, button, e) {
        if (count == -1) {
            this._setValueAttr(this.value, true);
        } else {
            this[(button == (this._descending ? this.incrementButton : this.decrementButton)) ? "decrement" : "increment"](e);
        }
    }, buildRendering:function () {
        this.inherited(arguments);
        if (this.showButtons) {
            this.incrementButton.style.display = "";
            this.decrementButton.style.display = "";
        }
        var label = query("label[for=\"" + this.id + "\"]");
        if (label.length) {
            if (!label[0].id) {
                label[0].id = this.id + "_label";
            }
            this.focusNode.setAttribute("aria-labelledby", label[0].id);
        }
        this.focusNode.setAttribute("aria-valuemin", this.minimum);
        this.focusNode.setAttribute("aria-valuemax", this.maximum);
    }, postCreate:function () {
        this.inherited(arguments);
        if (this.showButtons) {
            this.own(typematic.addMouseListener(this.decrementButton, this, "_typematicCallback", 25, 500), typematic.addMouseListener(this.incrementButton, this, "_typematicCallback", 25, 500));
        }
        this.own(on(this.domNode, mouse.wheel, lang.hitch(this, "_mouseWheeled")));
        var mover = declare(_SliderMover, {widget:this});
        this._movable = new Moveable(this.sliderHandle, {mover:mover});
        this._layoutHackIE7();
    }, destroy:function () {
        this._movable.destroy();
        if (this._inProgressAnim && this._inProgressAnim.status != "stopped") {
            this._inProgressAnim.stop(true);
        }
        this.inherited(arguments);
    }});
    HorizontalSlider._Mover = _SliderMover;
    return HorizontalSlider;
});

