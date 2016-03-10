//>>built

define("dojox/widget/Selection", ["dojo/_base/declare", "dojo/_base/array", "dojo/_base/lang", "dojo/Stateful"], function (declare, arr, lang, Stateful) {
    return declare("dojox.widget.Selection", Stateful, {constructor:function () {
        this.selectedItems = [];
    }, selectionMode:"single", _setSelectionModeAttr:function (value) {
        if (value != "none" && value != "single" && value != "multiple") {
            value = "single";
        }
        if (value != this.selectionMode) {
            this.selectionMode = value;
            if (value == "none") {
                this.set("selectedItems", null);
            } else {
                if (value == "single") {
                    this.set("selectedItem", this.selectedItem);
                }
            }
        }
    }, selectedItem:null, _setSelectedItemAttr:function (value) {
        if (this.selectedItem != value) {
            this._set("selectedItem", value);
            this.set("selectedItems", value ? [value] : null);
        }
    }, selectedItems:null, _setSelectedItemsAttr:function (value) {
        var oldSelectedItems = this.selectedItems;
        this.selectedItems = value;
        this.selectedItem = null;
        if (oldSelectedItems != null && oldSelectedItems.length > 0) {
            this.updateRenderers(oldSelectedItems, true);
        }
        if (this.selectedItems && this.selectedItems.length > 0) {
            this.selectedItem = this.selectedItems[0];
            this.updateRenderers(this.selectedItems, true);
        }
    }, _getSelectedItemsAttr:function () {
        return this.selectedItems == null ? [] : this.selectedItems.concat();
    }, isItemSelected:function (item) {
        if (this.selectedItems == null || this.selectedItems.length == 0) {
            return false;
        }
        return arr.some(this.selectedItems, lang.hitch(this, function (sitem) {
            return this.getIdentity(sitem) == this.getIdentity(item);
        }));
    }, getIdentity:function (item) {
    }, setItemSelected:function (item, value) {
        if (this.selectionMode == "none" || item == null) {
            return;
        }
        var sel = this.get("selectedItems");
        var old = this.get("selectedItems");
        if (this.selectionMode == "single") {
            if (value) {
                this.set("selectedItem", item);
            } else {
                if (this.isItemSelected(item)) {
                    this.set("selectedItems", null);
                }
            }
        } else {
            if (value) {
                if (this.isItemSelected(item)) {
                    return;
                }
                if (sel == null) {
                    sel = [item];
                } else {
                    sel.unshift(item);
                }
                this.set("selectedItems", sel);
            } else {
                var res = arr.filter(sel, function (sitem) {
                    return sitem.id != item.id;
                });
                if (res == null || res.length == sel.length) {
                    return;
                }
                this.set("selectedItems", res);
            }
        }
    }, selectFromEvent:function (e, item, renderer, dispatch) {
        if (this.selectionMode == "none") {
            return false;
        }
        var changed;
        var oldSelectedItem = this.get("selectedItem");
        var selected = item ? this.isItemSelected(item) : false;
        if (item == null) {
            if (!e.ctrlKey && this.selectedItem != null) {
                this.set("selectedItem", null);
                changed = true;
            }
        } else {
            if (this.selectionMode == "multiple") {
                if (e.ctrlKey) {
                    this.setItemSelected(item, !selected);
                    changed = true;
                } else {
                    this.set("selectedItem", item);
                    changed = true;
                }
            } else {
                if (e.ctrlKey) {
                    this.set("selectedItem", selected ? null : item);
                    changed = true;
                } else {
                    if (!selected) {
                        this.set("selectedItem", item);
                        changed = true;
                    }
                }
            }
        }
        if (dispatch && changed) {
            this.dispatchChange(oldSelectedItem, this.get("selectedItem"), renderer, e);
        }
        return changed;
    }, dispatchChange:function (oldSelectedItem, newSelectedItem, renderer, triggerEvent) {
        this.onChange({oldValue:oldSelectedItem, newValue:newSelectedItem, renderer:renderer, triggerEvent:triggerEvent});
    }, onChange:function () {
    }});
});

