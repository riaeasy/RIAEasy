//>>built

require({cache:{"url:dijit/form/templates/ComboButton.html":"<table class=\"dijit dijitReset dijitInline dijitLeft\"\n\tcellspacing='0' cellpadding='0' role=\"presentation\"\n\t><tbody role=\"presentation\"><tr role=\"presentation\"\n\t\t><td class=\"dijitReset dijitStretch dijitButtonNode\" data-dojo-attach-point=\"buttonNode\" data-dojo-attach-event=\"ondijitclick:__onClick,onkeydown:_onButtonKeyDown\"\n\t\t><div id=\"${id}_button\" class=\"dijitReset dijitButtonContents\"\n\t\t\tdata-dojo-attach-point=\"titleNode\"\n\t\t\trole=\"button\" aria-labelledby=\"${id}_label\"\n\t\t\t><div class=\"dijitReset dijitInline dijitIcon\" data-dojo-attach-point=\"iconNode\" role=\"presentation\"></div\n\t\t\t><div class=\"dijitReset dijitInline dijitButtonText\" id=\"${id}_label\" data-dojo-attach-point=\"containerNode\" role=\"presentation\"></div\n\t\t></div\n\t\t></td\n\t\t><td id=\"${id}_arrow\" class='dijitReset dijitRight dijitButtonNode dijitArrowButton'\n\t\t\tdata-dojo-attach-point=\"_popupStateNode,focusNode,_buttonNode\"\n\t\t\tdata-dojo-attach-event=\"onkeydown:_onArrowKeyDown\"\n\t\t\ttitle=\"${optionsTitle}\"\n\t\t\trole=\"button\" aria-haspopup=\"true\"\n\t\t\t><div class=\"dijitReset dijitArrowButtonInner\" role=\"presentation\"></div\n\t\t\t><div class=\"dijitReset dijitArrowButtonChar\" role=\"presentation\">&#9660;</div\n\t\t></td\n\t\t><td style=\"display:none !important;\"\n\t\t\t><input ${!nameAttrSetting} type=\"${type}\" value=\"${value}\" data-dojo-attach-point=\"valueNode\"\n\t\t\t\tclass=\"dijitOffScreen\"\n\t\t\t\trole=\"presentation\" aria-hidden=\"true\"\n\t\t\t\tdata-dojo-attach-event=\"onclick:_onClick\"\n\t\t/></td></tr></tbody\n></table>\n"}});
define("dijit/form/ComboButton", ["dojo/_base/declare", "dojo/keys", "../focus", "./DropDownButton", "dojo/text!./templates/ComboButton.html", "../a11yclick"], function (declare, keys, focus, DropDownButton, template) {
    return declare("dijit.form.ComboButton", DropDownButton, {templateString:template, _setIdAttr:"", _setTabIndexAttr:["focusNode", "titleNode"], _setTitleAttr:"titleNode", optionsTitle:"", baseClass:"dijitComboButton", cssStateNodes:{"buttonNode":"dijitButtonNode", "titleNode":"dijitButtonContents", "_popupStateNode":"dijitDownArrowButton"}, _focusedNode:null, _onButtonKeyDown:function (evt) {
        if (evt.keyCode == keys[this.isLeftToRight() ? "RIGHT_ARROW" : "LEFT_ARROW"]) {
            focus.focus(this._popupStateNode);
            evt.stopPropagation();
            evt.preventDefault();
        }
    }, _onArrowKeyDown:function (evt) {
        if (evt.keyCode == keys[this.isLeftToRight() ? "LEFT_ARROW" : "RIGHT_ARROW"]) {
            focus.focus(this.titleNode);
            evt.stopPropagation();
            evt.preventDefault();
        }
    }, focus:function (position) {
        if (!this.disabled) {
            focus.focus(position == "start" ? this.titleNode : this._popupStateNode);
        }
    }});
});

