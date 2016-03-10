//>>built

define("dojox/grid/enhanced/plugins/CellMerge", ["dojo/_base/declare", "dojo/_base/array", "dojo/_base/lang", "dojo/_base/html", "../_Plugin", "../../EnhancedGrid"], function (declare, array, lang, html, _Plugin, EnhancedGrid) {
    var CellMerge = declare("dojox.grid.enhanced.plugins.CellMerge", _Plugin, {name:"cellMerge", constructor:function (grid, args) {
        this.grid = grid;
        this._records = [];
        this._merged = {};
        if (args && lang.isObject(args)) {
            this._setupConfig(args.mergedCells);
        }
        this._initEvents();
        this._mixinGrid();
    }, mergeCells:function (rowTester, startColumnIndex, endColumnIndex, majorColumnIndex) {
        var item = this._createRecord({"row":rowTester, "start":startColumnIndex, "end":endColumnIndex, "major":majorColumnIndex});
        if (item) {
            this._updateRows(item);
        }
        return item;
    }, unmergeCells:function (mergeHandler) {
        var idx;
        if (mergeHandler && (idx = array.indexOf(this._records, mergeHandler)) >= 0) {
            this._records.splice(idx, 1);
            this._updateRows(mergeHandler);
        }
    }, getMergedCells:function () {
        var res = [];
        for (var i in this._merged) {
            res = res.concat(this._merged[i]);
        }
        return res;
    }, getMergedCellsByRow:function (rowIndex) {
        return this._merged[rowIndex] || [];
    }, _setupConfig:function (config) {
        array.forEach(config, this._createRecord, this);
    }, _initEvents:function () {
        array.forEach(this.grid.views.views, function (view) {
            this.connect(view, "onAfterRow", lang.hitch(this, "_onAfterRow", view.index));
        }, this);
    }, _mixinGrid:function () {
        var g = this.grid;
        g.mergeCells = lang.hitch(this, "mergeCells");
        g.unmergeCells = lang.hitch(this, "unmergeCells");
        g.getMergedCells = lang.hitch(this, "getMergedCells");
        g.getMergedCellsByRow = lang.hitch(this, "getMergedCellsByRow");
    }, _getWidth:function (colIndex) {
        var node = this.grid.layout.cells[colIndex].getHeaderNode();
        return html.position(node).w;
    }, _onAfterRow:function (viewIdx, rowIndex, subrows) {
        try {
            if (rowIndex < 0) {
                return;
            }
            var result = [], i, j, len = this._records.length, cells = this.grid.layout.cells;
            for (i = 0; i < len; ++i) {
                var item = this._records[i];
                var storeItem = this.grid._by_idx[rowIndex];
                if (item.view == viewIdx && item.row(rowIndex, storeItem && storeItem.item, this.grid.store)) {
                    var res = {record:item, hiddenCells:[], totalWidth:0, majorNode:cells[item.major].getNode(rowIndex), majorHeaderNode:cells[item.major].getHeaderNode()};
                    for (j = item.start; j <= item.end; ++j) {
                        var w = this._getWidth(j, rowIndex);
                        res.totalWidth += w;
                        if (j != item.major) {
                            res.hiddenCells.push(cells[j].getNode(rowIndex));
                        }
                    }
                    if (subrows.length != 1 || res.totalWidth > 0) {
                        for (j = result.length - 1; j >= 0; --j) {
                            var r = result[j].record;
                            if ((r.start >= item.start && r.start <= item.end) || (r.end >= item.start && r.end <= item.end)) {
                                result.splice(j, 1);
                            }
                        }
                        result.push(res);
                    }
                }
            }
            this._merged[rowIndex] = [];
            array.forEach(result, function (res) {
                array.forEach(res.hiddenCells, function (node) {
                    html.style(node, "display", "none");
                });
                var pbm = html.marginBox(res.majorHeaderNode).w - html.contentBox(res.majorHeaderNode).w;
                var tw = res.totalWidth;
                if (!html.isWebKit) {
                    tw -= pbm;
                }
                html.style(res.majorNode, "width", tw + "px");
                res.majorNode.setAttribute("colspan", res.hiddenCells.length + 1);
                this._merged[rowIndex].push({"row":rowIndex, "start":res.record.start, "end":res.record.end, "major":res.record.major, "handle":res.record});
            }, this);
        }
        catch (e) {
            console.warn("CellMerge._onAfterRow() error: ", rowIndex, e);
        }
    }, _createRecord:function (item) {
        if (this._isValid(item)) {
            item = {"row":item.row, "start":item.start, "end":item.end, "major":item.major};
            var cells = this.grid.layout.cells;
            item.view = cells[item.start].view.index;
            item.major = typeof item.major == "number" && !isNaN(item.major) ? item.major : item.start;
            if (typeof item.row == "number") {
                var r = item.row;
                item.row = function (rowIndex) {
                    return rowIndex === r;
                };
            } else {
                if (typeof item.row == "string") {
                    var id = item.row;
                    item.row = function (rowIndex, storeItem, store) {
                        try {
                            if (store && storeItem && store.getFeatures()["dojo.data.api.Identity"]) {
                                return store.getIdentity(storeItem) == id;
                            }
                        }
                        catch (e) {
                            console.error(e);
                        }
                        return false;
                    };
                }
            }
            if (lang.isFunction(item.row)) {
                this._records.push(item);
                return item;
            }
        }
        return null;
    }, _isValid:function (item) {
        var cells = this.grid.layout.cells, colCount = cells.length;
        return (lang.isObject(item) && ("row" in item) && ("start" in item) && ("end" in item) && item.start >= 0 && item.start < colCount && item.end > item.start && item.end < colCount && cells[item.start].view.index == cells[item.end].view.index && cells[item.start].subrow == cells[item.end].subrow && !(typeof item.major == "number" && (item.major < item.start || item.major > item.end)));
    }, _updateRows:function (item) {
        var min = null;
        for (var i = 0, count = this.grid.rowCount; i < count; ++i) {
            var storeItem = this.grid._by_idx[i];
            if (storeItem && item.row(i, storeItem && storeItem.item, this.grid.store)) {
                this.grid.views.updateRow(i);
                if (min === null) {
                    min = i;
                }
            }
        }
        if (min >= 0) {
            this.grid.scroller.rowHeightChanged(min);
        }
    }});
    EnhancedGrid.registerPlugin(CellMerge);
    return CellMerge;
});

