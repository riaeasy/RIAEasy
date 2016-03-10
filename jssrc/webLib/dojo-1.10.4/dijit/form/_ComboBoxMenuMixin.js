//>>built

define("dijit/form/_ComboBoxMenuMixin", ["dojo/_base/array", "dojo/_base/declare", "dojo/dom-attr", "dojo/has", "dojo/i18n", "dojo/i18n!./nls/ComboBox"], function (array, declare, domAttr, has, i18n) {
    var ComboBoxMenuMixin = declare("dijit.form._ComboBoxMenuMixin" + (0 ? "_NoBidi" : ""), null, {_messages:null, postMixInProperties:function () {
        this.inherited(arguments);
        this._messages = i18n.getLocalization("dijit.form", "ComboBox", this.lang);
    }, buildRendering:function () {
        this.inherited(arguments);
        this.previousButton.innerHTML = this._messages["previousMessage"];
        this.nextButton.innerHTML = this._messages["nextMessage"];
    }, _setValueAttr:function (value) {
        this._set("value", value);
        this.onChange(value);
    }, onClick:function (node) {
        if (node == this.previousButton) {
            this._setSelectedAttr(null);
            this.onPage(-1);
        } else {
            if (node == this.nextButton) {
                this._setSelectedAttr(null);
                this.onPage(1);
            } else {
                this.onChange(node);
            }
        }
    }, onChange:function () {
    }, onPage:function () {
    }, onClose:function () {
        this._setSelectedAttr(null);
    }, _createOption:function (item, labelFunc) {
        var menuitem = this._createMenuItem();
        var labelObject = labelFunc(item);
        if (labelObject.html) {
            menuitem.innerHTML = labelObject.label;
        } else {
            menuitem.appendChild(menuitem.ownerDocument.createTextNode(labelObject.label));
        }
        if (menuitem.innerHTML == "") {
            menuitem.innerHTML = "&#160;";
        }
        return menuitem;
    }, createOptions:function (results, options, labelFunc) {
        this.items = results;
        this.previousButton.style.display = (options.start == 0) ? "none" : "";
        domAttr.set(this.previousButton, "id", this.id + "_prev");
        array.forEach(results, function (item, i) {
            var menuitem = this._createOption(item, labelFunc);
            menuitem.setAttribute("item", i);
            domAttr.set(menuitem, "id", this.id + i);
            this.nextButton.parentNode.insertBefore(menuitem, this.nextButton);
        }, this);
        var displayMore = false;
        if (results.total && !results.total.then && results.total != -1) {
            if ((options.start + options.count) < results.total) {
                displayMore = true;
            } else {
                if ((options.start + options.count) > results.total && options.count == results.length) {
                    displayMore = true;
                }
            }
        } else {
            if (options.count == results.length) {
                displayMore = true;
            }
        }
        this.nextButton.style.display = displayMore ? "" : "none";
        domAttr.set(this.nextButton, "id", this.id + "_next");
    }, clearResultList:function () {
        var container = this.containerNode;
        while (container.childNodes.length > 2) {
            container.removeChild(container.childNodes[container.childNodes.length - 2]);
        }
        this._setSelectedAttr(null);
    }, highlightFirstOption:function () {
        this.selectFirstNode();
    }, highlightLastOption:function () {
        this.selectLastNode();
    }, selectFirstNode:function () {
        this.inherited(arguments);
        if (this.getHighlightedOption() == this.previousButton) {
            this.selectNextNode();
        }
    }, selectLastNode:function () {
        this.inherited(arguments);
        if (this.getHighlightedOption() == this.nextButton) {
            this.selectPreviousNode();
        }
    }, getHighlightedOption:function () {
        return this.selected;
    }});
    if (0) {
        ComboBoxMenuMixin = declare("dijit.form._ComboBoxMenuMixin", ComboBoxMenuMixin, {_createOption:function () {
            var menuitem = this.inherited(arguments);
            this.applyTextDir(menuitem);
            return menuitem;
        }});
    }
    return ComboBoxMenuMixin;
});

