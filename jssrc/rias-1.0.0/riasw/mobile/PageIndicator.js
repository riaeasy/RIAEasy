
//RIAStudio client runtime widget - PageIndicator

define([
	"rias/riasw/mobile/mobileBase",
	"dojox/mobile/PageIndicator"
], function(rias, _Widget){

	rias.theme.loadRiasCss([
		"PageIndicator.css"
	], true);

	var riasType = "rias.riasw.mobile.PageIndicator";
	var Widget = rias.declare(riasType, [_Widget], {

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswPageIndicatorIcon",
		iconClass16: "riaswPageIndicatorIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
