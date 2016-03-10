//>>built

define("dijit/form/MultiSelect", ["dojo/_base/array", "dojo/_base/declare", "dojo/dom-geometry", "dojo/sniff", "dojo/query", "./_FormValueWidget", "dojo/NodeList-dom"], function (array, declare, domGeometry, has, query, _FormValueWidget) {
    var MultiSelect = declare("dijit.form.MultiSelect" + (0 ? "_NoBidi" : ""), _FormValueWidget, {size:7, baseClass:"dijitMultiSelect", templateString:"<select multiple='multiple' ${!nameAttrSetting} data-dojo-attach-point='containerNode,focusNode' data-dojo-attach-event='onchange: _onChange'></select>", addSelected:function (select) {
        select.getSelected().forEach(function (n) {
            this.containerNode.appendChild(n);
            this.domNode.scrollTop = this.domNode.offsetHeight;
            var oldscroll = select.domNode.scrollTop;
            select.domNode.scrollTop = 0;
            select.domNode.scrollTop = oldscroll;
        }, this);
        this._set("value", this.get("value"));
    }, getSelected:function () {
        return query("option", this.containerNode).filter(function (n) {
            return n.selected;
        });
    }, _getValueAttr:function () {
        return array.map(this.getSelected(), function (n) {
            return n.value;
        });
    }, multiple:true, _setMultipleAttr:function (val) {
    }, _setValueAttr:function (values) {
        if (has("android")) {
            query("option", this.containerNode).orphan().forEach(function (n) {
                var option = n.ownerDocument.createElement("option");
                option.value = n.value;
                option.selected = (array.indexOf(values, n.value) != -1);
                option.text = n.text;
                option.originalText = n.originalText;
                this.containerNode.appendChild(option);
            }, this);
        } else {
            query("option", this.containerNode).forEach(function (n) {
                n.selected = (array.indexOf(values, n.value) != -1);
            });
        }
        this.inherited(arguments);
    }, invertSelection:function (onChange) {
        var val = [];
        query("option", this.containerNode).forEach(function (n) {
            if (!n.selected) {
                val.push(n.value);
            }
        });
        this._setValueAttr(val, !(onChange === false || onChange == null));
    }, _onChange:function () {
        this._handleOnChange(this.get("value"), true);
    }, resize:function (size) {
        if (size) {
            domGeometry.setMarginBox(this.domNode, size);
        }
    }, postCreate:function () {
        this._set("value", this.get("value"));
        this.inherited(arguments);
    }});
    if (0) {
        MultiSelect = declare("dijit.form.MultiSelect", MultiSelect, {addSelected:function (select) {
            select.getSelected().forEach(function (n) {
                n.text = this.enforceTextDirWithUcc(this.restoreOriginalText(n), n.text);
            }, this);
            this.inherited(arguments);
        }, _setTextDirAttr:function (textDir) {
            if ((this.textDir != textDir || !this._created) && this.enforceTextDirWithUcc) {
                this._set("textDir", textDir);
                query("option", this.containerNode).forEach(function (option) {
                    if (!this._created && option.value === option.text) {
                        option.value = option.text;
                    }
                    option.text = this.enforceTextDirWithUcc(option, option.originalText || option.text);
                }, this);
            }
        }});
    }
    return MultiSelect;
});

