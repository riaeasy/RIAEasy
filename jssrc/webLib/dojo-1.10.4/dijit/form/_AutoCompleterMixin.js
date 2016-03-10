//>>built

define("dijit/form/_AutoCompleterMixin", ["dojo/aspect", "dojo/_base/declare", "dojo/dom-attr", "dojo/keys", "dojo/_base/lang", "dojo/query", "dojo/regexp", "dojo/sniff", "./DataList", "./_TextBoxMixin", "./_SearchMixin"], function (aspect, declare, domAttr, keys, lang, query, regexp, has, DataList, _TextBoxMixin, SearchMixin) {
    var AutoCompleterMixin = declare("dijit.form._AutoCompleterMixin", SearchMixin, {item:null, autoComplete:true, highlightMatch:"first", labelAttr:"", labelType:"text", maxHeight:-1, _stopClickEvents:false, _getCaretPos:function (element) {
        var pos = 0;
        if (typeof (element.selectionStart) == "number") {
            pos = element.selectionStart;
        } else {
            if (has("ie")) {
                var tr = element.ownerDocument.selection.createRange().duplicate();
                var ntr = element.createTextRange();
                tr.move("character", 0);
                ntr.move("character", 0);
                try {
                    ntr.setEndPoint("EndToEnd", tr);
                    pos = String(ntr.text).replace(/\r/g, "").length;
                }
                catch (e) {
                }
            }
        }
        return pos;
    }, _setCaretPos:function (element, location) {
        location = parseInt(location);
        _TextBoxMixin.selectInputText(element, location, location);
    }, _setDisabledAttr:function (value) {
        this.inherited(arguments);
        this.domNode.setAttribute("aria-disabled", value ? "true" : "false");
    }, _onKey:function (evt) {
        if (evt.charCode >= 32) {
            return;
        }
        var key = evt.charCode || evt.keyCode;
        if (key == keys.ALT || key == keys.CTRL || key == keys.META || key == keys.SHIFT) {
            return;
        }
        var pw = this.dropDown;
        var highlighted = null;
        this._abortQuery();
        this.inherited(arguments);
        if (evt.altKey || evt.ctrlKey || evt.metaKey) {
            return;
        }
        if (this._opened) {
            highlighted = pw.getHighlightedOption();
        }
        switch (key) {
          case keys.PAGE_DOWN:
          case keys.DOWN_ARROW:
          case keys.PAGE_UP:
          case keys.UP_ARROW:
            if (this._opened) {
                this._announceOption(highlighted);
            }
            evt.stopPropagation();
            evt.preventDefault();
            break;
          case keys.ENTER:
            if (highlighted) {
                if (highlighted == pw.nextButton) {
                    this._nextSearch(1);
                    evt.stopPropagation();
                    evt.preventDefault();
                    break;
                } else {
                    if (highlighted == pw.previousButton) {
                        this._nextSearch(-1);
                        evt.stopPropagation();
                        evt.preventDefault();
                        break;
                    }
                }
                evt.stopPropagation();
                evt.preventDefault();
            } else {
                this._setBlurValue();
                this._setCaretPos(this.focusNode, this.focusNode.value.length);
            }
          case keys.TAB:
            var newvalue = this.get("displayedValue");
            if (pw && (newvalue == pw._messages["previousMessage"] || newvalue == pw._messages["nextMessage"])) {
                break;
            }
            if (highlighted) {
                this._selectOption(highlighted);
            }
          case keys.ESCAPE:
            if (this._opened) {
                this._lastQuery = null;
                this.closeDropDown();
            }
            break;
        }
    }, _autoCompleteText:function (text) {
        var fn = this.focusNode;
        _TextBoxMixin.selectInputText(fn, fn.value.length);
        var caseFilter = this.ignoreCase ? "toLowerCase" : "substr";
        if (text[caseFilter](0).indexOf(this.focusNode.value[caseFilter](0)) == 0) {
            var cpos = this.autoComplete ? this._getCaretPos(fn) : fn.value.length;
            if ((cpos + 1) > fn.value.length) {
                fn.value = text;
                _TextBoxMixin.selectInputText(fn, cpos);
            }
        } else {
            fn.value = text;
            _TextBoxMixin.selectInputText(fn);
        }
    }, _openResultList:function (results, query, options) {
        var wasSelected = this.dropDown.getHighlightedOption();
        this.dropDown.clearResultList();
        if (!results.length && options.start == 0) {
            this.closeDropDown();
            return;
        }
        this._nextSearch = this.dropDown.onPage = lang.hitch(this, function (direction) {
            results.nextPage(direction !== -1);
            this.focus();
        });
        this.dropDown.createOptions(results, options, lang.hitch(this, "_getMenuLabelFromItem"));
        this._showResultList();
        if ("direction" in options) {
            if (options.direction) {
                this.dropDown.highlightFirstOption();
            } else {
                if (!options.direction) {
                    this.dropDown.highlightLastOption();
                }
            }
            if (wasSelected) {
                this._announceOption(this.dropDown.getHighlightedOption());
            }
        } else {
            if (this.autoComplete && !this._prev_key_backspace && !/^[*]+$/.test(query[this.searchAttr].toString())) {
                this._announceOption(this.dropDown.containerNode.firstChild.nextSibling);
            }
        }
    }, _showResultList:function () {
        this.closeDropDown(true);
        this.openDropDown();
        this.domNode.setAttribute("aria-expanded", "true");
    }, loadDropDown:function () {
        this._startSearchAll();
    }, isLoaded:function () {
        return false;
    }, closeDropDown:function () {
        this._abortQuery();
        if (this._opened) {
            this.inherited(arguments);
            this.domNode.setAttribute("aria-expanded", "false");
        }
    }, _setBlurValue:function () {
        var newvalue = this.get("displayedValue");
        var pw = this.dropDown;
        if (pw && (newvalue == pw._messages["previousMessage"] || newvalue == pw._messages["nextMessage"])) {
            this._setValueAttr(this._lastValueReported, true);
        } else {
            if (typeof this.item == "undefined") {
                this.item = null;
                this.set("displayedValue", newvalue);
            } else {
                if (this.value != this._lastValueReported) {
                    this._handleOnChange(this.value, true);
                }
                this._refreshState();
            }
        }
        this.focusNode.removeAttribute("aria-activedescendant");
    }, _setItemAttr:function (item, priorityChange, displayedValue) {
        var value = "";
        if (item) {
            if (!displayedValue) {
                displayedValue = this.store._oldAPI ? this.store.getValue(item, this.searchAttr) : item[this.searchAttr];
            }
            value = this._getValueField() != this.searchAttr ? this.store.getIdentity(item) : displayedValue;
        }
        this.set("value", value, priorityChange, displayedValue, item);
    }, _announceOption:function (node) {
        if (!node) {
            return;
        }
        var newValue;
        if (node == this.dropDown.nextButton || node == this.dropDown.previousButton) {
            newValue = node.innerHTML;
            this.item = undefined;
            this.value = "";
        } else {
            var item = this.dropDown.items[node.getAttribute("item")];
            newValue = (this.store._oldAPI ? this.store.getValue(item, this.searchAttr) : item[this.searchAttr]).toString();
            this.set("item", item, false, newValue);
        }
        this.focusNode.value = this.focusNode.value.substring(0, this._lastInput.length);
        this.focusNode.setAttribute("aria-activedescendant", domAttr.get(node, "id"));
        this._autoCompleteText(newValue);
    }, _selectOption:function (target) {
        this.closeDropDown();
        if (target) {
            this._announceOption(target);
        }
        this._setCaretPos(this.focusNode, this.focusNode.value.length);
        this._handleOnChange(this.value, true);
        this.focusNode.removeAttribute("aria-activedescendant");
    }, _startSearchAll:function () {
        this._startSearch("");
    }, _startSearchFromInput:function () {
        this.item = undefined;
        this.inherited(arguments);
    }, _startSearch:function (key) {
        if (!this.dropDown) {
            var popupId = this.id + "_popup", dropDownConstructor = lang.isString(this.dropDownClass) ? lang.getObject(this.dropDownClass, false) : this.dropDownClass;
            this.dropDown = new dropDownConstructor({onChange:lang.hitch(this, this._selectOption), id:popupId, dir:this.dir, textDir:this.textDir});
        }
        this._lastInput = key;
        this.inherited(arguments);
    }, _getValueField:function () {
        return this.searchAttr;
    }, postMixInProperties:function () {
        this.inherited(arguments);
        if (!this.store && this.srcNodeRef) {
            var srcNodeRef = this.srcNodeRef;
            this.store = new DataList({}, srcNodeRef);
            if (!("value" in this.params)) {
                var item = (this.item = this.store.fetchSelectedItem());
                if (item) {
                    var valueField = this._getValueField();
                    this.value = this.store._oldAPI ? this.store.getValue(item, valueField) : item[valueField];
                }
            }
        }
    }, postCreate:function () {
        var label = query("label[for=\"" + this.id + "\"]");
        if (label.length) {
            if (!label[0].id) {
                label[0].id = this.id + "_label";
            }
            this.domNode.setAttribute("aria-labelledby", label[0].id);
        }
        this.inherited(arguments);
        aspect.after(this, "onSearch", lang.hitch(this, "_openResultList"), true);
    }, _getMenuLabelFromItem:function (item) {
        var label = this.labelFunc(item, this.store), labelType = this.labelType;
        if (this.highlightMatch != "none" && this.labelType == "text" && this._lastInput) {
            label = this.doHighlight(label, this._lastInput);
            labelType = "html";
        }
        return {html:labelType == "html", label:label};
    }, doHighlight:function (label, find) {
        var modifiers = (this.ignoreCase ? "i" : "") + (this.highlightMatch == "all" ? "g" : ""), i = this.queryExpr.indexOf("${0}");
        find = regexp.escapeString(find);
        return this._escapeHtml(label.replace(new RegExp((i == 0 ? "^" : "") + "(" + find + ")" + (i == (this.queryExpr.length - 4) ? "$" : ""), modifiers), "\uffff$1\uffff")).replace(/\uFFFF([^\uFFFF]+)\uFFFF/g, "<span class=\"dijitComboBoxHighlightMatch\">$1</span>");
    }, _escapeHtml:function (str) {
        str = String(str).replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");
        return str;
    }, reset:function () {
        this.item = null;
        this.inherited(arguments);
    }, labelFunc:function (item, store) {
        return (store._oldAPI ? store.getValue(item, this.labelAttr || this.searchAttr) : item[this.labelAttr || this.searchAttr]).toString();
    }, _setValueAttr:function (value, priorityChange, displayedValue, item) {
        this._set("item", item || null);
        if (value == null) {
            value = "";
        }
        this.inherited(arguments);
    }});
    if (0) {
        AutoCompleterMixin.extend({_setTextDirAttr:function (textDir) {
            this.inherited(arguments);
            if (this.dropDown) {
                this.dropDown._set("textDir", textDir);
            }
        }});
    }
    return AutoCompleterMixin;
});

