//>>built

define("dojox/drawing/plugins/drawing/GreekPalette", ["dojo", "dijit/popup", "../../library/greek", "dijit/focus", "dijit/_Widget", "dijit/_TemplatedMixin", "dijit/_PaletteMixin", "dojo/i18n!dojox/editor/plugins/nls/latinEntities"], function (dojo, popup, greek, focus, Widget, TemplatedMixin, PaletteMixin, latinEntities) {
    var Greeks = dojo.declare(null, {constructor:function (alias) {
        this._alias = alias;
    }, getValue:function () {
        return this._alias;
    }, fillCell:function (cell) {
        cell.innerHTML = "&" + this._alias + ";";
    }});
    return dojo.declare("dojox.drawing.plugins.drawing.GreekPalette", [Widget, TemplatedMixin, PaletteMixin], {postMixInProperties:function () {
        var choices = greek;
        var numChoices = 0;
        var entityKey;
        for (entityKey in choices) {
            numChoices++;
        }
        var choicesPerRow = Math.floor(Math.sqrt(numChoices));
        var numRows = choicesPerRow;
        var currChoiceIdx = 0;
        var rows = [];
        var row = [];
        for (entityKey in choices) {
            currChoiceIdx++;
            row.push(entityKey);
            if (currChoiceIdx % numRows === 0) {
                rows.push(row);
                row = [];
            }
        }
        if (row.length > 0) {
            rows.push(row);
        }
        this._palette = rows;
    }, show:function (obj) {
        dojo.mixin(obj, {popup:this});
        popup.open(obj);
    }, onChange:function (val) {
        var textBlock = this._textBlock;
        popup.hide(this);
        textBlock.insertText(this._pushChangeTo, val);
        textBlock._dropMode = false;
    }, onCancel:function (closeAll) {
        popup.hide(this);
        this._textBlock._dropMode = false;
    }, templateString:"<div class=\"dojoxEntityPalette\">\n" + "\t<table>\n" + "\t\t<tbody>\n" + "\t\t\t<tr>\n" + "\t\t\t\t<td>\n" + "\t\t\t\t\t<table class=\"dijitPaletteTable\">\n" + "\t\t\t\t\t\t<tbody dojoAttachPoint=\"gridNode\"></tbody>\n" + "\t\t\t\t   </table>\n" + "\t\t\t\t</td>\n" + "\t\t\t</tr>\n" + "\t\t\t<tr>\n" + "\t\t\t\t<td>\n" + "\t\t\t\t\t<table dojoAttachPoint=\"previewPane\" class=\"dojoxEntityPalettePreviewTable\">\n" + "\t\t\t\t\t\t<tbody>\n" + "\t\t\t\t\t\t\t<tr>\n" + "\t\t\t\t\t\t\t\t<td class=\"dojoxEntityPalettePreviewDetailEntity\">Type: <span class=\"dojoxEntityPalettePreviewDetail\" dojoAttachPoint=\"previewNode\"></span></td>\n" + "\t\t\t\t\t\t\t</tr>\n" + "\t\t\t\t\t\t</tbody>\n" + "\t\t\t\t\t</table>\n" + "\t\t\t\t</td>\n" + "\t\t\t</tr>\n" + "\t\t</tbody>\n" + "\t</table>\n" + "</div>", baseClass:"dojoxEntityPalette", showPreview:true, dyeClass:Greeks, paletteClass:"editorLatinEntityPalette", cellClass:"dojoxEntityPaletteCell", buildRendering:function () {
        this.inherited(arguments);
        var i18n = latinEntities;
        this._preparePalette(this._palette, i18n);
        var cells = dojo.query(".dojoxEntityPaletteCell", this.gridNode);
        dojo.forEach(cells, function (cellNode) {
            this.connect(cellNode, "onmouseenter", "_onCellMouseEnter");
        }, this);
    }, _onCellMouseEnter:function (e) {
        if (this.showPreview) {
            this._displayDetails(e.target);
        }
    }, _onCellClick:function (evt) {
        var target = evt.type == "click" ? evt.currentTarget : this._currentFocus, value = this._getDye(target).getValue();
        this._setCurrent(target);
        setTimeout(dojo.hitch(this, function () {
            focus(target);
            this._setValueAttr(value, true);
        }));
        dojo.removeClass(target, "dijitPaletteCellHover");
        dojo.stopEvent(evt);
    }, postCreate:function () {
        this.inherited(arguments);
        if (!this.showPreview) {
            dojo.style(this.previewNode, "display", "none");
        }
        popup.moveOffScreen(this);
    }, _setCurrent:function (node) {
        if ("_currentFocus" in this) {
            dojo.attr(this._currentFocus, "tabIndex", "-1");
            dojo.removeClass(this._currentFocus, "dojoxEntityPaletteCellHover");
        }
        this._currentFocus = node;
        if (node) {
            dojo.attr(node, "tabIndex", this.tabIndex);
            dojo.addClass(this._currentFocus, "dojoxEntityPaletteCellHover");
        }
        if (this.showPreview) {
            this._displayDetails(node);
        }
    }, _displayDetails:function (cell) {
        var dye = this._getDye(cell);
        if (dye) {
            var ehtml = dye.getValue();
            var ename = dye._alias;
            this.previewNode.innerHTML = ehtml;
        } else {
            this.previewNode.innerHTML = "";
            this.descNode.innerHTML = "";
        }
    }, _preparePalette:function (choices, titles) {
        this._cells = [];
        var url = this._blankGif;
        var dyeClassObj = typeof this.dyeClass === "string" ? dojo.getObject(this.dyeClass) : this.dyeClass;
        for (var row = 0; row < choices.length; row++) {
            var rowNode = dojo.create("tr", {tabIndex:"-1"}, this.gridNode);
            for (var col = 0; col < choices[row].length; col++) {
                var value = choices[row][col];
                if (value) {
                    var cellObject = new dyeClassObj(value);
                    var cellNode = dojo.create("td", {"class":this.cellClass, tabIndex:"-1", title:titles[value]});
                    cellObject.fillCell(cellNode, url);
                    this.connect(cellNode, "ondijitclick", "_onCellClick");
                    this._trackMouseState(cellNode, this.cellClass);
                    dojo.place(cellNode, rowNode);
                    cellNode.idx = this._cells.length;
                    this._cells.push({node:cellNode, dye:cellObject});
                }
            }
        }
        this._xDim = choices[0].length;
        this._yDim = choices.length;
    }, _navigateByArrow:function (evt) {
        var keyIncrementMap = {38:-this._xDim, 40:this._xDim, 39:this.isLeftToRight() ? 1 : -1, 37:this.isLeftToRight() ? -1 : 1};
        var increment = keyIncrementMap[evt.keyCode];
        var newFocusIndex = this._currentFocus.idx + increment;
        if (newFocusIndex < this._cells.length && newFocusIndex > -1) {
            var focusNode = this._cells[newFocusIndex].node;
            this._setCurrent(focusNode);
        }
    }});
});

