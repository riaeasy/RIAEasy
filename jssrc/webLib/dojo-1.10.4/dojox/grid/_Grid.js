//>>built

require({cache:{"url:dojox/grid/resources/_Grid.html":"<div hidefocus=\"hidefocus\" role=\"grid\" dojoAttachEvent=\"onmouseout:_mouseOut\">\n\t<div class=\"dojoxGridMasterHeader\" dojoAttachPoint=\"viewsHeaderNode\" role=\"presentation\"></div>\n\t<div class=\"dojoxGridMasterView\" dojoAttachPoint=\"viewsNode\" role=\"presentation\"></div>\n\t<div class=\"dojoxGridMasterMessages\" style=\"display: none;\" dojoAttachPoint=\"messagesNode\"></div>\n\t<span dojoAttachPoint=\"lastFocusNode\" tabindex=\"0\"></span>\n</div>\n"}});
define("dojox/grid/_Grid", ["dojo/_base/kernel", "../main", "dojo/_base/declare", "./_Events", "./_Scroller", "./_Layout", "./_View", "./_ViewManager", "./_RowManager", "./_FocusManager", "./_EditManager", "./Selection", "./_RowSelector", "./util", "dijit/_Widget", "dijit/_TemplatedMixin", "dijit/CheckedMenuItem", "dojo/text!./resources/_Grid.html", "dojo/string", "dojo/_base/array", "dojo/_base/lang", "dojo/_base/sniff", "dojox/html/metrics", "dojo/_base/html", "dojo/query", "dojo/dnd/common", "dojo/i18n!dijit/nls/loading"], function (dojo, dojox, declare, _Events, _Scroller, _Layout, _View, _ViewManager, _RowManager, _FocusManager, _EditManager, Selection, _RowSelector, util, _Widget, _TemplatedMixin, CheckedMenuItem, template, string, array, lang, has, metrics, html, query) {
    if (!dojo.isCopyKey) {
        dojo.isCopyKey = dojo.dnd.getCopyKeyState;
    }
    var _Grid = declare("dojox.grid._Grid", [_Widget, _TemplatedMixin, _Events], {templateString:template, classTag:"dojoxGrid", rowCount:5, keepRows:75, rowsPerPage:25, autoWidth:false, initialWidth:"", autoHeight:"", rowHeight:0, autoRender:true, defaultHeight:"15em", height:"", structure:null, elasticView:-1, singleClickEdit:false, selectionMode:"extended", rowSelector:"", columnReordering:false, headerMenu:null, placeholderLabel:"GridColumns", selectable:false, _click:null, loadingMessage:"<span class='dojoxGridLoading'>${loadingState}</span>", errorMessage:"<span class='dojoxGridError'>${errorState}</span>", noDataMessage:"", escapeHTMLInData:true, formatterScope:null, editable:false, summary:"", _setSummaryAttr:"domNode", sortInfo:0, _placeholders:null, _layoutClass:_Layout, buildRendering:function () {
        this.inherited(arguments);
        if (!this.domNode.getAttribute("tabIndex")) {
            this.domNode.tabIndex = "0";
        }
        this.createScroller();
        this.createLayout();
        this.createViews();
        this.createManagers();
        this.createSelection();
        this.connect(this.selection, "onSelected", "onSelected");
        this.connect(this.selection, "onDeselected", "onDeselected");
        this.connect(this.selection, "onChanged", "onSelectionChanged");
        metrics.initOnFontResize();
        this.connect(metrics, "onFontResize", "textSizeChanged");
        util.funnelEvents(this.domNode, this, "doKeyEvent", util.keyEvents);
        if (this.selectionMode != "none") {
            this.domNode.setAttribute("aria-multiselectable", this.selectionMode == "single" ? "false" : "true");
        }
        html.addClass(this.domNode, this.classTag);
        if (!this.isLeftToRight()) {
            html.addClass(this.domNode, this.classTag + "Rtl");
        }
        if (this.rowHeight > 0) {
            html.addClass(this.viewsNode, this.classTag + "FixedRowHeight");
        }
    }, postMixInProperties:function () {
        this.inherited(arguments);
        var messages = dojo.i18n.getLocalization("dijit", "loading", this.lang);
        this.loadingMessage = string.substitute(this.loadingMessage, messages);
        this.errorMessage = string.substitute(this.errorMessage, messages);
        if (this.srcNodeRef && this.srcNodeRef.style.height) {
            this.height = this.srcNodeRef.style.height;
        }
        this._setAutoHeightAttr(this.autoHeight, true);
        this.lastScrollTop = this.scrollTop = 0;
    }, postCreate:function () {
        this._placeholders = [];
        this._setHeaderMenuAttr(this.headerMenu);
        this._setStructureAttr(this.structure);
        this._click = [];
        this.inherited(arguments);
        if (this.domNode && this.autoWidth && this.initialWidth) {
            this.domNode.style.width = this.initialWidth;
        }
        if (this.domNode && !this.editable) {
            html.attr(this.domNode, "aria-readonly", "true");
        }
    }, destroy:function () {
        this.domNode.onReveal = null;
        this.domNode.onSizeChange = null;
        delete this._click;
        if (this.scroller) {
            this.scroller.destroy();
            delete this.scroller;
        }
        this.edit.destroy();
        delete this.edit;
        this.views.destroyViews();
        if (this.focus) {
            this.focus.destroy();
            delete this.focus;
        }
        if (this.headerMenu && this._placeholders.length) {
            array.forEach(this._placeholders, function (p) {
                p.unReplace(true);
            });
            this.headerMenu.unBindDomNode(this.viewsHeaderNode);
        }
        this.inherited(arguments);
    }, _setAutoHeightAttr:function (ah, skipRender) {
        if (typeof ah == "string") {
            if (!ah || ah == "false") {
                ah = false;
            } else {
                if (ah == "true") {
                    ah = true;
                } else {
                    ah = window.parseInt(ah, 10);
                }
            }
        }
        if (typeof ah == "number") {
            if (isNaN(ah)) {
                ah = false;
            }
            if (ah < 0) {
                ah = true;
            } else {
                if (ah === 0) {
                    ah = false;
                }
            }
        }
        this.autoHeight = ah;
        if (typeof ah == "boolean") {
            this._autoHeight = ah;
        } else {
            if (typeof ah == "number") {
                this._autoHeight = (ah >= this.get("rowCount"));
            } else {
                this._autoHeight = false;
            }
        }
        if (this._started && !skipRender) {
            this.render();
        }
    }, _getRowCountAttr:function () {
        return this.updating && this.invalidated && this.invalidated.rowCount != undefined ? this.invalidated.rowCount : this.rowCount;
    }, textSizeChanged:function () {
        this.render();
    }, sizeChange:function () {
        this.update();
    }, createManagers:function () {
        this.rows = new _RowManager(this);
        this.focus = new _FocusManager(this);
        this.edit = new _EditManager(this);
    }, createSelection:function () {
        this.selection = new Selection(this);
    }, createScroller:function () {
        this.scroller = new _Scroller();
        this.scroller.grid = this;
        this.scroller.renderRow = lang.hitch(this, "renderRow");
        this.scroller.removeRow = lang.hitch(this, "rowRemoved");
    }, createLayout:function () {
        this.layout = new this._layoutClass(this);
        this.connect(this.layout, "moveColumn", "onMoveColumn");
    }, onMoveColumn:function () {
        this.update();
    }, onResizeColumn:function (cellIdx) {
    }, createViews:function () {
        this.views = new _ViewManager(this);
        this.views.createView = lang.hitch(this, "createView");
    }, createView:function (inClass, idx) {
        var c = lang.getObject(inClass);
        var view = new c({grid:this, index:idx});
        this.viewsNode.appendChild(view.domNode);
        this.viewsHeaderNode.appendChild(view.headerNode);
        this.views.addView(view);
        html.attr(this.domNode, "align", this.isLeftToRight() ? "left" : "right");
        return view;
    }, buildViews:function () {
        for (var i = 0, vs; (vs = this.layout.structure[i]); i++) {
            this.createView(vs.type || dojox._scopeName + ".grid._View", i).setStructure(vs);
        }
        this.scroller.setContentNodes(this.views.getContentNodes());
    }, _setStructureAttr:function (structure) {
        var s = structure;
        if (s && lang.isString(s)) {
            dojo.deprecated("dojox.grid._Grid.set('structure', 'objVar')", "use dojox.grid._Grid.set('structure', objVar) instead", "2.0");
            s = lang.getObject(s);
        }
        this.structure = s;
        if (!s) {
            if (this.layout.structure) {
                s = this.layout.structure;
            } else {
                return;
            }
        }
        this.views.destroyViews();
        this.focus.focusView = null;
        if (s !== this.layout.structure) {
            this.layout.setStructure(s);
        }
        this._structureChanged();
    }, setStructure:function (inStructure) {
        dojo.deprecated("dojox.grid._Grid.setStructure(obj)", "use dojox.grid._Grid.set('structure', obj) instead.", "2.0");
        this._setStructureAttr(inStructure);
    }, getColumnTogglingItems:function () {
        var items, checkedItems = [];
        items = array.map(this.layout.cells, function (cell) {
            if (!cell.menuItems) {
                cell.menuItems = [];
            }
            var self = this;
            var item = new CheckedMenuItem({label:cell.name, checked:!cell.hidden, _gridCell:cell, onChange:function (checked) {
                if (self.layout.setColumnVisibility(this._gridCell.index, checked)) {
                    var items = this._gridCell.menuItems;
                    if (items.length > 1) {
                        array.forEach(items, function (item) {
                            if (item !== this) {
                                item.setAttribute("checked", checked);
                            }
                        }, this);
                    }
                    checked = array.filter(self.layout.cells, function (c) {
                        if (c.menuItems.length > 1) {
                            array.forEach(c.menuItems, "item.set('disabled', false);");
                        } else {
                            c.menuItems[0].set("disabled", false);
                        }
                        return !c.hidden;
                    });
                    if (checked.length == 1) {
                        array.forEach(checked[0].menuItems, "item.set('disabled', true);");
                    }
                }
            }, destroy:function () {
                var index = array.indexOf(this._gridCell.menuItems, this);
                this._gridCell.menuItems.splice(index, 1);
                delete this._gridCell;
                CheckedMenuItem.prototype.destroy.apply(this, arguments);
            }});
            cell.menuItems.push(item);
            if (!cell.hidden) {
                checkedItems.push(item);
            }
            return item;
        }, this);
        if (checkedItems.length == 1) {
            checkedItems[0].set("disabled", true);
        }
        return items;
    }, _setHeaderMenuAttr:function (menu) {
        if (this._placeholders && this._placeholders.length) {
            array.forEach(this._placeholders, function (p) {
                p.unReplace(true);
            });
            this._placeholders = [];
        }
        if (this.headerMenu) {
            this.headerMenu.unBindDomNode(this.viewsHeaderNode);
        }
        this.headerMenu = menu;
        if (!menu) {
            return;
        }
        this.headerMenu.bindDomNode(this.viewsHeaderNode);
        if (this.headerMenu.getPlaceholders) {
            this._placeholders = this.headerMenu.getPlaceholders(this.placeholderLabel);
        }
    }, setHeaderMenu:function (menu) {
        dojo.deprecated("dojox.grid._Grid.setHeaderMenu(obj)", "use dojox.grid._Grid.set('headerMenu', obj) instead.", "2.0");
        this._setHeaderMenuAttr(menu);
    }, setupHeaderMenu:function () {
        if (this._placeholders && this._placeholders.length) {
            array.forEach(this._placeholders, function (p) {
                if (p._replaced) {
                    p.unReplace(true);
                }
                p.replace(this.getColumnTogglingItems());
            }, this);
        }
    }, _fetch:function (start) {
        this.setScrollTop(0);
    }, getItem:function (inRowIndex) {
        return null;
    }, showMessage:function (message) {
        if (message) {
            this.messagesNode.innerHTML = message;
            this.messagesNode.style.display = "";
        } else {
            this.messagesNode.innerHTML = "";
            this.messagesNode.style.display = "none";
        }
    }, _structureChanged:function () {
        this.buildViews();
        if (this.autoRender && this._started) {
            this.render();
        }
    }, hasLayout:function () {
        return this.layout.cells.length;
    }, resize:function (changeSize, resultSize) {
        this._pendingChangeSize = changeSize;
        this._pendingResultSize = resultSize;
        this.sizeChange();
    }, _getPadBorder:function () {
        this._padBorder = this._padBorder || html._getPadBorderExtents(this.domNode);
        return this._padBorder;
    }, _getHeaderHeight:function () {
        var vns = this.viewsHeaderNode.style, t = vns.display == "none" ? 0 : this.views.measureHeader();
        vns.height = t + "px";
        this.views.normalizeHeaderNodeHeight();
        return t;
    }, _resize:function (changeSize, resultSize) {
        changeSize = changeSize || this._pendingChangeSize;
        resultSize = resultSize || this._pendingResultSize;
        delete this._pendingChangeSize;
        delete this._pendingResultSize;
        if (!this.domNode) {
            return;
        }
        var pn = this.domNode.parentNode;
        if (!pn || pn.nodeType != 1 || !this.hasLayout() || pn.style.visibility == "hidden" || pn.style.display == "none") {
            return;
        }
        var padBorder = this._getPadBorder();
        var hh = undefined;
        var h;
        if (this._autoHeight) {
            this.domNode.style.height = "auto";
        } else {
            if (typeof this.autoHeight == "number") {
                h = hh = this._getHeaderHeight();
                h += (this.scroller.averageRowHeight * this.autoHeight);
                this.domNode.style.height = h + "px";
            } else {
                if (this.domNode.clientHeight <= padBorder.h) {
                    if (pn == document.body) {
                        this.domNode.style.height = this.defaultHeight;
                    } else {
                        if (this.height) {
                            this.domNode.style.height = this.height;
                        } else {
                            this.fitTo = "parent";
                        }
                    }
                }
            }
        }
        if (resultSize) {
            changeSize = resultSize;
        }
        if (!this._autoHeight && changeSize) {
            html.marginBox(this.domNode, changeSize);
            this.height = this.domNode.style.height;
            delete this.fitTo;
        } else {
            if (this.fitTo == "parent") {
                h = this._parentContentBoxHeight = (this._parentContentBoxHeight > 0 ? this._parentContentBoxHeight : html._getContentBox(pn).h);
                this.domNode.style.height = Math.max(0, h) + "px";
            }
        }
        var hasFlex = array.some(this.views.views, function (v) {
            return v.flexCells;
        });
        if (!this._autoHeight && (h || html._getContentBox(this.domNode).h) === 0) {
            this.viewsHeaderNode.style.display = "none";
        } else {
            this.viewsHeaderNode.style.display = "block";
            if (!hasFlex && hh === undefined) {
                hh = this._getHeaderHeight();
            }
        }
        if (hasFlex) {
            hh = undefined;
        }
        this.adaptWidth();
        this.adaptHeight(hh);
        this.postresize();
    }, adaptWidth:function () {
        var doAutoWidth = (!this.initialWidth && this.autoWidth);
        var w = doAutoWidth ? 0 : this.domNode.clientWidth || (this.domNode.offsetWidth - this._getPadBorder().w), vw = this.views.arrange(1, w);
        this.views.onEach("adaptWidth");
        if (doAutoWidth) {
            this.domNode.style.width = vw + "px";
        }
    }, adaptHeight:function (inHeaderHeight) {
        var t = inHeaderHeight === undefined ? this._getHeaderHeight() : inHeaderHeight;
        var h = (this._autoHeight ? -1 : Math.max(this.domNode.clientHeight - t, 0) || 0);
        this.views.onEach("setSize", [0, h]);
        this.views.onEach("adaptHeight");
        if (!this._autoHeight) {
            var numScroll = 0, numNoScroll = 0;
            var noScrolls = array.filter(this.views.views, function (v) {
                var has = v.hasHScrollbar();
                if (has) {
                    numScroll++;
                } else {
                    numNoScroll++;
                }
                return (!has);
            });
            if (numScroll > 0 && numNoScroll > 0) {
                array.forEach(noScrolls, function (v) {
                    v.adaptHeight(true);
                });
            }
        }
        if (this.autoHeight === true || h != -1 || (typeof this.autoHeight == "number" && this.autoHeight >= this.get("rowCount"))) {
            this.scroller.windowHeight = h;
        } else {
            this.scroller.windowHeight = Math.max(this.domNode.clientHeight - t, 0);
        }
    }, startup:function () {
        if (this._started) {
            return;
        }
        this.inherited(arguments);
        if (this.autoRender) {
            this.render();
        }
    }, render:function () {
        if (!this.domNode) {
            return;
        }
        if (!this._started) {
            return;
        }
        if (!this.hasLayout()) {
            this.scroller.init(0, this.keepRows, this.rowsPerPage);
            return;
        }
        this.update = this.defaultUpdate;
        this._render();
    }, _render:function () {
        this.scroller.init(this.get("rowCount"), this.keepRows, this.rowsPerPage);
        this.prerender();
        this.setScrollTop(0);
        this.postrender();
    }, prerender:function () {
        this.keepRows = this._autoHeight ? 0 : this.keepRows;
        this.scroller.setKeepInfo(this.keepRows);
        this.views.render();
        this._resize();
    }, postrender:function () {
        this.postresize();
        this.focus.initFocusView();
        html.setSelectable(this.domNode, this.selectable);
    }, postresize:function () {
        if (this._autoHeight) {
            var size = Math.max(this.views.measureContent()) + "px";
            this.viewsNode.style.height = size;
        }
    }, renderRow:function (inRowIndex, inNodes) {
        this.views.renderRow(inRowIndex, inNodes, this._skipRowRenormalize);
    }, rowRemoved:function (inRowIndex) {
        this.views.rowRemoved(inRowIndex);
    }, invalidated:null, updating:false, beginUpdate:function () {
        this.invalidated = [];
        this.updating = true;
    }, endUpdate:function () {
        this.updating = false;
        var i = this.invalidated, r;
        if (i.all) {
            this.update();
        } else {
            if (i.rowCount != undefined) {
                this.updateRowCount(i.rowCount);
            } else {
                for (r in i) {
                    this.updateRow(Number(r));
                }
            }
        }
        this.invalidated = [];
    }, defaultUpdate:function () {
        if (!this.domNode) {
            return;
        }
        if (this.updating) {
            this.invalidated.all = true;
            return;
        }
        this.lastScrollTop = this.scrollTop;
        this.prerender();
        this.scroller.invalidateNodes();
        this.setScrollTop(this.lastScrollTop);
        this.postrender();
    }, update:function () {
        this.render();
    }, updateRow:function (inRowIndex) {
        inRowIndex = Number(inRowIndex);
        if (this.updating) {
            this.invalidated[inRowIndex] = true;
        } else {
            this.views.updateRow(inRowIndex);
            this.scroller.rowHeightChanged(inRowIndex);
        }
    }, updateRows:function (startIndex, howMany) {
        startIndex = Number(startIndex);
        howMany = Number(howMany);
        var i;
        if (this.updating) {
            for (i = 0; i < howMany; i++) {
                this.invalidated[i + startIndex] = true;
            }
        } else {
            for (i = 0; i < howMany; i++) {
                this.views.updateRow(i + startIndex, this._skipRowRenormalize);
            }
            this.scroller.rowHeightChanged(startIndex);
        }
    }, updateRowCount:function (inRowCount) {
        if (this.updating) {
            this.invalidated.rowCount = inRowCount;
        } else {
            this.rowCount = inRowCount;
            this._setAutoHeightAttr(this.autoHeight, true);
            if (this.layout.cells.length) {
                this.scroller.updateRowCount(inRowCount);
            }
            this._resize();
            if (this.layout.cells.length) {
                this.setScrollTop(this.scrollTop);
            }
        }
    }, updateRowStyles:function (inRowIndex) {
        this.views.updateRowStyles(inRowIndex);
    }, getRowNode:function (inRowIndex) {
        if (this.focus.focusView && !(this.focus.focusView instanceof _RowSelector)) {
            return this.focus.focusView.rowNodes[inRowIndex];
        } else {
            for (var i = 0, cView; (cView = this.views.views[i]); i++) {
                if (!(cView instanceof _RowSelector)) {
                    return cView.rowNodes[inRowIndex];
                }
            }
        }
        return null;
    }, rowHeightChanged:function (inRowIndex) {
        this.views.renormalizeRow(inRowIndex);
        this.scroller.rowHeightChanged(inRowIndex);
    }, fastScroll:true, delayScroll:false, scrollRedrawThreshold:(has("ie") ? 100 : 50), scrollTo:function (inTop) {
        if (!this.fastScroll) {
            this.setScrollTop(inTop);
            return;
        }
        var delta = Math.abs(this.lastScrollTop - inTop);
        this.lastScrollTop = inTop;
        if (delta > this.scrollRedrawThreshold || this.delayScroll) {
            this.delayScroll = true;
            this.scrollTop = inTop;
            this.views.setScrollTop(inTop);
            if (this._pendingScroll) {
                window.clearTimeout(this._pendingScroll);
            }
            var _this = this;
            this._pendingScroll = window.setTimeout(function () {
                delete _this._pendingScroll;
                _this.finishScrollJob();
            }, 200);
        } else {
            this.setScrollTop(inTop);
        }
    }, finishScrollJob:function () {
        this.delayScroll = false;
        this.setScrollTop(this.scrollTop);
    }, setScrollTop:function (inTop) {
        this.scroller.scroll(this.views.setScrollTop(inTop));
    }, scrollToRow:function (inRowIndex) {
        this.setScrollTop(this.scroller.findScrollTop(inRowIndex) + 1);
    }, styleRowNode:function (inRowIndex, inRowNode) {
        if (inRowNode) {
            this.rows.styleRowNode(inRowIndex, inRowNode);
        }
    }, _mouseOut:function (e) {
        this.rows.setOverRow(-2);
    }, getCell:function (inIndex) {
        return this.layout.cells[inIndex];
    }, setCellWidth:function (inIndex, inUnitWidth) {
        this.getCell(inIndex).unitWidth = inUnitWidth;
    }, getCellName:function (inCell) {
        return "Cell " + inCell.index;
    }, canSort:function (inSortInfo) {
    }, sort:function () {
    }, getSortAsc:function (inSortInfo) {
        inSortInfo = inSortInfo == undefined ? this.sortInfo : inSortInfo;
        return Boolean(inSortInfo > 0);
    }, getSortIndex:function (inSortInfo) {
        inSortInfo = inSortInfo == undefined ? this.sortInfo : inSortInfo;
        return Math.abs(inSortInfo) - 1;
    }, setSortIndex:function (inIndex, inAsc) {
        var si = inIndex + 1;
        if (inAsc != undefined) {
            si *= (inAsc ? 1 : -1);
        } else {
            if (this.getSortIndex() == inIndex) {
                si = -this.sortInfo;
            }
        }
        this.setSortInfo(si);
    }, setSortInfo:function (inSortInfo) {
        if (this.canSort(inSortInfo)) {
            this.sortInfo = inSortInfo;
            this.sort();
            this.update();
        }
    }, doKeyEvent:function (e) {
        e.dispatch = "do" + e.type;
        this.onKeyEvent(e);
    }, _dispatch:function (m, e) {
        if (m in this) {
            return this[m](e);
        }
        return false;
    }, dispatchKeyEvent:function (e) {
        this._dispatch(e.dispatch, e);
    }, dispatchContentEvent:function (e) {
        this.edit.dispatchEvent(e) || e.sourceView.dispatchContentEvent(e) || this._dispatch(e.dispatch, e);
    }, dispatchHeaderEvent:function (e) {
        e.sourceView.dispatchHeaderEvent(e) || this._dispatch("doheader" + e.type, e);
    }, dokeydown:function (e) {
        this.onKeyDown(e);
    }, doclick:function (e) {
        if (e.cellNode) {
            this.onCellClick(e);
        } else {
            this.onRowClick(e);
        }
    }, dodblclick:function (e) {
        if (e.cellNode) {
            this.onCellDblClick(e);
        } else {
            this.onRowDblClick(e);
        }
    }, docontextmenu:function (e) {
        if (e.cellNode) {
            this.onCellContextMenu(e);
        } else {
            this.onRowContextMenu(e);
        }
    }, doheaderclick:function (e) {
        if (e.cellNode) {
            this.onHeaderCellClick(e);
        } else {
            this.onHeaderClick(e);
        }
    }, doheaderdblclick:function (e) {
        if (e.cellNode) {
            this.onHeaderCellDblClick(e);
        } else {
            this.onHeaderDblClick(e);
        }
    }, doheadercontextmenu:function (e) {
        if (e.cellNode) {
            this.onHeaderCellContextMenu(e);
        } else {
            this.onHeaderContextMenu(e);
        }
    }, doStartEdit:function (inCell, inRowIndex) {
        this.onStartEdit(inCell, inRowIndex);
    }, doApplyCellEdit:function (inValue, inRowIndex, inFieldIndex) {
        this.onApplyCellEdit(inValue, inRowIndex, inFieldIndex);
    }, doCancelEdit:function (inRowIndex) {
        this.onCancelEdit(inRowIndex);
    }, doApplyEdit:function (inRowIndex) {
        this.onApplyEdit(inRowIndex);
    }, addRow:function () {
        this.updateRowCount(this.get("rowCount") + 1);
    }, removeSelectedRows:function () {
        if (this.allItemsSelected) {
            this.updateRowCount(0);
        } else {
            this.updateRowCount(Math.max(0, this.get("rowCount") - this.selection.getSelected().length));
        }
        this.selection.clear();
    }});
    _Grid.markupFactory = function (props, node, ctor, cellFunc) {
        var widthFromAttr = function (n) {
            var w = html.attr(n, "width") || "auto";
            if ((w != "auto") && (w.slice(-2) != "em") && (w.slice(-1) != "%")) {
                w = parseInt(w, 10) + "px";
            }
            return w;
        };
        if (!props.structure && node.nodeName.toLowerCase() == "table") {
            props.structure = query("> colgroup", node).map(function (cg) {
                var sv = html.attr(cg, "span");
                var v = {noscroll:(html.attr(cg, "noscroll") == "true") ? true : false, __span:(!!sv ? parseInt(sv, 10) : 1), cells:[]};
                if (html.hasAttr(cg, "width")) {
                    v.width = widthFromAttr(cg);
                }
                return v;
            });
            if (!props.structure.length) {
                props.structure.push({__span:Infinity, cells:[]});
            }
            query("thead > tr", node).forEach(function (tr, tr_idx) {
                var cellCount = 0;
                var viewIdx = 0;
                var lastViewIdx;
                var cView = null;
                query("> th", tr).map(function (th) {
                    if (!cView) {
                        lastViewIdx = 0;
                        cView = props.structure[0];
                    } else {
                        if (cellCount >= (lastViewIdx + cView.__span)) {
                            viewIdx++;
                            lastViewIdx += cView.__span;
                            var lastView = cView;
                            cView = props.structure[viewIdx];
                        }
                    }
                    var cell = {name:lang.trim(html.attr(th, "name") || th.innerHTML), colSpan:parseInt(html.attr(th, "colspan") || 1, 10), type:lang.trim(html.attr(th, "cellType") || ""), id:lang.trim(html.attr(th, "id") || "")};
                    cellCount += cell.colSpan;
                    var rowSpan = html.attr(th, "rowspan");
                    if (rowSpan) {
                        cell.rowSpan = rowSpan;
                    }
                    if (html.hasAttr(th, "width")) {
                        cell.width = widthFromAttr(th);
                    }
                    if (html.hasAttr(th, "relWidth")) {
                        cell.relWidth = window.parseInt(html.attr(th, "relWidth"), 10);
                    }
                    if (html.hasAttr(th, "hidden")) {
                        cell.hidden = (html.attr(th, "hidden") == "true" || html.attr(th, "hidden") === true);
                    }
                    if (cellFunc) {
                        cellFunc(th, cell);
                    }
                    cell.type = cell.type ? lang.getObject(cell.type) : dojox.grid.cells.Cell;
                    if (cell.type && cell.type.markupFactory) {
                        cell.type.markupFactory(th, cell);
                    }
                    if (!cView.cells[tr_idx]) {
                        cView.cells[tr_idx] = [];
                    }
                    cView.cells[tr_idx].push(cell);
                });
            });
        }
        return new ctor(props, node);
    };
    return _Grid;
});

