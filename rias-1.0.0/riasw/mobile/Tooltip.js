
//RIAStudio client runtime widget - Tooltip

define([
	"rias",
	"dojox/mobile/Tooltip"
], function(rias, _Widget){

	rias.theme.loadMobileThemeCss([
		"Tooltip.css"
	]);

	var riaswType = "rias.riasw.mobile.Tooltip";
	var Widget = rias.declare(riaswType, [_Widget], {

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
