//>>built

require({cache:{"url:dijit/templates/ColorPalette.html":"<div class=\"dijitInline dijitColorPalette\" role=\"grid\">\n\t<table data-dojo-attach-point=\"paletteTableNode\" class=\"dijitPaletteTable\" cellSpacing=\"0\" cellPadding=\"0\" role=\"presentation\">\n\t\t<tbody data-dojo-attach-point=\"gridNode\"></tbody>\n\t</table>\n</div>\n"}});
define("dijit/ColorPalette", ["require", "dojo/text!./templates/ColorPalette.html", "./_Widget", "./_TemplatedMixin", "./_PaletteMixin", "./hccss", "dojo/i18n", "dojo/_base/Color", "dojo/_base/declare", "dojo/dom-construct", "dojo/string", "dojo/i18n!dojo/nls/colors", "dojo/colors"], function (require, template, _Widget, _TemplatedMixin, _PaletteMixin, has, i18n, Color, declare, domConstruct, string) {
    var ColorPalette = declare("dijit.ColorPalette", [_Widget, _TemplatedMixin, _PaletteMixin], {palette:"7x10", _palettes:{"7x10":[["white", "seashell", "cornsilk", "lemonchiffon", "lightyellow", "palegreen", "paleturquoise", "lightcyan", "lavender", "plum"], ["lightgray", "pink", "bisque", "moccasin", "khaki", "lightgreen", "lightseagreen", "lightskyblue", "cornflowerblue", "violet"], ["silver", "lightcoral", "sandybrown", "orange", "palegoldenrod", "chartreuse", "mediumturquoise", "skyblue", "mediumslateblue", "orchid"], ["gray", "red", "orangered", "darkorange", "yellow", "limegreen", "darkseagreen", "royalblue", "slateblue", "mediumorchid"], ["dimgray", "crimson", "chocolate", "coral", "gold", "forestgreen", "seagreen", "blue", "blueviolet", "darkorchid"], ["darkslategray", "firebrick", "saddlebrown", "sienna", "olive", "green", "darkcyan", "mediumblue", "darkslateblue", "darkmagenta"], ["black", "darkred", "maroon", "brown", "darkolivegreen", "darkgreen", "midnightblue", "navy", "indigo", "purple"]], "3x4":[["white", "lime", "green", "blue"], ["silver", "yellow", "fuchsia", "navy"], ["gray", "red", "purple", "black"]]}, templateString:template, baseClass:"dijitColorPalette", _dyeFactory:function (value, row, col, title) {
        return new this._dyeClass(value, row, col, title);
    }, buildRendering:function () {
        this.inherited(arguments);
        this._dyeClass = declare(ColorPalette._Color, {palette:this.palette});
        this._preparePalette(this._palettes[this.palette], i18n.getLocalization("dojo", "colors", this.lang));
    }});
    ColorPalette._Color = declare("dijit._Color", Color, {template:"<span class='dijitInline dijitPaletteImg'>" + "<img src='${blankGif}' alt='${alt}' title='${title}' class='dijitColorPaletteSwatch' style='background-color: ${color}'/>" + "</span>", hcTemplate:"<span class='dijitInline dijitPaletteImg' style='position: relative; overflow: hidden; height: 12px; width: 14px;'>" + "<img src='${image}' alt='${alt}' title='${title}' style='position: absolute; left: ${left}px; top: ${top}px; ${size}'/>" + "</span>", _imagePaths:{"7x10":require.toUrl("./themes/a11y/colors7x10.png"), "3x4":require.toUrl("./themes/a11y/colors3x4.png")}, constructor:function (alias, row, col, title) {
        this._title = title;
        this._row = row;
        this._col = col;
        this.setColor(Color.named[alias]);
    }, getValue:function () {
        return this.toHex();
    }, fillCell:function (cell, blankGif) {
        var html = string.substitute(has("highcontrast") ? this.hcTemplate : this.template, {color:this.toHex(), blankGif:blankGif, alt:this._title, title:this._title, image:this._imagePaths[this.palette].toString(), left:this._col * -20 - 5, top:this._row * -20 - 5, size:this.palette == "7x10" ? "height: 145px; width: 206px" : "height: 64px; width: 86px"});
        domConstruct.place(html, cell);
    }});
    return ColorPalette;
});

