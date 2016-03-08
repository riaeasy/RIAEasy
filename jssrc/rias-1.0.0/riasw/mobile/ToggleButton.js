
//RIAStudio client runtime widget - ToggleButton

define([
	"rias/riasw/mobile/mobileBase",
	"dojox/mobile/ToggleButton"
], function(rias, _Widget){

	rias.theme.loadRiasCss([
		"ToggleButton.css"
	], true);

	var riasType = "rias.riasw.mobile.ToggleButton";
	var Widget = rias.declare(riasType, [_Widget], {

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswToggleButtonIcon",
		iconClass16: "riaswToggleButtonIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
