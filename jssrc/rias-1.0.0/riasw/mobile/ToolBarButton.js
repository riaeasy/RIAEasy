
//RIAStudio client runtime widget - ToolBarButton

define([
	"rias",
	"dojox/mobile/ToolBarButton"
], function(rias, _Widget){

	rias.theme.loadRiasCss([
		"ToolBarButton.css"
	], true);

	var riasType = "rias.riasw.mobile.ToolBarButton";
	var Widget = rias.declare(riasType, [_Widget], {

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswToolBarButtonIcon",
		iconClass16: "riaswToolBarButtonIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
