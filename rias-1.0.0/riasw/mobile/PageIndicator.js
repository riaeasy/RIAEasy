
//RIAStudio client runtime widget - PageIndicator

define([
	"rias",
	"dojox/mobile/PageIndicator"
], function(rias, _Widget){

	rias.theme.loadMobileThemeCss([
		"PageIndicator.css"
	]);

	var riaswType = "rias.riasw.mobile.PageIndicator";
	var Widget = rias.declare(riaswType, [_Widget], {

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
