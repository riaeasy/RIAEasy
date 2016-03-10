//>>built

require({cache:{"url:dojox/form/resources/_CheckedMultiSelectItem.html":"<div class=\"dijitReset ${baseClass}\"\n\t><input class=\"${baseClass}Box\" data-dojo-type=\"dijit.form.CheckBox\" data-dojo-attach-point=\"checkBox\" \n\t\tdata-dojo-attach-event=\"_onClick:_changeBox\" type=\"${_type.type}\" data-dojo-props='disabled:${disabled}, readOnly:${readOnly}' baseClass=\"${_type.baseClass}\"\n\t/><div class=\"dijitInline ${baseClass}Label\" data-dojo-attach-point=\"labelNode\" data-dojo-attach-event=\"onclick:_onClick\"></div\n></div>\n", "url:dojox/form/resources/_CheckedMultiSelectMenuItem.html":"<tr class=\"dijitReset dijitMenuItem\" dojoAttachPoint=\"focusNode\" role=\"menuitemcheckbox\" tabIndex=\"-1\"\n\tdojoAttachEvent=\"ondijitclick:_onClick\"\n\t><td class=\"dijitReset dijitMenuItemIconCell\" role=\"presentation\"\n\t\t><div src=\"${_blankGif}\" alt=\"\" class=\"dijitMenuItemIcon ${_iconClass}\" dojoAttachPoint=\"iconNode\"\n\t\t\t><input class=\"dojoxCheckedMultiSelectCheckBoxInput\" dojoAttachPoint=\"inputNode\" type=\"${_type.type}\"\n\t\t/></div></td\n\t><td class=\"dijitReset dijitMenuItemLabel\" colspan=\"2\" dojoAttachPoint=\"containerNode,labelNode\"></td\n\t><td class=\"dijitReset dijitMenuItemAccelKey\" style=\"display: none\" dojoAttachPoint=\"accelKeyNode\"></td\n\t><td class=\"dijitReset dijitMenuArrowCell\" role=\"presentation\">&nbsp;</td\n></tr>", "url:dojox/form/resources/CheckedMultiSelect.html":"<div class=\"dijit dijitReset dijitInline dijitLeft\" id=\"widget_${id}\"\n\t><div data-dojo-attach-point=\"comboButtonNode\"\n\t></div\n\t><div data-dojo-attach-point=\"selectNode\" class=\"dijit dijitReset dijitInline ${baseClass}Wrapper\" data-dojo-attach-event=\"onmousedown:_onMouseDown,onclick:focus\"\n\t\t><select class=\"${baseClass}Select dojoxCheckedMultiSelectHidden\" multiple=\"true\" data-dojo-attach-point=\"containerNode,focusNode\"></select\n\t\t><div data-dojo-attach-point=\"wrapperDiv\"></div\n\t></div\n></div>"}});
define("dojox/form/CheckedMultiSelect", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/event", "dojo/dom-geometry", "dojo/dom-class", "dojo/dom-construct", "dojo/i18n", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/registry", "dijit/Menu", "dijit/MenuItem", "dijit/Tooltip", "dijit/form/_FormSelectWidget", "dijit/form/ComboButton", "dojo/text!dojox/form/resources/_CheckedMultiSelectMenuItem.html", "dojo/text!dojox/form/resources/_CheckedMultiSelectItem.html", "dojo/text!dojox/form/resources/CheckedMultiSelect.html", "dojo/i18n!dojox/form/nls/CheckedMultiSelect", "dijit/form/CheckBox"], function (declare, lang, array, event, domGeometry, domClass, domConstruct, i18n, Widget, TemplatedMixin, WidgetsInTemplateMixin, registry, Menu, MenuItem, Tooltip, FormSelectWidget, ComboButton, CheckedMultiSelectMenuItem, CheckedMultiSelectItem, CheckedMultiSelect, nlsCheckedMultiSelect) {
    var formCheckedMultiSelectItem = declare("dojox.form._CheckedMultiSelectItem", [Widget, TemplatedMixin, WidgetsInTemplateMixin], {templateString:CheckedMultiSelectItem, baseClass:"dojoxMultiSelectItem", option:null, parent:null, disabled:false, readOnly:false, postMixInProperties:function () {
        this._type = this.parent.multiple ? {type:"checkbox", baseClass:"dijitCheckBox"} : {type:"radio", baseClass:"dijitRadio"};
        if (!this.disabled) {
            this.disabled = this.option.disabled = this.option.disabled || false;
        }
        if (!this.readOnly) {
            this.readOnly = this.option.readOnly = this.option.readOnly || false;
        }
        this.inherited(arguments);
    }, postCreate:function () {
        this.inherited(arguments);
        this.labelNode.innerHTML = this.option.label;
    }, _changeBox:function () {
        if (this.get("disabled") || this.get("readOnly")) {
            return;
        }
        if (this.parent.multiple) {
            this.option.selected = this.checkBox.get("value") && true;
        } else {
            this.parent.set("value", this.option.value);
        }
        this.parent._updateSelection();
        this.parent.focus();
    }, _onClick:function (e) {
        if (this.get("disabled") || this.get("readOnly")) {
            event.stop(e);
        } else {
            this.checkBox._onClick(e);
        }
    }, _updateBox:function () {
        this.checkBox.set("value", this.option.selected);
    }, _setDisabledAttr:function (value) {
        this.disabled = value || this.option.disabled;
        this.checkBox.set("disabled", this.disabled);
        domClass.toggle(this.domNode, "dojoxMultiSelectDisabled", this.disabled);
    }, _setReadOnlyAttr:function (value) {
        this.checkBox.set("readOnly", value);
        this.readOnly = value;
    }});
    var formCheckedMultiSelectMenu = declare("dojox.form._CheckedMultiSelectMenu", Menu, {multiple:false, buildRendering:function () {
        this.inherited(arguments);
        var o = (this.menuTableNode = this.domNode), n = (this.domNode = domConstruct.create("div", {style:{overflowX:"hidden", overflowY:"scroll"}}));
        if (o.parentNode) {
            o.parentNode.replaceChild(n, o);
        }
        domClass.remove(o, "dijitMenuTable");
        n.className = o.className + " dojoxCheckedMultiSelectMenu";
        o.className = "dijitReset dijitMenuTable";
        o.setAttribute("role", "listbox");
        n.setAttribute("role", "presentation");
        n.appendChild(o);
    }, resize:function (mb) {
        if (mb) {
            domGeometry.setMarginBox(this.domNode, mb);
            if ("w" in mb) {
                this.menuTableNode.style.width = "100%";
            }
        }
    }, onClose:function () {
        this.inherited(arguments);
        if (this.menuTableNode) {
            this.menuTableNode.style.width = "";
        }
    }, onItemClick:function (item, evt) {
        if (typeof this.isShowingNow == "undefined") {
            this._markActive();
        }
        this.focusChild(item);
        if (item.disabled || item.readOnly) {
            return false;
        }
        if (!this.multiple) {
            this.onExecute();
        }
        item.onClick(evt);
    }});
    var formCheckedMultiSelectMenuItem = declare("dojox.form._CheckedMultiSelectMenuItem", MenuItem, {templateString:CheckedMultiSelectMenuItem, option:null, parent:null, iconClass:"", postMixInProperties:function () {
        if (this.parent.multiple) {
            this._iconClass = "dojoxCheckedMultiSelectMenuCheckBoxItemIcon";
            this._type = {type:"checkbox"};
        } else {
            this._iconClass = "";
            this._type = {type:"hidden"};
        }
        this.disabled = this.option.disabled;
        this.checked = this.option.selected;
        this.label = this.option.label;
        this.readOnly = this.option.readOnly;
        this.inherited(arguments);
    }, onChange:function (checked) {
    }, _updateBox:function () {
        domClass.toggle(this.domNode, "dojoxCheckedMultiSelectMenuItemChecked", !!this.option.selected);
        this.domNode.setAttribute("aria-checked", this.option.selected);
        this.inputNode.checked = this.option.selected;
        if (!this.parent.multiple) {
            domClass.toggle(this.domNode, "dijitSelectSelectedOption", !!this.option.selected);
        }
    }, _onClick:function (e) {
        if (!this.disabled && !this.readOnly) {
            if (this.parent.multiple) {
                this.option.selected = !this.option.selected;
                this.parent.onChange();
                this.onChange(this.option.selected);
            } else {
                if (!this.option.selected) {
                    array.forEach(this.parent.getChildren(), function (item) {
                        item.option.selected = false;
                    });
                    this.option.selected = true;
                    this.parent.onChange();
                    this.onChange(this.option.selected);
                }
            }
        }
        this.inherited(arguments);
    }});
    var formCheckedMultiSelect = declare("dojox.form.CheckedMultiSelect", FormSelectWidget, {templateString:CheckedMultiSelect, baseClass:"dojoxCheckedMultiSelect", required:false, invalidMessage:"$_unset_$", _message:"", dropDown:false, labelText:"", tooltipPosition:[], postMixInProperties:function () {
        this.inherited(arguments);
        this._nlsResources = i18n.getLocalization("dojox.form", "CheckedMultiSelect", this.lang);
        if (this.invalidMessage == "$_unset_$") {
            this.invalidMessage = this._nlsResources.invalidMessage;
        }
    }, _fillContent:function () {
        this.inherited(arguments);
        if (this.options.length && !this.value && this.srcNodeRef) {
            var si = this.srcNodeRef.selectedIndex || 0;
            this.value = this.options[si >= 0 ? si : 0].value;
        }
        if (this.dropDown) {
            domClass.toggle(this.selectNode, "dojoxCheckedMultiSelectHidden");
            this.dropDownMenu = new formCheckedMultiSelectMenu({id:this.id + "_menu", style:"display: none;", multiple:this.multiple, onChange:lang.hitch(this, "_updateSelection")});
        }
    }, startup:function () {
        if (this.dropDown) {
            this.dropDownButton = new ComboButton({label:this.labelText, dropDown:this.dropDownMenu, baseClass:"dojoxCheckedMultiSelectButton", maxHeight:this.maxHeight}, this.comboButtonNode);
        }
        this.inherited(arguments);
    }, _onMouseDown:function (e) {
        e.preventDefault();
    }, validator:function () {
        if (!this.required) {
            return true;
        }
        return array.some(this.getOptions(), function (opt) {
            return opt.selected && opt.value != null && opt.value.toString().length != 0;
        });
    }, validate:function (isFocused) {
        Tooltip.hide(this.domNode);
        var isValid = this.isValid(isFocused);
        if (!isValid) {
            this.displayMessage(this.invalidMessage);
        }
        return isValid;
    }, isValid:function (isFocused) {
        return this.validator();
    }, getErrorMessage:function (isFocused) {
        return this.invalidMessage;
    }, displayMessage:function (message) {
        Tooltip.hide(this.domNode);
        if (message) {
            Tooltip.show(message, this.domNode, this.tooltipPosition);
        }
    }, onAfterAddOptionItem:function (item, option) {
    }, _addOptionItem:function (option) {
        var item;
        if (this.dropDown) {
            item = new formCheckedMultiSelectMenuItem({option:option, parent:this.dropDownMenu});
            this.dropDownMenu.addChild(item);
        } else {
            item = new formCheckedMultiSelectItem({option:option, parent:this, disabled:this.disabled, readOnly:this.readOnly});
            this.wrapperDiv.appendChild(item.domNode);
        }
        this.onAfterAddOptionItem(item, option);
    }, _refreshState:function () {
        this.validate(this.focused);
    }, onChange:function (newValue) {
        this._refreshState();
    }, reset:function () {
        this.inherited(arguments);
        Tooltip.hide(this.domNode);
    }, _updateSelection:function () {
        this.inherited(arguments);
        this._handleOnChange(this.value);
        array.forEach(this._getChildren(), function (item) {
            item._updateBox();
        });
        domConstruct.empty(this.containerNode);
        var self = this;
        array.forEach(this.value, function (item) {
            var opt = domConstruct.create("option", {"value":item, "label":item, "selected":"selected"});
            domConstruct.place(opt, self.containerNode);
        });
        if (this.dropDown && this.dropDownButton) {
            var i = 0, label = "";
            array.forEach(this.options, function (option) {
                if (option.selected) {
                    i++;
                    label = option.label;
                }
            });
            this.dropDownButton.set("label", this.multiple ? lang.replace(this._nlsResources.multiSelectLabelText, {num:i}) : label);
        }
    }, _getChildren:function () {
        if (this.dropDown) {
            return this.dropDownMenu.getChildren();
        } else {
            return array.map(this.wrapperDiv.childNodes, function (n) {
                return registry.byNode(n);
            });
        }
    }, invertSelection:function (onChange) {
        if (this.multiple) {
            array.forEach(this.options, function (i) {
                i.selected = !i.selected;
            });
            this._updateSelection();
        }
    }, _setDisabledAttr:function (value) {
        this.inherited(arguments);
        if (this.dropDown) {
            this.dropDownButton.set("disabled", value);
        }
        array.forEach(this._getChildren(), function (node) {
            if (node && node.set) {
                node.set("disabled", value);
            }
        });
    }, _setReadOnlyAttr:function (value) {
        this.inherited(arguments);
        if ("readOnly" in this.attributeMap) {
            this[this.attributeMap.readOnly].setAttribute("readonly", value);
        }
        this.readOnly = value;
        array.forEach(this._getChildren(), function (node) {
            if (node && node.set) {
                node.set("readOnly", value);
            }
        });
    }, uninitialize:function () {
        Tooltip.hide(this.domNode);
        array.forEach(this._getChildren(), function (child) {
            child.destroyRecursive();
        });
        this.inherited(arguments);
    }});
    return formCheckedMultiSelect;
});

