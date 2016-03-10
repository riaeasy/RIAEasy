//>>built

require({cache:{"url:dijit/form/templates/CheckBox.html":"<div class=\"dijit dijitReset dijitInline\" role=\"presentation\"\n\t><input\n\t \t${!nameAttrSetting} type=\"${type}\" role=\"${type}\" aria-checked=\"false\" ${checkedAttrSetting}\n\t\tclass=\"dijitReset dijitCheckBoxInput\"\n\t\tdata-dojo-attach-point=\"focusNode\"\n\t \tdata-dojo-attach-event=\"ondijitclick:_onClick\"\n/></div>\n"}});
define("dijit/form/CheckBox", ["require", "dojo/_base/declare", "dojo/dom-attr", "dojo/has", "dojo/query", "dojo/ready", "./ToggleButton", "./_CheckBoxMixin", "dojo/text!./templates/CheckBox.html", "dojo/NodeList-dom", "../a11yclick"], function (require, declare, domAttr, has, query, ready, ToggleButton, _CheckBoxMixin, template) {
    if (has("dijit-legacy-requires")) {
        ready(0, function () {
            var requires = ["dijit/form/RadioButton"];
            require(requires);
        });
    }
    return declare("dijit.form.CheckBox", [ToggleButton, _CheckBoxMixin], {templateString:template, baseClass:"dijitCheckBox", _setValueAttr:function (newValue, priorityChange) {
        if (typeof newValue == "string") {
            this.inherited(arguments);
            newValue = true;
        }
        if (this._created) {
            this.set("checked", newValue, priorityChange);
        }
    }, _getValueAttr:function () {
        return this.checked && this._get("value");
    }, _setIconClassAttr:null, _setNameAttr:"focusNode", postMixInProperties:function () {
        this.inherited(arguments);
        this.checkedAttrSetting = "";
    }, _fillContent:function () {
    }, _onFocus:function () {
        if (this.id) {
            query("label[for='" + this.id + "']").addClass("dijitFocusedLabel");
        }
        this.inherited(arguments);
    }, _onBlur:function () {
        if (this.id) {
            query("label[for='" + this.id + "']").removeClass("dijitFocusedLabel");
        }
        this.inherited(arguments);
    }});
});

