//>>built

define("dojox/grid/enhanced/plugins/Cookie", ["dojo/_base/declare", "dojo/_base/array", "dojo/_base/lang", "dojo/_base/sniff", "dojo/_base/html", "dojo/_base/json", "dojo/_base/window", "dojo/_base/unload", "dojo/cookie", "../_Plugin", "../../_RowSelector", "../../EnhancedGrid", "../../cells/_base"], function (declare, array, lang, has, html, json, win, unload, cookie, _Plugin, _RowSelector, EnhancedGrid) {
    var gridCells = lang.getObject("dojox.grid.cells");
    var _cookieKeyBuilder = function (grid) {
        return window.location + "/" + grid.id;
    };
    var _getCellsFromStructure = function (structure) {
        var cells = [];
        if (!lang.isArray(structure)) {
            structure = [structure];
        }
        array.forEach(structure, function (viewDef) {
            if (lang.isArray(viewDef)) {
                viewDef = {"cells":viewDef};
            }
            var rows = viewDef.rows || viewDef.cells;
            if (lang.isArray(rows)) {
                if (!lang.isArray(rows[0])) {
                    rows = [rows];
                }
                array.forEach(rows, function (row) {
                    if (lang.isArray(row)) {
                        array.forEach(row, function (cell) {
                            cells.push(cell);
                        });
                    }
                });
            }
        });
        return cells;
    };
    var _loadColWidth = function (colWidths, grid) {
        if (lang.isArray(colWidths)) {
            var oldFunc = grid._setStructureAttr;
            grid._setStructureAttr = function (structure) {
                if (!grid._colWidthLoaded) {
                    grid._colWidthLoaded = true;
                    var cells = _getCellsFromStructure(structure);
                    for (var i = cells.length - 1; i >= 0; --i) {
                        if (typeof colWidths[i] == "number") {
                            cells[i].width = colWidths[i] + "px";
                        } else {
                            if (colWidths[i] == "hidden") {
                                cells[i].hidden = true;
                            }
                        }
                    }
                }
                oldFunc.call(grid, structure);
                grid._setStructureAttr = oldFunc;
            };
        }
    };
    var _saveColWidth = function (grid) {
        return array.map(array.filter(grid.layout.cells, function (cell) {
            return !(cell.isRowSelector || cell instanceof gridCells.RowIndex);
        }), function (cell) {
            return cell.hidden ? "hidden" : html[has("webkit") ? "marginBox" : "contentBox"](cell.getHeaderNode()).w;
        });
    };
    var _loadColumnOrder = function (colOrder, grid) {
        if (colOrder && array.every(colOrder, function (viewInfo) {
            return lang.isArray(viewInfo) && array.every(viewInfo, function (subrowInfo) {
                return lang.isArray(subrowInfo) && subrowInfo.length > 0;
            });
        })) {
            var oldFunc = grid._setStructureAttr;
            var isCell = function (def) {
                return ("name" in def || "field" in def || "get" in def);
            };
            var isView = function (def) {
                return (def !== null && lang.isObject(def) && ("cells" in def || "rows" in def || ("type" in def && !isCell(def))));
            };
            grid._setStructureAttr = function (structure) {
                if (!grid._colOrderLoaded) {
                    grid._colOrderLoaded = true;
                    grid._setStructureAttr = oldFunc;
                    structure = lang.clone(structure);
                    if (lang.isArray(structure) && !array.some(structure, isView)) {
                        structure = [{cells:structure}];
                    } else {
                        if (isView(structure)) {
                            structure = [structure];
                        }
                    }
                    var cells = _getCellsFromStructure(structure);
                    array.forEach(lang.isArray(structure) ? structure : [structure], function (viewDef, viewIdx) {
                        var cellArray = viewDef;
                        if (lang.isArray(viewDef)) {
                            viewDef.splice(0, viewDef.length);
                        } else {
                            delete viewDef.rows;
                            cellArray = viewDef.cells = [];
                        }
                        array.forEach(colOrder[viewIdx], function (subrow) {
                            array.forEach(subrow, function (cellInfo) {
                                var i, cell;
                                for (i = 0; i < cells.length; ++i) {
                                    cell = cells[i];
                                    if (json.toJson({"name":cell.name, "field":cell.field}) == json.toJson(cellInfo)) {
                                        break;
                                    }
                                }
                                if (i < cells.length) {
                                    cellArray.push(cell);
                                }
                            });
                        });
                    });
                }
                oldFunc.call(grid, structure);
            };
        }
    };
    var _saveColumnOrder = function (grid) {
        var colOrder = array.map(array.filter(grid.views.views, function (view) {
            return !(view instanceof _RowSelector);
        }), function (view) {
            return array.map(view.structure.cells, function (subrow) {
                return array.map(array.filter(subrow, function (cell) {
                    return !(cell.isRowSelector || cell instanceof gridCells.RowIndex);
                }), function (cell) {
                    return {"name":cell.name, "field":cell.field};
                });
            });
        });
        return colOrder;
    };
    var _loadSortOrder = function (sortOrder, grid) {
        try {
            if (sortOrder && lang.isObject(sortOrder)) {
                grid.setSortIndex(sortOrder.idx, sortOrder.asc);
            }
        }
        catch (e) {
        }
    };
    var _saveSortOrder = function (grid) {
        return {idx:grid.getSortIndex(), asc:grid.getSortAsc()};
    };
    if (!has("ie")) {
        unload.addOnWindowUnload(function () {
            array.forEach(dijit.findWidgets(win.body()), function (widget) {
                if (widget instanceof EnhancedGrid && !widget._destroyed) {
                    widget.destroyRecursive();
                }
            });
        });
    }
    var Cookie = declare("dojox.grid.enhanced.plugins.Cookie", _Plugin, {name:"cookie", _cookieEnabled:true, constructor:function (grid, args) {
        this.grid = grid;
        args = (args && lang.isObject(args)) ? args : {};
        this.cookieProps = args.cookieProps;
        this._cookieHandlers = [];
        this._mixinGrid();
        this.addCookieHandler({name:"columnWidth", onLoad:_loadColWidth, onSave:_saveColWidth});
        this.addCookieHandler({name:"columnOrder", onLoad:_loadColumnOrder, onSave:_saveColumnOrder});
        this.addCookieHandler({name:"sortOrder", onLoad:_loadSortOrder, onSave:_saveSortOrder});
        array.forEach(this._cookieHandlers, function (handler) {
            if (args[handler.name] === false) {
                handler.enable = false;
            }
        }, this);
    }, destroy:function () {
        this._saveCookie();
        this._cookieHandlers = null;
        this.inherited(arguments);
    }, _mixinGrid:function () {
        var g = this.grid;
        g.addCookieHandler = lang.hitch(this, "addCookieHandler");
        g.removeCookie = lang.hitch(this, "removeCookie");
        g.setCookieEnabled = lang.hitch(this, "setCookieEnabled");
        g.getCookieEnabled = lang.hitch(this, "getCookieEnabled");
    }, _saveCookie:function () {
        if (this.getCookieEnabled()) {
            var ck = {}, chs = this._cookieHandlers, cookieProps = this.cookieProps, cookieKey = _cookieKeyBuilder(this.grid);
            for (var i = chs.length - 1; i >= 0; --i) {
                if (chs[i].enabled) {
                    ck[chs[i].name] = chs[i].onSave(this.grid);
                }
            }
            cookieProps = lang.isObject(this.cookieProps) ? this.cookieProps : {};
            cookie(cookieKey, json.toJson(ck), cookieProps);
        } else {
            this.removeCookie();
        }
    }, onPreInit:function () {
        var grid = this.grid, chs = this._cookieHandlers, cookieKey = _cookieKeyBuilder(grid), ck = cookie(cookieKey);
        if (ck) {
            ck = json.fromJson(ck);
            for (var i = 0; i < chs.length; ++i) {
                if (chs[i].name in ck && chs[i].enabled) {
                    chs[i].onLoad(ck[chs[i].name], grid);
                }
            }
        }
        this._cookie = ck || {};
        this._cookieStartedup = true;
    }, addCookieHandler:function (args) {
        if (args.name) {
            var dummy = function () {
            };
            args.onLoad = args.onLoad || dummy;
            args.onSave = args.onSave || dummy;
            if (!("enabled" in args)) {
                args.enabled = true;
            }
            for (var i = this._cookieHandlers.length - 1; i >= 0; --i) {
                if (this._cookieHandlers[i].name == args.name) {
                    this._cookieHandlers.splice(i, 1);
                }
            }
            this._cookieHandlers.push(args);
            if (this._cookieStartedup && args.name in this._cookie) {
                args.onLoad(this._cookie[args.name], this.grid);
            }
        }
    }, removeCookie:function () {
        var key = _cookieKeyBuilder(this.grid);
        cookie(key, null, {expires:-1});
    }, setCookieEnabled:function (cookieName, enabled) {
        if (typeof cookieName == "string") {
            var chs = this._cookieHandlers;
            for (var i = chs.length - 1; i >= 0; --i) {
                if (chs[i].name === cookieName) {
                    chs[i].enabled = !!enabled;
                }
            }
        } else {
            this._cookieEnabled = !!cookieName;
            if (!this._cookieEnabled) {
                this.removeCookie();
            }
        }
    }, getCookieEnabled:function (cookieName) {
        if (lang.isString(cookieName)) {
            var chs = this._cookieHandlers;
            for (var i = chs.length - 1; i >= 0; --i) {
                if (chs[i].name == cookieName) {
                    return chs[i].enabled;
                }
            }
            return false;
        }
        return this._cookieEnabled;
    }});
    EnhancedGrid.registerPlugin(Cookie, {"preInit":true});
    return Cookie;
});

