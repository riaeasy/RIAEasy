//RIAStudio client runtime widget - ColorPalette

define([
	"rias",
	"dijit/ColorPalette"
], function(rias, _Widget) {

	rias.theme.loadCss([
		"widget/ColorPalette.css"
	]);

	var riasType = "rias.riasw.widget.ColorPalette";
	var Widget = rias.declare(riasType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswColorPaletteIcon",
		iconClass16: "riaswColorPaletteIcon16",
		defaultParams: {
			//content: "<div></div>",
			defaultTimeout: 500,
			timeoutChangeRate: 0.9,
			palette: "7x10"
		},
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