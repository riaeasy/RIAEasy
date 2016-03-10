//>>built

require({cache:{"url:dijit/form/templates/DropDownButton.html":"<span class=\"dijit dijitReset dijitInline\"\n\t><span class='dijitReset dijitInline dijitButtonNode'\n\t\tdata-dojo-attach-event=\"ondijitclick:__onClick\" data-dojo-attach-point=\"_buttonNode\"\n\t\t><span class=\"dijitReset dijitStretch dijitButtonContents\"\n\t\t\tdata-dojo-attach-point=\"focusNode,titleNode,_arrowWrapperNode,_popupStateNode\"\n\t\t\trole=\"button\" aria-haspopup=\"true\" aria-labelledby=\"${id}_label\"\n\t\t\t><span class=\"dijitReset dijitInline dijitIcon\"\n\t\t\t\tdata-dojo-attach-point=\"iconNode\"\n\t\t\t></span\n\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\"\n\t\t\t\tdata-dojo-attach-point=\"containerNode\"\n\t\t\t\tid=\"${id}_label\"\n\t\t\t></span\n\t\t\t><span class=\"dijitReset dijitInline dijitArrowButtonInner\"></span\n\t\t\t><span class=\"dijitReset dijitInline dijitArrowButtonChar\">&#9660;</span\n\t\t></span\n\t></span\n\t><input ${!nameAttrSetting} type=\"${type}\" value=\"${value}\" class=\"dijitOffScreen\" tabIndex=\"-1\"\n\t\tdata-dojo-attach-event=\"onclick:_onClick\"\n\t\tdata-dojo-attach-point=\"valueNode\" role=\"presentation\" aria-hidden=\"true\"\n/></span>\n"}});
define("dijit/form/DropDownButton", ["dojo/_base/declare", "dojo/_base/lang", "dojo/query", "../registry", "../popup", "./Button", "../_Container", "../_HasDropDown", "dojo/text!./templates/DropDownButton.html", "../a11yclick"], function (declare, lang, query, registry, popup, Button, _Container, _HasDropDown, template) {
    return declare("dijit.form.DropDownButton", [Button, _Container, _HasDropDown], {baseClass:"dijitDropDownButton", templateString:template, _fillContent:function () {
        if (this.srcNodeRef) {
            var nodes = query("*", this.srcNodeRef);
            this.inherited(arguments, [nodes[0]]);
            this.dropDownContainer = this.srcNodeRef;
        }
    }, startup:function () {
        if (this._started) {
            return;
        }
        if (!this.dropDown && this.dropDownContainer) {
            var dropDownNode = query("[widgetId]", this.dropDownContainer)[0];
            if (dropDownNode) {
                this.dropDown = registry.byNode(dropDownNode);
            }
            delete this.dropDownContainer;
        }
        if (this.dropDown) {
            popup.hide(this.dropDown);
        }
        this.inherited(arguments);
    }, isLoaded:function () {
        var dropDown = this.dropDown;
        return (!!dropDown && (!dropDown.href || dropDown.isLoaded));
    }, loadDropDown:function (callback) {
        var dropDown = this.dropDown;
        var handler = dropDown.on("load", lang.hitch(this, function () {
            handler.remove();
            callback();
        }));
        dropDown.refresh();
    }, isFocusable:function () {
        return this.inherited(arguments) && !this._mouseDown;
    }});
});

