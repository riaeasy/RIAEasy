//RIAStudio client runtime widget - Toolbar

define([
	"rias",
	"dijit/Toolbar"
], function(rias, _Widget) {

	rias.theme.loadCss([
		"widget/Toolbar.css"
	]);

	var riasType = "rias.riasw.widget.Toolbar";
	var Widget = rias.declare(riasType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswToolbarIcon",
		iconClass16: "riaswToolbarIcon16",
		defaultParams: {
			//content: "<span></span>"
		},
		initialSize: {},
		resizable: "none",
		allowedChild: "dijit.form.Button, dijit.form.ComboButton, dijit.form.DropDownButton, dijit.form.ToggleButton, dijit.ToolbarSeparator",
		property: {
			tabIndex: {
				datatype: "string",
				defaultValue: "0",
				title: "Tab Index"
			},
			focusedChild: {
				datatype: "object",
				description: "The currently focused child widget, or null if there isn't one",
				hidden: true
			},
			isContainer: {
				datatype: "boolean",
				description: "Just a flag indicating that this widget descends from dijit._Container"
			}
		}
	};

	return Widget;

});