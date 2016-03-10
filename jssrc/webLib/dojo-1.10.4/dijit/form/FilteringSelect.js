//>>built

define("dijit/form/FilteringSelect", ["dojo/_base/declare", "dojo/_base/lang", "dojo/when", "./MappedTextBox", "./ComboBoxMixin"], function (declare, lang, when, MappedTextBox, ComboBoxMixin) {
    return declare("dijit.form.FilteringSelect", [MappedTextBox, ComboBoxMixin], {required:true, _lastDisplayedValue:"", _isValidSubset:function () {
        return this._opened;
    }, isValid:function () {
        return !!this.item || (!this.required && this.get("displayedValue") == "");
    }, _refreshState:function () {
        if (!this.searchTimer) {
            this.inherited(arguments);
        }
    }, _callbackSetLabel:function (result, query, options, priorityChange) {
        if ((query && query[this.searchAttr] !== this._lastQuery) || (!query && result.length && this.store.getIdentity(result[0]) != this._lastQuery)) {
            return;
        }
        if (!result.length) {
            this.set("value", "", priorityChange || (priorityChange === undefined && !this.focused), this.textbox.value, null);
        } else {
            this.set("item", result[0], priorityChange);
        }
    }, _openResultList:function (results, query, options) {
        if (query[this.searchAttr] !== this._lastQuery) {
            return;
        }
        this.inherited(arguments);
        if (this.item === undefined) {
            this.validate(true);
        }
    }, _getValueAttr:function () {
        return this.valueNode.value;
    }, _getValueField:function () {
        return "value";
    }, _setValueAttr:function (value, priorityChange, displayedValue, item) {
        if (!this._onChangeActive) {
            priorityChange = null;
        }
        if (item === undefined) {
            if (value === null || value === "") {
                value = "";
                if (!lang.isString(displayedValue)) {
                    this._setDisplayedValueAttr(displayedValue || "", priorityChange);
                    return;
                }
            }
            var self = this;
            this._lastQuery = value;
            when(this.store.get(value), function (item) {
                self._callbackSetLabel(item ? [item] : [], undefined, undefined, priorityChange);
            });
        } else {
            this.valueNode.value = value;
            this.inherited(arguments, [value, priorityChange, displayedValue, item]);
        }
    }, _setItemAttr:function (item, priorityChange, displayedValue) {
        this.inherited(arguments);
        this._lastDisplayedValue = this.textbox.value;
    }, _getDisplayQueryString:function (text) {
        return text.replace(/([\\\*\?])/g, "\\$1");
    }, _setDisplayedValueAttr:function (label, priorityChange) {
        if (label == null) {
            label = "";
        }
        if (!this._created) {
            if (!("displayedValue" in this.params)) {
                return;
            }
            priorityChange = false;
        }
        if (this.store) {
            this.closeDropDown();
            var query = lang.clone(this.query);
            var qs = this._getDisplayQueryString(label), q;
            if (this.store._oldAPI) {
                q = qs;
            } else {
                q = this._patternToRegExp(qs);
                q.toString = function () {
                    return qs;
                };
            }
            this._lastQuery = query[this.searchAttr] = q;
            this.textbox.value = label;
            this._lastDisplayedValue = label;
            this._set("displayedValue", label);
            var _this = this;
            var options = {queryOptions:{ignoreCase:this.ignoreCase, deep:true}};
            lang.mixin(options, this.fetchProperties);
            this._fetchHandle = this.store.query(query, options);
            when(this._fetchHandle, function (result) {
                _this._fetchHandle = null;
                _this._callbackSetLabel(result || [], query, options, priorityChange);
            }, function (err) {
                _this._fetchHandle = null;
                if (!_this._cancelingQuery) {
                    console.error("dijit.form.FilteringSelect: " + err.toString());
                }
            });
        }
    }, undo:function () {
        this.set("displayedValue", this._lastDisplayedValue);
    }});
});

