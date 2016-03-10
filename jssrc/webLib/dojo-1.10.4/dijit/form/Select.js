//>>built

require({cache:{"url:dijit/form/templates/Select.html":"<table class=\"dijit dijitReset dijitInline dijitLeft\"\n\tdata-dojo-attach-point=\"_buttonNode,tableNode,focusNode,_popupStateNode\" cellspacing='0' cellpadding='0'\n\trole=\"listbox\" aria-haspopup=\"true\"\n\t><tbody role=\"presentation\"><tr role=\"presentation\"\n\t\t><td class=\"dijitReset dijitStretch dijitButtonContents\" role=\"presentation\"\n\t\t\t><div class=\"dijitReset dijitInputField dijitButtonText\"  data-dojo-attach-point=\"containerNode,textDirNode\" role=\"presentation\"></div\n\t\t\t><div class=\"dijitReset dijitValidationContainer\"\n\t\t\t\t><input class=\"dijitReset dijitInputField dijitValidationIcon dijitValidationInner\" value=\"&#935; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t\t\t/></div\n\t\t\t><input type=\"hidden\" ${!nameAttrSetting} data-dojo-attach-point=\"valueNode\" value=\"${value}\" aria-hidden=\"true\"\n\t\t/></td\n\t\t><td class=\"dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton dijitArrowButtonContainer\"\n\t\t\tdata-dojo-attach-point=\"titleNode\" role=\"presentation\"\n\t\t\t><input class=\"dijitReset dijitInputField dijitArrowButtonInner\" value=\"&#9660; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t\t\t\t${_buttonInputDisabled}\n\t\t/></td\n\t></tr></tbody\n></table>\n"}});
define("dijit/form/Select", ["dojo/_base/array", "dojo/_base/declare", "dojo/dom-attr", "dojo/dom-class", "dojo/dom-geometry", "dojo/i18n", "dojo/keys", "dojo/_base/lang", "dojo/on", "dojo/sniff", "./_FormSelectWidget", "../_HasDropDown", "../DropDownMenu", "../MenuItem", "../MenuSeparator", "../Tooltip", "../_KeyNavMixin", "../registry", "dojo/text!./templates/Select.html", "dojo/i18n!./nls/validate"], function (array, declare, domAttr, domClass, domGeometry, i18n, keys, lang, on, has, _FormSelectWidget, _HasDropDown, DropDownMenu, MenuItem, MenuSeparator, Tooltip, _KeyNavMixin, registry, template) {
    var _SelectMenu = declare("dijit.form._SelectMenu", DropDownMenu, {autoFocus:true, buildRendering:function () {
        this.inherited(arguments);
        this.domNode.setAttribute("role", "listbox");
    }, postCreate:function () {
        this.inherited(arguments);
        this.own(on(this.domNode, "selectstart", function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
        }));
    }, focus:function () {
        var found = false, val = this.parentWidget.value;
        if (lang.isArray(val)) {
            val = val[val.length - 1];
        }
        if (val) {
            array.forEach(this.parentWidget._getChildren(), function (child) {
                if (child.option && (val === child.option.value)) {
                    found = true;
                    this.focusChild(child, false);
                }
            }, this);
        }
        if (!found) {
            this.inherited(arguments);
        }
    }});
    var Select = declare("dijit.form.Select" + (0 ? "_NoBidi" : ""), [_FormSelectWidget, _HasDropDown, _KeyNavMixin], {baseClass:"dijitSelect dijitValidationTextBox", templateString:template, _buttonInputDisabled:has("ie") ? "disabled" : "", required:false, state:"", message:"", tooltipPosition:[], emptyLabel:"&#160;", _isLoaded:false, _childrenLoaded:false, labelType:"html", _fillContent:function () {
        this.inherited(arguments);
        if (this.options.length && !this.value && this.srcNodeRef) {
            var si = this.srcNodeRef.selectedIndex || 0;
            this._set("value", this.options[si >= 0 ? si : 0].value);
        }
        this.dropDown = new _SelectMenu({id:this.id + "_menu", parentWidget:this});
        domClass.add(this.dropDown.domNode, this.baseClass.replace(/\s+|$/g, "Menu "));
    }, _getMenuItemForOption:function (option) {
        if (!option.value && !option.label) {
            return new MenuSeparator({ownerDocument:this.ownerDocument});
        } else {
            var click = lang.hitch(this, "_setValueAttr", option);
            var item = new MenuItem({option:option, label:(this.labelType === "text" ? (option.label || "").toString().replace(/&/g, "&amp;").replace(/</g, "&lt;") : option.label) || this.emptyLabel, onClick:click, ownerDocument:this.ownerDocument, dir:this.dir, textDir:this.textDir, disabled:option.disabled || false});
            item.focusNode.setAttribute("role", "option");
            return item;
        }
    }, _addOptionItem:function (option) {
        if (this.dropDown) {
            this.dropDown.addChild(this._getMenuItemForOption(option));
        }
    }, _getChildren:function () {
        if (!this.dropDown) {
            return [];
        }
        return this.dropDown.getChildren();
    }, focus:function () {
        if (!this.disabled && this.focusNode.focus) {
            try {
                this.focusNode.focus();
            }
            catch (e) {
            }
        }
    }, focusChild:function (widget) {
        if (widget) {
            this.set("value", widget.option);
        }
    }, _getFirst:function () {
        var children = this._getChildren();
        return children.length ? children[0] : null;
    }, _getLast:function () {
        var children = this._getChildren();
        return children.length ? children[children.length - 1] : null;
    }, childSelector:function (node) {
        var node = registry.byNode(node);
        return node && node.getParent() == this.dropDown;
    }, onKeyboardSearch:function (item, evt, searchString, numMatches) {
        if (item) {
            this.focusChild(item);
        }
    }, _loadChildren:function (loadMenuItems) {
        if (loadMenuItems === true) {
            if (this.dropDown) {
                delete this.dropDown.focusedChild;
                this.focusedChild = null;
            }
            if (this.options.length) {
                this.inherited(arguments);
            } else {
                array.forEach(this._getChildren(), function (child) {
                    child.destroyRecursive();
                });
                var item = new MenuItem({ownerDocument:this.ownerDocument, label:this.emptyLabel});
                this.dropDown.addChild(item);
            }
        } else {
            this._updateSelection();
        }
        this._isLoaded = false;
        this._childrenLoaded = true;
        if (!this._loadingStore) {
            this._setValueAttr(this.value, false);
        }
    }, _refreshState:function () {
        if (this._started) {
            this.validate(this.focused);
        }
    }, startup:function () {
        this.inherited(arguments);
        this._refreshState();
    }, _setValueAttr:function (value) {
        this.inherited(arguments);
        domAttr.set(this.valueNode, "value", this.get("value"));
        this._refreshState();
    }, _setNameAttr:"valueNode", _setDisabledAttr:function (value) {
        this.inherited(arguments);
        this._refreshState();
    }, _setRequiredAttr:function (value) {
        this._set("required", value);
        this.focusNode.setAttribute("aria-required", value);
        this._refreshState();
    }, _setOptionsAttr:function (options) {
        this._isLoaded = false;
        this._set("options", options);
    }, _setDisplay:function (newDisplay) {
        var lbl = (this.labelType === "text" ? (newDisplay || "").replace(/&/g, "&amp;").replace(/</g, "&lt;") : newDisplay) || this.emptyLabel;
        this.containerNode.innerHTML = "<span role=\"option\" class=\"dijitReset dijitInline " + this.baseClass.replace(/\s+|$/g, "Label ") + "\">" + lbl + "</span>";
    }, validate:function (isFocused) {
        var isValid = this.disabled || this.isValid(isFocused);
        this._set("state", isValid ? "" : (this._hasBeenBlurred ? "Error" : "Incomplete"));
        this.focusNode.setAttribute("aria-invalid", isValid ? "false" : "true");
        var message = isValid ? "" : this._missingMsg;
        if (message && this.focused && this._hasBeenBlurred) {
            Tooltip.show(message, this.domNode, this.tooltipPosition, !this.isLeftToRight());
        } else {
            Tooltip.hide(this.domNode);
        }
        this._set("message", message);
        return isValid;
    }, isValid:function () {
        return (!this.required || this.value === 0 || !(/^\s*$/.test(this.value || "")));
    }, reset:function () {
        this.inherited(arguments);
        Tooltip.hide(this.domNode);
        this._refreshState();
    }, postMixInProperties:function () {
        this.inherited(arguments);
        this._missingMsg = i18n.getLocalization("dijit.form", "validate", this.lang).missingMessage;
    }, postCreate:function () {
        this.inherited(arguments);
        this.own(on(this.domNode, "selectstart", function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
        }));
        this.domNode.setAttribute("aria-expanded", "false");
        var keyNavCodes = this._keyNavCodes;
        delete keyNavCodes[keys.LEFT_ARROW];
        delete keyNavCodes[keys.RIGHT_ARROW];
    }, _setStyleAttr:function (value) {
        this.inherited(arguments);
        domClass.toggle(this.domNode, this.baseClass.replace(/\s+|$/g, "FixedWidth "), !!this.domNode.style.width);
    }, isLoaded:function () {
        return this._isLoaded;
    }, loadDropDown:function (loadCallback) {
        this._loadChildren(true);
        this._isLoaded = true;
        loadCallback();
    }, destroy:function (preserveDom) {
        if (this.dropDown && !this.dropDown._destroyed) {
            this.dropDown.destroyRecursive(preserveDom);
            delete this.dropDown;
        }
        Tooltip.hide(this.domNode);
        this.inherited(arguments);
    }, _onFocus:function () {
        this.validate(true);
    }, _onBlur:function () {
        Tooltip.hide(this.domNode);
        this.inherited(arguments);
        this.validate(false);
    }});
    if (0) {
        Select = declare("dijit.form.Select", Select, {_setDisplay:function (newDisplay) {
            this.inherited(arguments);
            this.applyTextDir(this.containerNode);
        }});
    }
    Select._Menu = _SelectMenu;
    function _onEventAfterLoad(method) {
        return function (evt) {
            if (!this._isLoaded) {
                this.loadDropDown(lang.hitch(this, method, evt));
            } else {
                this.inherited(method, arguments);
            }
        };
    }
    Select.prototype._onContainerKeydown = _onEventAfterLoad("_onContainerKeydown");
    Select.prototype._onContainerKeypress = _onEventAfterLoad("_onContainerKeypress");
    return Select;
});

