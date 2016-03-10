//>>built

define("dojox/grid/_EditManager", ["dojo/_base/lang", "dojo/_base/array", "dojo/_base/declare", "dojo/_base/connect", "dojo/_base/sniff", "./util"], function (lang, array, declare, connect, has, util) {
    return declare("dojox.grid._EditManager", null, {constructor:function (inGrid) {
        this.grid = inGrid;
        this.connections = !has("ie") ? [] : [connect.connect(document.body, "onfocus", lang.hitch(this, "_boomerangFocus"))];
        this.connections.push(connect.connect(this.grid, "onBlur", this, "apply"));
        this.connections.push(connect.connect(this.grid, "prerender", this, "_onPreRender"));
    }, info:{}, destroy:function () {
        array.forEach(this.connections, connect.disconnect);
    }, cellFocus:function (inCell, inRowIndex) {
        if (this.grid.singleClickEdit || this.isEditRow(inRowIndex)) {
            this.setEditCell(inCell, inRowIndex);
        } else {
            this.apply();
        }
        if (this.isEditing() || (inCell && inCell.editable && inCell.alwaysEditing)) {
            this._focusEditor(inCell, inRowIndex);
        }
    }, rowClick:function (e) {
        if (this.isEditing() && !this.isEditRow(e.rowIndex)) {
            this.apply();
        }
    }, styleRow:function (inRow) {
        if (inRow.index == this.info.rowIndex) {
            inRow.customClasses += " dojoxGridRowEditing";
        }
    }, dispatchEvent:function (e) {
        var c = e.cell, ed = (c && c["editable"]) ? c : 0;
        return ed && ed.dispatchEvent(e.dispatch, e);
    }, isEditing:function () {
        return this.info.rowIndex !== undefined;
    }, isEditCell:function (inRowIndex, inCellIndex) {
        return (this.info.rowIndex === inRowIndex) && (this.info.cell.index == inCellIndex);
    }, isEditRow:function (inRowIndex) {
        return this.info.rowIndex === inRowIndex;
    }, setEditCell:function (inCell, inRowIndex) {
        if (!this.isEditCell(inRowIndex, inCell.index) && this.grid.canEdit && this.grid.canEdit(inCell, inRowIndex)) {
            this.start(inCell, inRowIndex, this.isEditRow(inRowIndex) || inCell.editable);
        }
    }, _focusEditor:function (inCell, inRowIndex) {
        util.fire(inCell, "focus", [inRowIndex]);
    }, focusEditor:function () {
        if (this.isEditing()) {
            this._focusEditor(this.info.cell, this.info.rowIndex);
        }
    }, _boomerangWindow:500, _shouldCatchBoomerang:function () {
        return this._catchBoomerang > new Date().getTime();
    }, _boomerangFocus:function () {
        if (this._shouldCatchBoomerang()) {
            this.grid.focus.focusGrid();
            this.focusEditor();
            this._catchBoomerang = 0;
        }
    }, _doCatchBoomerang:function () {
        if (has("ie")) {
            this._catchBoomerang = new Date().getTime() + this._boomerangWindow;
        }
    }, start:function (inCell, inRowIndex, inEditing) {
        if (!this._isValidInput()) {
            return;
        }
        this.grid.beginUpdate();
        this.editorApply();
        if (this.isEditing() && !this.isEditRow(inRowIndex)) {
            this.applyRowEdit();
            this.grid.updateRow(inRowIndex);
        }
        if (inEditing) {
            this.info = {cell:inCell, rowIndex:inRowIndex};
            this.grid.doStartEdit(inCell, inRowIndex);
            this.grid.updateRow(inRowIndex);
        } else {
            this.info = {};
        }
        this.grid.endUpdate();
        this.grid.focus.focusGrid();
        this._focusEditor(inCell, inRowIndex);
        this._doCatchBoomerang();
    }, _editorDo:function (inMethod) {
        var c = this.info.cell;
        if (c && c.editable) {
            c[inMethod](this.info.rowIndex);
        }
    }, editorApply:function () {
        this._editorDo("apply");
    }, editorCancel:function () {
        this._editorDo("cancel");
    }, applyCellEdit:function (inValue, inCell, inRowIndex) {
        if (this.grid.canEdit(inCell, inRowIndex)) {
            this.grid.doApplyCellEdit(inValue, inRowIndex, inCell.field);
        }
    }, applyRowEdit:function () {
        this.grid.doApplyEdit(this.info.rowIndex, this.info.cell.field);
    }, apply:function () {
        if (this.isEditing() && this._isValidInput()) {
            this.grid.beginUpdate();
            this.editorApply();
            this.applyRowEdit();
            this.info = {};
            this.grid.endUpdate();
            this.grid.focus.focusGrid();
            this._doCatchBoomerang();
        }
    }, cancel:function () {
        if (this.isEditing()) {
            this.grid.beginUpdate();
            this.editorCancel();
            this.info = {};
            this.grid.endUpdate();
            this.grid.focus.focusGrid();
            this._doCatchBoomerang();
        }
    }, save:function (inRowIndex, inView) {
        var c = this.info.cell;
        if (this.isEditRow(inRowIndex) && (!inView || c.view == inView) && c.editable) {
            c.save(c, this.info.rowIndex);
        }
    }, restore:function (inView, inRowIndex) {
        var c = this.info.cell;
        if (this.isEditRow(inRowIndex) && c.view == inView && c.editable) {
            c.restore(this.info.rowIndex);
        }
    }, _isValidInput:function () {
        var w = (this.info.cell || {}).widget;
        if (!w || !w.isValid) {
            return true;
        }
        w.focused = true;
        return w.isValid(true);
    }, _onPreRender:function () {
        if (this.isEditing()) {
            this.info.value = this.info.cell.getValue();
        }
    }});
});

