//>>built

define("dojox/grid/enhanced/plugins/Exporter", ["dojo/_base/declare", "dojo/_base/array", "dojo/_base/lang", "../_Plugin", "../../_RowSelector", "../../EnhancedGrid", "../../cells/_base"], function (declare, array, lang, _Plugin, _RowSelector, EnhancedGrid) {
    var gridCells = lang.getObject("dojox.grid.cells");
    var Exporter = declare("dojox.grid.enhanced.plugins.Exporter", _Plugin, {name:"exporter", constructor:function (grid, args) {
        this.grid = grid;
        this.formatter = (args && lang.isObject(args)) && args.exportFormatter;
        this._mixinGrid();
    }, _mixinGrid:function () {
        var g = this.grid;
        g.exportTo = lang.hitch(this, this.exportTo);
        g.exportGrid = lang.hitch(this, this.exportGrid);
        g.exportSelected = lang.hitch(this, this.exportSelected);
        g.setExportFormatter = lang.hitch(this, this.setExportFormatter);
    }, setExportFormatter:function (formatter) {
        this.formatter = formatter;
    }, exportGrid:function (type, args, onExported) {
        if (lang.isFunction(args)) {
            onExported = args;
            args = {};
        }
        if (!lang.isString(type) || !lang.isFunction(onExported)) {
            return;
        }
        args = args || {};
        var g = this.grid, _this = this, writer = this._getExportWriter(type, args.writerArgs), fetchArgs = (args.fetchArgs && lang.isObject(args.fetchArgs)) ? args.fetchArgs : {}, oldFunc = fetchArgs.onComplete;
        if (g.store) {
            fetchArgs.onComplete = function (items, request) {
                if (oldFunc) {
                    oldFunc(items, request);
                }
                onExported(_this._goThroughGridData(items, writer));
            };
            fetchArgs.sort = fetchArgs.sort || g.getSortProps();
            g._storeLayerFetch(fetchArgs);
        } else {
            var start = fetchArgs.start || 0, count = fetchArgs.count || -1, items = [];
            for (var i = start; i != start + count && i < g.rowCount; ++i) {
                items.push(g.getItem(i));
            }
            onExported(this._goThroughGridData(items, writer));
        }
    }, exportSelected:function (type, writerArgs, onExported) {
        if (!lang.isString(type)) {
            return "";
        }
        var writer = this._getExportWriter(type, writerArgs);
        return onExported(this._goThroughGridData(this.grid.selection.getSelected(), writer));
    }, _buildRow:function (arg_obj, writer) {
        var _this = this;
        array.forEach(arg_obj._views, function (view, vIdx) {
            arg_obj.view = view;
            arg_obj.viewIdx = vIdx;
            if (writer.beforeView(arg_obj)) {
                array.forEach(view.structure.cells, function (subrow, srIdx) {
                    arg_obj.subrow = subrow;
                    arg_obj.subrowIdx = srIdx;
                    if (writer.beforeSubrow(arg_obj)) {
                        array.forEach(subrow, function (cell, cIdx) {
                            if (arg_obj.isHeader && _this._isSpecialCol(cell)) {
                                arg_obj.spCols.push(cell.index);
                            }
                            arg_obj.cell = cell;
                            arg_obj.cellIdx = cIdx;
                            writer.handleCell(arg_obj);
                        });
                        writer.afterSubrow(arg_obj);
                    }
                });
                writer.afterView(arg_obj);
            }
        });
    }, _goThroughGridData:function (items, writer) {
        var grid = this.grid, views = array.filter(grid.views.views, function (view) {
            return !(view instanceof _RowSelector);
        }), arg_obj = {"grid":grid, "isHeader":true, "spCols":[], "_views":views, "colOffset":(views.length < grid.views.views.length ? -1 : 0)};
        if (writer.beforeHeader(grid)) {
            this._buildRow(arg_obj, writer);
            writer.afterHeader();
        }
        arg_obj.isHeader = false;
        if (writer.beforeContent(items)) {
            array.forEach(items, function (item, rIdx) {
                arg_obj.row = item;
                arg_obj.rowIdx = rIdx;
                if (writer.beforeContentRow(arg_obj)) {
                    this._buildRow(arg_obj, writer);
                    writer.afterContentRow(arg_obj);
                }
            }, this);
            writer.afterContent();
        }
        return writer.toString();
    }, _isSpecialCol:function (header_cell) {
        return header_cell.isRowSelector || header_cell instanceof gridCells.RowIndex;
    }, _getExportWriter:function (fileType, writerArgs) {
        var writerName, cls, expCls = Exporter;
        if (expCls.writerNames) {
            writerName = expCls.writerNames[fileType.toLowerCase()];
            cls = lang.getObject(writerName);
            if (cls) {
                var writer = new cls(writerArgs);
                writer.formatter = this.formatter;
                return writer;
            } else {
                throw new Error("Please make sure class \"" + writerName + "\" is required.");
            }
        }
        throw new Error("The writer for \"" + fileType + "\" has not been registered.");
    }});
    Exporter.registerWriter = function (fileType, writerClsName) {
        Exporter.writerNames = Exporter.writerNames || {};
        Exporter.writerNames[fileType] = writerClsName;
    };
    EnhancedGrid.registerPlugin(Exporter);
    return Exporter;
});

