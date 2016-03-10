//>>built

require({cache:{"url:dijit/form/templates/Button.html":"<span class=\"dijit dijitReset dijitInline\" role=\"presentation\"\n\t><span class=\"dijitReset dijitInline dijitButtonNode\"\n\t\tdata-dojo-attach-event=\"ondijitclick:__onClick\" role=\"presentation\"\n\t\t><span class=\"dijitReset dijitStretch dijitButtonContents\"\n\t\t\tdata-dojo-attach-point=\"titleNode,focusNode\"\n\t\t\trole=\"button\" aria-labelledby=\"${id}_label\"\n\t\t\t><span class=\"dijitReset dijitInline dijitIcon\" data-dojo-attach-point=\"iconNode\"></span\n\t\t\t><span class=\"dijitReset dijitToggleButtonIconChar\">&#x25CF;</span\n\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\"\n\t\t\t\tid=\"${id}_label\"\n\t\t\t\tdata-dojo-attach-point=\"containerNode\"\n\t\t\t></span\n\t\t></span\n\t></span\n\t><input ${!nameAttrSetting} type=\"${type}\" value=\"${value}\" class=\"dijitOffScreen\"\n\t\tdata-dojo-attach-event=\"onclick:_onClick\"\n\t\ttabIndex=\"-1\" role=\"presentation\" aria-hidden=\"true\" data-dojo-attach-point=\"valueNode\"\n/></span>\n"}});
define("dijit/form/Button", ["require", "dojo/_base/declare", "dojo/dom-class", "dojo/has", "dojo/_base/kernel", "dojo/_base/lang", "dojo/ready", "./_FormWidget", "./_ButtonMixin", "dojo/text!./templates/Button.html", "../a11yclick"], function (require, declare, domClass, has, kernel, lang, ready, _FormWidget, _ButtonMixin, template) {
    if (has("dijit-legacy-requires")) {
        ready(0, function () {
            var requires = ["dijit/form/DropDownButton", "dijit/form/ComboButton", "dijit/form/ToggleButton"];
            require(requires);
        });
    }
    var Button = declare("dijit.form.Button" + (0 ? "_NoBidi" : ""), [_FormWidget, _ButtonMixin], {showLabel:true, iconClass:"dijitNoIcon", _setIconClassAttr:{node:"iconNode", type:"class"}, baseClass:"dijitButton", templateString:template, _setValueAttr:"valueNode", _setNameAttr:function (name) {
        if (this.valueNode) {
            this.valueNode.setAttribute("name", name);
        }
    }, _fillContent:function (source) {
        if (source && (!this.params || !("label" in this.params))) {
            var sourceLabel = lang.trim(source.innerHTML);
            if (sourceLabel) {
                this.label = sourceLabel;
            }
        }
    }, _setShowLabelAttr:function (val) {
        if (this.containerNode) {
            domClass.toggle(this.containerNode, "dijitDisplayNone", !val);
        }
        this._set("showLabel", val);
    }, setLabel:function (content) {
        kernel.deprecated("dijit.form.Button.setLabel() is deprecated.  Use set('label', ...) instead.", "", "2.0");
        this.set("label", content);
    }, _setLabelAttr:function (content) {
        this.inherited(arguments);
        if (!this.showLabel && !("title" in this.params)) {
            this.titleNode.title = lang.trim(this.containerNode.innerText || this.containerNode.textContent || "");
        }
    }});
    if (0) {
        Button = declare("dijit.form.Button", Button, {_setLabelAttr:function (content) {
            this.inherited(arguments);
            if (this.titleNode.title) {
                this.applyTextDir(this.titleNode, this.titleNode.title);
            }
        }, _setTextDirAttr:function (textDir) {
            if (this._created && this.textDir != textDir) {
                this._set("textDir", textDir);
                this._setLabelAttr(this.label);
            }
        }});
    }
    return Button;
});

