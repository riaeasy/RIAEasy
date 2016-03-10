//>>built

define("dojox/grid/enhanced/_Events", ["dojo/_base/kernel", "dojo/_base/declare", "dojo/keys", "dojo/_base/html", "dojo/_base/event", "dojox/grid/_Events"], function (dojo, declare, keys, html, event, _Events) {
    return declare("dojox.grid.enhanced._Events", null, {_events:null, headerCellActiveClass:"dojoxGridHeaderActive", cellActiveClass:"dojoxGridCellActive", rowActiveClass:"dojoxGridRowActive", constructor:function (inGrid) {
        this._events = new _Events();
        inGrid.mixin(inGrid, this);
    }, dokeyup:function (e) {
        this.focus.currentArea().keyup(e);
    }, onKeyDown:function (e) {
        if (e.altKey || e.metaKey) {
            return;
        }
        var focus = this.focus;
        var editing = this.edit.isEditing();
        switch (e.keyCode) {
          case keys.TAB:
            if (e.ctrlKey) {
                return;
            }
            focus.tab(e.shiftKey ? -1 : 1, e);
            break;
          case keys.UP_ARROW:
          case keys.DOWN_ARROW:
            if (editing) {
                return;
            }
            focus.currentArea().move(e.keyCode == keys.UP_ARROW ? -1 : 1, 0, e);
            break;
          case keys.LEFT_ARROW:
          case keys.RIGHT_ARROW:
            if (editing) {
                return;
            }
            var offset = (e.keyCode == keys.LEFT_ARROW) ? 1 : -1;
            if (html._isBodyLtr()) {
                offset *= -1;
            }
            focus.currentArea().move(0, offset, e);
            break;
          case keys.F10:
            if (this.menus && e.shiftKey) {
                this.onRowContextMenu(e);
            }
            break;
          default:
            focus.currentArea().keydown(e);
            break;
        }
    }, domouseup:function (e) {
        if (e.cellNode) {
            this.onMouseUp(e);
        } else {
            this.onRowSelectorMouseUp(e);
        }
    }, domousedown:function (e) {
        if (!e.cellNode) {
            this.onRowSelectorMouseDown(e);
        }
    }, onMouseUp:function (e) {
        this[e.rowIndex == -1 ? "onHeaderCellMouseUp" : "onCellMouseUp"](e);
    }, onCellMouseDown:function (e) {
        html.addClass(e.cellNode, this.cellActiveClass);
        html.addClass(e.rowNode, this.rowActiveClass);
    }, onCellMouseUp:function (e) {
        html.removeClass(e.cellNode, this.cellActiveClass);
        html.removeClass(e.rowNode, this.rowActiveClass);
    }, onCellClick:function (e) {
        this._events.onCellClick.call(this, e);
        this.focus.contentMouseEvent(e);
    }, onCellDblClick:function (e) {
        if (this.pluginMgr.isFixedCell(e.cell)) {
            return;
        }
        if (this._click.length > 1 && (!this._click[0] || !this._click[1])) {
            this._click[0] = this._click[1] = e;
        }
        this._events.onCellDblClick.call(this, e);
    }, onRowClick:function (e) {
        this.edit.rowClick(e);
        if (!e.cell || !this.plugin("indirectSelection")) {
            this.selection.clickSelectEvent(e);
        }
    }, onRowContextMenu:function (e) {
        if (!this.edit.isEditing() && this.menus) {
            this.showMenu(e);
        }
    }, onSelectedRegionContextMenu:function (e) {
        if (this.selectedRegionMenu) {
            this.selectedRegionMenu._openMyself({target:e.target, coords:e.keyCode !== keys.F10 && "pageX" in e ? {x:e.pageX, y:e.pageY} : null});
            event.stop(e);
        }
    }, onHeaderCellMouseOut:function (e) {
        if (e.cellNode) {
            html.removeClass(e.cellNode, this.cellOverClass);
            html.removeClass(e.cellNode, this.headerCellActiveClass);
        }
    }, onHeaderCellMouseDown:function (e) {
        if (e.cellNode) {
            html.addClass(e.cellNode, this.headerCellActiveClass);
        }
    }, onHeaderCellMouseUp:function (e) {
        if (e.cellNode) {
            html.removeClass(e.cellNode, this.headerCellActiveClass);
        }
    }, onHeaderCellClick:function (e) {
        this.focus.currentArea("header");
        if (!e.cell.isRowSelector) {
            this._events.onHeaderCellClick.call(this, e);
        }
        this.focus.headerMouseEvent(e);
    }, onRowSelectorMouseDown:function (e) {
        this.focus.focusArea("rowHeader", e);
    }, onRowSelectorMouseUp:function (e) {
    }, onMouseUpRow:function (e) {
        if (e.rowIndex != -1) {
            this.onRowMouseUp(e);
        }
    }, onRowMouseUp:function (e) {
    }});
});

