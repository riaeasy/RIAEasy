//>>built

define("dojox/grid/enhanced/plugins/_SelectionPreserver", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/connect", "../../_SelectionPreserver"], function (declare, lang, connect, _SelectionPreserver) {
    return declare("dojox.grid.enhanced.plugins._SelectionPreserver", _SelectionPreserver, {constructor:function (selection) {
        var grid = this.grid;
        grid.onSelectedById = this.onSelectedById;
        this._oldClearData = grid._clearData;
        var self = this;
        grid._clearData = function () {
            self._updateMapping(!grid._noInternalMapping);
            self._trustSelection = [];
            self._oldClearData.apply(grid, arguments);
        };
        this._connects.push(connect.connect(selection, "selectRange", lang.hitch(this, "_updateMapping", true, true, false)), connect.connect(selection, "deselectRange", lang.hitch(this, "_updateMapping", true, false, false)), connect.connect(selection, "deselectAll", lang.hitch(this, "_updateMapping", true, false, true)));
    }, destroy:function () {
        this.inherited(arguments);
        this.grid._clearData = this._oldClearData;
    }, reset:function () {
        this.inherited(arguments);
        this._idMap = [];
        this._trustSelection = [];
        this._defaultSelected = false;
    }, _reSelectById:function (item, index) {
        var s = this.selection, g = this.grid;
        if (item && g._hasIdentity) {
            var id = g.store.getIdentity(item);
            if (this._selectedById[id] === undefined) {
                if (!this._trustSelection[index]) {
                    s.selected[index] = this._defaultSelected;
                }
            } else {
                s.selected[index] = this._selectedById[id];
            }
            this._idMap.push(id);
            g.onSelectedById(id, index, s.selected[index]);
        }
    }, _selectById:function (toSelect, inItemOrIndex) {
        if (!this.inherited(arguments)) {
            this._trustSelection[inItemOrIndex] = true;
        }
    }, onSelectedById:function (id, rowIndex, value) {
    }, _updateMapping:function (trustSelection, isSelect, isForAll, from, to) {
        var s = this.selection, g = this.grid, flag = 0, unloaded = 0, i, id;
        for (i = g.rowCount - 1; i >= 0; --i) {
            if (!g._by_idx[i]) {
                ++unloaded;
                flag += s.selected[i] ? 1 : -1;
            } else {
                id = g._by_idx[i].idty;
                if (id && (trustSelection || this._selectedById[id] === undefined)) {
                    this._selectedById[id] = !!s.selected[i];
                }
            }
        }
        if (unloaded) {
            this._defaultSelected = flag > 0;
        }
        if (!isForAll && from !== undefined && to !== undefined) {
            isForAll = !g.usingPagination && Math.abs(to - from + 1) === g.rowCount;
        }
        if (isForAll && (!g.usingPagination || g.selectionMode === "single")) {
            for (i = this._idMap.length - 1; i >= 0; --i) {
                this._selectedById[this._idMap[i]] = isSelect;
            }
        }
    }});
});

