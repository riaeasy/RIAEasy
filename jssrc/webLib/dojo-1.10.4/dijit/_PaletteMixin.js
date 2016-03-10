//>>built

define("dijit/_PaletteMixin", ["dojo/_base/declare", "dojo/dom-attr", "dojo/dom-class", "dojo/dom-construct", "dojo/keys", "dojo/_base/lang", "dojo/on", "./_CssStateMixin", "./a11yclick", "./focus", "./typematic"], function (declare, domAttr, domClass, domConstruct, keys, lang, on, _CssStateMixin, a11yclick, focus, typematic) {
    var PaletteMixin = declare("dijit._PaletteMixin", _CssStateMixin, {defaultTimeout:500, timeoutChangeRate:0.9, value:"", _selectedCell:-1, tabIndex:"0", cellClass:"dijitPaletteCell", dyeClass:null, _dyeFactory:function (value) {
        var dyeClassObj = typeof this.dyeClass == "string" ? lang.getObject(this.dyeClass) : this.dyeClass;
        return new dyeClassObj(value);
    }, _preparePalette:function (choices, titles) {
        this._cells = [];
        var url = this._blankGif;
        this.own(on(this.gridNode, a11yclick, lang.hitch(this, "_onCellClick")));
        for (var row = 0; row < choices.length; row++) {
            var rowNode = domConstruct.create("tr", {tabIndex:"-1", role:"row"}, this.gridNode);
            for (var col = 0; col < choices[row].length; col++) {
                var value = choices[row][col];
                if (value) {
                    var cellObject = this._dyeFactory(value, row, col, titles[value]);
                    var cellNode = domConstruct.create("td", {"class":this.cellClass, tabIndex:"-1", title:titles[value], role:"gridcell"}, rowNode);
                    cellObject.fillCell(cellNode, url);
                    cellNode.idx = this._cells.length;
                    this._cells.push({node:cellNode, dye:cellObject});
                }
            }
        }
        this._xDim = choices[0].length;
        this._yDim = choices.length;
        var keyIncrementMap = {UP_ARROW:-this._xDim, DOWN_ARROW:this._xDim, RIGHT_ARROW:this.isLeftToRight() ? 1 : -1, LEFT_ARROW:this.isLeftToRight() ? -1 : 1};
        for (var key in keyIncrementMap) {
            this.own(typematic.addKeyListener(this.domNode, {keyCode:keys[key], ctrlKey:false, altKey:false, shiftKey:false}, this, function () {
                var increment = keyIncrementMap[key];
                return function (count) {
                    this._navigateByKey(increment, count);
                };
            }(), this.timeoutChangeRate, this.defaultTimeout));
        }
    }, postCreate:function () {
        this.inherited(arguments);
        this._setCurrent(this._cells[0].node);
    }, focus:function () {
        focus.focus(this._currentFocus);
    }, _onCellClick:function (evt) {
        var target = evt.target;
        while (target.tagName != "TD") {
            if (!target.parentNode || target == this.gridNode) {
                return;
            }
            target = target.parentNode;
        }
        var value = this._getDye(target).getValue();
        this._setCurrent(target);
        focus.focus(target);
        this._setValueAttr(value, true);
        evt.stopPropagation();
        evt.preventDefault();
    }, _setCurrent:function (node) {
        if ("_currentFocus" in this) {
            domAttr.set(this._currentFocus, "tabIndex", "-1");
        }
        this._currentFocus = node;
        if (node) {
            domAttr.set(node, "tabIndex", this.tabIndex);
        }
    }, _setValueAttr:function (value, priorityChange) {
        if (this._selectedCell >= 0) {
            domClass.remove(this._cells[this._selectedCell].node, this.cellClass + "Selected");
        }
        this._selectedCell = -1;
        if (value) {
            for (var i = 0; i < this._cells.length; i++) {
                if (value == this._cells[i].dye.getValue()) {
                    this._selectedCell = i;
                    domClass.add(this._cells[i].node, this.cellClass + "Selected");
                    break;
                }
            }
        }
        this._set("value", this._selectedCell >= 0 ? value : null);
        if (priorityChange || priorityChange === undefined) {
            this.onChange(value);
        }
    }, onChange:function () {
    }, _navigateByKey:function (increment, typeCount) {
        if (typeCount == -1) {
            return;
        }
        var newFocusIndex = this._currentFocus.idx + increment;
        if (newFocusIndex < this._cells.length && newFocusIndex > -1) {
            var focusNode = this._cells[newFocusIndex].node;
            this._setCurrent(focusNode);
            this.defer(lang.hitch(focus, "focus", focusNode));
        }
    }, _getDye:function (cell) {
        return this._cells[cell.idx].dye;
    }});
    return PaletteMixin;
});

