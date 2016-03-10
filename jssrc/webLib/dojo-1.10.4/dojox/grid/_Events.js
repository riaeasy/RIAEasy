//>>built

define("dojox/grid/_Events", ["dojo/keys", "dojo/dom-class", "dojo/_base/declare", "dojo/_base/event", "dojo/_base/sniff"], function (keys, domClass, declare, event, has) {
    return declare("dojox.grid._Events", null, {cellOverClass:"dojoxGridCellOver", onKeyEvent:function (e) {
        this.dispatchKeyEvent(e);
    }, onContentEvent:function (e) {
        this.dispatchContentEvent(e);
    }, onHeaderEvent:function (e) {
        this.dispatchHeaderEvent(e);
    }, onStyleRow:function (inRow) {
        var i = inRow;
        i.customClasses += (i.odd ? " dojoxGridRowOdd" : "") + (i.selected ? " dojoxGridRowSelected" : "") + (i.over ? " dojoxGridRowOver" : "");
        this.focus.styleRow(inRow);
        this.edit.styleRow(inRow);
    }, onKeyDown:function (e) {
        if (e.altKey || e.metaKey) {
            return;
        }
        var colIdx;
        switch (e.keyCode) {
          case keys.ESCAPE:
            this.edit.cancel();
            break;
          case keys.ENTER:
            if (!this.edit.isEditing()) {
                colIdx = this.focus.getHeaderIndex();
                if (colIdx >= 0) {
                    this.setSortIndex(colIdx);
                    break;
                } else {
                    this.selection.clickSelect(this.focus.rowIndex, dojo.isCopyKey(e), e.shiftKey);
                }
                event.stop(e);
            }
            if (!e.shiftKey) {
                var isEditing = this.edit.isEditing();
                this.edit.apply();
                if (!isEditing) {
                    this.edit.setEditCell(this.focus.cell, this.focus.rowIndex);
                }
            }
            if (!this.edit.isEditing()) {
                var curView = this.focus.focusView || this.views.views[0];
                curView.content.decorateEvent(e);
                this.onRowClick(e);
                event.stop(e);
            }
            break;
          case keys.SPACE:
            if (!this.edit.isEditing()) {
                colIdx = this.focus.getHeaderIndex();
                if (colIdx >= 0) {
                    this.setSortIndex(colIdx);
                    break;
                } else {
                    this.selection.clickSelect(this.focus.rowIndex, dojo.isCopyKey(e), e.shiftKey);
                }
                event.stop(e);
            }
            break;
          case keys.TAB:
            this.focus[e.shiftKey ? "previousKey" : "nextKey"](e);
            break;
          case keys.LEFT_ARROW:
          case keys.RIGHT_ARROW:
            if (!this.edit.isEditing()) {
                var keyCode = e.keyCode;
                event.stop(e);
                colIdx = this.focus.getHeaderIndex();
                if (colIdx >= 0 && (e.shiftKey && e.ctrlKey)) {
                    this.focus.colSizeAdjust(e, colIdx, (keyCode == keys.LEFT_ARROW ? -1 : 1) * 5);
                } else {
                    var offset = (keyCode == keys.LEFT_ARROW) ? 1 : -1;
                    if (this.isLeftToRight()) {
                        offset *= -1;
                    }
                    this.focus.move(0, offset);
                }
            }
            break;
          case keys.UP_ARROW:
            if (!this.edit.isEditing() && this.focus.rowIndex !== 0) {
                event.stop(e);
                this.focus.move(-1, 0);
            }
            break;
          case keys.DOWN_ARROW:
            if (!this.edit.isEditing() && this.focus.rowIndex + 1 != this.rowCount) {
                event.stop(e);
                this.focus.move(1, 0);
            }
            break;
          case keys.PAGE_UP:
            if (!this.edit.isEditing() && this.focus.rowIndex !== 0) {
                event.stop(e);
                if (this.focus.rowIndex != this.scroller.firstVisibleRow + 1) {
                    this.focus.move(this.scroller.firstVisibleRow - this.focus.rowIndex, 0);
                } else {
                    this.setScrollTop(this.scroller.findScrollTop(this.focus.rowIndex - 1));
                    this.focus.move(this.scroller.firstVisibleRow - this.scroller.lastVisibleRow + 1, 0);
                }
            }
            break;
          case keys.PAGE_DOWN:
            if (!this.edit.isEditing() && this.focus.rowIndex + 1 != this.rowCount) {
                event.stop(e);
                if (this.focus.rowIndex != this.scroller.lastVisibleRow - 1) {
                    this.focus.move(this.scroller.lastVisibleRow - this.focus.rowIndex - 1, 0);
                } else {
                    this.setScrollTop(this.scroller.findScrollTop(this.focus.rowIndex + 1));
                    this.focus.move(this.scroller.lastVisibleRow - this.scroller.firstVisibleRow - 1, 0);
                }
            }
            break;
          default:
            break;
        }
    }, onMouseOver:function (e) {
        e.rowIndex == -1 ? this.onHeaderCellMouseOver(e) : this.onCellMouseOver(e);
    }, onMouseOut:function (e) {
        e.rowIndex == -1 ? this.onHeaderCellMouseOut(e) : this.onCellMouseOut(e);
    }, onMouseDown:function (e) {
        e.rowIndex == -1 ? this.onHeaderCellMouseDown(e) : this.onCellMouseDown(e);
    }, onMouseOverRow:function (e) {
        if (!this.rows.isOver(e.rowIndex)) {
            this.rows.setOverRow(e.rowIndex);
            e.rowIndex == -1 ? this.onHeaderMouseOver(e) : this.onRowMouseOver(e);
        }
    }, onMouseOutRow:function (e) {
        if (this.rows.isOver(-1)) {
            this.onHeaderMouseOut(e);
        } else {
            if (!this.rows.isOver(-2)) {
                this.rows.setOverRow(-2);
                this.onRowMouseOut(e);
            }
        }
    }, onMouseDownRow:function (e) {
        if (e.rowIndex != -1) {
            this.onRowMouseDown(e);
        }
    }, onCellMouseOver:function (e) {
        if (e.cellNode) {
            domClass.add(e.cellNode, this.cellOverClass);
        }
    }, onCellMouseOut:function (e) {
        if (e.cellNode) {
            domClass.remove(e.cellNode, this.cellOverClass);
        }
    }, onCellMouseDown:function (e) {
    }, onCellClick:function (e) {
        this._click[0] = this._click[1];
        this._click[1] = e;
        if (!this.edit.isEditCell(e.rowIndex, e.cellIndex)) {
            this.focus.setFocusCell(e.cell, e.rowIndex);
        }
        if (this._click.length > 1 && this._click[0] == null) {
            this._click.shift();
        }
        this.onRowClick(e);
    }, onCellDblClick:function (e) {
        var event;
        if (this._click.length > 1 && has("ie")) {
            event = this._click[1];
        } else {
            if (this._click.length > 1 && this._click[0].rowIndex != this._click[1].rowIndex) {
                event = this._click[0];
            } else {
                event = e;
            }
        }
        this.focus.setFocusCell(event.cell, event.rowIndex);
        this.edit.setEditCell(event.cell, event.rowIndex);
        this.onRowDblClick(e);
    }, onCellContextMenu:function (e) {
        this.onRowContextMenu(e);
    }, onCellFocus:function (inCell, inRowIndex) {
        this.edit.cellFocus(inCell, inRowIndex);
    }, onRowClick:function (e) {
        this.edit.rowClick(e);
        this.selection.clickSelectEvent(e);
    }, onRowDblClick:function (e) {
    }, onRowMouseOver:function (e) {
    }, onRowMouseOut:function (e) {
    }, onRowMouseDown:function (e) {
    }, onRowContextMenu:function (e) {
        event.stop(e);
    }, onHeaderMouseOver:function (e) {
    }, onHeaderMouseOut:function (e) {
    }, onHeaderCellMouseOver:function (e) {
        if (e.cellNode) {
            domClass.add(e.cellNode, this.cellOverClass);
        }
    }, onHeaderCellMouseOut:function (e) {
        if (e.cellNode) {
            domClass.remove(e.cellNode, this.cellOverClass);
        }
    }, onHeaderCellMouseDown:function (e) {
    }, onHeaderClick:function (e) {
    }, onHeaderCellClick:function (e) {
        this.setSortIndex(e.cell.index);
        this.onHeaderClick(e);
    }, onHeaderDblClick:function (e) {
    }, onHeaderCellDblClick:function (e) {
        this.onHeaderDblClick(e);
    }, onHeaderCellContextMenu:function (e) {
        this.onHeaderContextMenu(e);
    }, onHeaderContextMenu:function (e) {
        if (!this.headerMenu) {
            event.stop(e);
        }
    }, onStartEdit:function (inCell, inRowIndex) {
    }, onApplyCellEdit:function (inValue, inRowIndex, inFieldIndex) {
    }, onCancelEdit:function (inRowIndex) {
    }, onApplyEdit:function (inRowIndex) {
    }, onCanSelect:function (inRowIndex) {
        return true;
    }, onCanDeselect:function (inRowIndex) {
        return true;
    }, onSelected:function (inRowIndex) {
        this.updateRowStyles(inRowIndex);
    }, onDeselected:function (inRowIndex) {
        this.updateRowStyles(inRowIndex);
    }, onSelectionChanged:function () {
    }});
});

