//>>built

define("dojox/grid/_SelectionPreserver", ["dojo/_base/declare", "dojo/_base/connect", "dojo/_base/lang", "dojo/_base/array"], function (declare, connect, lang, array) {
    return declare("dojox.grid._SelectionPreserver", null, {constructor:function (selection) {
        this.selection = selection;
        var grid = this.grid = selection.grid;
        this.reset();
        this._connects = [connect.connect(grid, "_setStore", this, "reset"), connect.connect(grid, "_addItem", this, "_reSelectById"), connect.connect(selection, "onSelected", lang.hitch(this, "_selectById", true)), connect.connect(selection, "onDeselected", lang.hitch(this, "_selectById", false)), connect.connect(selection, "deselectAll", this, "reset")];
    }, destroy:function () {
        this.reset();
        array.forEach(this._connects, connect.disconnect);
        delete this._connects;
    }, reset:function () {
        this._selectedById = {};
    }, _reSelectById:function (item, index) {
        if (item && this.grid._hasIdentity) {
            this.selection.selected[index] = this._selectedById[this.grid.store.getIdentity(item)];
        }
    }, _selectById:function (toSelect, inItemOrIndex) {
        if (this.selection.mode == "none" || !this.grid._hasIdentity) {
            return;
        }
        var item = inItemOrIndex, g = this.grid;
        if (typeof inItemOrIndex == "number" || typeof inItemOrIndex == "string") {
            var entry = g._by_idx[inItemOrIndex];
            item = entry && entry.item;
        }
        if (item) {
            this._selectedById[g.store.getIdentity(item)] = !!toSelect;
        }
        return item;
    }});
});

