//>>built

define("dojox/grid/enhanced/plugins/Selector", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/declare", "dojo/_base/array", "dojo/_base/event", "dojo/keys", "dojo/query", "dojo/_base/html", "dojo/_base/window", "dijit/focus", "../../_RowSelector", "../_Plugin", "../../EnhancedGrid", "../../cells/_base", "./AutoScroll"], function (dojo, lang, declare, array, event, keys, query, html, win, dijitFocus, _RowSelector, _Plugin, EnhancedGrid) {
    var DISABLED = 0, SINGLE = 1, MULTI = 2, _theOther = {col:"row", row:"col"}, _inRange = function (type, value, start, end, halfClose) {
        if (type !== "cell") {
            value = value[type];
            start = start[type];
            end = end[type];
            if (typeof value !== "number" || typeof start !== "number" || typeof end !== "number") {
                return false;
            }
            return halfClose ? ((value >= start && value < end) || (value > end && value <= start)) : ((value >= start && value <= end) || (value >= end && value <= start));
        } else {
            return _inRange("col", value, start, end, halfClose) && _inRange("row", value, start, end, halfClose);
        }
    }, _isEqual = function (type, v1, v2) {
        try {
            if (v1 && v2) {
                switch (type) {
                  case "col":
                  case "row":
                    return v1[type] == v2[type] && typeof v1[type] == "number" && !(_theOther[type] in v1) && !(_theOther[type] in v2);
                  case "cell":
                    return v1.col == v2.col && v1.row == v2.row && typeof v1.col == "number" && typeof v1.row == "number";
                }
            }
        }
        catch (e) {
        }
        return false;
    }, _stopEvent = function (evt) {
        try {
            if (evt && evt.preventDefault) {
                event.stop(evt);
            }
        }
        catch (e) {
        }
    }, _createItem = function (type, rowIndex, colIndex) {
        switch (type) {
          case "col":
            return {"col":typeof colIndex == "undefined" ? rowIndex : colIndex, "except":[]};
          case "row":
            return {"row":rowIndex, "except":[]};
          case "cell":
            return {"row":rowIndex, "col":colIndex};
        }
        return null;
    };
    var Selector = declare("dojox.grid.enhanced.plugins.Selector", _Plugin, {name:"selector", constructor:function (grid, args) {
        this.grid = grid;
        this._config = {row:MULTI, col:MULTI, cell:MULTI};
        this.noClear = args && args.noClear;
        this.setupConfig(args);
        if (grid.selectionMode === "single") {
            this._config.row = SINGLE;
        }
        this._enabled = true;
        this._selecting = {};
        this._selected = {"col":[], "row":[], "cell":[]};
        this._startPoint = {};
        this._currentPoint = {};
        this._lastAnchorPoint = {};
        this._lastEndPoint = {};
        this._lastSelectedAnchorPoint = {};
        this._lastSelectedEndPoint = {};
        this._keyboardSelect = {};
        this._lastType = null;
        this._selectedRowModified = {};
        this._hacks();
        this._initEvents();
        this._initAreas();
        this._mixinGrid();
    }, destroy:function () {
        this.inherited(arguments);
    }, setupConfig:function (config) {
        if (!config || !lang.isObject(config)) {
            return;
        }
        var types = ["row", "col", "cell"];
        for (var type in config) {
            if (array.indexOf(types, type) >= 0) {
                if (!config[type] || config[type] == "disabled") {
                    this._config[type] = DISABLED;
                } else {
                    if (config[type] == "single") {
                        this._config[type] = SINGLE;
                    } else {
                        this._config[type] = MULTI;
                    }
                }
            }
        }
        var mode = ["none", "single", "extended"][this._config.row];
        this.grid.selection.setMode(mode);
    }, isSelected:function (type, rowIndex, colIndex) {
        return this._isSelected(type, _createItem(type, rowIndex, colIndex));
    }, toggleSelect:function (type, rowIndex, colIndex) {
        this._startSelect(type, _createItem(type, rowIndex, colIndex), this._config[type] === MULTI, false, false, !this.isSelected(type, rowIndex, colIndex));
        this._endSelect(type);
    }, select:function (type, rowIndex, colIndex) {
        if (!this.isSelected(type, rowIndex, colIndex)) {
            this.toggleSelect(type, rowIndex, colIndex);
        }
    }, deselect:function (type, rowIndex, colIndex) {
        if (this.isSelected(type, rowIndex, colIndex)) {
            this.toggleSelect(type, rowIndex, colIndex);
        }
    }, selectRange:function (type, start, end, toSelect) {
        this.grid._selectingRange = true;
        var startPoint = type == "cell" ? _createItem(type, start.row, start.col) : _createItem(type, start), endPoint = type == "cell" ? _createItem(type, end.row, end.col) : _createItem(type, end);
        this._startSelect(type, startPoint, false, false, false, toSelect);
        this._highlight(type, endPoint, toSelect === undefined ? true : toSelect);
        this._endSelect(type);
        this.grid._selectingRange = false;
    }, clear:function (type) {
        this._clearSelection(type || "all");
    }, isSelecting:function (type) {
        if (typeof type == "undefined") {
            return this._selecting.col || this._selecting.row || this._selecting.cell;
        }
        return this._selecting[type];
    }, selectEnabled:function (toEnable) {
        if (typeof toEnable != "undefined" && !this.isSelecting()) {
            this._enabled = !!toEnable;
        }
        return this._enabled;
    }, getSelected:function (type, includeExceptions) {
        switch (type) {
          case "cell":
            return array.map(this._selected[type], function (item) {
                return item;
            });
          case "col":
          case "row":
            return array.map(includeExceptions ? this._selected[type] : array.filter(this._selected[type], function (item) {
                return item.except.length === 0;
            }), function (item) {
                return includeExceptions ? item : item[type];
            });
        }
        return [];
    }, getSelectedCount:function (type, includeExceptions) {
        switch (type) {
          case "cell":
            return this._selected[type].length;
          case "col":
          case "row":
            return (includeExceptions ? this._selected[type] : array.filter(this._selected[type], function (item) {
                return item.except.length === 0;
            })).length;
        }
        return 0;
    }, getSelectedType:function () {
        var s = this._selected;
        return ["", "cell", "row", "row|cell", "col", "col|cell", "col|row", "col|row|cell"][(!!s.cell.length) | (!!s.row.length << 1) | (!!s.col.length << 2)];
    }, getLastSelectedRange:function (type) {
        return this._lastAnchorPoint[type] ? {"start":this._lastAnchorPoint[type], "end":this._lastEndPoint[type]} : null;
    }, _hacks:function () {
        var g = this.grid;
        var doContentMouseUp = function (e) {
            if (e.cellNode) {
                g.onMouseUp(e);
            }
            g.onMouseUpRow(e);
        };
        var mouseUp = lang.hitch(g, "onMouseUp");
        var mouseDown = lang.hitch(g, "onMouseDown");
        var doRowSelectorFocus = function (e) {
            e.cellNode.style.border = "solid 1px";
        };
        array.forEach(g.views.views, function (view) {
            view.content.domouseup = doContentMouseUp;
            view.header.domouseup = mouseUp;
            if (view.declaredClass == "dojox.grid._RowSelector") {
                view.domousedown = mouseDown;
                view.domouseup = mouseUp;
                view.dofocus = doRowSelectorFocus;
            }
        });
        g.selection.clickSelect = function () {
        };
        this._oldDeselectAll = g.selection.deselectAll;
        var _this = this;
        g.selection.selectRange = function (from, to) {
            _this.selectRange("row", from, to, true);
            if (g.selection.preserver) {
                g.selection.preserver._updateMapping(true, true, false, from, to);
            }
            g.selection.onChanged();
        };
        g.selection.deselectRange = function (from, to) {
            _this.selectRange("row", from, to, false);
            if (g.selection.preserver) {
                g.selection.preserver._updateMapping(true, false, false, from, to);
            }
            g.selection.onChanged();
        };
        g.selection.deselectAll = function () {
            g._selectingRange = true;
            _this._oldDeselectAll.apply(g.selection, arguments);
            _this._clearSelection("all");
            g._selectingRange = false;
            if (g.selection.preserver) {
                g.selection.preserver._updateMapping(true, false, true);
            }
            g.selection.onChanged();
        };
        var rowSelector = g.views.views[0];
        if (rowSelector instanceof _RowSelector) {
            rowSelector.doStyleRowNode = function (inRowIndex, inRowNode) {
                html.removeClass(inRowNode, "dojoxGridRow");
                html.addClass(inRowNode, "dojoxGridRowbar");
                html.addClass(inRowNode, "dojoxGridNonNormalizedCell");
                html.toggleClass(inRowNode, "dojoxGridRowbarOver", g.rows.isOver(inRowIndex));
                html.toggleClass(inRowNode, "dojoxGridRowbarSelected", !!g.selection.isSelected(inRowIndex));
            };
        }
        this.connect(g, "updateRow", function (rowIndex) {
            array.forEach(g.layout.cells, function (cell) {
                if (this.isSelected("cell", rowIndex, cell.index)) {
                    this._highlightNode(cell.getNode(rowIndex), true);
                }
            }, this);
        });
    }, _mixinGrid:function () {
        var g = this.grid;
        g.setupSelectorConfig = lang.hitch(this, this.setupConfig);
        g.onStartSelect = function () {
        };
        g.onEndSelect = function () {
        };
        g.onStartDeselect = function () {
        };
        g.onEndDeselect = function () {
        };
        g.onSelectCleared = function () {
        };
    }, _initEvents:function () {
        var g = this.grid, _this = this, dp = lang.partial, starter = function (type, e) {
            if (type === "row") {
                _this._isUsingRowSelector = true;
            }
            if (_this.selectEnabled() && _this._config[type] && e.button != 2) {
                if (_this._keyboardSelect.col || _this._keyboardSelect.row || _this._keyboardSelect.cell) {
                    _this._endSelect("all");
                    _this._keyboardSelect.col = _this._keyboardSelect.row = _this._keyboardSelect.cell = 0;
                }
                if (_this._usingKeyboard) {
                    _this._usingKeyboard = false;
                }
                var target = _createItem(type, e.rowIndex, e.cell && e.cell.index);
                _this._startSelect(type, target, e.ctrlKey, e.shiftKey);
            }
        }, ender = lang.hitch(this, "_endSelect");
        this.connect(g, "onHeaderCellMouseDown", dp(starter, "col"));
        this.connect(g, "onHeaderCellMouseUp", dp(ender, "col"));
        this.connect(g, "onRowSelectorMouseDown", dp(starter, "row"));
        this.connect(g, "onRowSelectorMouseUp", dp(ender, "row"));
        this.connect(g, "onCellMouseDown", function (e) {
            if (e.cell && e.cell.isRowSelector) {
                return;
            }
            if (g.singleClickEdit) {
                _this._singleClickEdit = true;
                g.singleClickEdit = false;
            }
            starter(_this._config["cell"] == DISABLED ? "row" : "cell", e);
        });
        this.connect(g, "onCellMouseUp", function (e) {
            if (_this._singleClickEdit) {
                delete _this._singleClickEdit;
                g.singleClickEdit = true;
            }
            ender("all", e);
        });
        this.connect(g, "onCellMouseOver", function (e) {
            if (_this._curType != "row" && _this._selecting[_this._curType] && _this._config[_this._curType] == MULTI) {
                _this._highlight("col", _createItem("col", e.cell.index), _this._toSelect);
                if (!_this._keyboardSelect.cell) {
                    _this._highlight("cell", _createItem("cell", e.rowIndex, e.cell.index), _this._toSelect);
                }
            }
        });
        this.connect(g, "onHeaderCellMouseOver", function (e) {
            if (_this._selecting.col && _this._config.col == MULTI) {
                _this._highlight("col", _createItem("col", e.cell.index), _this._toSelect);
            }
        });
        this.connect(g, "onRowMouseOver", function (e) {
            if (_this._selecting.row && _this._config.row == MULTI) {
                _this._highlight("row", _createItem("row", e.rowIndex), _this._toSelect);
            }
        });
        this.connect(g, "onSelectedById", "_onSelectedById");
        this.connect(g, "_onFetchComplete", function () {
            if (!g._notRefreshSelection) {
                this._refreshSelected(true);
            }
        });
        this.connect(g.scroller, "buildPage", function () {
            if (!g._notRefreshSelection) {
                this._refreshSelected(true);
            }
        });
        this.connect(win.doc, "onmouseup", dp(ender, "all"));
        this.connect(g, "onEndAutoScroll", function (isVertical, isForward, view, target) {
            var selectCell = _this._selecting.cell, type, current, dir = isForward ? 1 : -1;
            if (isVertical && (selectCell || _this._selecting.row)) {
                type = selectCell ? "cell" : "row";
                current = _this._currentPoint[type];
                _this._highlight(type, _createItem(type, current.row + dir, current.col), _this._toSelect);
            } else {
                if (!isVertical && (selectCell || _this._selecting.col)) {
                    type = selectCell ? "cell" : "col";
                    current = _this._currentPoint[type];
                    _this._highlight(type, _createItem(type, current.row, target), _this._toSelect);
                }
            }
        });
        this.subscribe("dojox/grid/rearrange/move/" + g.id, "_onInternalRearrange");
        this.subscribe("dojox/grid/rearrange/copy/" + g.id, "_onInternalRearrange");
        this.subscribe("dojox/grid/rearrange/change/" + g.id, "_onExternalChange");
        this.subscribe("dojox/grid/rearrange/insert/" + g.id, "_onExternalChange");
        this.subscribe("dojox/grid/rearrange/remove/" + g.id, "clear");
        this.connect(g, "onSelected", function (rowIndex) {
            if (this._selectedRowModified && this._isUsingRowSelector) {
                delete this._selectedRowModified;
            } else {
                if (!this.grid._selectingRange) {
                    this.select("row", rowIndex);
                }
            }
        });
        this.connect(g, "onDeselected", function (rowIndex) {
            if (this._selectedRowModified && this._isUsingRowSelector) {
                delete this._selectedRowModified;
            } else {
                if (!this.grid._selectingRange) {
                    this.deselect("row", rowIndex);
                }
            }
        });
    }, _onSelectedById:function (id, newIndex, isSelected) {
        if (this.grid._noInternalMapping) {
            return;
        }
        var pointSet = [this._lastAnchorPoint.row, this._lastEndPoint.row, this._lastSelectedAnchorPoint.row, this._lastSelectedEndPoint.row];
        pointSet = pointSet.concat(this._selected.row);
        var found = false;
        array.forEach(pointSet, function (item) {
            if (item) {
                if (item.id === id) {
                    found = true;
                    item.row = newIndex;
                } else {
                    if (item.row === newIndex && item.id) {
                        item.row = -1;
                    }
                }
            }
        });
        if (!found && isSelected) {
            array.some(this._selected.row, function (item) {
                if (item && !item.id && !item.except.length) {
                    item.id = id;
                    item.row = newIndex;
                    return true;
                }
                return false;
            });
        }
        found = false;
        pointSet = [this._lastAnchorPoint.cell, this._lastEndPoint.cell, this._lastSelectedAnchorPoint.cell, this._lastSelectedEndPoint.cell];
        pointSet = pointSet.concat(this._selected.cell);
        array.forEach(pointSet, function (item) {
            if (item) {
                if (item.id === id) {
                    found = true;
                    item.row = newIndex;
                } else {
                    if (item.row === newIndex && item.id) {
                        item.row = -1;
                    }
                }
            }
        });
    }, onSetStore:function () {
        this._clearSelection("all");
    }, _onInternalRearrange:function (type, mapping) {
        try {
            this._refresh("col", false);
            array.forEach(this._selected.row, function (item) {
                array.forEach(this.grid.layout.cells, function (cell) {
                    this._highlightNode(cell.getNode(item.row), false);
                }, this);
            }, this);
            query(".dojoxGridRowSelectorSelected").forEach(function (node) {
                html.removeClass(node, "dojoxGridRowSelectorSelected");
                html.removeClass(node, "dojoxGridRowSelectorSelectedUp");
                html.removeClass(node, "dojoxGridRowSelectorSelectedDown");
            });
            var cleanUp = function (item) {
                if (item) {
                    delete item.converted;
                }
            }, pointSet = [this._lastAnchorPoint[type], this._lastEndPoint[type], this._lastSelectedAnchorPoint[type], this._lastSelectedEndPoint[type]];
            if (type === "cell") {
                this.selectRange("cell", mapping.to.min, mapping.to.max);
                var cells = this.grid.layout.cells;
                array.forEach(pointSet, function (item) {
                    if (item.converted) {
                        return;
                    }
                    for (var r = mapping.from.min.row, tr = mapping.to.min.row; r <= mapping.from.max.row; ++r, ++tr) {
                        for (var c = mapping.from.min.col, tc = mapping.to.min.col; c <= mapping.from.max.col; ++c, ++tc) {
                            while (cells[c].hidden) {
                                ++c;
                            }
                            while (cells[tc].hidden) {
                                ++tc;
                            }
                            if (item.row == r && item.col == c) {
                                item.row = tr;
                                item.col = tc;
                                item.converted = true;
                                return;
                            }
                        }
                    }
                });
            } else {
                pointSet = this._selected.cell.concat(this._selected[type]).concat(pointSet).concat([this._lastAnchorPoint.cell, this._lastEndPoint.cell, this._lastSelectedAnchorPoint.cell, this._lastSelectedEndPoint.cell]);
                array.forEach(pointSet, function (item) {
                    if (item && !item.converted) {
                        var from = item[type];
                        if (from in mapping) {
                            item[type] = mapping[from];
                        }
                        item.converted = true;
                    }
                });
                array.forEach(this._selected[_theOther[type]], function (item) {
                    for (var i = 0, len = item.except.length; i < len; ++i) {
                        var from = item.except[i];
                        if (from in mapping) {
                            item.except[i] = mapping[from];
                        }
                    }
                });
            }
            array.forEach(pointSet, cleanUp);
            this._refreshSelected(true);
            this._focusPoint(type, this._lastEndPoint);
        }
        catch (e) {
            console.warn("Selector._onInternalRearrange() error", e);
        }
    }, _onExternalChange:function (type, target) {
        var start = type == "cell" ? target.min : target[0], end = type == "cell" ? target.max : target[target.length - 1];
        this.selectRange(type, start, end);
    }, _refresh:function (type, toHighlight) {
        if (!this._keyboardSelect[type]) {
            array.forEach(this._selected[type], function (item) {
                this._highlightSingle(type, toHighlight, item, undefined, true);
            }, this);
        }
    }, _refreshSelected:function () {
        this._refresh("col", true);
        this._refresh("row", true);
        this._refresh("cell", true);
    }, _initAreas:function () {
        var g = this.grid, f = g.focus, _this = this, keyboardSelectReady = 1, duringKeyboardSelect = 2, onmove = function (type, createNewEnd, rowStep, colStep, evt) {
            var ks = _this._keyboardSelect;
            if (evt.shiftKey && ks[type]) {
                if (ks[type] === keyboardSelectReady) {
                    if (type === "cell") {
                        var item = _this._lastEndPoint[type];
                        if (f.cell != g.layout.cells[item.col + colStep] || f.rowIndex != item.row + rowStep) {
                            ks[type] = 0;
                            return;
                        }
                    }
                    _this._startSelect(type, _this._lastAnchorPoint[type], true, false, true);
                    _this._highlight(type, _this._lastEndPoint[type], _this._toSelect);
                    ks[type] = duringKeyboardSelect;
                }
                var newEnd = createNewEnd(type, rowStep, colStep, evt);
                if (_this._isValid(type, newEnd, g)) {
                    _this._highlight(type, newEnd, _this._toSelect);
                }
                _stopEvent(evt);
            }
        }, onkeydown = function (type, getTarget, evt, isBubble) {
            if (isBubble && _this.selectEnabled() && _this._config[type] != DISABLED) {
                switch (evt.keyCode) {
                  case keys.SPACE:
                    _this._startSelect(type, getTarget(), evt.ctrlKey, evt.shiftKey);
                    _this._endSelect(type);
                    break;
                  case keys.SHIFT:
                    if (_this._config[type] == MULTI && _this._isValid(type, _this._lastAnchorPoint[type], g)) {
                        _this._endSelect(type);
                        _this._keyboardSelect[type] = keyboardSelectReady;
                        _this._usingKeyboard = true;
                    }
                }
            }
        }, onkeyup = function (type, evt, isBubble) {
            if (isBubble && evt.keyCode == keys.SHIFT && _this._keyboardSelect[type]) {
                _this._endSelect(type);
                _this._keyboardSelect[type] = 0;
            }
        };
        if (g.views.views[0] instanceof _RowSelector) {
            this._lastFocusedRowBarIdx = 0;
            f.addArea({name:"rowHeader", onFocus:function (evt, step) {
                var view = g.views.views[0];
                if (view instanceof _RowSelector) {
                    var rowBarNode = view.getCellNode(_this._lastFocusedRowBarIdx, 0);
                    if (rowBarNode) {
                        html.toggleClass(rowBarNode, f.focusClass, false);
                    }
                    if (evt && "rowIndex" in evt) {
                        if (evt.rowIndex >= 0) {
                            _this._lastFocusedRowBarIdx = evt.rowIndex;
                        } else {
                            if (!_this._lastFocusedRowBarIdx) {
                                _this._lastFocusedRowBarIdx = 0;
                            }
                        }
                    }
                    rowBarNode = view.getCellNode(_this._lastFocusedRowBarIdx, 0);
                    if (rowBarNode) {
                        dijitFocus.focus(rowBarNode);
                        html.toggleClass(rowBarNode, f.focusClass, true);
                    }
                    f.rowIndex = _this._lastFocusedRowBarIdx;
                    _stopEvent(evt);
                    return true;
                }
                return false;
            }, onBlur:function (evt, step) {
                var view = g.views.views[0];
                if (view instanceof _RowSelector) {
                    var rowBarNode = view.getCellNode(_this._lastFocusedRowBarIdx, 0);
                    if (rowBarNode) {
                        html.toggleClass(rowBarNode, f.focusClass, false);
                    }
                    _stopEvent(evt);
                }
                return true;
            }, onMove:function (rowStep, colStep, evt) {
                var view = g.views.views[0];
                if (rowStep && view instanceof _RowSelector) {
                    var next = _this._lastFocusedRowBarIdx + rowStep;
                    if (next >= 0 && next < g.rowCount) {
                        _stopEvent(evt);
                        var rowBarNode = view.getCellNode(_this._lastFocusedRowBarIdx, 0);
                        html.toggleClass(rowBarNode, f.focusClass, false);
                        var sc = g.scroller;
                        var lastPageRow = sc.getLastPageRow(sc.page);
                        var rc = g.rowCount - 1, row = Math.min(rc, next);
                        if (next > lastPageRow) {
                            g.setScrollTop(g.scrollTop + sc.findScrollTop(row) - sc.findScrollTop(_this._lastFocusedRowBarIdx));
                        }
                        rowBarNode = view.getCellNode(next, 0);
                        dijitFocus.focus(rowBarNode);
                        html.toggleClass(rowBarNode, f.focusClass, true);
                        _this._lastFocusedRowBarIdx = next;
                        f.cell = rowBarNode;
                        f.cell.view = view;
                        f.cell.getNode = function (index) {
                            return f.cell;
                        };
                        f.rowIndex = _this._lastFocusedRowBarIdx;
                        f.scrollIntoView();
                        f.cell = null;
                    }
                }
            }});
            f.placeArea("rowHeader", "before", "content");
        }
        f.addArea({name:"cellselect", onMove:lang.partial(onmove, "cell", function (type, rowStep, colStep, evt) {
            var current = _this._currentPoint[type];
            return _createItem("cell", current.row + rowStep, current.col + colStep);
        }), onKeyDown:lang.partial(onkeydown, "cell", function () {
            return _createItem("cell", f.rowIndex, f.cell.index);
        }), onKeyUp:lang.partial(onkeyup, "cell")});
        f.placeArea("cellselect", "below", "content");
        f.addArea({name:"colselect", onMove:lang.partial(onmove, "col", function (type, rowStep, colStep, evt) {
            var current = _this._currentPoint[type];
            return _createItem("col", current.col + colStep);
        }), onKeyDown:lang.partial(onkeydown, "col", function () {
            return _createItem("col", f.getHeaderIndex());
        }), onKeyUp:lang.partial(onkeyup, "col")});
        f.placeArea("colselect", "below", "header");
        f.addArea({name:"rowselect", onMove:lang.partial(onmove, "row", function (type, rowStep, colStep, evt) {
            return _createItem("row", f.rowIndex);
        }), onKeyDown:lang.partial(onkeydown, "row", function () {
            return _createItem("row", f.rowIndex);
        }), onKeyUp:lang.partial(onkeyup, "row")});
        f.placeArea("rowselect", "below", "rowHeader");
    }, _clearSelection:function (type, reservedItem) {
        if (type == "all") {
            this._clearSelection("cell", reservedItem);
            this._clearSelection("col", reservedItem);
            this._clearSelection("row", reservedItem);
            return;
        }
        this._isUsingRowSelector = true;
        array.forEach(this._selected[type], function (item) {
            if (!_isEqual(type, reservedItem, item)) {
                this._highlightSingle(type, false, item);
            }
        }, this);
        this._blurPoint(type, this._currentPoint);
        this._selecting[type] = false;
        this._startPoint[type] = this._currentPoint[type] = null;
        this._selected[type] = [];
        if (type == "row" && !this.grid._selectingRange) {
            this._oldDeselectAll.call(this.grid.selection);
            this.grid.selection._selectedById = {};
        }
        this.grid.onEndDeselect(type, null, null, this._selected);
        this.grid.onSelectCleared(type);
    }, _startSelect:function (type, start, extending, isRange, mandatarySelect, toSelect) {
        if (!this._isValid(type, start)) {
            return;
        }
        var lastIsSelected = this._isSelected(type, this._lastEndPoint[type]), isSelected = this._isSelected(type, start);
        if (this.noClear && !extending) {
            this._toSelect = toSelect === undefined ? true : toSelect;
        } else {
            this._toSelect = mandatarySelect ? isSelected : !isSelected;
        }
        if (!extending || (!isSelected && this._config[type] == SINGLE)) {
            this._clearSelection("col", start);
            this._clearSelection("cell", start);
            if (!this.noClear || (type === "row" && this._config[type] == SINGLE)) {
                this._clearSelection("row", start);
            }
            this._toSelect = toSelect === undefined ? true : toSelect;
        }
        this._selecting[type] = true;
        this._currentPoint[type] = null;
        if (isRange && this._lastType == type && lastIsSelected == this._toSelect && this._config[type] == MULTI) {
            if (type === "row") {
                this._isUsingRowSelector = true;
            }
            this._startPoint[type] = this._lastAnchorPoint[type];
            this._highlight(type, this._startPoint[type]);
            this._isUsingRowSelector = false;
        } else {
            this._startPoint[type] = start;
        }
        this._curType = type;
        this._fireEvent("start", type);
        this._isStartFocus = true;
        this._isUsingRowSelector = true;
        this._highlight(type, start, this._toSelect);
        this._isStartFocus = false;
    }, _endSelect:function (type) {
        if (type === "row") {
            delete this._isUsingRowSelector;
        }
        if (type == "all") {
            this._endSelect("col");
            this._endSelect("row");
            this._endSelect("cell");
        } else {
            if (this._selecting[type]) {
                this._addToSelected(type);
                this._lastAnchorPoint[type] = this._startPoint[type];
                this._lastEndPoint[type] = this._currentPoint[type];
                if (this._toSelect) {
                    this._lastSelectedAnchorPoint[type] = this._lastAnchorPoint[type];
                    this._lastSelectedEndPoint[type] = this._lastEndPoint[type];
                }
                this._startPoint[type] = this._currentPoint[type] = null;
                this._selecting[type] = false;
                this._lastType = type;
                this._fireEvent("end", type);
            }
        }
    }, _fireEvent:function (evtName, type) {
        switch (evtName) {
          case "start":
            this.grid[this._toSelect ? "onStartSelect" : "onStartDeselect"](type, this._startPoint[type], this._selected);
            break;
          case "end":
            this.grid[this._toSelect ? "onEndSelect" : "onEndDeselect"](type, this._lastAnchorPoint[type], this._lastEndPoint[type], this._selected);
            break;
        }
    }, _calcToHighlight:function (type, target, toHighlight, toSelect) {
        if (toSelect !== undefined) {
            var sltd;
            if (this._usingKeyboard && !toHighlight) {
                var last = this._isInLastRange(this._lastType, target);
                if (last) {
                    sltd = this._isSelected(type, target);
                    if (toSelect && sltd) {
                        return false;
                    }
                    if (!toSelect && !sltd && this._isInLastRange(this._lastType, target, true)) {
                        return true;
                    }
                }
            }
            return toHighlight ? toSelect : (sltd || this._isSelected(type, target));
        }
        return toHighlight;
    }, _highlightNode:function (node, toHighlight) {
        if (node) {
            var selectCSSClass = "dojoxGridRowSelected";
            var selectCellClass = "dojoxGridCellSelected";
            html.toggleClass(node, selectCSSClass, toHighlight);
            html.toggleClass(node, selectCellClass, toHighlight);
        }
    }, _highlightHeader:function (colIdx, toHighlight) {
        var cells = this.grid.layout.cells;
        var node = cells[colIdx].getHeaderNode();
        var selectedClass = "dojoxGridHeaderSelected";
        html.toggleClass(node, selectedClass, toHighlight);
    }, _highlightRowSelector:function (rowIdx, toHighlight) {
        var rowSelector = this.grid.views.views[0];
        if (rowSelector instanceof _RowSelector) {
            var node = rowSelector.getRowNode(rowIdx);
            if (node) {
                var selectedClass = "dojoxGridRowSelectorSelected";
                html.toggleClass(node, selectedClass, toHighlight);
            }
        }
    }, _highlightSingle:function (type, toHighlight, target, toSelect, isRefresh) {
        var _this = this, toHL, g = _this.grid, cells = g.layout.cells;
        switch (type) {
          case "cell":
            toHL = this._calcToHighlight(type, target, toHighlight, toSelect);
            var c = cells[target.col];
            if (!c.hidden && !c.notselectable) {
                this._highlightNode(target.node || c.getNode(target.row), toHL);
            }
            break;
          case "col":
            toHL = this._calcToHighlight(type, target, toHighlight, toSelect);
            this._highlightHeader(target.col, toHL);
            query("td[idx='" + target.col + "']", g.domNode).forEach(function (cellNode) {
                var rowNode = cells[target.col].view.content.findRowTarget(cellNode);
                if (rowNode) {
                    var rowIndex = rowNode[dojox.grid.util.rowIndexTag];
                    _this._highlightSingle("cell", toHL, {"row":rowIndex, "col":target.col, "node":cellNode});
                }
            });
            break;
          case "row":
            toHL = this._calcToHighlight(type, target, toHighlight, toSelect);
            this._highlightRowSelector(target.row, toHL);
            if (this._config.cell) {
                array.forEach(cells, function (cell) {
                    _this._highlightSingle("cell", toHL, {"row":target.row, "col":cell.index, "node":cell.getNode(target.row)});
                });
            }
            this._selectedRowModified = true;
            if (!isRefresh) {
                g.selection.setSelected(target.row, toHL);
            }
        }
    }, _highlight:function (type, target, toSelect) {
        if (this._selecting[type] && target !== null) {
            var start = this._startPoint[type], current = this._currentPoint[type], _this = this, highlight = function (from, to, toHL) {
                _this._forEach(type, from, to, function (item) {
                    _this._highlightSingle(type, toHL, item, toSelect);
                }, true);
            };
            switch (type) {
              case "col":
              case "row":
                if (current !== null) {
                    if (_inRange(type, target, start, current, true)) {
                        highlight(current, target, false);
                    } else {
                        if (_inRange(type, start, target, current, true)) {
                            highlight(current, start, false);
                            current = start;
                        }
                        highlight(target, current, true);
                    }
                } else {
                    this._highlightSingle(type, true, target, toSelect);
                }
                break;
              case "cell":
                if (current !== null) {
                    if (_inRange("row", target, start, current, true) || _inRange("col", target, start, current, true) || _inRange("row", start, target, current, true) || _inRange("col", start, target, current, true)) {
                        highlight(start, current, false);
                    }
                }
                highlight(start, target, true);
            }
            this._currentPoint[type] = target;
            this._focusPoint(type, this._currentPoint);
        }
    }, _focusPoint:function (type, point) {
        if (!this._isStartFocus) {
            var current = point[type], f = this.grid.focus;
            if (type == "col") {
                f._colHeadFocusIdx = current.col;
                f.focusArea("header");
            } else {
                if (type == "row") {
                    f.focusArea("rowHeader", {"rowIndex":current.row});
                } else {
                    if (type == "cell") {
                        f.setFocusIndex(current.row, current.col);
                    }
                }
            }
        }
    }, _blurPoint:function (type, point) {
        var f = this.grid.focus;
        if (type == "cell") {
            f._blurContent();
        }
    }, _addToSelected:function (type) {
        var toSelect = this._toSelect, _this = this, toAdd = [], toRemove = [], start = this._startPoint[type], end = this._currentPoint[type];
        if (this._usingKeyboard) {
            this._forEach(type, this._lastAnchorPoint[type], this._lastEndPoint[type], function (item) {
                if (!_inRange(type, item, start, end)) {
                    (toSelect ? toRemove : toAdd).push(item);
                }
            });
        }
        this._forEach(type, start, end, function (item) {
            var isSelected = _this._isSelected(type, item);
            if (toSelect && !isSelected) {
                toAdd.push(item);
            } else {
                if (!toSelect) {
                    toRemove.push(item);
                }
            }
        });
        this._add(type, toAdd);
        this._remove(type, toRemove);
        array.forEach(this._selected.row, function (item) {
            if (item.except.length > 0) {
                this._selectedRowModified = true;
                this.grid.selection.setSelected(item.row, false);
            }
        }, this);
    }, _forEach:function (type, start, end, func, halfClose) {
        if (!this._isValid(type, start, true) || !this._isValid(type, end, true)) {
            return;
        }
        switch (type) {
          case "col":
          case "row":
            start = start[type];
            end = end[type];
            var dir = end > start ? 1 : -1;
            if (!halfClose) {
                end += dir;
            }
            for (; start != end; start += dir) {
                func(_createItem(type, start));
            }
            break;
          case "cell":
            var colDir = end.col > start.col ? 1 : -1, rowDir = end.row > start.row ? 1 : -1;
            for (var i = start.row, p = end.row + rowDir; i != p; i += rowDir) {
                for (var j = start.col, q = end.col + colDir; j != q; j += colDir) {
                    func(_createItem(type, i, j));
                }
            }
        }
    }, _makeupForExceptions:function (type, newCellItems) {
        var makedUps = [];
        array.forEach(this._selected[type], function (v1) {
            array.forEach(newCellItems, function (v2) {
                if (v1[type] == v2[type]) {
                    var pos = array.indexOf(v1.except, v2[_theOther[type]]);
                    if (pos >= 0) {
                        v1.except.splice(pos, 1);
                    }
                    makedUps.push(v2);
                }
            });
        });
        return makedUps;
    }, _makeupForCells:function (type, newItems) {
        var toRemove = [];
        array.forEach(this._selected.cell, function (v1) {
            array.some(newItems, function (v2) {
                if (v1[type] == v2[type]) {
                    toRemove.push(v1);
                    return true;
                }
                return false;
            });
        });
        this._remove("cell", toRemove);
        array.forEach(this._selected[_theOther[type]], function (v1) {
            array.forEach(newItems, function (v2) {
                var pos = array.indexOf(v1.except, v2[type]);
                if (pos >= 0) {
                    v1.except.splice(pos, 1);
                }
            });
        });
    }, _addException:function (type, items) {
        array.forEach(this._selected[type], function (v1) {
            array.forEach(items, function (v2) {
                v1.except.push(v2[_theOther[type]]);
            });
        });
    }, _addCellException:function (type, items) {
        array.forEach(this._selected[type], function (v1) {
            array.forEach(items, function (v2) {
                if (v1[type] == v2[type]) {
                    v1.except.push(v2[_theOther[type]]);
                }
            });
        });
    }, _add:function (type, items) {
        var cells = this.grid.layout.cells;
        if (type == "cell") {
            var colMakedup = this._makeupForExceptions("col", items);
            var rowMakedup = this._makeupForExceptions("row", items);
            items = array.filter(items, function (item) {
                return array.indexOf(colMakedup, item) < 0 && array.indexOf(rowMakedup, item) < 0 && !cells[item.col].hidden && !cells[item.col].notselectable;
            });
        } else {
            if (type == "col") {
                items = array.filter(items, function (item) {
                    return !cells[item.col].hidden && !cells[item.col].notselectable;
                });
            }
            this._makeupForCells(type, items);
            this._selected[type] = array.filter(this._selected[type], function (v) {
                return array.every(items, function (item) {
                    return v[type] !== item[type];
                });
            });
        }
        if (type != "col" && this.grid._hasIdentity) {
            array.forEach(items, function (item) {
                var record = this.grid._by_idx[item.row];
                if (record) {
                    item.id = record.idty;
                }
            }, this);
        }
        this._selected[type] = this._selected[type].concat(items);
    }, _remove:function (type, items) {
        var comp = lang.partial(_isEqual, type);
        this._selected[type] = array.filter(this._selected[type], function (v1) {
            return !array.some(items, function (v2) {
                return comp(v1, v2);
            });
        });
        if (type == "cell") {
            this._addCellException("col", items);
            this._addCellException("row", items);
        } else {
            if (this._config.cell) {
                this._addException(_theOther[type], items);
            }
        }
    }, _isCellNotInExcept:function (type, item) {
        var attr = item[type], corres = item[_theOther[type]];
        return array.some(this._selected[type], function (v) {
            return v[type] == attr && array.indexOf(v.except, corres) < 0;
        });
    }, _isSelected:function (type, item) {
        if (!item) {
            return false;
        }
        var res = array.some(this._selected[type], function (v) {
            var ret = _isEqual(type, item, v);
            if (ret && type !== "cell") {
                return v.except.length === 0;
            }
            return ret;
        });
        if (!res && type === "cell") {
            res = (this._isCellNotInExcept("col", item) || this._isCellNotInExcept("row", item));
            if (type === "cell") {
                res = res && !this.grid.layout.cells[item.col].notselectable;
            }
        }
        return res;
    }, _isInLastRange:function (type, item, isSelected) {
        var start = this[isSelected ? "_lastSelectedAnchorPoint" : "_lastAnchorPoint"][type], end = this[isSelected ? "_lastSelectedEndPoint" : "_lastEndPoint"][type];
        if (!item || !start || !end) {
            return false;
        }
        return _inRange(type, item, start, end);
    }, _isValid:function (type, item, allowNotSelectable) {
        if (!item) {
            return false;
        }
        try {
            var g = this.grid, index = item[type];
            switch (type) {
              case "col":
                return index >= 0 && index < g.layout.cells.length && lang.isArray(item.except) && (allowNotSelectable || !g.layout.cells[index].notselectable);
              case "row":
                return index >= 0 && index < g.rowCount && lang.isArray(item.except);
              case "cell":
                return item.col >= 0 && item.col < g.layout.cells.length && item.row >= 0 && item.row < g.rowCount && (allowNotSelectable || !g.layout.cells[item.col].notselectable);
            }
        }
        catch (e) {
        }
        return false;
    }});
    EnhancedGrid.registerPlugin(Selector, {"dependency":["autoScroll"]});
    return Selector;
});

