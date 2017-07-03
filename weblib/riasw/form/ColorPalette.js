//RIAStudio client runtime widget - ColorPalette

define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_TemplatedMixin",
	"riasw/sys/_CssStateMixin",
	"riasw/form/_FormWidgetMixin",
	"riasw/form/_PaletteMixin",
	"dojo/i18n!dojo/nls/colors"
], function(rias, _WidgetBase, _TemplatedMixin, _CssStateMixin, _FormWidgetMixin, _PaletteMixin) {

	//rias.theme.loadThemeCss([
	//	"riasw/form/ColorPalette.css"
	//]);

	var riaswType = "riasw.form.ColorPalette";
	var Widget = rias.declare(riaswType, [_WidgetBase, _TemplatedMixin, _CssStateMixin, _FormWidgetMixin, _PaletteMixin], {
		// summary:
		//		A keyboard accessible color-picking widget
		// description:
		//		Grid showing various colors, so the user can pick a certain color.
		//		Can be used standalone, or as a popup.
		//
		// example:
		// |	<div data-dojo-type="riasw/form/ColorPalette"></div>
		//
		// example:
		// |	var picker = new riasw.form.ColorPalette({ },srcNode);
		// |	picker.startup();


		// palette: [const] String
		//		Size of grid, either "7x10" or "3x4".
		palette: "7x10",

		// _palettes: [protected] Map
		//		This represents the value of the colors.
		//		The first level is a hashmap of the different palettes available.
		//		The next two dimensions represent the columns and rows of colors.
		_palettes: {
			"7x10": [
				["white", "seashell", "cornsilk", "lemonchiffon", "lightyellow", "palegreen", "paleturquoise", "lightcyan", "lavender", "plum"],
				["lightgray", "pink", "bisque", "moccasin", "khaki", "lightgreen", "lightseagreen", "lightskyblue", "cornflowerblue", "violet"],
				["silver", "lightcoral", "sandybrown", "orange", "palegoldenrod", "chartreuse", "mediumturquoise", "skyblue", "mediumslateblue", "orchid"],
				["gray", "red", "orangered", "darkorange", "yellow", "limegreen", "darkseagreen", "royalblue", "slateblue", "mediumorchid"],
				["dimgray", "crimson", "chocolate", "coral", "gold", "forestgreen", "seagreen", "blue", "blueviolet", "darkorchid"],
				["darkslategray", "firebrick", "saddlebrown", "sienna", "olive", "green", "darkcyan", "mediumblue", "darkslateblue", "darkmagenta" ],
				["black", "darkred", "maroon", "brown", "darkolivegreen", "darkgreen", "midnightblue", "navy", "indigo", "purple"]
			],

			"3x4": [
				["white", "lime", "green", "blue"],
				["silver", "yellow", "fuchsia", "navy"],
				["gray", "red", "purple", "black"]
			]
		},

		// templateString: String
		//		The template of this widget.
		templateString:
			'<div class="dijitReset" role="grid">' +
				'<table data-dojo-attach-point="paletteTableNode" class="riaswPaletteTable" cellSpacing="0" cellPadding="0" role="presentation">' +
					'<tbody data-dojo-attach-point="gridNode,focusNode"></tbody>' +
				'</table>' +
			'</div>',

		baseClass: "riaswColorPalette",

		_dyeFactory: function(value, row, col, title){
			// Overrides _PaletteMixin._dyeFactory().
			return new this._dyeClass(value, row, col, title);
		},

		buildRendering: function(){
			// Instantiate the template, which makes a skeleton into which we'll insert a bunch of
			// <img> nodes
			this.inherited(arguments);

			//	Creates customized constructor for dye class (color of a single cell) for
			//	specified palette and high-contrast vs. normal mode.   Used in _getDye().
			this._dyeClass = rias.declare(Widget._ColorPaletteCell, {
				palette: this.palette,
				cellHeight: this.cellHeight,
				cellWidth: this.cellWidth
			});

			// Creates <img> nodes in each cell of the template.
			this._preparePalette(
				this._palettes[this.palette],
				rias.i18n.getLocalization("dojo", "colors", this.lang));
		},

		_setValueAttr: function(value, priorityChange){
			value = rias.Color.fromString(value).toHex();
			this.inherited(arguments, [value, priorityChange]);
		}
	});

	Widget._ColorPaletteCell = rias.declare("riasw.form._ColorPaletteCell", rias.Color, {
		// summary:
		//		Object associated with each cell in a ColorPalette palette.
		//		Implements riasw/form/_PaletteMixin.

		// Template for each cell in normal (non-high-contrast mode).  Each cell contains a wrapper
		// node for showing the border (called riaswPaletteImg for back-compat), and riaswColorPaletteSwatch
		// for showing the color.
		template: "<span class='dijitInline riaswPaletteImg'>" +
			"<img src='${blankGif}' alt='${alt}' title='${title}' class='riaswColorPaletteSwatch' style='background-color: ${color}'/>" +
			"</span>",

		// Template for each cell in high contrast mode.  Each cell contains an image with the whole palette,
		// but scrolled and clipped to show the correct color only
		hcTemplate: "<span class='dijitInline riaswPaletteImg' style='position: relative; overflow: hidden; height: 12px; width: 14px;'>" +
			"<img src='${image}' alt='${alt}' title='${title}' style='position: absolute; left: ${left}px; top: ${top}px; ${size}'/>" +
			"</span>",

		// _imagePaths: [protected] Map
		//		This is stores the path to the palette images used for high-contrast mode display
		_imagePaths: {
			"7x10": rias.toUrl("./ColorPalette/images/colors7x10.png"),
			"3x4": rias.toUrl("./ColorPalette/images/colors3x4.png")
		},

		constructor: function(alias, row, col, title){
			// summary:
			//		Constructor for ColorPalette._ColorPaletteCell
			// alias: String
			//		English name of the color.
			// row: Number
			//		Vertical position in grid.
			// column: Number
			//		Horizontal position in grid.
			// title: String
			//		Localized name of the color.
			this._title = title;
			this._row = row;
			this._col = col;
			this.setColor(rias.Color.named[alias]);
		},

		getValue: function(){
			// summary:
			//		Note that although riasw.form._ColorPaletteCell is initialized with a value like "white" getValue() always
			//		returns a hex value
			return this.toHex();
		},

		fillCell: function(/*DOMNode*/ cell, /*String*/ blankGif){
			var html = rias.substitute(rias.has("highcontrast") ? this.hcTemplate : this.template, {
				// substitution variables for normal mode
				color: this.toHex(),
				blankGif: blankGif,
				alt: this._title,
				title: this._title,

				// variables used for high contrast mode
				image: this._imagePaths[this.palette].toString(),
				left: this._col * -20 - 5,
				top: this._row * -20 - 5,
				size: this.palette === "7x10" ? "height: 145px; width: 206px" : "height: 64px; width: 86px"
			});

			var node = rias.dom.place(html, cell);
			if(this.cellHeight){
				node.firstChild.style.height = this.cellHeight + "px";
			}
			if(this.cellWidth){
				node.firstChild.style.width = this.cellWidth + "px";
			}
		}
	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		resizable: "none",
		//allowedChild: "",
		"property": {
			"defaultTimeout": {
				"datatype": "number",
				"defaultValue": 500,
				"title": "Default Timeout"
			},
			"timeoutChangeRate": {
				"datatype": "number",
				"defaultValue": 0.9,
				"title": "Timeout Change Rate"
			},
			"palette": {
				"datatype": "string",
				"option": [
					{
						"value": "3x4"
					},
					{
						"value": "7x10"
					}
				],
				"defaultValue": "7x10",
				"title": "Palette Size"
			},
			"value": {
				"datatype": "string",
				"description": "The value of the selected color.",
				"hidden": false
			},
			"tabIndex": {
				"datatype": "string",
				"description": "Widget tab index.",
				"hidden": false
			}
		}
	};

	return Widget;
});