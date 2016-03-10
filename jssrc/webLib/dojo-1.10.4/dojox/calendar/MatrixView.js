//>>built

require({cache:{"url:dojox/calendar/templates/MatrixView.html":"<div data-dojo-attach-events=\"keydown:_onKeyDown\">\n\t<div  class=\"dojoxCalendarYearColumnHeader\" data-dojo-attach-point=\"yearColumnHeader\">\n\t\t<table><tr><td><span data-dojo-attach-point=\"yearColumnHeaderContent\"></span></td></tr></table>\t\t\n\t</div>\t\n\t<div data-dojo-attach-point=\"columnHeader\" class=\"dojoxCalendarColumnHeader\">\n\t\t<table data-dojo-attach-point=\"columnHeaderTable\" class=\"dojoxCalendarColumnHeaderTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t</div>\t\t\n\t<div dojoAttachPoint=\"rowHeader\" class=\"dojoxCalendarRowHeader\">\n\t\t<table data-dojo-attach-point=\"rowHeaderTable\" class=\"dojoxCalendarRowHeaderTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t</div>\t\n\t<div dojoAttachPoint=\"grid\" class=\"dojoxCalendarGrid\">\n\t\t<table data-dojo-attach-point=\"gridTable\" class=\"dojoxCalendarGridTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t</div>\t\n\t<div data-dojo-attach-point=\"itemContainer\" class=\"dojoxCalendarContainer\" data-dojo-attach-event=\"mousedown:_onGridMouseDown,mouseup:_onGridMouseUp,ondblclick:_onGridDoubleClick,touchstart:_onGridTouchStart,touchmove:_onGridTouchMove,touchend:_onGridTouchEnd\">\n\t\t<table data-dojo-attach-point=\"itemContainerTable\" class=\"dojoxCalendarContainerTable\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%\"></table>\n\t</div>\t\n</div>\n"}});
define("dojox/calendar/MatrixView", ["dojo/_base/declare", "dojo/_base/array", "dojo/_base/event", "dojo/_base/lang", "dojo/_base/sniff", "dojo/_base/fx", "dojo/_base/html", "dojo/on", "dojo/dom", "dojo/dom-class", "dojo/dom-style", "dojo/dom-geometry", "dojo/dom-construct", "dojo/query", "dojox/html/metrics", "dojo/i18n", "./ViewBase", "dojo/text!./templates/MatrixView.html", "dijit/_TemplatedMixin"], function (declare, arr, event, lang, has, fx, html, on, dom, domClass, domStyle, domGeometry, domConstruct, query, metrics, i18n, ViewBase, template, _TemplatedMixin) {
    return declare("dojox.calendar.MatrixView", [ViewBase, _TemplatedMixin], {templateString:template, baseClass:"dojoxCalendarMatrixView", _setTabIndexAttr:"domNode", viewKind:"matrix", renderData:null, startDate:null, refStartTime:null, refEndTime:null, columnCount:7, rowCount:5, horizontalRenderer:null, labelRenderer:null, expandRenderer:null, horizontalDecorationRenderer:null, percentOverlap:0, verticalGap:2, horizontalRendererHeight:17, labelRendererHeight:14, expandRendererHeight:15, cellPaddingTop:16, expandDuration:300, expandEasing:null, layoutDuringResize:false, roundToDay:true, showCellLabel:true, scrollable:false, resizeCursor:"e-resize", constructor:function () {
        this.invalidatingProperties = ["columnCount", "rowCount", "startDate", "horizontalRenderer", "horizontalDecaorationRenderer", "labelRenderer", "expandRenderer", "rowHeaderDatePattern", "columnHeaderLabelLength", "cellHeaderShortPattern", "cellHeaderLongPattern", "percentOverlap", "verticalGap", "horizontalRendererHeight", "labelRendererHeight", "expandRendererHeight", "cellPaddingTop", "roundToDay", "itemToRendererKindFunc", "layoutPriorityFunction", "formatItemTimeFunc", "textDir", "items"];
        this._ddRendererList = [];
        this._ddRendererPool = [];
        this._rowHeaderHandles = [];
    }, destroy:function (preserveDom) {
        this._cleanupRowHeader();
        this.inherited(arguments);
    }, postCreate:function () {
        this.inherited(arguments);
        this._initialized = true;
        if (!this.invalidRendering) {
            this.refreshRendering();
        }
    }, _createRenderData:function () {
        var rd = {};
        rd.dateLocaleModule = this.dateLocaleModule;
        rd.dateClassObj = this.dateClassObj;
        rd.dateModule = this.dateModule;
        rd.dates = [];
        rd.columnCount = this.get("columnCount");
        rd.rowCount = this.get("rowCount");
        rd.sheetHeight = this.itemContainer.offsetHeight;
        this._computeRowsHeight(rd);
        var d = this.get("startDate");
        if (d == null) {
            d = new rd.dateClassObj();
        }
        d = this.floorToDay(d, false, rd);
        this.startDate = d;
        for (var row = 0; row < rd.rowCount; row++) {
            rd.dates.push([]);
            for (var col = 0; col < rd.columnCount; col++) {
                rd.dates[row].push(d);
                d = this.addAndFloor(d, "day", 1);
            }
        }
        rd.startTime = this.newDate(rd.dates[0][0], rd);
        rd.endTime = this.newDate(rd.dates[rd.rowCount - 1][rd.columnCount - 1], rd);
        rd.endTime = rd.dateModule.add(rd.endTime, "day", 1);
        rd.endTime = this.floorToDay(rd.endTime, true);
        if (this.displayedItemsInvalidated && !this._isEditing) {
            this.displayedItemsInvalidated = false;
            this._computeVisibleItems(rd);
        } else {
            if (this.renderData) {
                rd.items = this.renderData.items;
            }
        }
        if (this.displayedDecorationItemsInvalidated) {
            rd.decorationItems = this.decorationStoreManager._computeVisibleItems(rd);
        } else {
            if (this.renderData) {
                rd.decorationItems = this.renderData.decorationItems;
            }
        }
        rd.rtl = !this.isLeftToRight();
        return rd;
    }, _validateProperties:function () {
        this.inherited(arguments);
        if (this.columnCount < 1 || isNaN(this.columnCount)) {
            this.columnCount = 1;
        }
        if (this.rowCount < 1 || isNaN(this.rowCount)) {
            this.rowCount = 1;
        }
        if (isNaN(this.percentOverlap) || this.percentOverlap < 0 || this.percentOverlap > 100) {
            this.percentOverlap = 0;
        }
        if (isNaN(this.verticalGap) || this.verticalGap < 0) {
            this.verticalGap = 2;
        }
        if (isNaN(this.horizontalRendererHeight) || this.horizontalRendererHeight < 1) {
            this.horizontalRendererHeight = 17;
        }
        if (isNaN(this.labelRendererHeight) || this.labelRendererHeight < 1) {
            this.labelRendererHeight = 14;
        }
        if (isNaN(this.expandRendererHeight) || this.expandRendererHeight < 1) {
            this.expandRendererHeight = 15;
        }
    }, _setStartDateAttr:function (value) {
        this.displayedItemsInvalidated = true;
        this._set("startDate", value);
    }, _setColumnCountAttr:function (value) {
        this.displayedItemsInvalidated = true;
        this._set("columnCount", value);
    }, _setRowCountAttr:function (value) {
        this.displayedItemsInvalidated = true;
        this._set("rowCount", value);
    }, __fixEvt:function (e) {
        e.sheet = "primary";
        e.source = this;
        return e;
    }, _formatRowHeaderLabel:function (d) {
        if (this.rowHeaderDatePattern) {
            return this.renderData.dateLocaleModule.format(d, {selector:"date", datePattern:this.rowHeaderDatePattern});
        } else {
            return this.getWeekNumberLabel(d);
        }
    }, _formatColumnHeaderLabel:function (d) {
        return this.renderData.dateLocaleModule.getNames("days", this.columnHeaderLabelLength ? this.columnHeaderLabelLength : "wide", "standAlone")[d.getDay()];
    }, cellHeaderShortPattern:null, cellHeaderLongPattern:null, _formatGridCellLabel:function (d, row, col) {
        var isFirstDayOfMonth = row == 0 && col == 0 || d.getDate() == 1;
        var format, rb;
        if (isFirstDayOfMonth) {
            if (this.cellHeaderLongPattern) {
                format = this.cellHeaderLongPattern;
            } else {
                rb = i18n.getLocalization("dojo.cldr", this._calendar);
                format = rb["dateFormatItem-MMMd"];
            }
        } else {
            if (this.cellHeaderShortPattern) {
                format = this.cellHeaderShortPattern;
            } else {
                rb = i18n.getLocalization("dojo.cldr", this._calendar);
                format = rb["dateFormatItem-d"];
            }
        }
        return this.renderData.dateLocaleModule.format(d, {selector:"date", datePattern:format});
    }, refreshRendering:function () {
        this.inherited(arguments);
        if (!this.domNode) {
            return;
        }
        this._validateProperties();
        var oldRd = this.renderData;
        var rd = this.renderData = this._createRenderData();
        this._createRendering(rd, oldRd);
        this._layoutDecorationRenderers(rd);
        this._layoutRenderers(rd);
    }, _createRendering:function (renderData, oldRenderData) {
        if (renderData.rowHeight <= 0) {
            renderData.columnCount = 1;
            renderData.rowCount = 1;
            renderData.invalidRowHeight = true;
            return;
        }
        if (oldRenderData) {
            if (this.itemContainerTable) {
                var rows = query(".dojoxCalendarItemContainerRow", this.itemContainerTable);
                oldRenderData.rowCount = rows.length;
            }
        }
        this._buildColumnHeader(renderData, oldRenderData);
        this._buildRowHeader(renderData, oldRenderData);
        this._buildGrid(renderData, oldRenderData);
        this._buildItemContainer(renderData, oldRenderData);
        if (this.buttonContainer && this.owner != null && this.owner.currentView == this) {
            domStyle.set(this.buttonContainer, {"right":0, "left":0});
        }
    }, _buildColumnHeader:function (renderData, oldRenderData) {
        var table = this.columnHeaderTable;
        if (!table) {
            return;
        }
        var count = renderData.columnCount - (oldRenderData ? oldRenderData.columnCount : 0);
        if (has("ie") == 8) {
            if (this._colTableSave == null) {
                this._colTableSave = lang.clone(table);
            } else {
                if (count < 0) {
                    this.columnHeader.removeChild(table);
                    domConstruct.destroy(table);
                    table = lang.clone(this._colTableSave);
                    this.columnHeaderTable = table;
                    this.columnHeader.appendChild(table);
                    count = renderData.columnCount;
                }
            }
        }
        var tbodies = query("tbody", table);
        var trs = query("tr", table);
        var tbody, tr, td;
        if (tbodies.length == 1) {
            tbody = tbodies[0];
        } else {
            tbody = html.create("tbody", null, table);
        }
        if (trs.length == 1) {
            tr = trs[0];
        } else {
            tr = domConstruct.create("tr", null, tbody);
        }
        if (count > 0) {
            for (var i = 0; i < count; i++) {
                td = domConstruct.create("td", null, tr);
            }
        } else {
            count = -count;
            for (var i = 0; i < count; i++) {
                tr.removeChild(tr.lastChild);
            }
        }
        query("td", table).forEach(function (td, i) {
            td.className = "";
            var d = renderData.dates[0][i];
            this._setText(td, this._formatColumnHeaderLabel(d));
            if (i == 0) {
                domClass.add(td, "first-child");
            } else {
                if (i == this.renderData.columnCount - 1) {
                    domClass.add(td, "last-child");
                }
            }
            this.styleColumnHeaderCell(td, d, renderData);
        }, this);
        if (this.yearColumnHeaderContent) {
            var d = renderData.dates[0][0];
            this._setText(this.yearColumnHeaderContent, renderData.dateLocaleModule.format(d, {selector:"date", datePattern:"yyyy"}));
        }
    }, styleColumnHeaderCell:function (node, date, renderData) {
        domClass.add(node, this._cssDays[date.getDay()]);
        if (this.isWeekEnd(date)) {
            domClass.add(node, "dojoxCalendarWeekend");
        }
    }, _rowHeaderHandles:null, _cleanupRowHeader:function () {
        while (this._rowHeaderHandles.length > 0) {
            var list = this._rowHeaderHandles.pop();
            while (list.length > 0) {
                list.pop().remove();
            }
        }
    }, _rowHeaderClick:function (e) {
        var index = query("td", this.rowHeaderTable).indexOf(e.currentTarget);
        this._onRowHeaderClick({index:index, date:this.renderData.dates[index][0], triggerEvent:e});
    }, _buildRowHeader:function (renderData, oldRenderData) {
        var rowHeaderTable = this.rowHeaderTable;
        if (!rowHeaderTable) {
            return;
        }
        var tbodies = query("tbody", rowHeaderTable);
        var tbody, tr, td;
        if (tbodies.length == 1) {
            tbody = tbodies[0];
        } else {
            tbody = domConstruct.create("tbody", null, rowHeaderTable);
        }
        var count = renderData.rowCount - (oldRenderData ? oldRenderData.rowCount : 0);
        if (count > 0) {
            for (var i = 0; i < count; i++) {
                tr = domConstruct.create("tr", null, tbody);
                td = domConstruct.create("td", null, tr);
                var h = [];
                h.push(on(td, "click", lang.hitch(this, this._rowHeaderClick)));
                if (!1) {
                    h.push(on(td, "mousedown", function (e) {
                        domClass.add(e.currentTarget, "Active");
                    }));
                    h.push(on(td, "mouseup", function (e) {
                        domClass.remove(e.currentTarget, "Active");
                    }));
                    h.push(on(td, "mouseover", function (e) {
                        domClass.add(e.currentTarget, "Hover");
                    }));
                    h.push(on(td, "mouseout", function (e) {
                        domClass.remove(e.currentTarget, "Hover");
                    }));
                }
                this._rowHeaderHandles.push(h);
            }
        } else {
            count = -count;
            for (var i = 0; i < count; i++) {
                tbody.removeChild(tbody.lastChild);
                var list = this._rowHeaderHandles.pop();
                while (list.length > 0) {
                    list.pop().remove();
                }
            }
        }
        query("tr", rowHeaderTable).forEach(function (tr, i) {
            domStyle.set(tr, "height", this._getRowHeight(i) + "px");
            var d = renderData.dates[i][0];
            var td = query("td", tr)[0];
            td.className = "";
            if (i == 0) {
                domClass.add(td, "first-child");
            }
            if (i == this.renderData.rowCount - 1) {
                domClass.add(td, "last-child");
            }
            this.styleRowHeaderCell(td, d, renderData);
            this._setText(td, this._formatRowHeaderLabel(d));
        }, this);
    }, styleRowHeaderCell:function (node, date, renderData) {
    }, _buildGrid:function (renderData, oldRenderData) {
        var table = this.gridTable;
        if (!table) {
            return;
        }
        var currentTR = query("tr", table);
        var rowDiff = renderData.rowCount - currentTR.length;
        var addRows = rowDiff > 0;
        var colDiff = renderData.columnCount - (currentTR ? query("td", currentTR[0]).length : 0);
        if (has("ie") == 8) {
            if (this._gridTableSave == null) {
                this._gridTableSave = lang.clone(table);
            } else {
                if (colDiff < 0) {
                    this.grid.removeChild(table);
                    domConstruct.destroy(table);
                    table = lang.clone(this._gridTableSave);
                    this.gridTable = table;
                    this.grid.appendChild(table);
                    colDiff = renderData.columnCount;
                    rowDiff = renderData.rowCount;
                    addRows = true;
                }
            }
        }
        var tbodies = query("tbody", table);
        var tbody;
        if (tbodies.length == 1) {
            tbody = tbodies[0];
        } else {
            tbody = domConstruct.create("tbody", null, table);
        }
        if (addRows) {
            for (var i = 0; i < rowDiff; i++) {
                domConstruct.create("tr", null, tbody);
            }
        } else {
            rowDiff = -rowDiff;
            for (var i = 0; i < rowDiff; i++) {
                tbody.removeChild(tbody.lastChild);
            }
        }
        var rowIndex = renderData.rowCount - rowDiff;
        var addCols = addRows || colDiff > 0;
        colDiff = addCols ? colDiff : -colDiff;
        query("tr", table).forEach(function (tr, i) {
            if (addCols) {
                var len = i >= rowIndex ? renderData.columnCount : colDiff;
                for (var i = 0; i < len; i++) {
                    var td = domConstruct.create("td", null, tr);
                    domConstruct.create("span", null, td);
                }
            } else {
                for (var i = 0; i < colDiff; i++) {
                    tr.removeChild(tr.lastChild);
                }
            }
        });
        query("tr", table).forEach(function (tr, row) {
            domStyle.set(tr, "height", this._getRowHeight(row) + "px");
            tr.className = "";
            if (row == 0) {
                domClass.add(tr, "first-child");
            }
            if (row == renderData.rowCount - 1) {
                domClass.add(tr, "last-child");
            }
            query("td", tr).forEach(function (td, col) {
                td.className = "";
                if (col == 0) {
                    domClass.add(td, "first-child");
                }
                if (col == renderData.columnCount - 1) {
                    domClass.add(td, "last-child");
                }
                var d = renderData.dates[row][col];
                var span = query("span", td)[0];
                this._setText(span, this.showCellLabel ? this._formatGridCellLabel(d, row, col) : null);
                this.styleGridCell(td, d, renderData);
            }, this);
        }, this);
    }, styleGridCellFunc:null, defaultStyleGridCell:function (node, date, renderData) {
        domClass.add(node, this._cssDays[date.getDay()]);
        var cal = this.dateModule;
        if (this.isToday(date)) {
            domClass.add(node, "dojoxCalendarToday");
        } else {
            if (this.refStartTime != null && this.refEndTime != null && (cal.compare(date, this.refEndTime) >= 0 || cal.compare(cal.add(date, "day", 1), this.refStartTime) <= 0)) {
                domClass.add(node, "dojoxCalendarDayDisabled");
            } else {
                if (this.isWeekEnd(date)) {
                    domClass.add(node, "dojoxCalendarWeekend");
                }
            }
        }
    }, styleGridCell:function (node, date, renderData) {
        if (this.styleGridCellFunc) {
            this.styleGridCellFunc(node, date, renderData);
        } else {
            this.defaultStyleGridCell(node, date, renderData);
        }
    }, _buildItemContainer:function (renderData, oldRenderData) {
        var table = this.itemContainerTable;
        if (!table) {
            return;
        }
        var rows = [];
        var count = renderData.rowCount - (oldRenderData ? oldRenderData.rowCount : 0);
        if (has("ie") == 8) {
            if (this._itemTableSave == null) {
                this._itemTableSave = lang.clone(table);
            } else {
                if (count < 0) {
                    this.itemContainer.removeChild(table);
                    this._recycleItemRenderers(true);
                    this._recycleExpandRenderers(true);
                    domConstruct.destroy(table);
                    table = lang.clone(this._itemTableSave);
                    this.itemContainerTable = table;
                    this.itemContainer.appendChild(table);
                    count = renderData.columnCount;
                }
            }
        }
        var tbodies = query("tbody", table);
        var tbody, tr, td, div;
        if (tbodies.length == 1) {
            tbody = tbodies[0];
        } else {
            tbody = domConstruct.create("tbody", null, table);
        }
        if (count > 0) {
            for (var i = 0; i < count; i++) {
                tr = domConstruct.create("tr", null, tbody);
                domClass.add(tr, "dojoxCalendarItemContainerRow");
                td = domConstruct.create("td", null, tr);
                div = domConstruct.create("div", null, td);
                domClass.add(div, "dojoxCalendarContainerRow");
            }
        } else {
            count = -count;
            for (var i = 0; i < count; i++) {
                tbody.removeChild(tbody.lastChild);
            }
        }
        query(".dojoxCalendarItemContainerRow", table).forEach(function (tr, i) {
            domStyle.set(tr, "height", this._getRowHeight(i) + "px");
            rows.push(tr.childNodes[0].childNodes[0]);
        }, this);
        renderData.cells = rows;
    }, resize:function (changeSize) {
        this.inherited(arguments);
        this._resizeHandler(null, false);
    }, _resizeHandler:function (e, apply) {
        var rd = this.renderData;
        if (rd == null) {
            this.refreshRendering();
            return;
        }
        if (rd.sheetHeight != this.itemContainer.offsetHeight) {
            rd.sheetHeight = this.itemContainer.offsetHeight;
            var expRow = this.getExpandedRowIndex();
            if (expRow == -1) {
                this._computeRowsHeight();
                this._resizeRows();
            } else {
                this.expandRow(rd.expandedRow, rd.expandedRowCol, 0, null, true);
            }
            if (rd.invalidRowHeight) {
                delete rd.invalidRowHeight;
                this.renderData = null;
                this.displayedItemsInvalidated = true;
                this.refreshRendering();
                return;
            }
        }
        if (this.layoutDuringResize || apply) {
            setTimeout(lang.hitch(this, function () {
                this._layoutRenderers(this.renderData);
                this._layoutDecorationRenderers(this.renderData);
            }), 20);
        } else {
            domStyle.set(this.itemContainer, "opacity", 0);
            this._recycleItemRenderers();
            this._recycleExpandRenderers();
            if (this._resizeTimer != undefined) {
                clearTimeout(this._resizeTimer);
            }
            this._resizeTimer = setTimeout(lang.hitch(this, function () {
                delete this._resizeTimer;
                this._resizeRowsImpl(this.itemContainer, "tr");
                this._layoutRenderers(this.renderData);
                this._layoutDecorationRenderers(this.renderData);
                if (this.resizeAnimationDuration == 0) {
                    domStyle.set(this.itemContainer, "opacity", 1);
                } else {
                    fx.fadeIn({node:this.itemContainer, curve:[0, 1]}).play(this.resizeAnimationDuration);
                }
            }), 200);
        }
    }, resizeAnimationDuration:0, getExpandedRowIndex:function () {
        return this.renderData.expandedRow == null ? -1 : this.renderData.expandedRow;
    }, collapseRow:function (duration, easing, apply) {
        var rd = this.renderData;
        if (apply == undefined) {
            apply = true;
        }
        if (duration == undefined) {
            duration = this.expandDuration;
        }
        if (rd && rd.expandedRow != null && rd.expandedRow != -1) {
            if (apply && duration) {
                var index = rd.expandedRow;
                var oldSize = rd.expandedRowHeight;
                delete rd.expandedRow;
                this._computeRowsHeight(rd);
                var size = this._getRowHeight(index);
                rd.expandedRow = index;
                this._recycleExpandRenderers();
                this._recycleItemRenderers();
                domStyle.set(this.itemContainer, "display", "none");
                this._expandAnimation = new fx.Animation({curve:[oldSize, size], duration:duration, easing:easing, onAnimate:lang.hitch(this, function (size) {
                    this._expandRowImpl(Math.floor(size));
                }), onEnd:lang.hitch(this, function (size) {
                    this._expandAnimation = null;
                    this._collapseRowImpl(false);
                    this._resizeRows();
                    domStyle.set(this.itemContainer, "display", "block");
                    setTimeout(lang.hitch(this, function () {
                        this._layoutRenderers(rd);
                    }), 100);
                    this.onExpandAnimationEnd(false);
                })});
                this._expandAnimation.play();
            } else {
                this._collapseRowImpl(apply);
            }
        }
    }, _collapseRowImpl:function (apply) {
        var rd = this.renderData;
        delete rd.expandedRow;
        delete rd.expandedRowHeight;
        this._computeRowsHeight(rd);
        if (apply == undefined || apply) {
            this._resizeRows();
            this._layoutRenderers(rd);
        }
    }, expandRow:function (rowIndex, colIndex, duration, easing, apply) {
        var rd = this.renderData;
        if (!rd || rowIndex < 0 || rowIndex >= rd.rowCount) {
            return -1;
        }
        if (colIndex == undefined || colIndex < 0 || colIndex >= rd.columnCount) {
            colIndex = -1;
        }
        if (apply == undefined) {
            apply = true;
        }
        if (duration == undefined) {
            duration = this.expandDuration;
        }
        if (easing == undefined) {
            easing = this.expandEasing;
        }
        var oldSize = this._getRowHeight(rowIndex);
        var size = rd.sheetHeight - Math.ceil(this.cellPaddingTop * (rd.rowCount - 1));
        rd.expandedRow = rowIndex;
        rd.expandedRowCol = colIndex;
        rd.expandedRowHeight = size;
        if (apply) {
            if (duration) {
                this._recycleExpandRenderers();
                this._recycleItemRenderers();
                domStyle.set(this.itemContainer, "display", "none");
                this._expandAnimation = new fx.Animation({curve:[oldSize, size], duration:duration, delay:50, easing:easing, onAnimate:lang.hitch(this, function (size) {
                    this._expandRowImpl(Math.floor(size));
                }), onEnd:lang.hitch(this, function () {
                    this._expandAnimation = null;
                    domStyle.set(this.itemContainer, "display", "block");
                    setTimeout(lang.hitch(this, function () {
                        this._expandRowImpl(size, true);
                    }), 100);
                    this.onExpandAnimationEnd(true);
                })});
                this._expandAnimation.play();
            } else {
                this._expandRowImpl(size, true);
            }
        }
    }, _expandRowImpl:function (size, layout) {
        var rd = this.renderData;
        rd.expandedRowHeight = size;
        this._computeRowsHeight(rd, rd.sheetHeight - size);
        this._resizeRows();
        if (layout) {
            this._layoutRenderers(rd);
        }
    }, onExpandAnimationEnd:function (expand) {
    }, _resizeRows:function () {
        if (this._getRowHeight(0) <= 0) {
            return;
        }
        if (this.rowHeaderTable) {
            this._resizeRowsImpl(this.rowHeaderTable, "tr");
        }
        if (this.gridTable) {
            this._resizeRowsImpl(this.gridTable, "tr");
        }
        if (this.itemContainerTable) {
            this._resizeRowsImpl(this.itemContainerTable, "tr");
        }
    }, _computeRowsHeight:function (renderData, max) {
        var rd = renderData == null ? this.renderData : renderData;
        max = max || rd.sheetHeight;
        max--;
        if (has("ie") == 7) {
            max -= rd.rowCount;
        }
        if (rd.rowCount == 1) {
            rd.rowHeight = max;
            rd.rowHeightFirst = max;
            rd.rowHeightLast = max;
            return;
        }
        var count = rd.expandedRow == null ? rd.rowCount : rd.rowCount - 1;
        var rhx = max / count;
        var rhf, rhl, rh;
        var diffMin = max - (Math.floor(rhx) * count);
        var diffMax = Math.abs(max - (Math.ceil(rhx) * count));
        var diff;
        var sign = 1;
        if (diffMin < diffMax) {
            rh = Math.floor(rhx);
            diff = diffMin;
        } else {
            sign = -1;
            rh = Math.ceil(rhx);
            diff = diffMax;
        }
        rhf = rh + sign * Math.floor(diff / 2);
        rhl = rhf + sign * (diff % 2);
        rd.rowHeight = rh;
        rd.rowHeightFirst = rhf;
        rd.rowHeightLast = rhl;
    }, _getRowHeight:function (index) {
        var rd = this.renderData;
        if (index == rd.expandedRow) {
            return rd.expandedRowHeight;
        } else {
            if (rd.expandedRow == 0 && index == 1 || index == 0) {
                return rd.rowHeightFirst;
            } else {
                if (rd.expandedRow == this.renderData.rowCount - 1 && index == this.renderData.rowCount - 2 || index == this.renderData.rowCount - 1) {
                    return rd.rowHeightLast;
                } else {
                    return rd.rowHeight;
                }
            }
        }
    }, _resizeRowsImpl:function (tableNode, query) {
        dojo.query(query, tableNode).forEach(function (tr, i) {
            domStyle.set(tr, "height", this._getRowHeight(i) + "px");
        }, this);
    }, _setHorizontalRendererAttr:function (value) {
        this._destroyRenderersByKind("horizontal");
        this._set("horizontalRenderer", value);
    }, _setLabelRendererAttr:function (value) {
        this._destroyRenderersByKind("label");
        this._set("labelRenderer", value);
    }, _destroyExpandRenderer:function (renderer) {
        if (renderer["destroyRecursive"]) {
            renderer.destroyRecursive();
        }
        html.destroy(renderer.domNode);
    }, _setExpandRendererAttr:function (value) {
        while (this._ddRendererList.length > 0) {
            this._destroyExpandRenderer(this._ddRendererList.pop());
        }
        var pool = this._ddRendererPool;
        if (pool) {
            while (pool.length > 0) {
                this._destroyExpandRenderer(pool.pop());
            }
        }
        this._set("expandRenderer", value);
    }, _ddRendererList:null, _ddRendererPool:null, _getExpandRenderer:function (date, items, rowIndex, colIndex, expanded) {
        if (this.expandRenderer == null) {
            return null;
        }
        var ir = this._ddRendererPool.pop();
        if (ir == null) {
            ir = new this.expandRenderer();
        }
        this._ddRendererList.push(ir);
        ir.set("owner", this);
        ir.set("date", date);
        ir.set("items", items);
        ir.set("rowIndex", rowIndex);
        ir.set("columnIndex", colIndex);
        ir.set("expanded", expanded);
        return ir;
    }, _recycleExpandRenderers:function (remove) {
        for (var i = 0; i < this._ddRendererList.length; i++) {
            var ir = this._ddRendererList[i];
            ir.set("Up", false);
            ir.set("Down", false);
            if (remove) {
                ir.domNode.parentNode.removeChild(ir.domNode);
            }
            domStyle.set(ir.domNode, "display", "none");
        }
        this._ddRendererPool = this._ddRendererPool.concat(this._ddRendererList);
        this._ddRendererList = [];
    }, _defaultItemToRendererKindFunc:function (item) {
        var dur = Math.abs(this.renderData.dateModule.difference(item.startTime, item.endTime, "minute"));
        return dur >= 1440 ? "horizontal" : "label";
    }, naturalRowsHeight:null, _roundItemToDay:function (item) {
        var s = item.startTime, e = item.endTime;
        if (!this.isStartOfDay(s)) {
            s = this.floorToDay(s, false, this.renderData);
        }
        if (!this.isStartOfDay(e)) {
            e = this.renderData.dateModule.add(e, "day", 1);
            e = this.floorToDay(e, true);
        }
        return {startTime:s, endTime:e};
    }, _sortItemsFunction:function (a, b) {
        if (this.roundToDay) {
            a = this._roundItemToDay(a);
            b = this._roundItemToDay(b);
        }
        var res = this.dateModule.compare(a.startTime, b.startTime);
        if (res == 0) {
            res = -1 * this.dateModule.compare(a.endTime, b.endTime);
        }
        return res;
    }, _overlapLayoutPass3:function (lanes) {
        var pos = 0, posEnd = 0;
        var res = [];
        var refPos = domGeometry.position(this.gridTable).x;
        for (var col = 0; col < this.renderData.columnCount; col++) {
            var stop = false;
            var colPos = domGeometry.position(this._getCellAt(0, col));
            pos = colPos.x - refPos;
            posEnd = pos + colPos.w;
            for (var lane = lanes.length - 1; lane >= 0 && !stop; lane--) {
                for (var i = 0; i < lanes[lane].length; i++) {
                    var item = lanes[lane][i];
                    stop = item.start < posEnd && pos < item.end;
                    if (stop) {
                        res[col] = lane + 1;
                        break;
                    }
                }
            }
            if (!stop) {
                res[col] = 0;
            }
        }
        return res;
    }, applyRendererZIndex:function (item, renderer, hovered, selected, edited, focused) {
        domStyle.set(renderer.container, {"zIndex":edited || selected ? renderer.renderer.mobile ? 100 : 0 : item.lane == undefined ? 1 : item.lane + 1});
    }, _layoutDecorationRenderers:function (renderData) {
        if (renderData == null || renderData.decorationItems == null || renderData.rowHeight <= 0) {
            return;
        }
        if (!this.gridTable || this._expandAnimation != null || this.horizontalDecorationRenderer == null) {
            this.decorationRendererManager.recycleItemRenderers();
            return;
        }
        this._layoutStep = renderData.columnCount;
        this.renderData.gridTablePosX = domGeometry.position(this.gridTable).x;
        this.inherited(arguments);
    }, _layoutRenderers:function (renderData) {
        if (renderData == null || renderData.items == null || renderData.rowHeight <= 0) {
            return;
        }
        if (!this.gridTable || this._expandAnimation != null || (this.horizontalRenderer == null && this.labelRenderer == null)) {
            this._recycleItemRenderers();
            return;
        }
        this.renderData.gridTablePosX = domGeometry.position(this.gridTable).x;
        this._layoutStep = renderData.columnCount;
        this._recycleExpandRenderers();
        this._hiddenItems = [];
        this._offsets = [];
        this.naturalRowsHeight = [];
        this.inherited(arguments);
    }, _offsets:null, _layoutInterval:function (renderData, index, start, end, items, itemsType) {
        if (this.renderData.cells == null) {
            return;
        }
        if (itemsType === "dataItems") {
            var horizontalItems = [];
            var labelItems = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var kind = this._itemToRendererKind(item);
                if (kind == "horizontal") {
                    horizontalItems.push(item);
                } else {
                    if (kind == "label") {
                        labelItems.push(item);
                    }
                }
            }
            var expIndex = this.getExpandedRowIndex();
            if (expIndex != -1 && expIndex != index) {
                return;
            }
            var offsets;
            var hiddenItems = [];
            var hItems = null;
            var hOffsets = [];
            if (horizontalItems.length > 0 && this.horizontalRenderer) {
                var hItems = this._createHorizontalLayoutItems(index, start, end, horizontalItems, itemsType);
                var hOverlapLayout = this._computeHorizontalOverlapLayout(hItems, hOffsets);
            }
            var lItems;
            var lOffsets = [];
            if (labelItems.length > 0 && this.labelRenderer) {
                lItems = this._createLabelLayoutItems(index, start, end, labelItems);
                this._computeLabelOffsets(lItems, lOffsets);
            }
            var hasHiddenItems = this._computeColHasHiddenItems(index, hOffsets, lOffsets);
            if (hItems != null) {
                this._layoutHorizontalItemsImpl(index, hItems, hOverlapLayout, hasHiddenItems, hiddenItems, itemsType);
            }
            if (lItems != null) {
                this._layoutLabelItemsImpl(index, lItems, hasHiddenItems, hiddenItems, hOffsets, itemsType);
            }
            this._layoutExpandRenderers(index, hasHiddenItems, hiddenItems);
            this._hiddenItems[index] = hiddenItems;
        } else {
            if (this.horizontalDecorationRenderer) {
                var hItems = this._createHorizontalLayoutItems(index, start, end, items, itemsType);
                if (hItems != null) {
                    this._layoutHorizontalItemsImpl(index, hItems, null, false, null, itemsType);
                }
            }
        }
    }, _createHorizontalLayoutItems:function (index, startTime, endTime, items, itemsType) {
        var rd = this.renderData;
        var cal = rd.dateModule;
        var sign = rd.rtl ? -1 : 1;
        var layoutItems = [];
        var isDecoration = itemsType === "decorationItems";
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var overlap = this.computeRangeOverlap(rd, item.startTime, item.endTime, startTime, endTime);
            var startOffset = cal.difference(startTime, this.floorToDay(overlap[0], false, rd), "day");
            var dayStart = rd.dates[index][startOffset];
            var celPos = domGeometry.position(this._getCellAt(index, startOffset, false));
            var start = celPos.x - rd.gridTablePosX;
            if (rd.rtl) {
                start += celPos.w;
            }
            if (isDecoration && !item.isAllDay || !isDecoration && !this.roundToDay && !item.allDay) {
                start += sign * this.computeProjectionOnDate(rd, dayStart, overlap[0], celPos.w);
            }
            start = Math.ceil(start);
            var endOffset = cal.difference(startTime, this.floorToDay(overlap[1], false, rd), "day");
            var end;
            if (endOffset > rd.columnCount - 1) {
                celPos = domGeometry.position(this._getCellAt(index, rd.columnCount - 1, false));
                if (rd.rtl) {
                    end = celPos.x - rd.gridTablePosX;
                } else {
                    end = celPos.x - rd.gridTablePosX + celPos.w;
                }
            } else {
                dayStart = rd.dates[index][endOffset];
                celPos = domGeometry.position(this._getCellAt(index, endOffset, false));
                end = celPos.x - rd.gridTablePosX;
                if (rd.rtl) {
                    end += celPos.w;
                }
                if (!isDecoration && this.roundToDay) {
                    if (!this.isStartOfDay(overlap[1])) {
                        end += sign * celPos.w;
                    }
                } else {
                    end += sign * this.computeProjectionOnDate(rd, dayStart, overlap[1], celPos.w);
                }
            }
            end = Math.floor(end);
            if (rd.rtl) {
                var t = end;
                end = start;
                start = t;
            }
            if (end > start) {
                var litem = lang.mixin({start:start, end:end, range:overlap, item:item, startOffset:startOffset, endOffset:endOffset}, item);
                layoutItems.push(litem);
            }
        }
        return layoutItems;
    }, _computeHorizontalOverlapLayout:function (layoutItems, offsets) {
        var rd = this.renderData;
        var irHeight = this.horizontalRendererHeight;
        var overlapLayoutRes = this.computeOverlapping(layoutItems, this._overlapLayoutPass3);
        var vOverlap = this.percentOverlap / 100;
        for (var i = 0; i < rd.columnCount; i++) {
            var numLanes = overlapLayoutRes.addedPassRes[i];
            var index = rd.rtl ? rd.columnCount - i - 1 : i;
            if (vOverlap == 0) {
                offsets[index] = numLanes == 0 ? 0 : numLanes == 1 ? irHeight : irHeight + (numLanes - 1) * (irHeight + this.verticalGap);
            } else {
                offsets[index] = numLanes == 0 ? 0 : numLanes * irHeight - (numLanes - 1) * (vOverlap * irHeight) + this.verticalGap;
            }
            offsets[index] += this.cellPaddingTop;
        }
        return overlapLayoutRes;
    }, _createLabelLayoutItems:function (index, startTime, endTime, items) {
        if (this.labelRenderer == null) {
            return;
        }
        var d;
        var rd = this.renderData;
        var cal = rd.dateModule;
        var layoutItems = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            d = this.floorToDay(item.startTime, false, rd);
            var comp = this.dateModule.compare;
            while (comp(d, item.endTime) == -1 && comp(d, endTime) == -1) {
                var dayEnd = cal.add(d, "day", 1);
                dayEnd = this.floorToDay(dayEnd, true);
                var overlap = this.computeRangeOverlap(rd, item.startTime, item.endTime, d, dayEnd);
                var startOffset = cal.difference(startTime, this.floorToDay(overlap[0], false, rd), "day");
                if (startOffset >= this.columnCount) {
                    break;
                }
                if (startOffset >= 0) {
                    var list = layoutItems[startOffset];
                    if (list == null) {
                        list = [];
                        layoutItems[startOffset] = list;
                    }
                    list.push(lang.mixin({startOffset:startOffset, range:overlap, item:item}, item));
                }
                d = cal.add(d, "day", 1);
                this.floorToDay(d, true);
            }
        }
        return layoutItems;
    }, _computeLabelOffsets:function (layoutItems, offsets) {
        for (var i = 0; i < this.renderData.columnCount; i++) {
            offsets[i] = layoutItems[i] == null ? 0 : layoutItems[i].length * (this.labelRendererHeight + this.verticalGap);
        }
    }, _computeColHasHiddenItems:function (index, hOffsets, lOffsets) {
        var res = [];
        var cellH = this._getRowHeight(index);
        var h;
        var maxH = 0;
        for (var i = 0; i < this.renderData.columnCount; i++) {
            h = hOffsets == null || hOffsets[i] == null ? this.cellPaddingTop : hOffsets[i];
            h += lOffsets == null || lOffsets[i] == null ? 0 : lOffsets[i];
            if (h > maxH) {
                maxH = h;
            }
            res[i] = h > cellH;
        }
        this.naturalRowsHeight[index] = maxH;
        return res;
    }, _layoutHorizontalItemsImpl:function (index, layoutItems, hOverlapLayout, hasHiddenItems, hiddenItems, itemsType) {
        var rd = this.renderData;
        var cell = rd.cells[index];
        var cellH = this._getRowHeight(index);
        var irHeight = this.horizontalRendererHeight;
        var vOverlap = this.percentOverlap / 100;
        for (var i = 0; i < layoutItems.length; i++) {
            var item = layoutItems[i];
            var lane = item.lane;
            if (itemsType === "dataItems") {
                var posY = this.cellPaddingTop;
                if (vOverlap == 0) {
                    posY += lane * (irHeight + this.verticalGap);
                } else {
                    posY += lane * (irHeight - vOverlap * irHeight);
                }
                var exp = false;
                var maxH = cellH;
                if (this.expandRenderer) {
                    for (var off = item.startOffset; off <= item.endOffset; off++) {
                        if (hasHiddenItems[off]) {
                            exp = true;
                            break;
                        }
                    }
                    maxH = exp ? cellH - this.expandRendererHeight : cellH;
                }
                if (posY + irHeight <= maxH) {
                    var ir = this._createRenderer(item, "horizontal", this.horizontalRenderer, "dojoxCalendarHorizontal");
                    var fullHeight = this.isItemBeingEdited(item) && !this.liveLayout && this._isEditing;
                    var h = fullHeight ? cellH - this.cellPaddingTop : irHeight;
                    var w = item.end - item.start;
                    if (has("ie") >= 9 && item.start + w < this.itemContainer.offsetWidth) {
                        w++;
                    }
                    domStyle.set(ir.container, {"top":(fullHeight ? this.cellPaddingTop : posY) + "px", "left":item.start + "px", "width":w + "px", "height":h + "px"});
                    this._applyRendererLayout(item, ir, cell, w, h, "horizontal");
                } else {
                    for (var d = item.startOffset; d < item.endOffset; d++) {
                        if (hiddenItems[d] == null) {
                            hiddenItems[d] = [item.item];
                        } else {
                            hiddenItems[d].push(item.item);
                        }
                    }
                }
            } else {
                var ir = this.decorationRendererManager.createRenderer(item, "horizontal", this.horizontalDecorationRenderer, "dojoxCalendarDecoration");
                var h = cellH;
                var w = item.end - item.start;
                if (has("ie") >= 9 && item.start + w < this.itemContainer.offsetWidth) {
                    w++;
                }
                domStyle.set(ir.container, {"top":"0", "left":item.start + "px", "width":w + "px", "height":h + "px"});
                domConstruct.place(ir.container, cell);
                domStyle.set(ir.container, "display", "block");
            }
        }
    }, _layoutLabelItemsImpl:function (index, layoutItems, hasHiddenItems, hiddenItems, hOffsets) {
        var list, posY;
        var rd = this.renderData;
        var cell = rd.cells[index];
        var cellH = this._getRowHeight(index);
        var irHeight = this.labelRendererHeight;
        var maxW = domGeometry.getMarginBox(this.itemContainer).w;
        for (var i = 0; i < layoutItems.length; i++) {
            list = layoutItems[i];
            if (list != null) {
                list.sort(lang.hitch(this, function (a, b) {
                    return this.dateModule.compare(a.range[0], b.range[0]);
                }));
                var maxH = this.expandRenderer ? (hasHiddenItems[i] ? cellH - this.expandRendererHeight : cellH) : cellH;
                posY = hOffsets == null || hOffsets[i] == null ? this.cellPaddingTop : hOffsets[i] + this.verticalGap;
                var celPos = domGeometry.position(this._getCellAt(index, i));
                var left = celPos.x - rd.gridTablePosX;
                for (var j = 0; j < list.length; j++) {
                    if (posY + irHeight + this.verticalGap <= maxH) {
                        var item = list[j];
                        lang.mixin(item, {start:left, end:left + celPos.w});
                        var ir = this._createRenderer(item, "label", this.labelRenderer, "dojoxCalendarLabel");
                        var fullHeight = this.isItemBeingEdited(item) && !this.liveLayout && this._isEditing;
                        var h = fullHeight ? this._getRowHeight(index) - this.cellPaddingTop : irHeight;
                        if (rd.rtl) {
                            item.start = maxW - item.end;
                            item.end = item.start + celPos.w;
                        }
                        domStyle.set(ir.container, {"top":(fullHeight ? this.cellPaddingTop : posY) + "px", "left":item.start + "px", "width":celPos.w + "px", "height":h + "px"});
                        this._applyRendererLayout(item, ir, cell, celPos.w, h, "label");
                    } else {
                        break;
                    }
                    posY += irHeight + this.verticalGap;
                }
                for (var j; j < list.length; j++) {
                    if (hiddenItems[i] == null) {
                        hiddenItems[i] = [list[j]];
                    } else {
                        hiddenItems[i].push(list[j]);
                    }
                }
            }
        }
    }, _applyRendererLayout:function (item, ir, cell, w, h, kind) {
        var edited = this.isItemBeingEdited(item);
        var selected = this.isItemSelected(item);
        var hovered = this.isItemHovered(item);
        var focused = this.isItemFocused(item);
        var renderer = ir.renderer;
        renderer.set("hovered", hovered);
        renderer.set("selected", selected);
        renderer.set("edited", edited);
        renderer.set("focused", this.showFocus ? focused : false);
        renderer.set("moveEnabled", this.isItemMoveEnabled(item._item, kind));
        renderer.set("storeState", this.getItemStoreState(item));
        if (kind != "label") {
            renderer.set("resizeEnabled", this.isItemResizeEnabled(item, kind));
        }
        this.applyRendererZIndex(item, ir, hovered, selected, edited, focused);
        if (renderer.updateRendering) {
            renderer.updateRendering(w, h);
        }
        domConstruct.place(ir.container, cell);
        domStyle.set(ir.container, "display", "block");
    }, _getCellAt:function (rowIndex, columnIndex, rtl) {
        if ((rtl == undefined || rtl == true) && !this.isLeftToRight()) {
            columnIndex = this.renderData.columnCount - 1 - columnIndex;
        }
        return this.gridTable.childNodes[0].childNodes[rowIndex].childNodes[columnIndex];
    }, _layoutExpandRenderers:function (index, hasHiddenItems, hiddenItems) {
        if (!this.expandRenderer) {
            return;
        }
        var rd = this.renderData;
        if (rd.expandedRow == index) {
            if (rd.expandedRowCol != null && rd.expandedRowCol != -1) {
                this._layoutExpandRendererImpl(rd.expandedRow, rd.expandedRowCol, null, true);
            }
        } else {
            if (rd.expandedRow == null) {
                for (var i = 0; i < rd.columnCount; i++) {
                    if (hasHiddenItems[i]) {
                        this._layoutExpandRendererImpl(index, rd.rtl ? rd.columnCount - 1 - i : i, hiddenItems[i], false);
                    }
                }
            }
        }
    }, _layoutExpandRendererImpl:function (rowIndex, colIndex, items, expanded) {
        var rd = this.renderData;
        var d = lang.clone(rd.dates[rowIndex][colIndex]);
        var ir = null;
        var cell = rd.cells[rowIndex];
        ir = this._getExpandRenderer(d, items, rowIndex, colIndex, expanded);
        var dim = domGeometry.position(this._getCellAt(rowIndex, colIndex));
        dim.x -= rd.gridTablePosX;
        this.layoutExpandRenderer(ir, d, items, dim, this.expandRendererHeight);
        domConstruct.place(ir.domNode, cell);
        domStyle.set(ir.domNode, "display", "block");
    }, layoutExpandRenderer:function (renderer, date, items, cellPosition, height) {
        domStyle.set(renderer.domNode, {"left":cellPosition.x + "px", "width":cellPosition.w + "px", "height":height + "px", "top":(cellPosition.h - height - 1) + "px"});
    }, _onItemEditBeginGesture:function (e) {
        var p = this._edProps;
        var item = p.editedItem;
        var dates = e.dates;
        var refTime = this.newDate(p.editKind == "resizeEnd" ? item.endTime : item.startTime);
        if (p.rendererKind == "label") {
        } else {
            if (e.editKind == "move" && (item.allDay || this.roundToDay)) {
                var cal = this.renderData.dateModule;
                p.dayOffset = cal.difference(this.floorToDay(dates[0], false, this.renderData), refTime, "day");
            }
        }
        this.inherited(arguments);
    }, _computeItemEditingTimes:function (item, editKind, rendererKind, times, eventSource) {
        var cal = this.renderData.dateModule;
        var p = this._edProps;
        if (rendererKind == "label") {
        } else {
            if (item.allDay || this.roundToDay) {
                var isStartOfDay = this.isStartOfDay(times[0]);
                switch (editKind) {
                  case "resizeEnd":
                    if (!isStartOfDay && item.allDay) {
                        times[0] = cal.add(times[0], "day", 1);
                    }
                  case "resizeStart":
                    if (!isStartOfDay) {
                        times[0] = this.floorToDay(times[0], true);
                    }
                    break;
                  case "move":
                    times[0] = cal.add(times[0], "day", p.dayOffset);
                    break;
                  case "resizeBoth":
                    if (!isStartOfDay) {
                        times[0] = this.floorToDay(times[0], true);
                    }
                    if (!this.isStartOfDay(times[1])) {
                        times[1] = this.floorToDay(cal.add(times[1], "day", 1), true);
                    }
                    break;
                }
            } else {
                times = this.inherited(arguments);
            }
        }
        return times;
    }, getTime:function (e, x, y, touchIndex) {
        var rd = this.renderData;
        if (e != null) {
            var refPos = domGeometry.position(this.itemContainer, true);
            if (e.touches) {
                touchIndex = touchIndex == undefined ? 0 : touchIndex;
                x = e.touches[touchIndex].pageX - refPos.x;
                y = e.touches[touchIndex].pageY - refPos.y;
            } else {
                x = e.pageX - refPos.x;
                y = e.pageY - refPos.y;
            }
        }
        var r = domGeometry.getContentBox(this.itemContainer);
        if (x < 0) {
            x = 0;
        } else {
            if (x > r.w) {
                x = r.w - 1;
            }
        }
        if (y < 0) {
            y = 0;
        } else {
            if (y > r.h) {
                y = r.h - 1;
            }
        }
        var w = domGeometry.getMarginBox(this.itemContainer).w;
        var colW = w / rd.columnCount;
        var row;
        if (rd.expandedRow == null) {
            row = Math.floor(y / (domGeometry.getMarginBox(this.itemContainer).h / rd.rowCount));
        } else {
            row = rd.expandedRow;
        }
        var r = domGeometry.getContentBox(this.itemContainer);
        if (rd.rtl) {
            x = r.w - x;
        }
        var col = Math.floor(x / colW);
        var tm = Math.floor((x - (col * colW)) * 1440 / colW);
        var date = null;
        if (row < rd.dates.length && col < this.renderData.dates[row].length) {
            date = this.newDate(this.renderData.dates[row][col]);
            date = this.renderData.dateModule.add(date, "minute", tm);
        }
        return date;
    }, _onGridMouseUp:function (e) {
        this.inherited(arguments);
        if (this._gridMouseDown) {
            this._gridMouseDown = false;
            this._onGridClick({date:this.getTime(e), triggerEvent:e});
        }
    }, _onGridTouchEnd:function (e) {
        this.inherited(arguments);
        var g = this._gridProps;
        if (g) {
            if (!this._isEditing) {
                if (!g.fromItem && !g.editingOnStart) {
                    this.selectFromEvent(e, null, null, true);
                }
                if (!g.fromItem) {
                    if (this._pendingDoubleTap && this._pendingDoubleTap.grid) {
                        this._onGridDoubleClick({date:this.getTime(this._gridProps.event), triggerEvent:this._gridProps.event});
                        clearTimeout(this._pendingDoubleTap.timer);
                        delete this._pendingDoubleTap;
                    } else {
                        this._onGridClick({date:this.getTime(this._gridProps.event), triggerEvent:this._gridProps.event});
                        this._pendingDoubleTap = {grid:true, timer:setTimeout(lang.hitch(this, function () {
                            delete this._pendingDoubleTap;
                        }), this.doubleTapDelay)};
                    }
                }
            }
            this._gridProps = null;
        }
    }, _onRowHeaderClick:function (e) {
        this._dispatchCalendarEvt(e, "onRowHeaderClick");
    }, onRowHeaderClick:function (e) {
    }, expandRendererClickHandler:function (e, renderer) {
        event.stop(e);
        var ri = renderer.get("rowIndex");
        var ci = renderer.get("columnIndex");
        this._onExpandRendererClick(lang.mixin(this._createItemEditEvent(), {rowIndex:ri, columnIndex:ci, renderer:renderer, triggerEvent:e, date:this.renderData.dates[ri][ci]}));
    }, onExpandRendererClick:function (e) {
    }, _onExpandRendererClick:function (e) {
        this._dispatchCalendarEvt(e, "onExpandRendererClick");
        if (!e.isDefaultPrevented()) {
            if (this.getExpandedRowIndex() != -1) {
                this.collapseRow();
            } else {
                this.expandRow(e.rowIndex, e.columnIndex);
            }
        }
    }, snapUnit:"minute", snapSteps:15, minDurationUnit:"minute", minDurationSteps:15, triggerExtent:3, liveLayout:false, stayInView:true, allowStartEndSwap:true, allowResizeLessThan24H:false});
});

