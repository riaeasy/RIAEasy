
//RIAStudio client runtime widget - Tooltip

define([
	"rias/riasw/mobile/mobileBase",
	"dojox/mobile/Tooltip"
], function(rias, _Widget){

	rias.theme.loadRiasCss([
		"Tooltip.css"
	], true);

	var riasType = "rias.riasw.mobile.Tooltip";
	var Widget = rias.declare(riasType, [_Widget], {

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswTooltipIcon",
		iconClass16: "riaswTooltipIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
