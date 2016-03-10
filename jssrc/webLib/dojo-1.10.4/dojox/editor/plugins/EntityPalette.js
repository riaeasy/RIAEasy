//>>built

define("dojox/editor/plugins/EntityPalette", ["dojo", "dijit", "dojox", "dijit/_Widget", "dijit/_TemplatedMixin", "dijit/_PaletteMixin", "dojo/_base/connect", "dojo/_base/declare", "dojo/i18n", "dojo/i18n!dojox/editor/plugins/nls/latinEntities"], function (dojo, dijit, dojox, _Widget, _TemplatedMixin, _PaletteMixin) {
    dojo.experimental("dojox.editor.plugins.EntityPalette");
    var EntityPalette = dojo.declare("dojox.editor.plugins.EntityPalette", [_Widget, _TemplatedMixin, _PaletteMixin], {templateString:"<div class=\"dojoxEntityPalette\">\n" + "\t<table>\n" + "\t\t<tbody>\n" + "\t\t\t<tr>\n" + "\t\t\t\t<td>\n" + "\t\t\t\t\t<table class=\"dijitPaletteTable\">\n" + "\t\t\t\t\t\t<tbody dojoAttachPoint=\"gridNode\"></tbody>\n" + "\t\t\t\t   </table>\n" + "\t\t\t\t</td>\n" + "\t\t\t</tr>\n" + "\t\t\t<tr>\n" + "\t\t\t\t<td>\n" + "\t\t\t\t\t<table dojoAttachPoint=\"previewPane\" class=\"dojoxEntityPalettePreviewTable\">\n" + "\t\t\t\t\t\t<tbody>\n" + "\t\t\t\t\t\t\t<tr>\n" + "\t\t\t\t\t\t\t\t<th class=\"dojoxEntityPalettePreviewHeader\">Preview</th>\n" + "\t\t\t\t\t\t\t\t<th class=\"dojoxEntityPalettePreviewHeader\" dojoAttachPoint=\"codeHeader\">Code</th>\n" + "\t\t\t\t\t\t\t\t<th class=\"dojoxEntityPalettePreviewHeader\" dojoAttachPoint=\"entityHeader\">Name</th>\n" + "\t\t\t\t\t\t\t\t<th class=\"dojoxEntityPalettePreviewHeader\">Description</th>\n" + "\t\t\t\t\t\t\t</tr>\n" + "\t\t\t\t\t\t\t<tr>\n" + "\t\t\t\t\t\t\t\t<td class=\"dojoxEntityPalettePreviewDetailEntity\" dojoAttachPoint=\"previewNode\"></td>\n" + "\t\t\t\t\t\t\t\t<td class=\"dojoxEntityPalettePreviewDetail\" dojoAttachPoint=\"codeNode\"></td>\n" + "\t\t\t\t\t\t\t\t<td class=\"dojoxEntityPalettePreviewDetail\" dojoAttachPoint=\"entityNode\"></td>\n" + "\t\t\t\t\t\t\t\t<td class=\"dojoxEntityPalettePreviewDetail\" dojoAttachPoint=\"descNode\"></td>\n" + "\t\t\t\t\t\t\t</tr>\n" + "\t\t\t\t\t\t</tbody>\n" + "\t\t\t\t\t</table>\n" + "\t\t\t\t</td>\n" + "\t\t\t</tr>\n" + "\t\t</tbody>\n" + "\t</table>\n" + "</div>", baseClass:"dojoxEntityPalette", showPreview:true, showCode:false, showEntityName:false, palette:"latin", dyeClass:"dojox.editor.plugins.LatinEntity", paletteClass:"editorLatinEntityPalette", cellClass:"dojoxEntityPaletteCell", postMixInProperties:function () {
        var choices = dojo.i18n.getLocalization("dojox.editor.plugins", "latinEntities");
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
    }, buildRendering:function () {
        this.inherited(arguments);
        var i18n = dojo.i18n.getLocalization("dojox.editor.plugins", "latinEntities");
        this._preparePalette(this._palette, i18n);
        var cells = dojo.query(".dojoxEntityPaletteCell", this.gridNode);
        dojo.forEach(cells, function (cellNode) {
            this.connect(cellNode, "onmouseenter", "_onCellMouseEnter");
        }, this);
    }, _onCellMouseEnter:function (e) {
        this._displayDetails(e.target);
    }, postCreate:function () {
        this.inherited(arguments);
        dojo.style(this.codeHeader, "display", this.showCode ? "" : "none");
        dojo.style(this.codeNode, "display", this.showCode ? "" : "none");
        dojo.style(this.entityHeader, "display", this.showEntityName ? "" : "none");
        dojo.style(this.entityNode, "display", this.showEntityName ? "" : "none");
        if (!this.showPreview) {
            dojo.style(this.previewNode, "display", "none");
        }
    }, _setCurrent:function (node) {
        this.inherited(arguments);
        if (this.showPreview) {
            this._displayDetails(node);
        }
    }, _displayDetails:function (cell) {
        var dye = this._getDye(cell);
        if (dye) {
            var ehtml = dye.getValue();
            var ename = dye._alias;
            this.previewNode.innerHTML = ehtml;
            this.codeNode.innerHTML = "&amp;#" + parseInt(ehtml.charCodeAt(0), 10) + ";";
            this.entityNode.innerHTML = "&amp;" + ename + ";";
            var i18n = dojo.i18n.getLocalization("dojox.editor.plugins", "latinEntities");
            this.descNode.innerHTML = i18n[ename].replace("\n", "<br>");
        } else {
            this.previewNode.innerHTML = "";
            this.codeNode.innerHTML = "";
            this.entityNode.innerHTML = "";
            this.descNode.innerHTML = "";
        }
    }});
    EntityPalette.LatinEntity = dojo.declare("dojox.editor.plugins.LatinEntity", null, {constructor:function (alias) {
        this._alias = alias;
    }, getValue:function () {
        return "&" + this._alias + ";";
    }, fillCell:function (cell) {
        cell.innerHTML = this.getValue();
    }});
    return EntityPalette;
});

