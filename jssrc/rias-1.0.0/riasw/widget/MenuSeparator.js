//RIAStudio client runtime widget - MenuSeparator

define([
	"rias",
	"dijit/MenuSeparator"
], function(rias, _Widget) {

	rias.theme.loadCss([
		"widget/Menu.css"
	]);

	var riasType = "rias.riasw.widget.MenuSeparator";
	var Widget = rias.declare(riasType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswMenuSeparatorIcon",
		iconClass16: "riaswMenuSeparatorIcon16",
		defaultParams: {
			//content: "<span></span>",
			label: "MenuSeparator"
		},
		initialSize: {},
		resizable: "none",
		allowedParent: "rias.riasw.Menu, dijit.Menu",
		allowedChild: ""
	};

	return Widget;

});