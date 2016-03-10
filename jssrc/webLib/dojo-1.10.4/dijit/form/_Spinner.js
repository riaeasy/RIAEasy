//>>built

require({cache:{"url:dijit/form/templates/Spinner.html":"<div class=\"dijit dijitReset dijitInline dijitLeft\"\n\tid=\"widget_${id}\" role=\"presentation\"\n\t><div class=\"dijitReset dijitButtonNode dijitSpinnerButtonContainer\"\n\t\t><input class=\"dijitReset dijitInputField dijitSpinnerButtonInner\" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t\t/><div class=\"dijitReset dijitLeft dijitButtonNode dijitArrowButton dijitUpArrowButton\"\n\t\t\tdata-dojo-attach-point=\"upArrowNode\"\n\t\t\t><div class=\"dijitArrowButtonInner\"\n\t\t\t\t><input class=\"dijitReset dijitInputField\" value=\"&#9650; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t\t\t\t\t${_buttonInputDisabled}\n\t\t\t/></div\n\t\t></div\n\t\t><div class=\"dijitReset dijitLeft dijitButtonNode dijitArrowButton dijitDownArrowButton\"\n\t\t\tdata-dojo-attach-point=\"downArrowNode\"\n\t\t\t><div class=\"dijitArrowButtonInner\"\n\t\t\t\t><input class=\"dijitReset dijitInputField\" value=\"&#9660; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t\t\t\t\t${_buttonInputDisabled}\n\t\t\t/></div\n\t\t></div\n\t></div\n\t><div class='dijitReset dijitValidationContainer'\n\t\t><input class=\"dijitReset dijitInputField dijitValidationIcon dijitValidationInner\" value=\"&#935; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t/></div\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\n\t\t><input class='dijitReset dijitInputInner' data-dojo-attach-point=\"textbox,focusNode\" type=\"${type}\" data-dojo-attach-event=\"onkeydown:_onKeyDown\"\n\t\t\trole=\"spinbutton\" autocomplete=\"off\" ${!nameAttrSetting}\n\t/></div\n></div>\n"}});
define("dijit/form/_Spinner", ["dojo/_base/declare", "dojo/keys", "dojo/_base/lang", "dojo/sniff", "dojo/mouse", "dojo/on", "../typematic", "./RangeBoundTextBox", "dojo/text!./templates/Spinner.html", "./_TextBoxMixin"], function (declare, keys, lang, has, mouse, on, typematic, RangeBoundTextBox, template, _TextBoxMixin) {
    return declare("dijit.form._Spinner", RangeBoundTextBox, {defaultTimeout:500, minimumTimeout:10, timeoutChangeRate:0.9, smallDelta:1, largeDelta:10, templateString:template, baseClass:"dijitTextBox dijitSpinner", cssStateNodes:{"upArrowNode":"dijitUpArrowButton", "downArrowNode":"dijitDownArrowButton"}, adjust:function (val) {
        return val;
    }, _arrowPressed:function (nodePressed, direction, increment) {
        if (this.disabled || this.readOnly) {
            return;
        }
        this._setValueAttr(this.adjust(this.get("value"), direction * increment), false);
        _TextBoxMixin.selectInputText(this.textbox, this.textbox.value.length);
    }, _arrowReleased:function () {
        this._wheelTimer = null;
    }, _typematicCallback:function (count, node, evt) {
        var inc = this.smallDelta;
        if (node == this.textbox) {
            var key = evt.keyCode;
            inc = (key == keys.PAGE_UP || key == keys.PAGE_DOWN) ? this.largeDelta : this.smallDelta;
            node = (key == keys.UP_ARROW || key == keys.PAGE_UP) ? this.upArrowNode : this.downArrowNode;
        }
        if (count == -1) {
            this._arrowReleased(node);
        } else {
            this._arrowPressed(node, (node == this.upArrowNode) ? 1 : -1, inc);
        }
    }, _wheelTimer:null, _mouseWheeled:function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var wheelDelta = evt.wheelDelta / 120;
        if (Math.floor(wheelDelta) != wheelDelta) {
            wheelDelta = evt.wheelDelta > 0 ? 1 : -1;
        }
        var scrollAmount = evt.detail ? (evt.detail * -1) : wheelDelta;
        if (scrollAmount !== 0) {
            var node = this[(scrollAmount > 0 ? "upArrowNode" : "downArrowNode")];
            this._arrowPressed(node, scrollAmount, this.smallDelta);
            if (this._wheelTimer) {
                this._wheelTimer.remove();
            }
            this._wheelTimer = this.defer(function () {
                this._arrowReleased(node);
            }, 50);
        }
    }, _setConstraintsAttr:function (constraints) {
        this.inherited(arguments);
        if (this.focusNode) {
            if (this.constraints.min !== undefined) {
                this.focusNode.setAttribute("aria-valuemin", this.constraints.min);
            } else {
                this.focusNode.removeAttribute("aria-valuemin");
            }
            if (this.constraints.max !== undefined) {
                this.focusNode.setAttribute("aria-valuemax", this.constraints.max);
            } else {
                this.focusNode.removeAttribute("aria-valuemax");
            }
        }
    }, _setValueAttr:function (value, priorityChange) {
        this.focusNode.setAttribute("aria-valuenow", value);
        this.inherited(arguments);
    }, postCreate:function () {
        this.inherited(arguments);
        this.own(on(this.domNode, mouse.wheel, lang.hitch(this, "_mouseWheeled")), typematic.addListener(this.upArrowNode, this.textbox, {keyCode:keys.UP_ARROW, ctrlKey:false, altKey:false, shiftKey:false, metaKey:false}, this, "_typematicCallback", this.timeoutChangeRate, this.defaultTimeout, this.minimumTimeout), typematic.addListener(this.downArrowNode, this.textbox, {keyCode:keys.DOWN_ARROW, ctrlKey:false, altKey:false, shiftKey:false, metaKey:false}, this, "_typematicCallback", this.timeoutChangeRate, this.defaultTimeout, this.minimumTimeout), typematic.addListener(this.upArrowNode, this.textbox, {keyCode:keys.PAGE_UP, ctrlKey:false, altKey:false, shiftKey:false, metaKey:false}, this, "_typematicCallback", this.timeoutChangeRate, this.defaultTimeout, this.minimumTimeout), typematic.addListener(this.downArrowNode, this.textbox, {keyCode:keys.PAGE_DOWN, ctrlKey:false, altKey:false, shiftKey:false, metaKey:false}, this, "_typematicCallback", this.timeoutChangeRate, this.defaultTimeout, this.minimumTimeout));
    }});
});

