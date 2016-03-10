//>>built

define("dojox/grid/_FocusManager", ["dojo/_base/array", "dojo/_base/lang", "dojo/_base/declare", "dojo/_base/connect", "dojo/_base/event", "dojo/_base/sniff", "dojo/query", "./util", "dojo/_base/html"], function (array, lang, declare, connect, event, has, query, util, html) {
    return declare("dojox.grid._FocusManager", null, {constructor:function (inGrid) {
        this.grid = inGrid;
        this.cell = null;
        this.rowIndex = -1;
        this._connects = [];
        this._headerConnects = [];
        this.headerMenu = this.grid.headerMenu;
        this._connects.push(connect.connect(this.grid.domNode, "onfocus", this, "doFocus"));
        this._connects.push(connect.connect(this.grid.domNode, "onblur", this, "doBlur"));
        this._connects.push(connect.connect(this.grid.domNode, "mousedown", this, "_mouseDown"));
        this._connects.push(connect.connect(this.grid.domNode, "mouseup", this, "_mouseUp"));
        this._connects.push(connect.connect(this.grid.domNode, "oncontextmenu", this, "doContextMenu"));
        this._connects.push(connect.connect(this.grid.lastFocusNode, "onfocus", this, "doLastNodeFocus"));
        this._connects.push(connect.connect(this.grid.lastFocusNode, "onblur", this, "doLastNodeBlur"));
        this._connects.push(connect.connect(this.grid, "_onFetchComplete", this, "_delayedCellFocus"));
        this._connects.push(connect.connect(this.grid, "postrender", this, "_delayedHeaderFocus"));
    }, destroy:function () {
        array.forEach(this._connects, connect.disconnect);
        array.forEach(this._headerConnects, connect.disconnect);
        delete this.grid;
        delete this.cell;
    }, _colHeadNode:null, _colHeadFocusIdx:null, _contextMenuBindNode:null, tabbingOut:false, focusClass:"dojoxGridCellFocus", focusView:null, initFocusView:function () {
        this.focusView = this.grid.views.getFirstScrollingView() || this.focusView || this.grid.views.views[0];
        this._initColumnHeaders();
    }, isFocusCell:function (inCell, inRowIndex) {
        return (this.cell == inCell) && (this.rowIndex == inRowIndex);
    }, isLastFocusCell:function () {
        if (this.cell) {
            return (this.rowIndex == this.grid.rowCount - 1) && (this.cell.index == this.grid.layout.cellCount - 1);
        }
        return false;
    }, isFirstFocusCell:function () {
        if (this.cell) {
            return (this.rowIndex === 0) && (this.cell.index === 0);
        }
        return false;
    }, isNoFocusCell:function () {
        return (this.rowIndex < 0) || !this.cell;
    }, isNavHeader:function () {
        return (!!this._colHeadNode);
    }, getHeaderIndex:function () {
        if (this._colHeadNode) {
            return array.indexOf(this._findHeaderCells(), this._colHeadNode);
        } else {
            return -1;
        }
    }, _focusifyCellNode:function (inBork) {
        var n = this.cell && this.cell.getNode(this.rowIndex);
        if (n) {
            html.toggleClass(n, this.focusClass, inBork);
            if (inBork) {
                var sl = this.scrollIntoView();
                try {
                    if (has("webkit") || !this.grid.edit.isEditing()) {
                        util.fire(n, "focus");
                        if (sl) {
                            this.cell.view.scrollboxNode.scrollLeft = sl;
                        }
                    }
                }
                catch (e) {
                }
            }
        }
    }, _delayedCellFocus:function () {
        if (this.isNavHeader() || !this.grid.focused) {
            return;
        }
        var n = this.cell && this.cell.getNode(this.rowIndex);
        if (n) {
            try {
                if (!this.grid.edit.isEditing()) {
                    html.toggleClass(n, this.focusClass, true);
                    if (this._colHeadNode) {
                        this.blurHeader();
                    }
                    util.fire(n, "focus");
                }
            }
            catch (e) {
            }
        }
    }, _delayedHeaderFocus:function () {
        if (this.isNavHeader()) {
            this.focusHeader();
        }
    }, _initColumnHeaders:function () {
        array.forEach(this._headerConnects, connect.disconnect);
        this._headerConnects = [];
        var headers = this._findHeaderCells();
        for (var i = 0; i < headers.length; i++) {
            this._headerConnects.push(connect.connect(headers[i], "onfocus", this, "doColHeaderFocus"));
            this._headerConnects.push(connect.connect(headers[i], "onblur", this, "doColHeaderBlur"));
        }
    }, _findHeaderCells:function () {
        var allHeads = query("th", this.grid.viewsHeaderNode);
        var headers = [];
        for (var i = 0; i < allHeads.length; i++) {
            var aHead = allHeads[i];
            var hasTabIdx = html.hasAttr(aHead, "tabIndex");
            var tabindex = html.attr(aHead, "tabIndex");
            if (hasTabIdx && tabindex < 0) {
                headers.push(aHead);
            }
        }
        return headers;
    }, _setActiveColHeader:function (colHeaderNode, colFocusIdx, prevColFocusIdx) {
        this.grid.domNode.setAttribute("aria-activedescendant", colHeaderNode.id);
        if (prevColFocusIdx != null && prevColFocusIdx >= 0 && prevColFocusIdx != colFocusIdx) {
            html.toggleClass(this._findHeaderCells()[prevColFocusIdx], this.focusClass, false);
        }
        html.toggleClass(colHeaderNode, this.focusClass, true);
        this._colHeadNode = colHeaderNode;
        this._colHeadFocusIdx = colFocusIdx;
        this._scrollHeader(this._colHeadFocusIdx);
    }, scrollIntoView:function () {
        var info = (this.cell ? this._scrollInfo(this.cell) : null);
        if (!info || !info.s) {
            return null;
        }
        var rt = this.grid.scroller.findScrollTop(this.rowIndex);
        if (info.n && info.sr) {
            if (info.n.offsetLeft + info.n.offsetWidth > info.sr.l + info.sr.w) {
                info.s.scrollLeft = info.n.offsetLeft + info.n.offsetWidth - info.sr.w;
            } else {
                if (info.n.offsetLeft < info.sr.l) {
                    info.s.scrollLeft = info.n.offsetLeft;
                }
            }
        }
        if (info.r && info.sr) {
            if (rt + info.r.offsetHeight > info.sr.t + info.sr.h) {
                this.grid.setScrollTop(rt + info.r.offsetHeight - info.sr.h);
            } else {
                if (rt < info.sr.t) {
                    this.grid.setScrollTop(rt);
                }
            }
        }
        return info.s.scrollLeft;
    }, _scrollInfo:function (cell, domNode) {
        if (cell) {
            var cl = cell, sbn = cl.view.scrollboxNode, sbnr = {w:sbn.clientWidth, l:sbn.scrollLeft, t:sbn.scrollTop, h:sbn.clientHeight}, rn = cl.view.getRowNode(this.rowIndex);
            return {c:cl, s:sbn, sr:sbnr, n:(domNode ? domNode : cell.getNode(this.rowIndex)), r:rn};
        }
        return null;
    }, _scrollHeader:function (currentIdx) {
        var info = null;
        if (this._colHeadNode) {
            var cell = this.grid.getCell(currentIdx);
            if (!cell) {
                return;
            }
            info = this._scrollInfo(cell, cell.getNode(0));
        }
        if (info && info.s && info.sr && info.n) {
            var scroll = info.sr.l + info.sr.w;
            if (info.n.offsetLeft + info.n.offsetWidth > scroll) {
                info.s.scrollLeft = info.n.offsetLeft + info.n.offsetWidth - info.sr.w;
            } else {
                if (info.n.offsetLeft < info.sr.l) {
                    info.s.scrollLeft = info.n.offsetLeft;
                } else {
                    if (has("ie") <= 7 && cell && cell.view.headerNode) {
                        cell.view.headerNode.scrollLeft = info.s.scrollLeft;
                    }
                }
            }
        }
    }, _isHeaderHidden:function () {
        var curView = this.focusView;
        if (!curView) {
            for (var i = 0, cView; (cView = this.grid.views.views[i]); i++) {
                if (cView.headerNode) {
                    curView = cView;
                    break;
                }
            }
        }
        return (curView && html.getComputedStyle(curView.headerNode).display == "none");
    }, colSizeAdjust:function (e, colIdx, delta) {
        var headers = this._findHeaderCells();
        var view = this.focusView;
        if (!view || !view.header.tableMap.map) {
            for (var i = 0, cView; (cView = this.grid.views.views[i]); i++) {
                if (cView.header.tableMap.map) {
                    view = cView;
                    break;
                }
            }
        }
        var curHeader = headers[colIdx];
        if (!view || (colIdx == headers.length - 1 && colIdx === 0)) {
            return;
        }
        view.content.baseDecorateEvent(e);
        e.cellNode = curHeader;
        e.cellIndex = view.content.getCellNodeIndex(e.cellNode);
        e.cell = (e.cellIndex >= 0 ? this.grid.getCell(e.cellIndex) : null);
        if (view.header.canResize(e)) {
            var deltaObj = {l:delta};
            var drag = view.header.colResizeSetup(e, false);
            view.header.doResizeColumn(drag, null, deltaObj);
            view.update();
        }
    }, styleRow:function (inRow) {
        return;
    }, setFocusIndex:function (inRowIndex, inCellIndex) {
        this.setFocusCell(this.grid.getCell(inCellIndex), inRowIndex);
    }, setFocusCell:function (inCell, inRowIndex) {
        if (inCell && !this.isFocusCell(inCell, inRowIndex)) {
            this.tabbingOut = false;
            if (this._colHeadNode) {
                this.blurHeader();
            }
            this._colHeadNode = this._colHeadFocusIdx = null;
            this.focusGridView();
            this._focusifyCellNode(false);
            this.cell = inCell;
            this.rowIndex = inRowIndex;
            this._focusifyCellNode(true);
        }
        if (has("opera")) {
            setTimeout(lang.hitch(this.grid, "onCellFocus", this.cell, this.rowIndex), 1);
        } else {
            this.grid.onCellFocus(this.cell, this.rowIndex);
        }
    }, next:function () {
        if (this.cell) {
            var row = this.rowIndex, col = this.cell.index + 1, cc = this.grid.layout.cellCount - 1, rc = this.grid.rowCount - 1;
            if (col > cc) {
                col = 0;
                row++;
            }
            if (row > rc) {
                col = cc;
                row = rc;
            }
            if (this.grid.edit.isEditing()) {
                var nextCell = this.grid.getCell(col);
                if (!this.isLastFocusCell() && (!nextCell.editable || this.grid.canEdit && !this.grid.canEdit(nextCell, row))) {
                    this.cell = nextCell;
                    this.rowIndex = row;
                    this.next();
                    return;
                }
            }
            this.setFocusIndex(row, col);
        }
    }, previous:function () {
        if (this.cell) {
            var row = (this.rowIndex || 0), col = (this.cell.index || 0) - 1;
            if (col < 0) {
                col = this.grid.layout.cellCount - 1;
                row--;
            }
            if (row < 0) {
                row = 0;
                col = 0;
            }
            if (this.grid.edit.isEditing()) {
                var prevCell = this.grid.getCell(col);
                if (!this.isFirstFocusCell() && !prevCell.editable) {
                    this.cell = prevCell;
                    this.rowIndex = row;
                    this.previous();
                    return;
                }
            }
            this.setFocusIndex(row, col);
        }
    }, move:function (inRowDelta, inColDelta) {
        var colDir = inColDelta < 0 ? -1 : 1;
        if (this.isNavHeader()) {
            var headers = this._findHeaderCells();
            var savedIdx = currentIdx = array.indexOf(headers, this._colHeadNode);
            currentIdx += inColDelta;
            while (currentIdx >= 0 && currentIdx < headers.length && headers[currentIdx].style.display == "none") {
                currentIdx += colDir;
            }
            if ((currentIdx >= 0) && (currentIdx < headers.length)) {
                this._setActiveColHeader(headers[currentIdx], currentIdx, savedIdx);
            }
        } else {
            if (this.cell) {
                var sc = this.grid.scroller, r = this.rowIndex, rc = this.grid.rowCount - 1, row = Math.min(rc, Math.max(0, r + inRowDelta));
                if (inRowDelta) {
                    if (inRowDelta > 0) {
                        if (row > sc.getLastPageRow(sc.page)) {
                            this.grid.setScrollTop(this.grid.scrollTop + sc.findScrollTop(row) - sc.findScrollTop(r));
                        }
                    } else {
                        if (inRowDelta < 0) {
                            if (row <= sc.getPageRow(sc.page)) {
                                this.grid.setScrollTop(this.grid.scrollTop - sc.findScrollTop(r) - sc.findScrollTop(row));
                            }
                        }
                    }
                }
                var cc = this.grid.layout.cellCount - 1, i = this.cell.index, col = Math.min(cc, Math.max(0, i + inColDelta));
                var cell = this.grid.getCell(col);
                while (col >= 0 && col < cc && cell && cell.hidden === true) {
                    col += colDir;
                    cell = this.grid.getCell(col);
                }
                if (!cell || cell.hidden === true) {
                    col = i;
                }
                var n = cell.getNode(row);
                if (!n && inRowDelta) {
                    if ((row + inRowDelta) >= 0 && (row + inRowDelta) <= rc) {
                        this.move(inRowDelta > 0 ? ++inRowDelta : --inRowDelta, inColDelta);
                    }
                    return;
                } else {
                    if ((!n || html.style(n, "display") === "none") && inColDelta) {
                        if ((col + inColDelta) >= 0 && (col + inColDelta) <= cc) {
                            this.move(inRowDelta, inColDelta > 0 ? ++inColDelta : --inColDelta);
                        }
                        return;
                    }
                }
                this.setFocusIndex(row, col);
                if (inRowDelta) {
                    this.grid.updateRow(r);
                }
            }
        }
    }, previousKey:function (e) {
        if (this.grid.edit.isEditing()) {
            event.stop(e);
            this.previous();
        } else {
            if (!this.isNavHeader() && !this._isHeaderHidden()) {
                this.grid.domNode.focus();
                event.stop(e);
            } else {
                this.tabOut(this.grid.domNode);
                if (this._colHeadFocusIdx != null) {
                    html.toggleClass(this._findHeaderCells()[this._colHeadFocusIdx], this.focusClass, false);
                    this._colHeadFocusIdx = null;
                }
                this._focusifyCellNode(false);
            }
        }
    }, nextKey:function (e) {
        var isEmpty = (this.grid.rowCount === 0);
        if (e.target === this.grid.domNode && this._colHeadFocusIdx == null) {
            this.focusHeader();
            event.stop(e);
        } else {
            if (this.isNavHeader()) {
                this.blurHeader();
                if (!this.findAndFocusGridCell()) {
                    this.tabOut(this.grid.lastFocusNode);
                }
                this._colHeadNode = this._colHeadFocusIdx = null;
            } else {
                if (this.grid.edit.isEditing()) {
                    event.stop(e);
                    this.next();
                } else {
                    this.tabOut(this.grid.lastFocusNode);
                }
            }
        }
    }, tabOut:function (inFocusNode) {
        this.tabbingOut = true;
        inFocusNode.focus();
    }, focusGridView:function () {
        util.fire(this.focusView, "focus");
    }, focusGrid:function (inSkipFocusCell) {
        this.focusGridView();
        this._focusifyCellNode(true);
    }, findAndFocusGridCell:function () {
        var didFocus = true;
        var isEmpty = (this.grid.rowCount === 0);
        if (this.isNoFocusCell() && !isEmpty) {
            var cellIdx = 0;
            var cell = this.grid.getCell(cellIdx);
            if (cell.hidden) {
                cellIdx = this.isNavHeader() ? this._colHeadFocusIdx : 0;
            }
            this.setFocusIndex(0, cellIdx);
        } else {
            if (this.cell && !isEmpty) {
                if (this.focusView && !this.focusView.rowNodes[this.rowIndex]) {
                    this.grid.scrollToRow(this.rowIndex);
                }
                this.focusGrid();
            } else {
                didFocus = false;
            }
        }
        this._colHeadNode = this._colHeadFocusIdx = null;
        return didFocus;
    }, focusHeader:function () {
        var headerNodes = this._findHeaderCells();
        var saveColHeadFocusIdx = this._colHeadFocusIdx;
        if (this._isHeaderHidden()) {
            this.findAndFocusGridCell();
        } else {
            if (!this._colHeadFocusIdx) {
                if (this.isNoFocusCell()) {
                    this._colHeadFocusIdx = 0;
                } else {
                    this._colHeadFocusIdx = this.cell.index;
                }
            }
        }
        this._colHeadNode = headerNodes[this._colHeadFocusIdx];
        while (this._colHeadNode && this._colHeadFocusIdx >= 0 && this._colHeadFocusIdx < headerNodes.length && this._colHeadNode.style.display == "none") {
            this._colHeadFocusIdx++;
            this._colHeadNode = headerNodes[this._colHeadFocusIdx];
        }
        if (this._colHeadNode && this._colHeadNode.style.display != "none") {
            if (this.headerMenu && this._contextMenuBindNode != this.grid.domNode) {
                this.headerMenu.unBindDomNode(this.grid.viewsHeaderNode);
                this.headerMenu.bindDomNode(this.grid.domNode);
                this._contextMenuBindNode = this.grid.domNode;
            }
            this._setActiveColHeader(this._colHeadNode, this._colHeadFocusIdx, saveColHeadFocusIdx);
            this._scrollHeader(this._colHeadFocusIdx);
            this._focusifyCellNode(false);
        } else {
            this.findAndFocusGridCell();
        }
    }, blurHeader:function () {
        html.removeClass(this._colHeadNode, this.focusClass);
        html.removeAttr(this.grid.domNode, "aria-activedescendant");
        if (this.headerMenu && this._contextMenuBindNode == this.grid.domNode) {
            var viewsHeader = this.grid.viewsHeaderNode;
            this.headerMenu.unBindDomNode(this.grid.domNode);
            this.headerMenu.bindDomNode(viewsHeader);
            this._contextMenuBindNode = viewsHeader;
        }
    }, doFocus:function (e) {
        if (e && e.target != e.currentTarget) {
            event.stop(e);
            return;
        }
        if (this._clickFocus) {
            return;
        }
        if (!this.tabbingOut) {
            this.focusHeader();
        }
        this.tabbingOut = false;
        event.stop(e);
    }, doBlur:function (e) {
        event.stop(e);
    }, doContextMenu:function (e) {
        if (!this.headerMenu) {
            event.stop(e);
        }
    }, doLastNodeFocus:function (e) {
        if (this.tabbingOut) {
            this._focusifyCellNode(false);
        } else {
            if (this.grid.rowCount > 0) {
                if (this.isNoFocusCell()) {
                    this.setFocusIndex(0, 0);
                }
                this._focusifyCellNode(true);
            } else {
                this.focusHeader();
            }
        }
        this.tabbingOut = false;
        event.stop(e);
    }, doLastNodeBlur:function (e) {
        event.stop(e);
    }, doColHeaderFocus:function (e) {
        this._setActiveColHeader(e.target, html.attr(e.target, "idx"), this._colHeadFocusIdx);
        this._scrollHeader(this.getHeaderIndex());
        event.stop(e);
    }, doColHeaderBlur:function (e) {
        html.toggleClass(e.target, this.focusClass, false);
    }, _mouseDown:function (e) {
        this._clickFocus = dojo.some(this.grid.views.views, function (v) {
            return v.scrollboxNode === e.target;
        });
    }, _mouseUp:function (e) {
        this._clickFocus = false;
    }});
});

