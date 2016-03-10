//>>built

define("dojox/form/ListInput", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/json", "dojo/_base/fx", "dojo/_base/window", "dojo/_base/connect", "dojo/dom-class", "dojo/dom-style", "dojo/dom-construct", "dojo/dom-geometry", "dojo/keys", "dijit/_Widget", "dijit/_TemplatedMixin", "dijit/form/_FormValueWidget", "dijit/form/ValidationTextBox", "dijit/InlineEditBox", "dojo/i18n!dijit/nls/common", "dojo/_base/declare"], function (kernel, lang, array, jsonUtil, fx, win, connect, domClass, domStyle, domConstruct, domGeometry, keys, Widget, TemplatedMixin, FormValueWidget, ValidationTextBox, InlineEditBox, i18nCommon, declare) {
    kernel.experimental("dojox.form.ListInput");
    var ListInput = declare("dojox.form.ListInput", [FormValueWidget], {constructor:function () {
        this._items = [];
        if (!lang.isArray(this.delimiter)) {
            this.delimiter = [this.delimiter];
        }
        var r = "(" + this.delimiter.join("|") + ")?";
        this.regExp = "^" + this.regExp + r + "$";
    }, inputClass:"dojox.form._ListInputInputBox", inputHandler:"onChange", inputProperties:{minWidth:50}, submitOnlyValidValue:true, useOnBlur:true, readOnlyInput:false, maxItems:null, showCloseButtonWhenValid:true, showCloseButtonWhenInvalid:true, regExp:".*", delimiter:",", constraints:{}, baseClass:"dojoxListInput", type:"select", value:"", templateString:"<div dojoAttachPoint=\"focusNode\" class=\"dijit dijitReset dijitLeft dojoxListInput\"><select dojoAttachpoint=\"_selectNode\" multiple=\"multiple\" class=\"dijitHidden\" ${!nameAttrSetting}></select><ul dojoAttachPoint=\"_listInput\"><li dojoAttachEvent=\"onclick: _onClick\" class=\"dijitInputField dojoxListInputNode dijitHidden\" dojoAttachPoint=\"_inputNode\"></li></ul></div>", _setNameAttr:"_selectNode", useAnim:true, duration:500, easingIn:null, easingOut:null, readOnlyItem:false, useArrowForEdit:true, _items:null, _lastAddedItem:null, _currentItem:null, _input:null, _count:0, postCreate:function () {
        this.inherited(arguments);
        this._createInputBox();
    }, _setReadOnlyInputAttr:function (value) {
        if (!this._started) {
            return this._createInputBox();
        }
        this.readOnlyInput = value;
        this._createInputBox();
    }, _setReadOnlyItemAttr:function (value) {
        if (!this._started) {
            return;
        }
        for (var i in this._items) {
            this._items[i].set("readOnlyItem", value);
        }
    }, _createInputBox:function () {
        domClass.toggle(this._inputNode, "dijitHidden", this.readOnlyInput);
        if (this.readOnlyInput) {
            return;
        }
        if (this._input) {
            return;
        }
        if (this.inputHandler === null) {
            console.warn("you must add some handler to connect to input field");
            return false;
        }
        if (lang.isString(this.inputHandler)) {
            this.inputHandler = this.inputHandler.split(",");
        }
        if (lang.isString(this.inputProperties)) {
            this.inputProperties = jsonUtil.fromJson(this.inputProperties);
        }
        var input = lang.getObject(this.inputClass, false);
        this.inputProperties.regExp = this.regExpGen(this.constraints);
        this._input = new input(this.inputProperties);
        this._input.startup();
        this._inputNode.appendChild(this._input.domNode);
        array.forEach(this.inputHandler, function (handler) {
            this.connect(this._input, lang.trim(handler), "_onHandler");
        }, this);
        this.connect(this._input, "onKeyDown", "_inputOnKeyDown");
        this.connect(this._input, "onBlur", "_inputOnBlur");
    }, compare:function (val1, val2) {
        val1 = val1.join(",");
        val2 = val2.join(",");
        if (val1 > val2) {
            return 1;
        } else {
            if (val1 < val2) {
                return -1;
            } else {
                return 0;
            }
        }
    }, add:function (values) {
        if (this._count >= this.maxItems && this.maxItems !== null) {
            return;
        }
        this._lastValueReported = this._getValues();
        if (!lang.isArray(values)) {
            values = [values];
        }
        for (var i in values) {
            var value = values[i];
            if (value === "" || typeof value != "string") {
                continue;
            }
            this._count++;
            var re = new RegExp(this.regExpGen(this.constraints));
            this._lastAddedItem = new _ListInputInputItem({"index":this._items.length, readOnlyItem:this.readOnlyItem, value:value, regExp:this.regExpGen(this.constraints)});
            this._lastAddedItem.startup();
            this._testItem(this._lastAddedItem, value);
            this._lastAddedItem.onClose = lang.hitch(this, "_onItemClose", this._lastAddedItem);
            this._lastAddedItem.onChange = lang.hitch(this, "_onItemChange", this._lastAddedItem);
            this._lastAddedItem.onEdit = lang.hitch(this, "_onItemEdit", this._lastAddedItem);
            this._lastAddedItem.onKeyDown = lang.hitch(this, "_onItemKeyDown", this._lastAddedItem);
            if (this.useAnim) {
                domStyle.set(this._lastAddedItem.domNode, {opacity:0, display:""});
            }
            this._placeItem(this._lastAddedItem.domNode);
            if (this.useAnim) {
                var anim = fx.fadeIn({node:this._lastAddedItem.domNode, duration:this.duration, easing:this.easingIn}).play();
            }
            this._items[this._lastAddedItem.index] = this._lastAddedItem;
            if (this._onChangeActive && this.intermediateChanges) {
                this.onChange(value);
            }
            if (this._count >= this.maxItems && this.maxItems !== null) {
                break;
            }
        }
        this._updateValues();
        if (this._lastValueReported.length == 0) {
            this._lastValueReported = this.value;
        }
        if (!this.readOnlyInput) {
            this._input.set("value", "");
        }
        if (this._onChangeActive) {
            this.onChange(this.value);
        }
        this._setReadOnlyWhenMaxItemsReached();
    }, _setReadOnlyWhenMaxItemsReached:function () {
        this.set("readOnlyInput", (this._count >= this.maxItems && this.maxItems !== null));
    }, _setSelectNode:function () {
        this._selectNode.options.length = 0;
        var values = this.submitOnlyValidValue ? this.get("MatchedValue") : this.value;
        if (!lang.isArray(values)) {
            return;
        }
        array.forEach(values, function (item) {
            this._selectNode.options[this._selectNode.options.length] = new Option(item, item, true, true);
        }, this);
    }, _placeItem:function (node) {
        domConstruct.place(node, this._inputNode, "before");
    }, _getCursorPos:function (node) {
        if (typeof node.selectionStart != "undefined") {
            return node.selectionStart;
        }
        try {
            node.focus();
        }
        catch (e) {
        }
        var range = node.createTextRange();
        range.moveToBookmark(win.doc.selection.createRange().getBookmark());
        range.moveEnd("character", node.value.length);
        try {
            return node.value.length - range.text.length;
        }
        finally {
            range = null;
        }
    }, _onItemClose:function (item) {
        if (this.disabled) {
            return;
        }
        if (this.useAnim) {
            var anim = fx.fadeOut({node:item.domNode, duration:this.duration, easing:this.easingOut, onEnd:lang.hitch(this, "_destroyItem", item)}).play();
        } else {
            this._destroyItem(item);
        }
    }, _onItemKeyDown:function (item, e) {
        if (this.readOnlyItem || !this.useArrowForEdit) {
            return;
        }
        if (e.keyCode == keys.LEFT_ARROW && this._getCursorPos(e.target) == 0) {
            this._editBefore(item);
        } else {
            if (e.keyCode == keys.RIGHT_ARROW && this._getCursorPos(e.target) == e.target.value.length) {
                this._editAfter(item);
            }
        }
    }, _editBefore:function (item) {
        this._currentItem = this._getPreviousItem(item);
        if (this._currentItem !== null) {
            this._currentItem.edit();
        }
    }, _editAfter:function (item) {
        this._currentItem = this._getNextItem(item);
        if (this._currentItem !== null) {
            this._currentItem.edit();
        }
        if (!this.readOnlyInput) {
            if (this._currentItem === null) {
                this._focusInput();
            }
        }
    }, _onItemChange:function (item, value) {
        value = value || item.get("value");
        this._testItem(item, value);
        this._updateValues();
    }, _onItemEdit:function (item) {
        domClass.remove(item.domNode, ["dijitError", this.baseClass + "Match", this.baseClass + "Mismatch"]);
    }, _testItem:function (item, value) {
        var re = new RegExp(this.regExpGen(this.constraints));
        var match = ("" + value).match(re);
        domClass.remove(item.domNode, this.baseClass + (!match ? "Match" : "Mismatch"));
        domClass.add(item.domNode, this.baseClass + (match ? "Match" : "Mismatch"));
        domClass.toggle(item.domNode, "dijitError", !match);
        if ((this.showCloseButtonWhenValid && match) || (this.showCloseButtonWhenInvalid && !match)) {
            domClass.add(item.domNode, this.baseClass + "Closable");
        } else {
            domClass.remove(item.domNode, this.baseClass + "Closable");
        }
    }, _getValueAttr:function () {
        return this.value;
    }, _setValueAttr:function (newValue) {
        this._destroyAllItems();
        this.add(this._parseValue(newValue));
    }, _parseValue:function (newValue) {
        if (typeof newValue == "string") {
            if (lang.isString(this.delimiter)) {
                this.delimiter = [this.delimiter];
            }
            var re = new RegExp("^.*(" + this.delimiter.join("|") + ").*");
            if (newValue.match(re)) {
                re = new RegExp(this.delimiter.join("|"));
                return newValue.split(re);
            }
        }
        return newValue;
    }, regExpGen:function (constraints) {
        return this.regExp;
    }, _setDisabledAttr:function (value) {
        if (!this.readOnlyItem) {
            for (var i in this._items) {
                this._items[i].set("disabled", value);
            }
        }
        if (!this.readOnlyInput) {
            this._input.set("disabled", value);
        }
        this.inherited(arguments);
    }, _onHandler:function (value) {
        var parsedValue = this._parseValue(value);
        if (lang.isArray(parsedValue)) {
            this.add(parsedValue);
        }
    }, _onClick:function (e) {
        this._focusInput();
    }, _focusInput:function () {
        if (!this.readOnlyInput && this._input.focus) {
            this._input.focus();
        }
    }, _inputOnKeyDown:function (e) {
        this._currentItem = null;
        var val = this._input.get("value");
        if (e.keyCode == keys.BACKSPACE && val == "" && this.get("lastItem")) {
            this._destroyItem(this.get("lastItem"));
        } else {
            if (e.keyCode == keys.ENTER && val != "") {
                this.add(val);
            } else {
                if (e.keyCode == keys.LEFT_ARROW && this._getCursorPos(this._input.focusNode) == 0 && !this.readOnlyItem && this.useArrowForEdit) {
                    this._editBefore();
                }
            }
        }
    }, _inputOnBlur:function () {
        var val = this._input.get("value");
        if (this.useOnBlur && val != "") {
            this.add(val);
        }
    }, _getMatchedValueAttr:function () {
        return this._getValues(lang.hitch(this, this._matchValidator));
    }, _getMismatchedValueAttr:function () {
        return this._getValues(lang.hitch(this, this._mismatchValidator));
    }, _getValues:function (validator) {
        var value = [];
        validator = validator || this._nullValidator;
        for (var i in this._items) {
            var item = this._items[i];
            if (item === null) {
                continue;
            }
            var itemValue = item.get("value");
            if (validator(itemValue)) {
                value.push(itemValue);
            }
        }
        return value;
    }, _nullValidator:function (itemValue) {
        return true;
    }, _matchValidator:function (itemValue) {
        var re = new RegExp(this.regExpGen(this.constraints));
        return itemValue.match(re);
    }, _mismatchValidator:function (itemValue) {
        var re = new RegExp(this.regExpGen(this.constraints));
        return !(itemValue.match(re));
    }, _getLastItemAttr:function () {
        return this._getSomeItem();
    }, _getSomeItem:function (item, position) {
        item = item || false;
        position = position || "last";
        var lastItem = null;
        var stop = -1;
        for (var i in this._items) {
            if (this._items[i] === null) {
                continue;
            }
            if (position == "before" && this._items[i] === item) {
                break;
            }
            lastItem = this._items[i];
            if (position == "first" || stop == 0) {
                stop = 1;
                break;
            }
            if (position == "after" && this._items[i] === item) {
                stop = 0;
            }
        }
        if (position == "after" && stop == 0) {
            lastItem = null;
        }
        return lastItem;
    }, _getPreviousItem:function (item) {
        return this._getSomeItem(item, "before");
    }, _getNextItem:function (item) {
        return this._getSomeItem(item, "after");
    }, _destroyItem:function (item, updateValue) {
        this._items[item.index] = null;
        item.destroy();
        this._count--;
        if (updateValue !== false) {
            this._updateValues();
            this._setReadOnlyWhenMaxItemsReached();
        }
    }, _updateValues:function () {
        this.value = this._getValues();
        this._setSelectNode();
    }, _destroyAllItems:function () {
        for (var i in this._items) {
            if (this._items[i] == null) {
                continue;
            }
            this._destroyItem(this._items[i], false);
        }
        this._items = [];
        this._count = 0;
        this.value = null;
        this._setSelectNode();
        this._setReadOnlyWhenMaxItemsReached();
    }, destroy:function () {
        this._destroyAllItems();
        this._lastAddedItem = null;
        if (!this._input) {
            this._input.destroy();
        }
        this.inherited(arguments);
    }});
    var _ListInputInputItem = declare("dojox.form._ListInputInputItem", [Widget, TemplatedMixin], {templateString:"<li class=\"dijit dijitReset dijitLeft dojoxListInputItem\" dojoAttachEvent=\"onclick: onClick\" ><span dojoAttachPoint=\"labelNode\"></span></li>", closeButtonNode:null, readOnlyItem:true, baseClass:"dojoxListInputItem", value:"", regExp:".*", _editBox:null, _handleKeyDown:null, attributeMap:{value:{node:"labelNode", type:"innerHTML"}}, postMixInProperties:function () {
        var _nlsResources = i18nCommon;
        lang.mixin(this, _nlsResources);
        this.inherited(arguments);
    }, postCreate:function () {
        this.inherited(arguments);
        this.closeButtonNode = domConstruct.create("span", {"class":"dijitButtonNode dijitDialogCloseIcon", title:this.itemClose, onclick:lang.hitch(this, "onClose"), onmouseenter:lang.hitch(this, "_onCloseEnter"), onmouseleave:lang.hitch(this, "_onCloseLeave")}, this.domNode);
        domConstruct.create("span", {"class":"closeText", title:this.itemClose, innerHTML:"x"}, this.closeButtonNode);
    }, startup:function () {
        this.inherited(arguments);
        this._createInlineEditBox();
    }, _setReadOnlyItemAttr:function (value) {
        this.readOnlyItem = value;
        if (!value) {
            this._createInlineEditBox();
        } else {
            if (this._editBox) {
                this._editBox.set("disabled", true);
            }
        }
    }, _createInlineEditBox:function () {
        if (this.readOnlyItem) {
            return;
        }
        if (!this._started) {
            return;
        }
        if (this._editBox) {
            this._editBox.set("disabled", false);
            return;
        }
        this._editBox = new InlineEditBox({value:this.value, editor:"dijit.form.ValidationTextBox", editorParams:{regExp:this.regExp}}, this.labelNode);
        this.connect(this._editBox, "edit", "_onEdit");
        this.connect(this._editBox, "onChange", "_onCloseEdit");
        this.connect(this._editBox, "onCancel", "_onCloseEdit");
    }, edit:function () {
        if (!this.readOnlyItem) {
            this._editBox.edit();
        }
    }, _onCloseEdit:function (value) {
        domClass.remove(this.closeButtonNode, this.baseClass + "Edited");
        connect.disconnect(this._handleKeyDown);
        this.onChange(value);
    }, _onEdit:function () {
        domClass.add(this.closeButtonNode, this.baseClass + "Edited");
        this._handleKeyDown = connect.connect(this._editBox.editWidget, "_onKeyPress", this, "onKeyDown");
        this.onEdit();
    }, _setDisabledAttr:function (value) {
        if (!this.readOnlyItem) {
            this._editBox.set("disabled", value);
        }
    }, _getValueAttr:function () {
        return (!this.readOnlyItem && this._started ? this._editBox.get("value") : this.value);
    }, destroy:function () {
        if (this._editBox) {
            this._editBox.destroy();
        }
        this.inherited(arguments);
    }, _onCloseEnter:function () {
        domClass.add(this.closeButtonNode, "dijitDialogCloseIcon-hover");
    }, _onCloseLeave:function () {
        domClass.remove(this.closeButtonNode, "dijitDialogCloseIcon-hover");
    }, onClose:function () {
    }, onEdit:function () {
    }, onClick:function () {
    }, onChange:function (value) {
    }, onKeyDown:function (value) {
    }});
    var _ListInputInputBox = declare("dojox.form._ListInputInputBox", [ValidationTextBox], {minWidth:50, intermediateChanges:true, regExp:".*", _sizer:null, onChange:function (value) {
        this.inherited(arguments);
        if (this._sizer === null) {
            this._sizer = domConstruct.create("div", {style:{position:"absolute", left:"-10000px", top:"-10000px"}}, win.body());
        }
        this._sizer.innerHTML = value;
        var w = domGeometry.getContentBox(this._sizer).w + this.minWidth;
        domGeometry.setContentSize(this.domNode, {w:w});
    }, destroy:function () {
        domConstruct.destroy(this._sizer);
        this.inherited(arguments);
    }});
    return ListInput;
});

